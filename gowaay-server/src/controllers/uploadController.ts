import { Request, Response, NextFunction } from 'express';
import sharp from 'sharp';
import { v4 as uuidv4 } from 'uuid';
import { AppError } from '../middleware/errorHandler';
import { uploadToR2, deleteFromR2, extractKeyFromUrl } from '../utils/r2';

export const uploadImage = async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.file) {
      const error: AppError = new Error('No image file provided');
      error.statusCode = 400;
      return next(error);
    }

    try {
      // Generate unique key for R2
      const key = `misc/${uuidv4()}.webp`;
      
      // Process image with sharp
      const processedBuffer = await sharp(req.file.buffer)
        .resize(1920, 1920, {
          fit: 'inside',
          withoutEnlargement: true
        })
        .webp({ quality: 80 })
        .toBuffer();

      // Upload to R2
      const imageUrl = await uploadToR2(key, processedBuffer, 'image/webp');

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