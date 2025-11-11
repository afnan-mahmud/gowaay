import { Request, Response, NextFunction } from 'express';
import sharp from 'sharp';
import { v4 as uuidv4 } from 'uuid';
import { AppError } from '../middleware/errorHandler';
import { uploadToR2, deleteFromR2, extractKeyFromUrl } from '../utils/r2';
import fs from 'fs';
import path from 'path';

// Check if R2 is configured
const isR2Configured = () => {
  const accountId = process.env.CF_ACCOUNT_ID || process.env.CF_R2_ACCOUNT_ID;
  return !!(accountId && process.env.CF_R2_ACCESS_KEY_ID && process.env.CF_R2_SECRET_ACCESS_KEY && process.env.CF_R2_BUCKET_NAME);
};

export const uploadImage = async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.file) {
      const error: AppError = new Error('No image file provided');
      error.statusCode = 400;
      return next(error);
    }

    try {
      // Generate unique filename
      const filename = `${uuidv4()}.webp`;
      const key = `misc/${filename}`;
      
      // Process image with sharp
      const processedBuffer = await sharp(req.file.buffer)
        .resize(1920, 1920, {
          fit: 'inside',
          withoutEnlargement: true
        })
        .webp({ quality: 80 })
        .toBuffer();

      let imageUrl: string;

      // Try to upload to R2 if configured, otherwise save locally
      if (isR2Configured()) {
        try {
          imageUrl = await uploadToR2(key, processedBuffer, 'image/webp');
          console.log('✅ Image uploaded to R2:', imageUrl);
        } catch (r2Error) {
          console.warn('⚠️  R2 upload failed, falling back to local storage:', r2Error);
          // Fallback to local storage
          imageUrl = await saveLocalImage(filename, processedBuffer);
        }
      } else {
        console.log('ℹ️  R2 not configured, using local storage');
        // Save locally if R2 is not configured
        imageUrl = await saveLocalImage(filename, processedBuffer);
      }

      res.json({
        success: true,
        message: 'Image uploaded successfully',
        data: {
          filename: key,
          originalName: req.file.originalname,
          size: processedBuffer.length,
          url: imageUrl
        }
      });
    } catch (processingError) {
      console.error('Image processing error:', processingError);
      const error: AppError = new Error('Failed to process image');
      error.statusCode = 500;
      return next(error);
    }
  } catch (error) {
    next(error);
  }
};

// Helper function to save image locally
async function saveLocalImage(filename: string, buffer: Buffer): Promise<string> {
  const uploadsDir = path.join(__dirname, '../../uploads');
  
  // Create uploads directory if it doesn't exist
  if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
  }

  const filePath = path.join(uploadsDir, filename);
  
  // Write file to disk
  await fs.promises.writeFile(filePath, buffer);
  
  // Return URL path (relative to server)
  const baseUrl = process.env.API_BASE_URL || 'http://localhost:8080';
  return `${baseUrl}/uploads/${filename}`;
}

export const deleteImage = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { url } = req.body;
    
    if (!url) {
      const error: AppError = new Error('Image URL is required');
      error.statusCode = 400;
      return next(error);
    }

    try {
      // Extract key from URL and delete from R2
      const key = extractKeyFromUrl(url);
      await deleteFromR2(key);

      res.json({
        success: true,
        message: 'Image deleted successfully'
      });
    } catch (deleteError) {
      console.error('R2 delete error:', deleteError);
      const error: AppError = new Error('Failed to delete image');
      error.statusCode = 500;
      return next(error);
    }
  } catch (error) {
    next(error);
  }
};