import express from 'express';
import { HostProfile, User, Room, Booking, AccountLedger, PayoutRequest } from '../models';
import { requireUser, requireHost, requireAdmin, AuthenticatedRequest } from '../middleware/auth';
import { hostApplySchema, hostApprovalSchema, paginationSchema, statusFilterSchema } from '../schemas';
import { validateBody, validateQuery } from '../middleware/validateRequest';

const router: express.Router = express.Router();

// @route   POST /api/hosts/apply
// @desc    Apply to become a host
// @access  Private (any authenticated user)
router.post('/apply', requireUser, validateBody(hostApplySchema), async (req: AuthenticatedRequest, res) => {
  try {
    // Check if user already has a host profile
    const existingProfile = await HostProfile.findOne({ userId: req.user!.id });
    if (existingProfile) {
      return res.status(400).json({
        success: false,
        message: 'Host profile already exists'
      });
    }

    // Create host profile
    const hostProfile = new HostProfile({
      userId: req.user!.id,
      ...req.body,
      status: 'pending'
    });

    await hostProfile.save();

    return res.status(201).json({
      success: true,
      message: 'Host application submitted successfully',
      data: {
        id: hostProfile._id,
        status: hostProfile.status,
        createdAt: hostProfile.createdAt
      }
    });
  } catch (error) {
    console.error('Host application error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// @route   GET /api/hosts/me
// @desc    Get current user's host profile
// @access  Private (host or admin)
router.get('/me', requireUser, async (req: AuthenticatedRequest, res) => {
  try {
    const hostProfile = await HostProfile.findOne({ userId: req.user!.id })
      .populate('userId', 'name email phone');

    if (!hostProfile) {
      return res.status(404).json({
        success: false,
        message: 'Host profile not found'
      });
    }

    return res.json({
      success: true,
      data: {
        id: hostProfile._id,
        displayName: hostProfile.displayName,
        phone: hostProfile.phone,
        whatsapp: hostProfile.whatsapp,
        locationName: hostProfile.locationName,
        locationMapUrl: hostProfile.locationMapUrl,
        nidFrontUrl: hostProfile.nidFrontUrl,
        nidBackUrl: hostProfile.nidBackUrl,
        status: hostProfile.status,
        propertyCount: hostProfile.propertyCount,
        user: hostProfile.userId,
        createdAt: hostProfile.createdAt,
        updatedAt: hostProfile.updatedAt
      }
    });
  } catch (error) {
    console.error('Get host profile error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// @route   GET /api/admin/hosts
// @desc    Get all host profiles (admin only)
// @access  Private (admin)
router.get('/admin/hosts', requireAdmin, validateQuery(paginationSchema.merge(statusFilterSchema)), async (req, res) => {
  try {
    const { page, limit, status } = req.query;
    const skip = (Number(page) - 1) * Number(limit);

    const filter: any = {};
    if (status) filter.status = status;

    const hosts = await HostProfile.find(filter)
      .populate('userId', 'name email phone createdAt')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit));

    const total = await HostProfile.countDocuments(filter);

    return res.json({
      success: true,
      data: {
        hosts,
        pagination: {
          page: Number(page),
          limit: Number(limit),
          total,
          pages: Math.ceil(total / Number(limit))
        }
      }
    });
  } catch (error) {
    console.error('Get hosts error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// @route   POST /api/admin/hosts/:id/approve
// @desc    Approve host application
// @access  Private (admin)
router.post('/admin/hosts/:id/approve', requireAdmin, validateBody(hostApprovalSchema), async (req, res) => {
  try {
    const hostProfile = await HostProfile.findById(req.params.id);
    if (!hostProfile) {
      return res.status(404).json({
        success: false,
        message: 'Host profile not found'
      });
    }

    hostProfile.status = 'approved';
    await hostProfile.save();

    // Update user role to host
    await User.findByIdAndUpdate(hostProfile.userId, { role: 'host' });

    return res.json({
      success: true,
      message: 'Host application approved successfully',
      data: {
        id: hostProfile._id,
        status: hostProfile.status,
        updatedAt: hostProfile.updatedAt
      }
    });
  } catch (error) {
    console.error('Approve host error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// @route   POST /api/admin/hosts/:id/reject
// @desc    Reject host application
// @access  Private (admin)
router.post('/admin/hosts/:id/reject', requireAdmin, validateBody(hostApprovalSchema), async (req, res) => {
  try {
    const hostProfile = await HostProfile.findById(req.params.id);
    if (!hostProfile) {
      return res.status(404).json({
        success: false,
        message: 'Host profile not found'
      });
    }

    hostProfile.status = 'rejected';
    await hostProfile.save();

    return res.json({
      success: true,
      message: 'Host application rejected',
      data: {
        id: hostProfile._id,
        status: hostProfile.status,
        updatedAt: hostProfile.updatedAt
      }
    });
  } catch (error) {
    console.error('Reject host error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// @route   GET /api/hosts/stats
// @desc    Get host dashboard statistics
// @access  Private (host)
router.get('/stats', requireHost, async (req: AuthenticatedRequest, res) => {
  try {
    const hostProfile = await HostProfile.findOne({ userId: req.user!.id });
    if (!hostProfile) {
      return res.status(404).json({
        success: false,
        message: 'Host profile not found'
      });
    }

    // Get booking statistics for this host
    const totalBookings = await Booking.countDocuments({ hostId: hostProfile._id });
    const confirmedBookings = await Booking.countDocuments({ 
      hostId: hostProfile._id, 
      status: 'confirmed' 
    });
    const pendingBookings = await Booking.countDocuments({ 
      hostId: hostProfile._id, 
      status: 'pending' 
    });

    // Get earnings from confirmed bookings
    const earningsResult = await Booking.aggregate([
      { 
        $match: { 
          hostId: hostProfile._id, 
          status: 'confirmed', 
          paymentStatus: 'paid' 
        } 
      },
      { $group: { _id: null, total: { $sum: '$amountTk' } } }
    ]);
    const totalEarnings = earningsResult.length > 0 ? earningsResult[0].total : 0;

    // Get room statistics
    const totalRooms = await Room.countDocuments({ hostId: hostProfile._id });
    const activeRooms = await Room.countDocuments({ 
      hostId: hostProfile._id, 
      status: 'approved' 
    });

    return res.json({
      success: true,
      data: {
        totalBookings,
        confirmedBookings,
        pendingBookings,
        totalEarnings,
        totalRooms,
        activeRooms
      }
    });
  } catch (error) {
    console.error('Host stats error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// @route   GET /api/hosts/rooms
// @desc    Get host's rooms
// @access  Private (host)
router.get('/rooms', requireHost, async (req: AuthenticatedRequest, res) => {
  try {
    const hostProfile = await HostProfile.findOne({ userId: req.user!.id });
    if (!hostProfile) {
      return res.status(404).json({
        success: false,
        message: 'Host profile not found'
      });
    }

    const rooms = await Room.find({ hostId: hostProfile._id })
      .sort({ createdAt: -1 });

    return res.json({
      success: true,
      data: rooms
    });
  } catch (error) {
    console.error('Get host rooms error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// @route   GET /api/hosts/bookings
// @desc    Get host's bookings
// @access  Private (host)
router.get('/bookings', requireHost, async (req: AuthenticatedRequest, res) => {
  try {
    const hostProfile = await HostProfile.findOne({ userId: req.user!.id });
    if (!hostProfile) {
      return res.status(404).json({
        success: false,
        message: 'Host profile not found'
      });
    }

    const bookings = await Booking.find({ hostId: hostProfile._id })
      .populate('roomId', 'title locationName images')
      .populate('userId', 'name email phone')
      .sort({ createdAt: -1 });

    return res.json({
      success: true,
      data: bookings
    });
  } catch (error) {
    console.error('Get host bookings error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// @route   GET /api/hosts/balance
// @desc    Get host balance and earnings summary
// @access  Private (host)
router.get('/balance', requireHost, async (req: AuthenticatedRequest, res) => {
  try {
    // Get host profile
    const hostProfile = await HostProfile.findOne({ userId: req.user!.id });
    if (!hostProfile) {
      return res.status(404).json({
        success: false,
        message: 'Host profile not found'
      });
    }

    // Get total earnings from confirmed bookings
    const earningsResult = await Booking.aggregate([
      { 
        $match: { 
          hostId: hostProfile._id, 
          status: 'confirmed', 
          paymentStatus: 'paid' 
        } 
      },
      { $group: { _id: null, total: { $sum: '$amountTk' } } }
    ]);
    const totalEarnings = earningsResult.length > 0 ? earningsResult[0].total : 0;

    // Get total payouts from ledger
    const payoutsResult = await AccountLedger.aggregate([
      { 
        $match: { 
          type: 'payout',
          'ref.payoutRequestId': { $exists: true }
        } 
      },
      { $group: { _id: null, total: { $sum: { $abs: '$amountTk' } } } }
    ]);
    const totalPayouts = payoutsResult.length > 0 ? payoutsResult[0].total : 0;

    // Get pending payouts
    const pendingPayoutsResult = await PayoutRequest.aggregate([
      { 
        $match: { 
          hostId: hostProfile._id, 
          status: 'pending' 
        } 
      },
      { $group: { _id: null, total: { $sum: '$amountTk' } } }
    ]);
    const pendingAmount = pendingPayoutsResult.length > 0 ? pendingPayoutsResult[0].total : 0;

    // Calculate available balance
    const availableBalance = totalEarnings - totalPayouts - pendingAmount;

    // Get monthly earnings (current month)
    const currentMonth = new Date();
    const startOfMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1);
    const endOfMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0);

    const monthlyEarningsResult = await Booking.aggregate([
      { 
        $match: { 
          hostId: hostProfile._id, 
          status: 'confirmed', 
          paymentStatus: 'paid',
          createdAt: { $gte: startOfMonth, $lte: endOfMonth }
        } 
      },
      { $group: { _id: null, total: { $sum: '$amountTk' } } }
    ]);
    const monthlyEarnings = monthlyEarningsResult.length > 0 ? monthlyEarningsResult[0].total : 0;

    return res.json({
      success: true,
      data: {
        totalEarnings,
        availableBalance,
        pendingAmount,
        monthlyEarnings,
        totalPayouts
      }
    });
  } catch (error) {
    console.error('Host balance error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// @route   GET /api/hosts/transactions
// @desc    Get host transaction history
// @access  Private (host)
router.get('/transactions', requireHost, validateQuery(paginationSchema), async (req: AuthenticatedRequest, res) => {
  try {
    const { page, limit } = req.query;
    const skip = (Number(page) - 1) * Number(limit);

    // Get host profile
    const hostProfile = await HostProfile.findOne({ userId: req.user!.id });
    if (!hostProfile) {
      return res.status(404).json({
        success: false,
        message: 'Host profile not found'
      });
    }

    // Get booking transactions (earnings)
    const bookingTransactions = await Booking.find({
      hostId: hostProfile._id,
      status: 'confirmed',
      paymentStatus: 'paid'
    })
    .populate('userId', 'name email')
    .populate('roomId', 'title')
    .select('amountTk createdAt userId roomId')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(Number(limit));

    // Get payout transactions
    const payoutTransactions = await PayoutRequest.find({
      hostId: hostProfile._id
    })
    .select('amountTk status createdAt method')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(Number(limit));

    // Combine and format transactions
    const transactions = [
      ...bookingTransactions.map(booking => ({
        _id: booking._id,
        type: 'booking',
        amount: booking.amountTk,
        description: `Booking payment - ${(booking.roomId as any).title}`,
        date: booking.createdAt,
        status: 'completed',
        user: booking.userId
      })),
      ...payoutTransactions.map(payout => ({
        _id: payout._id,
        type: 'payout',
        amount: -payout.amountTk,
        description: `Payout to ${payout.method.type} - ${payout.method.accountNo || 'N/A'}`,
        date: payout.createdAt,
        status: payout.status
      }))
    ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    const total = await Booking.countDocuments({
      hostId: hostProfile._id,
      status: 'confirmed',
      paymentStatus: 'paid'
    }) + await PayoutRequest.countDocuments({
      hostId: hostProfile._id
    });

    return res.json({
      success: true,
      data: {
        transactions,
        pagination: {
          page: Number(page),
          limit: Number(limit),
          total,
          pages: Math.ceil(total / Number(limit))
        }
      }
    });
  } catch (error) {
    console.error('Host transactions error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

export default router;
