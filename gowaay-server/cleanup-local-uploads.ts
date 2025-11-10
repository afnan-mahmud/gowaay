#!/usr/bin/env tsx

/**
 * Cleanup Script: Remove local uploads folder after migration
 * 
 * This script:
 * 1. Checks if any rooms still have local image URLs
 * 2. If none found, removes the local uploads folder
 * 3. Reports cleanup statistics
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
  totalLocalImages: 0,
  uploadsFolderSize: 0,
  filesRemoved: 0,
  errors: [] as string[]
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
 * Get folder size recursively
 */
function getFolderSize(dirPath: string): number {
  let totalSize = 0;
  
  try {
    const files = fs.readdirSync(dirPath);
    
    for (const file of files) {
      const filePath = path.join(dirPath, file);
      const stats = fs.statSync(filePath);
      
      if (stats.isDirectory()) {
        totalSize += getFolderSize(filePath);
      } else {
        totalSize += stats.size;
      }
    }
  } catch (error) {
    // Folder doesn't exist or can't be read
  }
  
  return totalSize;
}

/**
 * Remove folder recursively
 */
function removeFolder(dirPath: string): number {
  let filesRemoved = 0;
  
  try {
    const files = fs.readdirSync(dirPath);
    
    for (const file of files) {
      const filePath = path.join(dirPath, file);
      const stats = fs.statSync(filePath);
      
      if (stats.isDirectory()) {
        filesRemoved += removeFolder(filePath);
        fs.rmdirSync(filePath);
      } else {
        fs.unlinkSync(filePath);
        filesRemoved++;
      }
    }
    
    fs.rmdirSync(dirPath);
  } catch (error) {
    throw new Error(`Failed to remove folder ${dirPath}: ${error}`);
  }
  
  return filesRemoved;
}

/**
 * Main cleanup function
 */
async function cleanupLocalUploads() {
  try {
    console.log('🧹 Starting cleanup of local uploads folder...\n');
    
    // Check required environment variables
    if (!process.env.MONGODB_URI) {
      throw new Error('MONGODB_URI environment variable is required');
    }
    
    // Connect to MongoDB
    console.log('📡 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');
    
    // Find all rooms
    console.log('\n🔍 Checking for remaining local image URLs...');
    const rooms = await Room.find({});
    stats.totalRooms = rooms.length;
    console.log(`📊 Found ${stats.totalRooms} rooms`);
    
    // Check for rooms with local images
    const roomsWithLocalImages = rooms.filter(room => 
      room.images.some((img: any) => isLocalUrl(img.url))
    );
    
    if (roomsWithLocalImages.length > 0) {
      console.log(`⚠️  Found ${roomsWithLocalImages.length} rooms still with local image URLs:`);
      roomsWithLocalImages.forEach((room, index) => {
        const localImages = room.images.filter((img: any) => isLocalUrl(img.url));
        console.log(`  ${index + 1}. Room ${room._id}: ${localImages.length} local images`);
        stats.roomsWithLocalImages++;
        stats.totalLocalImages += localImages.length;
      });
      
      console.log('\n❌ Cleanup aborted! Please run the migration script first.');
      console.log('💡 Run: npm run migrate:images');
      return;
    }
    
    console.log('✅ No rooms with local image URLs found. Safe to cleanup!');
    
    // Check uploads folder
    const uploadsPath = path.resolve(process.cwd(), 'uploads');
    console.log(`\n📁 Checking uploads folder: ${uploadsPath}`);
    
    if (!fs.existsSync(uploadsPath)) {
      console.log('ℹ️  Uploads folder does not exist. Nothing to cleanup.');
      return;
    }
    
    // Get folder size
    stats.uploadsFolderSize = getFolderSize(uploadsPath);
    console.log(`📊 Uploads folder size: ${(stats.uploadsFolderSize / 1024 / 1024).toFixed(2)} MB`);
    
    // Confirm cleanup
    console.log('\n⚠️  This will permanently delete the local uploads folder!');
    console.log('💡 Make sure you have backups and that migration was successful.');
    
    // In a real scenario, you might want to add a confirmation prompt
    // For now, we'll just log what would be removed
    console.log('\n🔍 Files that would be removed:');
    try {
      const files = fs.readdirSync(uploadsPath);
      files.forEach((file, index) => {
        const filePath = path.join(uploadsPath, file);
        const stats = fs.statSync(filePath);
        if (stats.isDirectory()) {
          console.log(`  ${index + 1}. 📁 ${file}/ (directory)`);
        } else {
          console.log(`  ${index + 1}. 📄 ${file} (${(stats.size / 1024).toFixed(2)} KB)`);
        }
      });
    } catch (error) {
      console.log('  ❌ Could not list files in uploads folder');
    }
    
    console.log('\n💡 To actually remove the folder, uncomment the cleanup code in this script.');
    console.log('⚠️  Make sure to test this in a safe environment first!');
    
    // Uncomment the following lines to actually perform cleanup:
    /*
    console.log('\n🗑️  Removing uploads folder...');
    stats.filesRemoved = removeFolder(uploadsPath);
    console.log(`✅ Removed ${stats.filesRemoved} files and folders`);
    console.log(`💾 Freed up ${(stats.uploadsFolderSize / 1024 / 1024).toFixed(2)} MB of space`);
    */
    
    // Print final statistics
    console.log('\n📊 Cleanup Results:');
    console.log(`  Total rooms checked: ${stats.totalRooms}`);
    console.log(`  Rooms with local images: ${stats.roomsWithLocalImages}`);
    console.log(`  Total local images: ${stats.totalLocalImages}`);
    console.log(`  Uploads folder size: ${(stats.uploadsFolderSize / 1024 / 1024).toFixed(2)} MB`);
    console.log(`  Files that would be removed: ${stats.filesRemoved}`);
    
    if (stats.errors.length > 0) {
      console.log('\n❌ Errors encountered:');
      stats.errors.forEach((error, index) => {
        console.log(`  ${index + 1}. ${error}`);
      });
    }
    
    console.log('\n✅ Cleanup analysis completed!');
    
  } catch (error: any) {
    console.error('❌ Cleanup failed:', error.message);
    process.exit(1);
  } finally {
    // Close MongoDB connection
    await mongoose.connection.close();
    console.log('📡 MongoDB connection closed');
  }
}

// Run cleanup if this script is executed directly
if (require.main === module) {
  cleanupLocalUploads().catch(console.error);
}

export { cleanupLocalUploads, stats };
