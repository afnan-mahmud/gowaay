import express from 'express';
import { Booking, Room, HostProfile, User, AccountLedger } from '../models';
import { requireUser, requireHost, requireAdmin, AuthenticatedRequest } from '../middleware/auth';
import { bookingQuoteSchema, bookingCreateSchema, bookingApprovalSchema, paginationSchema, statusFilterSchema, dateRangeSchema } from '../schemas';
import { validateBody, validateQuery } from '../middleware/validateRequest';
import { checkBookingOverlap, hasOverlap } from '../utils/bookingUtils';

const router: express.Router = express.Router();

// @route   POST /api/bookings/quote
// @desc    Get booking quote and check availability
// @access  Public
router.post('/quote', validateBody(bookingQuoteSchema), async (req, res) => {
  try {
    const { roomId, checkIn, checkOut, guests } = req.body;

    // Get room details
    const room = await Room.findById(roomId);
    if (!room) {
      return res.status(404).json({
        success: false,
        message: 'Room not found'
      });
    }

    if (room.status !== 'approved') {
      return res.status(400).json({
        success: false,
        message: 'Room is not available for booking'
      });
    }

    // Check for overlapping bookings
    const hasOverlappingBookings = await hasOverlap(
      roomId,
      new Date(checkIn),
      new Date(checkOut)
    );

    if (hasOverlappingBookings) {
      return res.status(400).json({
        success: false,
        message: 'Room is not available for the selected dates'
      });
    }

    // Calculate total amount
    const checkInDate = new Date(checkIn);
    const checkOutDate = new Date(checkOut);
    const nights = Math.ceil((checkOutDate.getTime() - checkInDate.getTime()) / (1000 * 60 * 60 * 24));
    const totalAmount = room.totalPriceTk * nights;

    return res.json({
      success: true,
      data: {
        roomId,
        checkIn,
        checkOut,
        guests,
        nights,
        basePriceTk: room.basePriceTk,
        commissionTk: room.commissionTk,
        totalPriceTk: room.totalPriceTk,
        totalAmount,
        instantBooking: room.instantBooking
      }
    });
  } catch (error) {
    console.error('Booking quote error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// @route   POST /api/bookings/create
// @desc    Create a new booking
// @access  Private
router.post('/create', requireUser, validateBody(bookingCreateSchema), async (req: AuthenticatedRequest, res) => {
  try {
    const { roomId, checkIn, checkOut, guests, mode } = req.body;

    // Get room and host details
    const room = await Room.findById(roomId).populate('hostId');
    if (!room) {
      return res.status(404).json({
        success: false,
        message: 'Room not found'
      });
    }

    if (room.status !== 'approved') {
      return res.status(400).json({
        success: false,
        message: 'Room is not available for booking'
      });
    }

    // Check for overlapping bookings
    const hasOverlappingBookings = await hasOverlap(
      roomId,
      new Date(checkIn),
      new Date(checkOut)
    );

    if (hasOverlappingBookings) {
      return res.status(400).json({
        success: false,
        message: 'Room is not available for the selected dates'
      });
    }

    // Calculate total amount
    const checkInDate = new Date(checkIn);
    const checkOutDate = new Date(checkOut);
    const nights = Math.ceil((checkOutDate.getTime() - checkInDate.getTime()) / (1000 * 60 * 60 * 24));
    const totalAmount = room.totalPriceTk * nights;

    // Generate transaction ID
    const transactionId = `TXN_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    // Create booking
    const booking = new Booking({
      roomId,
      userId: req.user!.id,
      hostId: room.hostId._id,
      checkIn: new Date(checkIn),
      checkOut: new Date(checkOut),
      guests,
      mode,
      status: mode === 'instant' ? 'pending' : 'pending',
      transactionId,
      paymentStatus: mode === 'instant' ? 'unpaid' : 'unpaid',
      amountTk: totalAmount
    });

    await booking.save();

    // Track ViewContent event for booking creation
    try {
      const eventResponse = await fetch(`${process.env.BACKEND_URL}/api/events/booking-created`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(req.headers.authorization && { 'Authorization': req.headers.authorization }),
          ...(req.headers['x-fbp'] && { 'x-fbp': req.headers['x-fbp'] as string }),
          ...(req.headers['x-fbc'] && { 'x-fbc': req.headers['x-fbc'] as string }),
        },
        body: JSON.stringify({
          bookingId: booking._id,
          roomId: roomId,
          amount: totalAmount,
          userEmail: req.user!.email,
          userName: req.user!.name,
          userPhone: req.user!.phone,
        }),
      });
      
      if (eventResponse.ok) {
        console.log(`[BOOKING] ViewContent event tracked for booking: ${booking._id}`);
      }
    } catch (error) {
      console.warn('[BOOKING] Failed to track ViewContent event:', error);
    }

    // If instant booking, return payment URL
    if (mode === 'instant') {
      return res.status(201).json({
        success: true,
        message: 'Booking created successfully. Please complete payment.',
        data: {
          bookingId: booking._id,
          transactionId: booking.transactionId,
          amountTk: booking.amountTk,
          paymentUrl: `/api/payments/ssl/init?bookingId=${booking._id}`
        }
      });
    } else {
      // Request mode - notify host (implement notification later)
      return res.status(201).json({
        success: true,
        message: 'Booking request submitted. Host will review and respond.',
        data: {
          bookingId: booking._id,
          status: booking.status,
          createdAt: booking.createdAt
        }
      });
    }
  } catch (error) {
    console.error('Create booking error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// @route   GET /api/bookings/mine
// @desc    Get current user's bookings
// @access  Private
router.get('/mine', requireUser, validateQuery(paginationSchema.merge(statusFilterSchema)), async (req: AuthenticatedRequest, res) => {
  try {
    const { page, limit, status } = req.query;
    const skip = (Number(page) - 1) * Number(limit);

    const filter: any = { userId: req.user!.id };
    if (status) filter.status = status;

    const bookings = await Booking.find(filter)
      .populate('roomId', 'title images totalPriceTk locationName')
      .populate('hostId', 'displayName phone locationMapUrl')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit));

    const total = await Booking.countDocuments(filter);

    return res.json({
      success: true,
      data: {
        bookings,
        pagination: {
          page: Number(page),
          limit: Number(limit),
          total,
          pages: Math.ceil(total / Number(limit))
        }
      }
    });
  } catch (error) {
    console.error('Get my bookings error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// @route   GET /api/host/bookings
// @desc    Get host's bookings
// @access  Private (host)
router.get('/host/bookings', requireHost, validateQuery(paginationSchema.merge(statusFilterSchema)), async (req: AuthenticatedRequest, res) => {
  try {
    const { page, limit, status } = req.query;
    const skip = (Number(page) - 1) * Number(limit);

    // Get host profile
    const hostProfile = await HostProfile.findOne({ userId: req.user!.id });
    if (!hostProfile) {
      return res.status(404).json({
        success: false,
        message: 'Host profile not found'
      });
    }

    const filter: any = { hostId: hostProfile._id };
    if (status) filter.status = status;

    const bookings = await Booking.find(filter)
      .populate('roomId', 'title images totalPriceTk')
      .populate('userId', 'name email phone')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit));

    const total = await Booking.countDocuments(filter);

    return res.json({
      success: true,
      data: {
        bookings,
        pagination: {
          page: Number(page),
          limit: Number(limit),
          total,
          pages: Math.ceil(total / Number(limit))
        }
      }
    });
  } catch (error) {
    console.error('Get host bookings error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// @route   POST /api/bookings/:id/approve
// @desc    Approve booking (host or admin)
// @access  Private (host or admin)
router.post('/:id/approve', requireUser, validateBody(bookingApprovalSchema), async (req: AuthenticatedRequest, res) => {
  try {
    const booking = await Booking.findById(req.params.id);
    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }

    // Check permissions
    if (req.user!.role === 'host') {
      const hostProfile = await HostProfile.findOne({ userId: req.user!.id });
      if (!hostProfile || booking.hostId.toString() !== (hostProfile._id as any).toString()) {
        return res.status(403).json({
          success: false,
          message: 'Access denied'
        });
      }
    }

    booking.status = 'confirmed';
    await booking.save();

    return res.json({
      success: true,
      message: 'Booking approved successfully',
      data: {
        id: booking._id,
        status: booking.status,
        updatedAt: booking.updatedAt
      }
    });
  } catch (error) {
    console.error('Approve booking error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// @route   POST /api/bookings/:id/reject
// @desc    Reject booking (host or admin)
// @access  Private (host or admin)
router.post('/:id/reject', requireUser, validateBody(bookingApprovalSchema), async (req: AuthenticatedRequest, res) => {
  try {
    const booking = await Booking.findById(req.params.id);
    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }

    // Check permissions
    if (req.user!.role === 'host') {
      const hostProfile = await HostProfile.findOne({ userId: req.user!.id });
      if (!hostProfile || booking.hostId.toString() !== (hostProfile._id as any).toString()) {
        return res.status(403).json({
          success: false,
          message: 'Access denied'
        });
      }
    }

    booking.status = 'rejected';
    await booking.save();

    return res.json({
      success: true,
      message: 'Booking rejected',
      data: {
        id: booking._id,
        status: booking.status,
        updatedAt: booking.updatedAt
      }
    });
  } catch (error) {
    console.error('Reject booking error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// @route   PUT /api/bookings/:id
// @desc    Update booking status
// @access  Private (host or admin)
router.put('/:id', requireUser, async (req: AuthenticatedRequest, res) => {
  try {
    const { status } = req.body;
    const booking = await Booking.findById(req.params.id);
    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }

    // Check permissions
    if (req.user!.role === 'host') {
      const hostProfile = await HostProfile.findOne({ userId: req.user!.id });
      if (!hostProfile || booking.hostId.toString() !== (hostProfile._id as any).toString()) {
        return res.status(403).json({
          success: false,
          message: 'Access denied'
        });
      }
    }

    // Update booking status
    if (status) {
      booking.status = status;
    }
    
    await booking.save();

    return res.json({
      success: true,
      message: 'Booking updated successfully',
      data: {
        id: booking._id,
        status: booking.status,
        updatedAt: booking.updatedAt
      }
    });
  } catch (error) {
    console.error('Update booking error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// @route   POST /api/bookings/:id/cancel
// @desc    Cancel booking with refund logic
// @access  Private (user)
router.post('/:id/cancel', requireUser, async (req: AuthenticatedRequest, res) => {
  try {
    const booking = await Booking.findById(req.params.id).populate('roomId');
    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }

    // Check if user owns this booking
    if (booking.userId.toString() !== req.user!.id) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    // Check if booking can be cancelled
    if (booking.status === 'cancelled') {
      return res.status(400).json({
        success: false,
        message: 'Booking is already cancelled'
      });
    }

    if (booking.status === 'confirmed' && booking.paymentStatus === 'paid') {
      // Check refund eligibility based on check-in time
      const now = new Date();
      const checkInTime = new Date(booking.checkIn);
      const hoursUntilCheckIn = (checkInTime.getTime() - now.getTime()) / (1000 * 60 * 60);

      if (hoursUntilCheckIn >= 24) {
        // Full refund eligible
        booking.paymentStatus = 'refunded';
        booking.status = 'cancelled';
        await booking.save();

        // Write refund adjustment to ledger
        const refundEntry = new AccountLedger({
          type: 'adjustment',
          ref: { bookingId: booking._id },
          amountTk: -booking.amountTk, // Negative amount for refund
          note: `Refund for cancelled booking ${booking._id}`,
          at: new Date()
        });
        await refundEntry.save();

        return res.json({
          success: true,
          message: 'Booking cancelled with full refund',
          data: {
            id: booking._id,
            status: booking.status,
            paymentStatus: booking.paymentStatus,
            refundAmount: booking.amountTk
          }
        });
      } else {
        // No refund - less than 24 hours
        booking.status = 'cancelled';
        await booking.save();

        return res.json({
          success: true,
          message: 'Booking cancelled. No refund available (less than 24 hours notice)',
          data: {
            id: booking._id,
            status: booking.status,
            paymentStatus: booking.paymentStatus,
            refundAmount: 0
          }
        });
      }
    } else {
      // Pending booking - just cancel
      booking.status = 'cancelled';
      await booking.save();

      return res.json({
        success: true,
        message: 'Booking cancelled successfully',
        data: {
          id: booking._id,
          status: booking.status
        }
      });
    }
  } catch (error) {
    console.error('Cancel booking error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Admin routes
// @route   GET /api/admin/bookings
// @desc    Get all bookings (admin only)
// @access  Private (admin)
router.get('/admin/bookings', requireAdmin, validateQuery(paginationSchema.merge(statusFilterSchema).merge(dateRangeSchema)), async (req, res) => {
  try {
    const { page, limit, status, from, to } = req.query;
    const skip = (Number(page) - 1) * Number(limit);

    const filter: any = {};
    if (status) filter.status = status;
    if (from || to) {
      filter.createdAt = {};
      if (from) filter.createdAt.$gte = new Date(from as string);
      if (to) filter.createdAt.$lte = new Date(to as string);
    }

    const bookings = await Booking.find(filter)
      .populate('roomId', 'title images totalPriceTk')
      .populate('userId', 'name email phone')
      .populate('hostId', 'displayName')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit));

    const total = await Booking.countDocuments(filter);

    return res.json({
      success: true,
      data: {
        bookings,
        pagination: {
          page: Number(page),
          limit: Number(limit),
          total,
          pages: Math.ceil(total / Number(limit))
        }
      }
    });
  } catch (error) {
    console.error('Get admin bookings error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

export default router;
