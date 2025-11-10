import express, { Request, Response } from 'express';
import { Review, Booking, Room } from '../models';
import { requireUser } from '../middleware/auth';
import { z } from 'zod';
import { validateBody } from '../middleware/validateRequest';

interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    role: string;
  };
}

const router: express.Router = express.Router();

// Validation schema
const createReviewSchema = z.object({
  bookingId: z.string().min(1, 'Booking ID is required'),
  rating: z.number().min(1, 'Rating must be at least 1').max(5, 'Rating cannot exceed 5'),
  comment: z.string().min(10, 'Comment must be at least 10 characters').max(1000, 'Comment cannot exceed 1000 characters')
});

// @route   POST /api/reviews
// @desc    Create a review for a completed booking
// @access  Private
router.post('/', requireUser, validateBody(createReviewSchema), async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { bookingId, rating, comment } = req.body;

    // Check if booking exists and belongs to user
    const booking = await Booking.findById(bookingId).populate('roomId');
    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }

    // Verify booking belongs to the user
    if (booking.userId.toString() !== req.user!.id) {
      return res.status(403).json({
        success: false,
        message: 'You can only review your own bookings'
      });
    }

    // Check if booking is confirmed and checkout date has passed
    const now = new Date();
    if (booking.status !== 'confirmed') {
      return res.status(400).json({
        success: false,
        message: 'You can only review confirmed bookings'
      });
    }

    if (booking.checkOut > now) {
      return res.status(400).json({
        success: false,
        message: 'You can only review after checkout date has passed'
      });
    }

    // Check if review already exists
    const existingReview = await Review.findOne({ bookingId });
    if (existingReview) {
      return res.status(400).json({
        success: false,
        message: 'You have already reviewed this booking'
      });
    }

    // Create review
    const review = new Review({
      bookingId,
      roomId: booking.roomId,
      userId: req.user!.id,
      hostId: booking.hostId,
      rating,
      comment
    });

    await review.save();

    // Mark booking as reviewed
    booking.hasReview = true;
    await booking.save();

    // Update room's average rating and total reviews
    const room = await Room.findById(booking.roomId);
    if (room) {
      const allReviews = await Review.find({ roomId: room._id });
      const totalRating = allReviews.reduce((sum, r) => sum + r.rating, 0);
      room.averageRating = Number((totalRating / allReviews.length).toFixed(2));
      room.totalReviews = allReviews.length;
      await room.save();
    }

    return res.status(201).json({
      success: true,
      message: 'Review submitted successfully',
      data: review
    });
  } catch (error) {
    console.error('Create review error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// @route   GET /api/reviews/room/:roomId
// @desc    Get all reviews for a room
// @access  Public
router.get('/room/:roomId', async (req: Request, res: Response) => {
  try {
    const { roomId } = req.params;
    const { page = 1, limit = 10 } = req.query;

    const skip = (Number(page) - 1) * Number(limit);

    const reviews = await Review.find({ roomId })
      .populate('userId', 'name')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit));

    const total = await Review.countDocuments({ roomId });

    return res.json({
      success: true,
      data: {
        reviews,
        pagination: {
          page: Number(page),
          limit: Number(limit),
          total,
          pages: Math.ceil(total / Number(limit))
        }
      }
    });
  } catch (error) {
    console.error('Get room reviews error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// @route   GET /api/reviews/my
// @desc    Get user's reviews
// @access  Private
router.get('/my', requireUser, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const skip = (Number(page) - 1) * Number(limit);

    const reviews = await Review.find({ userId: req.user!.id })
      .populate('roomId', 'title images')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit));

    const total = await Review.countDocuments({ userId: req.user!.id });

    return res.json({
      success: true,
      data: {
        reviews,
        pagination: {
          page: Number(page),
          limit: Number(limit),
          total,
          pages: Math.ceil(total / Number(limit))
        }
      }
    });
  } catch (error) {
    console.error('Get my reviews error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// @route   GET /api/reviews/booking/:bookingId
// @desc    Check if a booking has a review
// @access  Private
router.get('/booking/:bookingId', requireUser, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { bookingId } = req.params;

    const review = await Review.findOne({ bookingId });

    return res.json({
      success: true,
      data: {
        hasReview: !!review,
        review
      }
    });
  } catch (error) {
    console.error('Check booking review error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

export default router;

