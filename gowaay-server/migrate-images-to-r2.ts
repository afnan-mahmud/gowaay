#!/usr/bin/env tsx

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

import mongoose from 'mongoose';
import fs from 'fs';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import sharp from 'sharp';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Import R2 utilities
import { uploadToR2 } from './src/utils/r2';
import { Room } from './src/models/Room';

// Statistics tracking
const stats = {
  totalRooms: 0,
  roomsWithLocalImages: 0,
  totalImages: 0,
  migratedImages: 0,
  failedImages: 0,
  errors: [] as Array<{
    roomId: string;
    roomIndex: number;
    imageIndex?: number;
    url?: string;
    error: string;
  }>
};

/**
 * Check if a URL is a local upload URL
 */
function isLocalUrl(url: string): boolean {
  return Boolean(url && (
    url.startsWith('http://localhost:8080/uploads/') ||
    url.startsWith('http://127.0.0.1:8080/uploads/') ||
    url.startsWith('/uploads/')
  ));
}

/**
 * Check if a URL is an old R2 URL that needs to be updated to use the new public base
 */
function isOldR2Url(url: string): boolean {
  return Boolean(url && (
    url.includes('.r2.cloudflarestorage.com') ||
    url.startsWith('https://gowaayimageupload.66d3c416fc214c7311529358cd07aece.r2.cloudflarestorage.com')
  ));
}

/**
 * Update an old R2 URL to use the new public base URL
 */
function updateR2Url(url: string): string {
  if (!process.env.CF_R2_PUBLIC_BASE_URL) {
    return url; // No custom domain configured
  }
  
  // Extract the key from the old URL
  const urlObj = new URL(url);
  const key = urlObj.pathname.slice(1); // Remove leading slash
  
  // Return new URL with custom domain
  return `${process.env.CF_R2_PUBLIC_BASE_URL}/${key}`;
}

/**
 * Convert local URL to file path
 */
function urlToFilePath(url: string): string | null {
  // Handle different URL formats
  let relativePath: string;
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
function generateR2Key(roomId: string, originalUrl: string): string {
  const extension = path.extname(originalUrl) || '.webp';
  const filename = `${uuidv4()}${extension}`;
  return `rooms/${roomId}/${filename}`;
}

/**
 * Process and upload a single image
 */
async function processImage(roomId: string, image: { url: string; w: number; h: number }, roomIndex: number, imageIndex: number) {
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
  } catch (error: any) {
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
async function migrateRoom(room: any, roomIndex: number) {
  console.log(`\n🏠 Room ${roomIndex + 1}: ${room._id}`);
  
  const localImages = room.images.filter((img: any) => isLocalUrl(img.url));
  const oldR2Images = room.images.filter((img: any) => isOldR2Url(img.url));
  const totalImagesToProcess = localImages.length + oldR2Images.length;
  
  if (totalImagesToProcess === 0) {
    console.log('  ℹ️  No images need migration, skipping');
    return room;
  }
  
  console.log(`  📊 Found ${localImages.length} local images and ${oldR2Images.length} old R2 images to migrate`);
  stats.roomsWithLocalImages++;
  stats.totalImages += totalImagesToProcess;
  
  // Process all images
  const updatedImages: Array<{ url: string; w: number; h: number }> = [];
  for (let i = 0; i < room.images.length; i++) {
    const image = room.images[i];
    if (isLocalUrl(image.url)) {
      // Upload local file to R2
      const processedImage = await processImage(room._id, image, roomIndex, i);
      updatedImages.push(processedImage);
    } else if (isOldR2Url(image.url)) {
      // Update old R2 URL to use new public base
      const updatedUrl = updateR2Url(image.url);
      console.log(`  🔄 Updated R2 URL: ${image.url} -> ${updatedUrl}`);
      updatedImages.push({ ...image, url: updatedUrl });
      stats.migratedImages++;
    } else {
      // Keep other images as-is
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
    
    // Check required environment variables
    if (!process.env.MONGODB_URI) {
      throw new Error('MONGODB_URI environment variable is required');
    }
    
    if (!process.env.CF_ACCOUNT_ID || !process.env.CF_R2_ACCESS_KEY_ID || !process.env.CF_R2_SECRET_ACCESS_KEY || !process.env.CF_R2_BUCKET_NAME) {
      throw new Error('Cloudflare R2 environment variables are required (CF_ACCOUNT_ID, CF_R2_ACCESS_KEY_ID, CF_R2_SECRET_ACCESS_KEY, CF_R2_BUCKET_NAME)');
    }
    
    // Connect to MongoDB
    console.log('📡 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');
    
    // Find all rooms
    console.log('\n🔍 Finding all rooms...');
    const rooms = await Room.find({});
    stats.totalRooms = rooms.length;
    console.log(`📊 Found ${stats.totalRooms} rooms`);
    
    // Filter rooms with local images or old R2 URLs
    const roomsNeedingMigration = rooms.filter(room => 
      room.images.some((img: any) => isLocalUrl(img.url) || isOldR2Url(img.url))
    );
    
    if (roomsNeedingMigration.length === 0) {
      console.log('✅ No rooms need migration. All images are already using the correct URLs!');
      return;
    }
    
    console.log(`🎯 Found ${roomsNeedingMigration.length} rooms needing migration`);
    
    // Migrate each room
    console.log('\n🔄 Starting migration...');
    for (let i = 0; i < roomsNeedingMigration.length; i++) {
      const room = roomsNeedingMigration[i];
      const updatedRoom = await migrateRoom(room, i);
      
      // Save updated room to database
      try {
        await Room.findByIdAndUpdate(room._id, { images: updatedRoom.images });
        console.log(`  💾 Room ${i + 1} updated in database`);
      } catch (error: any) {
        console.error(`  ❌ Failed to update room ${i + 1} in database:`, error.message);
        stats.errors.push({
          roomId: String(room._id),
          roomIndex: i,
          error: `Database update failed: ${error.message}`
        });
      }
    }
    
    // Print final statistics
    console.log('\n📊 Migration Statistics:');
    console.log(`  Total rooms: ${stats.totalRooms}`);
    console.log(`  Rooms needing migration: ${stats.roomsWithLocalImages}`);
    console.log(`  Total images processed: ${stats.totalImages}`);
    console.log(`  Successfully migrated: ${stats.migratedImages}`);
    console.log(`  Failed migrations: ${stats.failedImages}`);
    console.log(`  Success rate: ${stats.totalImages > 0 ? ((stats.migratedImages / stats.totalImages) * 100).toFixed(2) : 0}%`);
    
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
    
  } catch (error: any) {
    console.error('❌ Migration failed:', error.message);
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

export { migrateImages, stats };
