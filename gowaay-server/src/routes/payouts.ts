import express from 'express';
import { PayoutRequest, HostProfile, AccountLedger } from '../models';
import { requireUser, requireHost, requireAdmin, AuthenticatedRequest } from '../middleware/auth';
import { payoutRequestSchema, payoutApprovalSchema, paginationSchema, statusFilterSchema } from '../schemas';
import { validateBody, validateQuery } from '../middleware/validateRequest';

const router: express.Router = express.Router();

// @route   GET /api/payouts/mine
// @desc    Get current user's payout requests
// @access  Private (host)
router.get('/mine', requireHost, validateQuery(paginationSchema.merge(statusFilterSchema)), async (req: AuthenticatedRequest, res) => {
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

    const payoutRequests = await PayoutRequest.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit));

    const total = await PayoutRequest.countDocuments(filter);

    return res.json({
      success: true,
      data: {
        payoutRequests,
        pagination: {
          page: Number(page),
          limit: Number(limit),
          total,
          pages: Math.ceil(total / Number(limit))
        }
      }
    });
  } catch (error) {
    console.error('Get my payouts error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// @route   POST /api/payouts/request
// @desc    Create a payout request
// @access  Private (host)
router.post('/request', requireHost, validateBody(payoutRequestSchema), async (req: AuthenticatedRequest, res) => {
  try {
    // Get host profile
    const hostProfile = await HostProfile.findOne({ userId: req.user!.id });
    if (!hostProfile) {
      return res.status(404).json({
        success: false,
        message: 'Host profile not found'
      });
    }

    if (hostProfile.status !== 'approved') {
      return res.status(400).json({
        success: false,
        message: 'Host profile must be approved to request payouts'
      });
    }

    // Check if there's a pending payout request
    const pendingRequest = await PayoutRequest.findOne({
      hostId: hostProfile._id,
      status: 'pending'
    });

    if (pendingRequest) {
      return res.status(400).json({
        success: false,
        message: 'You already have a pending payout request'
      });
    }

    // Create payout request
    const payoutRequest = new PayoutRequest({
      hostId: hostProfile._id,
      ...req.body,
      status: 'pending'
    });

    await payoutRequest.save();

    return res.status(201).json({
      success: true,
      message: 'Payout request submitted successfully',
      data: {
        id: payoutRequest._id,
        amountTk: payoutRequest.amountTk,
        method: payoutRequest.method,
        status: payoutRequest.status,
        createdAt: payoutRequest.createdAt
      }
    });
  } catch (error) {
    console.error('Create payout request error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// @route   GET /api/admin/payouts
// @desc    Get all payout requests (admin only)
// @access  Private (admin)
router.get('/admin/payouts', requireAdmin, validateQuery(paginationSchema.merge(statusFilterSchema)), async (req, res) => {
  try {
    const { page, limit, status } = req.query;
    const skip = (Number(page) - 1) * Number(limit);

    const filter: any = {};
    if (status) filter.status = status;

    const payoutRequests = await PayoutRequest.find(filter)
      .populate('hostId', 'displayName locationName')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit));

    const total = await PayoutRequest.countDocuments(filter);

    return res.json({
      success: true,
      data: {
        payoutRequests,
        pagination: {
          page: Number(page),
          limit: Number(limit),
          total,
          pages: Math.ceil(total / Number(limit))
        }
      }
    });
  } catch (error) {
    console.error('Get admin payouts error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// @route   POST /api/admin/payouts/:id/approve
// @desc    Approve payout request (admin only)
// @access  Private (admin)
router.post('/admin/payouts/:id/approve', requireAdmin, validateBody(payoutApprovalSchema), async (req, res) => {
  try {
    const payoutRequest = await PayoutRequest.findById(req.params.id);
    if (!payoutRequest) {
      return res.status(404).json({
        success: false,
        message: 'Payout request not found'
      });
    }

    if (payoutRequest.status !== 'pending') {
      return res.status(400).json({
        success: false,
        message: 'Payout request is not pending'
      });
    }

    // Update payout request status
    payoutRequest.status = 'approved';
    await payoutRequest.save();

    // Record payout in ledger
    const ledgerEntry = new AccountLedger({
      type: 'payout',
      ref: { payoutRequestId: payoutRequest._id },
      amountTk: -Math.abs(payoutRequest.amountTk), // Payout amounts are negative
      note: `Payout approved for ${payoutRequest.method.type} - ${payoutRequest.method.accountNo || 'N/A'}`,
      at: new Date()
    });

    await ledgerEntry.save();

    return res.json({
      success: true,
      message: 'Payout request approved successfully',
      data: {
        id: payoutRequest._id,
        status: payoutRequest.status,
        amountTk: payoutRequest.amountTk,
        method: payoutRequest.method,
        updatedAt: payoutRequest.updatedAt
      }
    });
  } catch (error) {
    console.error('Approve payout error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// @route   POST /api/admin/payouts/:id/reject
// @desc    Reject payout request (admin only)
// @access  Private (admin)
router.post('/admin/payouts/:id/reject', requireAdmin, validateBody(payoutApprovalSchema), async (req, res) => {
  try {
    const payoutRequest = await PayoutRequest.findById(req.params.id);
    if (!payoutRequest) {
      return res.status(404).json({
        success: false,
        message: 'Payout request not found'
      });
    }

    if (payoutRequest.status !== 'pending') {
      return res.status(400).json({
        success: false,
        message: 'Payout request is not pending'
      });
    }

    // Update payout request status
    payoutRequest.status = 'rejected';
    await payoutRequest.save();

    return res.json({
      success: true,
      message: 'Payout request rejected',
      data: {
        id: payoutRequest._id,
        status: payoutRequest.status,
        updatedAt: payoutRequest.updatedAt
      }
    });
  } catch (error) {
    console.error('Reject payout error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// @route   GET /api/payouts/:id
// @desc    Get payout request details
// @access  Private (host or admin)
router.get('/:id', requireUser, async (req: AuthenticatedRequest, res) => {
  try {
    const payoutRequest = await PayoutRequest.findById(req.params.id)
      .populate('hostId', 'displayName locationName');

    if (!payoutRequest) {
      return res.status(404).json({
        success: false,
        message: 'Payout request not found'
      });
    }

    // Check permissions
    if (req.user!.role === 'host') {
      const hostProfile = await HostProfile.findOne({ userId: req.user!.id });
      if (!hostProfile || payoutRequest.hostId._id.toString() !== (hostProfile._id as any).toString()) {
        return res.status(403).json({
          success: false,
          message: 'Access denied'
        });
      }
    }

    return res.json({
      success: true,
      data: payoutRequest
    });
  } catch (error) {
    console.error('Get payout request error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

export default router;
