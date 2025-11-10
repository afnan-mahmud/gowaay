import express from 'express';
import multer from 'multer';
import { uploadImage, deleteImage } from '../controllers/uploadController';
import { requireUser } from '../middleware/auth';
import { roomImageUpload, processRoomImages, deleteRoomImages } from '../middleware/upload';

const router: express.Router = express.Router();

// File filter for images only
const fileFilter = (req: any, file: any, cb: any) => {
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Only image files are allowed!'), false);
  }
};

// Configure multer for general image uploads using memory storage
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
  fileFilter: fileFilter
});

// Routes
router.post('/image', requireUser, upload.single('image'), uploadImage);
router.post('/public/image', upload.single('image'), uploadImage); // Public route for host applications
router.delete('/image', requireUser, deleteImage); // Changed to use body with URL

// Room image uploads
router.post('/rooms/:roomId/images', requireUser, roomImageUpload.array('images', 15), processRoomImages, async (req, res) => {
  try {
    const { roomId } = req.params;
    const processedImages = req.processedImages || [];

    if (processedImages.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No images were processed successfully'
      });
    }

    return res.json({
      success: true,
      message: `${processedImages.length} images uploaded successfully`,
      data: {
        roomId,
        images: processedImages,
        count: processedImages.length
      }
    });
  } catch (error) {
    console.error('Room image upload error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Delete room images
router.delete('/rooms/:roomId/images', requireUser, async (req, res) => {
  try {
    const { roomId } = req.params;
    const { imageUrls } = req.body;

    if (!imageUrls || !Array.isArray(imageUrls)) {
      return res.status(400).json({
        success: false,
        message: 'Image URLs array is required'
      });
    }

    await deleteRoomImages(roomId, imageUrls);

    return res.json({
      success: true,
      message: 'Images deleted successfully',
      data: {
        roomId,
        deletedCount: imageUrls.length
      }
    });
  } catch (error) {
    console.error('Delete room images error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

export default router;