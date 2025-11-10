# Image Migration to Cloudflare R2

This document describes the process of migrating local images to Cloudflare R2 storage.

## Overview

The migration process consists of three main steps:
1. **Dry Run Analysis** - Analyze existing local images without making changes
2. **Image Migration** - Move local images to Cloudflare R2 and update database
3. **Cleanup** - Remove local uploads folder after successful migration

## Prerequisites

Before running the migration, ensure you have:

1. **Cloudflare R2 Configuration** in your `.env` file:
   ```env
   CF_ACCOUNT_ID=your_cloudflare_account_id
   CF_R2_ACCESS_KEY_ID=your_r2_access_key_id
   CF_R2_SECRET_ACCESS_KEY=your_r2_secret_access_key
   CF_R2_BUCKET_NAME=your_r2_bucket_name
   CF_R2_REGION=auto
   CF_R2_PUBLIC_DOMAIN=your_custom_domain.com  # Optional
   ```

2. **MongoDB Connection** configured:
   ```env
   MONGODB_URI=your_mongodb_connection_string
   ```

3. **Dependencies installed**:
   ```bash
   npm install
   ```

## Migration Process

### Step 1: Dry Run Analysis

First, analyze what needs to be migrated without making any changes:

```bash
npm run migrate:images:dry-run
```

This will:
- Connect to MongoDB
- Find all rooms with local image URLs
- Check if local files exist on disk
- Report statistics about what would be migrated
- Show file sizes and missing files

**Example Output:**
```
🔍 Starting dry run analysis of local images...

📡 Connecting to MongoDB...
✅ Connected to MongoDB

🔍 Finding all rooms...
📊 Found 25 rooms

🎯 Found 3 rooms with local images

🔄 Starting analysis...

🏠 Room 1: 507f1f77bcf86cd799439011
  📝 Title: Cozy Studio Apartment
  📊 Found 5 local images to analyze
  📸 Analyzing image 1: http://localhost:8080/uploads/rooms/507f1f77bcf86cd799439011/image1.jpg
    ✅ File exists: /path/to/uploads/rooms/507f1f77bcf86cd799439011/image1.jpg
    📁 File size: 245.67 KB
    📐 Dimensions: 1920x1080

📊 Analysis Results:
  Total rooms: 25
  Rooms with local images: 3
  Total local images: 12
  Existing files: 11
  Missing files: 1
  Total file size: 2.45 MB
  Average file size: 222.73 KB
```

### Step 2: Image Migration

Once you're satisfied with the analysis, run the actual migration:

```bash
npm run migrate:images
```

This will:
- Find all rooms with local image URLs
- Read local files from disk
- Process images with Sharp (resize to 1920x1920, convert to WebP)
- Upload processed images to Cloudflare R2
- Update MongoDB records with new R2 URLs
- Report detailed migration statistics

**Example Output:**
```
🚀 Starting image migration to Cloudflare R2...

📡 Connecting to MongoDB...
✅ Connected to MongoDB

🔍 Finding all rooms...
📊 Found 25 rooms

🎯 Found 3 rooms with local images

🔄 Starting migration...

🏠 Room 1: 507f1f77bcf86cd799439011
  📊 Found 5 local images to migrate
  📸 Processing image 1: http://localhost:8080/uploads/rooms/507f1f77bcf86cd799439011/image1.jpg
    📁 File size: 245.67 KB
    🔄 Processed size: 198.34 KB
    🔑 R2 key: rooms/507f1f77bcf86cd799439011/uuid-1234.webp
    ☁️  R2 URL: https://thakajabeimageupload.66d3c416fc214c7311529358cd07aece.r2.cloudflarestorage.com/rooms/507f1f77bcf86cd799439011/uuid-1234.webp
    ✅ Successfully migrated image 1
  💾 Room 1 updated in database

📊 Migration Statistics:
  Total rooms: 25
  Rooms with local images: 3
  Total images processed: 12
  Successfully migrated: 11
  Failed migrations: 1
  Success rate: 91.67%
```

### Step 3: Cleanup (Optional)

After successful migration, you can remove the local uploads folder:

```bash
npm run cleanup:uploads
```

This will:
- Check if any rooms still have local image URLs
- If none found, analyze the uploads folder
- Show what would be removed (dry run by default)
- Optionally remove the folder (requires code modification)

**Example Output:**
```
🧹 Starting cleanup of local uploads folder...

📡 Connecting to MongoDB...
✅ Connected to MongoDB

🔍 Checking for remaining local image URLs...
📊 Found 25 rooms
✅ No rooms with local image URLs found. Safe to cleanup!

📁 Checking uploads folder: /path/to/uploads
📊 Uploads folder size: 2.45 MB

🔍 Files that would be removed:
  1. 📁 rooms/ (directory)
  2. 📄 image-1234567890-123456789.jpg (245.67 KB)

💡 To actually remove the folder, uncomment the cleanup code in this script.
```

## Migration Details

### Image Processing

During migration, images are:
- Resized to maximum 1920x1920 pixels (maintaining aspect ratio)
- Converted to WebP format with 80% quality
- Stored in R2 with keys like `rooms/{roomId}/{uuid}.webp`

### URL Format

**Before Migration:**
```
http://localhost:8080/uploads/rooms/507f1f77bcf86cd799439011/image1.jpg
```

**After Migration:**
```
https://thakajabeimageupload.66d3c416fc214c7311529358cd07aece.r2.cloudflarestorage.com/rooms/507f1f77bcf86cd799439011/uuid-1234.webp
```

### Error Handling

The migration script includes comprehensive error handling:
- Missing files are logged but don't stop the migration
- Failed uploads are reported in the statistics
- Database update failures are tracked
- All errors are logged with context

### Rollback

If you need to rollback the migration:
1. The original local files are preserved until cleanup
2. You can manually revert the database URLs
3. The R2 files can be deleted if needed

## Troubleshooting

### Common Issues

1. **Missing Environment Variables**
   ```
   ❌ CF_ACCOUNT_ID environment variable is required
   ```
   Solution: Ensure all Cloudflare R2 environment variables are set

2. **File Not Found**
   ```
   ❌ File not found: /path/to/uploads/rooms/roomId/image.jpg
   ```
   Solution: Check if the file exists and the path is correct

3. **R2 Upload Failed**
   ```
   ❌ Failed to upload file to R2
   ```
   Solution: Check R2 credentials and bucket permissions

4. **Database Update Failed**
   ```
   ❌ Failed to update room in database
   ```
   Solution: Check MongoDB connection and permissions

### Logs

All migration activities are logged to the console with:
- ✅ Success indicators
- ❌ Error indicators
- 📊 Statistics and progress
- 🔍 Detailed file information

## Safety Features

1. **Dry Run First**: Always analyze before migrating
2. **Error Recovery**: Failed images don't stop the entire migration
3. **Backup Preserved**: Original files are kept until cleanup
4. **Detailed Logging**: Full audit trail of all operations
5. **Rollback Ready**: Easy to revert if needed

## Post-Migration

After successful migration:

1. **Update Frontend**: Ensure Next.js config includes R2 domains
2. **Test Images**: Verify images load correctly in the application
3. **Monitor**: Check R2 usage and costs
4. **Cleanup**: Remove local uploads folder when ready
5. **Delete Scripts**: Remove migration scripts from production

## Script Files

- `migrate-images-dry-run.ts` - Analysis script
- `migrate-images-to-r2.ts` - Migration script
- `cleanup-local-uploads.ts` - Cleanup script

**Note**: These are temporary scripts and should be deleted after successful migration.
