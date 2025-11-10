#!/usr/bin/env node

/**
 * Migration Script: Move local images to Cloudflare R2
 * 
 * This script:
 * 1. Finds all rooms with local image URLs (http://localhost:8080/uploads/...)
 * 2. Reads the local files from disk
 * 3. Uploads them to Cloudflare R2
 * 4. Updates the MongoDB records with new R2 URLs
 * 5. Reports migration statistics
 */

const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const sharp = require('sharp');

// Import R2 utilities
const { uploadToR2 } = require('./dist/utils/r2');

// Load environment variables
require('dotenv').config();

// MongoDB connection
const MONGODB_URI = process.env.MONGODB_URI;
if (!MONGODB_URI) {
  console.error('❌ MONGODB_URI environment variable is required');
  process.exit(1);
}

// Room schema (simplified for migration)
const roomSchema = new mongoose.Schema({
  images: [{
    url: String,
    w: Number,
    h: Number
  }]
}, { collection: 'rooms' });

const Room = mongoose.model('Room', roomSchema);

// Statistics tracking
const stats = {
  totalRooms: 0,
  roomsWithLocalImages: 0,
  totalImages: 0,
  migratedImages: 0,
  failedImages: 0,
  errors: []
};

/**
 * Check if a URL is a local upload URL
 */
function isLocalUrl(url) {
  return url && (
    url.startsWith('http://localhost:8080/uploads/') ||
    url.startsWith('http://127.0.0.1:8080/uploads/') ||
    url.startsWith('/uploads/')
  );
}

/**
 * Convert local URL to file path
 */
function urlToFilePath(url) {
  // Handle different URL formats
  let relativePath;
  if (url.startsWith('http://localhost:8080/uploads/') || url.startsWith('http://127.0.0.1:8080/uploads/')) {
    relativePath = url.replace(/^https?:\/\/(localhost|127\.0\.0\.1):8080\/uploads\//, 'uploads/');
  } else if (url.startsWith('/uploads/')) {
    relativePath = url.substring(1); // Remove leading slash
  } else {
    return null;
  }
  
  return path.resolve(process.cwd(), relativePath);
}

/**
 * Generate R2 key for image
 */
function generateR2Key(roomId, originalUrl) {
  const extension = path.extname(originalUrl) || '.webp';
  const filename = `${uuidv4()}${extension}`;
  return `rooms/${roomId}/${filename}`;
}

/**
 * Process and upload a single image
 */
async function processImage(roomId, image, roomIndex, imageIndex) {
  try {
    console.log(`  📸 Processing image ${imageIndex + 1}: ${image.url}`);
    
    // Convert URL to file path
    const filePath = urlToFilePath(image.url);
    if (!filePath) {
      throw new Error('Invalid local URL format');
    }
    
    // Check if file exists
    if (!fs.existsSync(filePath)) {
      throw new Error(`File not found: ${filePath}`);
    }
    
    // Read file
    const fileBuffer = fs.readFileSync(filePath);
    console.log(`    📁 File size: ${(fileBuffer.length / 1024).toFixed(2)} KB`);
    
    // Process with Sharp (resize and convert to WebP)
    const processedBuffer = await sharp(fileBuffer)
      .resize(1920, 1920, {
        fit: 'inside',
        withoutEnlargement: true
      })
      .webp({ quality: 80 })
      .toBuffer();
    
    console.log(`    🔄 Processed size: ${(processedBuffer.length / 1024).toFixed(2)} KB`);
    
    // Generate R2 key
    const r2Key = generateR2Key(roomId, image.url);
    console.log(`    🔑 R2 key: ${r2Key}`);
    
    // Upload to R2
    const r2Url = await uploadToR2(r2Key, processedBuffer, 'image/webp');
    console.log(`    ☁️  R2 URL: ${r2Url}`);
    
    // Update image object
    const newImage = {
      ...image,
      url: r2Url
    };
    
    stats.migratedImages++;
    console.log(`    ✅ Successfully migrated image ${imageIndex + 1}`);
    
    return newImage;
  } catch (error) {
    console.error(`    ❌ Failed to process image ${imageIndex + 1}:`, error.message);
    stats.failedImages++;
    stats.errors.push({
      roomId,
      roomIndex,
      imageIndex,
      url: image.url,
      error: error.message
    });
    return image; // Return original image on failure
  }
}

/**
 * Migrate a single room
 */
async function migrateRoom(room, roomIndex) {
  console.log(`\n🏠 Room ${roomIndex + 1}: ${room._id}`);
  
  const localImages = room.images.filter(img => isLocalUrl(img.url));
  if (localImages.length === 0) {
    console.log('  ℹ️  No local images found, skipping');
    return room;
  }
  
  console.log(`  📊 Found ${localImages.length} local images to migrate`);
  stats.roomsWithLocalImages++;
  stats.totalImages += localImages.length;
  
  // Process all images
  const updatedImages = [];
  for (let i = 0; i < room.images.length; i++) {
    const image = room.images[i];
    if (isLocalUrl(image.url)) {
      const processedImage = await processImage(room._id, image, roomIndex, i);
      updatedImages.push(processedImage);
    } else {
      // Keep non-local images as-is
      updatedImages.push(image);
    }
  }
  
  // Update room with new images
  room.images = updatedImages;
  return room;
}

/**
 * Main migration function
 */
async function migrateImages() {
  try {
    console.log('🚀 Starting image migration to Cloudflare R2...\n');
    
    // Connect to MongoDB
    console.log('📡 Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB');
    
    // Find all rooms
    console.log('\n🔍 Finding all rooms...');
    const rooms = await Room.find({});
    stats.totalRooms = rooms.length;
    console.log(`📊 Found ${stats.totalRooms} rooms`);
    
    // Filter rooms with local images
    const roomsWithLocalImages = rooms.filter(room => 
      room.images.some(img => isLocalUrl(img.url))
    );
    
    if (roomsWithLocalImages.length === 0) {
      console.log('✅ No rooms with local images found. Migration complete!');
      return;
    }
    
    console.log(`🎯 Found ${roomsWithLocalImages.length} rooms with local images`);
    
    // Migrate each room
    console.log('\n🔄 Starting migration...');
    for (let i = 0; i < roomsWithLocalImages.length; i++) {
      const room = roomsWithLocalImages[i];
      const updatedRoom = await migrateRoom(room, i);
      
      // Save updated room to database
      try {
        await Room.findByIdAndUpdate(room._id, { images: updatedRoom.images });
        console.log(`  💾 Room ${i + 1} updated in database`);
      } catch (error) {
        console.error(`  ❌ Failed to update room ${i + 1} in database:`, error.message);
        stats.errors.push({
          roomId: room._id,
          roomIndex: i,
          error: `Database update failed: ${error.message}`
        });
      }
    }
    
    // Print final statistics
    console.log('\n📊 Migration Statistics:');
    console.log(`  Total rooms: ${stats.totalRooms}`);
    console.log(`  Rooms with local images: ${stats.roomsWithLocalImages}`);
    console.log(`  Total images processed: ${stats.totalImages}`);
    console.log(`  Successfully migrated: ${stats.migratedImages}`);
    console.log(`  Failed migrations: ${stats.failedImages}`);
    console.log(`  Success rate: ${((stats.migratedImages / stats.totalImages) * 100).toFixed(2)}%`);
    
    if (stats.errors.length > 0) {
      console.log('\n❌ Errors encountered:');
      stats.errors.forEach((error, index) => {
        console.log(`  ${index + 1}. Room ${error.roomId}: ${error.error}`);
        if (error.url) {
          console.log(`     URL: ${error.url}`);
        }
      });
    }
    
    console.log('\n✅ Migration completed!');
    
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  } finally {
    // Close MongoDB connection
    await mongoose.connection.close();
    console.log('📡 MongoDB connection closed');
  }
}

// Run migration if this script is executed directly
if (require.main === module) {
  migrateImages().catch(console.error);
}

module.exports = { migrateImages, stats };
