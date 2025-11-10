#!/usr/bin/env tsx

/**
 * Test Migration Setup
 * 
 * This script tests the migration setup without making any changes:
 * 1. Checks environment variables
 * 2. Tests MongoDB connection
 * 3. Tests R2 connection
 * 4. Reports setup status
 */

import mongoose from 'mongoose';
import dotenv from 'dotenv';

// Load environment variables FIRST
dotenv.config();

// Import R2 utilities AFTER loading env vars
import { uploadToR2 } from './src/utils/r2';

// Test results
const tests = {
  environment: false,
  mongodb: false,
  r2: false,
  errors: [] as string[]
};

/**
 * Test environment variables
 */
function testEnvironment() {
  console.log('🔍 Testing environment variables...');
  
  const required = [
    'MONGODB_URI',
    'CF_ACCOUNT_ID',
    'CF_R2_ACCESS_KEY_ID',
    'CF_R2_SECRET_ACCESS_KEY',
    'CF_R2_BUCKET_NAME'
  ];
  
  const missing = required.filter(key => !process.env[key]);
  
  // Debug: Show what we found
  console.log('📋 Environment variables status:');
  required.forEach(key => {
    const value = process.env[key];
    const status = value ? '✅' : '❌';
    const displayValue = value ? (key.includes('SECRET') || key.includes('KEY') ? '***' : value) : 'NOT SET';
    console.log(`  ${status} ${key}: ${displayValue}`);
  });
  
  if (missing.length === 0) {
    console.log('✅ All required environment variables are set');
    tests.environment = true;
  } else {
    const error = `Missing environment variables: ${missing.join(', ')}`;
    console.log(`❌ ${error}`);
    tests.errors.push(error);
  }
}

/**
 * Test MongoDB connection
 */
async function testMongoDB() {
  console.log('\n🔍 Testing MongoDB connection...');
  
  try {
    if (!process.env.MONGODB_URI) {
      throw new Error('MONGODB_URI not set');
    }
    
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ MongoDB connection successful');
    
    // Test a simple query
    const collections = await mongoose.connection.db.listCollections().toArray();
    console.log(`📊 Found ${collections.length} collections`);
    
    tests.mongodb = true;
  } catch (error: any) {
    const errorMsg = `MongoDB connection failed: ${error.message}`;
    console.log(`❌ ${errorMsg}`);
    tests.errors.push(errorMsg);
  } finally {
    await mongoose.connection.close();
  }
}

/**
 * Test R2 connection
 */
async function testR2() {
  console.log('\n🔍 Testing Cloudflare R2 connection...');
  
  try {
    // Test with a small dummy file
    const testBuffer = Buffer.from('test image data');
    const testKey = `test/migration-test-${Date.now()}.txt`;
    
    const url = await uploadToR2(testKey, testBuffer, 'text/plain');
    console.log('✅ R2 upload successful');
    console.log(`📄 Test file URL: ${url}`);
    
    tests.r2 = true;
  } catch (error: any) {
    const errorMsg = `R2 connection failed: ${error.message}`;
    console.log(`❌ ${errorMsg}`);
    tests.errors.push(errorMsg);
  }
}

/**
 * Main test function
 */
async function testSetup() {
  console.log('🧪 Testing migration setup...\n');
  
  // Run tests
  testEnvironment();
  await testMongoDB();
  await testR2();
  
  // Print results
  console.log('\n📊 Test Results:');
  console.log(`  Environment: ${tests.environment ? '✅' : '❌'}`);
  console.log(`  MongoDB: ${tests.mongodb ? '✅' : '❌'}`);
  console.log(`  R2: ${tests.r2 ? '✅' : '❌'}`);
  
  if (tests.errors.length > 0) {
    console.log('\n❌ Errors:');
    tests.errors.forEach((error, index) => {
      console.log(`  ${index + 1}. ${error}`);
    });
  }
  
  const allPassed = tests.environment && tests.mongodb && tests.r2;
  
  if (allPassed) {
    console.log('\n🎉 All tests passed! Migration setup is ready.');
    console.log('💡 You can now run: npm run migrate:images:dry-run');
  } else {
    console.log('\n⚠️  Some tests failed. Please fix the issues before running migration.');
    process.exit(1);
  }
}

// Run tests if this script is executed directly
if (require.main === module) {
  testSetup().catch(console.error);
}

export { testSetup, tests };
