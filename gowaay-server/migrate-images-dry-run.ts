#!/usr/bin/env tsx

/**
 * Dry Run Migration Script: Analyze local images without migrating
 * 
 * This script:
 * 1. Finds all rooms with local image URLs (http://localhost:8080/uploads/...)
 * 2. Checks if local files exist on disk
 * 3. Reports what would be migrated without actually doing it
 */

import mongoose from 'mongoose';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Import Room model
import { Room } from './src/models/Room';

// Statistics tracking
const stats = {
  totalRooms: 0,
  roomsWithLocalImages: 0,
  totalImages: 0,
  existingFiles: 0,
  missingFiles: 0,
  totalFileSize: 0,
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
 * Analyze a single image
 */
function analyzeImage(roomId: string, image: { url: string; w: number; h: number }, roomIndex: number, imageIndex: number) {
  try {
    console.log(`  📸 Analyzing image ${imageIndex + 1}: ${image.url}`);
    
    // Convert URL to file path
    const filePath = urlToFilePath(image.url);
    if (!filePath) {
      throw new Error('Invalid local URL format');
    }
    
    // Check if file exists
    if (!fs.existsSync(filePath)) {
      console.log(`    ❌ File not found: ${filePath}`);
      stats.missingFiles++;
      return;
    }
    
    // Get file stats
    const fileStats = fs.statSync(filePath);
    const fileSizeKB = fileStats.size / 1024;
    
    console.log(`    ✅ File exists: ${filePath}`);
    console.log(`    📁 File size: ${fileSizeKB.toFixed(2)} KB`);
    console.log(`    📐 Dimensions: ${image.w}x${image.h}`);
    
    stats.existingFiles++;
    stats.totalFileSize += fileStats.size;
    
  } catch (error: any) {
    console.error(`    ❌ Error analyzing image ${imageIndex + 1}:`, error.message);
    stats.errors.push({
      roomId,
      roomIndex,
      imageIndex,
      url: image.url,
      error: error.message
    });
  }
}

/**
 * Analyze a single room
 */
function analyzeRoom(room: any, roomIndex: number) {
  console.log(`\n🏠 Room ${roomIndex + 1}: ${room._id}`);
  console.log(`  📝 Title: ${room.title || 'N/A'}`);
  
  const localImages = room.images.filter((img: any) => isLocalUrl(img.url));
  if (localImages.length === 0) {
    console.log('  ℹ️  No local images found, skipping');
    return;
  }
  
  console.log(`  📊 Found ${localImages.length} local images to analyze`);
  stats.roomsWithLocalImages++;
  stats.totalImages += localImages.length;
  
  // Analyze each image
  for (let i = 0; i < room.images.length; i++) {
    const image = room.images[i];
    if (isLocalUrl(image.url)) {
      analyzeImage(room._id, image, roomIndex, i);
    }
  }
}

/**
 * Main analysis function
 */
async function analyzeImages() {
  try {
    console.log('🔍 Starting dry run analysis of local images...\n');
    
    // Check required environment variables
    if (!process.env.MONGODB_URI) {
      throw new Error('MONGODB_URI environment variable is required');
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
    
    // Filter rooms with local images
    const roomsWithLocalImages = rooms.filter(room => 
      room.images.some((img: any) => isLocalUrl(img.url))
    );
    
    if (roomsWithLocalImages.length === 0) {
      console.log('✅ No rooms with local images found. Nothing to migrate!');
      return;
    }
    
    console.log(`🎯 Found ${roomsWithLocalImages.length} rooms with local images`);
    
    // Analyze each room
    console.log('\n🔄 Starting analysis...');
    for (let i = 0; i < roomsWithLocalImages.length; i++) {
      const room = roomsWithLocalImages[i];
      analyzeRoom(room, i);
    }
    
    // Print final statistics
    console.log('\n📊 Analysis Results:');
    console.log(`  Total rooms: ${stats.totalRooms}`);
    console.log(`  Rooms with local images: ${stats.roomsWithLocalImages}`);
    console.log(`  Total local images: ${stats.totalImages}`);
    console.log(`  Existing files: ${stats.existingFiles}`);
    console.log(`  Missing files: ${stats.missingFiles}`);
    console.log(`  Total file size: ${(stats.totalFileSize / 1024 / 1024).toFixed(2)} MB`);
    console.log(`  Average file size: ${stats.existingFiles > 0 ? (stats.totalFileSize / stats.existingFiles / 1024).toFixed(2) : 0} KB`);
    
    if (stats.errors.length > 0) {
      console.log('\n❌ Errors encountered:');
      stats.errors.forEach((error, index) => {
        console.log(`  ${index + 1}. Room ${error.roomId}: ${error.error}`);
        if (error.url) {
          console.log(`     URL: ${error.url}`);
        }
      });
    }
    
    console.log('\n✅ Analysis completed!');
    console.log('\n💡 To run the actual migration, use: npm run migrate:images');
    
  } catch (error: any) {
    console.error('❌ Analysis failed:', error.message);
    process.exit(1);
  } finally {
    // Close MongoDB connection
    await mongoose.connection.close();
    console.log('📡 MongoDB connection closed');
  }
}

// Run analysis if this script is executed directly
if (require.main === module) {
  analyzeImages().catch(console.error);
}

export { analyzeImages, stats };
