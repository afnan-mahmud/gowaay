import express from 'express';
import { AccountLedger, PayoutRequest } from '../models';
import { Booking } from '../models/Booking';
import { requireAdmin } from '../middleware/auth';
import { accountSummarySchema, accountSpendSchema, dateRangeSchema } from '../schemas';
import { validateBody, validateQuery } from '../middleware/validateRequest';

const router: express.Router = express.Router();

// @route   GET /api/accounts/summary
// @desc    Get financial summary (admin only)
// @access  Private (admin)
router.get('/summary', requireAdmin, validateQuery(accountSummarySchema), async (req, res) => {
  try {
    const { from, to } = req.query;

    const filter: any = {};
    if (from || to) {
      filter.at = {};
      if (from) filter.at.$gte = new Date(from as string);
      if (to) filter.at.$lte = new Date(to as string);
    }

    // Get all ledger entries
    const ledgerEntries = await AccountLedger.find(filter).sort({ at: -1 });

    // Calculate summary
    const summary = {
      totalCommission: 0,
      totalPayouts: 0,
      totalSpend: 0,
      totalAdjustments: 0,
      netIncome: 0,
      transactionCount: ledgerEntries.length
    };

    ledgerEntries.forEach(entry => {
      switch (entry.type) {
        case 'commission':
          summary.totalCommission += entry.amountTk;
          break;
        case 'payout':
          summary.totalPayouts += Math.abs(entry.amountTk); // payout amounts are negative
          break;
        case 'spend':
          summary.totalSpend += Math.abs(entry.amountTk); // spend amounts are negative
          break;
        case 'adjustment':
          summary.totalAdjustments += entry.amountTk;
          break;
      }
    });

    summary.netIncome = summary.totalCommission - summary.totalPayouts - summary.totalSpend + summary.totalAdjustments;

    // Get recent transactions
    const recentTransactions = ledgerEntries.slice(0, 10);

    res.json({
      success: true,
      data: {
        summary,
        recentTransactions,
        period: {
          from: from || null,
          to: to || null
        }
      }
    });
  } catch (error) {
    console.error('Get account summary error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// @route   GET /api/accounts/ledger
// @desc    Get account ledger (admin only)
// @access  Private (admin)
router.get('/ledger', requireAdmin, validateQuery(dateRangeSchema), async (req, res) => {
  try {
    const { from, to } = req.query;

    const filter: any = {};
    if (from || to) {
      filter.at = {};
      if (from) filter.at.$gte = new Date(from as string);
      if (to) filter.at.$lte = new Date(to as string);
    }

    const ledgerEntries = await AccountLedger.find(filter)
      .populate('ref.bookingId', 'transactionId amountTk')
      .populate('ref.payoutRequestId', 'amountTk method')
      .sort({ at: -1 });

    res.json({
      success: true,
      data: ledgerEntries
    });
  } catch (error) {
    console.error('Get ledger error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// @route   POST /api/accounts/spend
// @desc    Record a spend transaction (admin only)
// @access  Private (admin)
router.post('/spend', requireAdmin, validateBody(accountSpendSchema), async (req, res) => {
  try {
    const { amountTk, note } = req.body;

    // Create ledger entry (spend amounts are negative)
    const ledgerEntry = new AccountLedger({
      type: 'spend',
      amountTk: -Math.abs(amountTk), // Ensure negative
      note,
      at: new Date()
    });

    await ledgerEntry.save();

    res.status(201).json({
      success: true,
      message: 'Spend recorded successfully',
      data: {
        id: ledgerEntry._id,
        type: ledgerEntry.type,
        amountTk: ledgerEntry.amountTk,
        note: ledgerEntry.note,
        at: ledgerEntry.at
      }
    });
  } catch (error) {
    console.error('Record spend error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// @route   POST /api/accounts/adjustment
// @desc    Record an adjustment transaction (admin only)
// @access  Private (admin)
router.post('/adjustment', requireAdmin, validateBody(accountSpendSchema), async (req, res) => {
  try {
    const { amountTk, note } = req.body;

    // Create ledger entry
    const ledgerEntry = new AccountLedger({
      type: 'adjustment',
      amountTk,
      note,
      at: new Date()
    });

    await ledgerEntry.save();

    res.status(201).json({
      success: true,
      message: 'Adjustment recorded successfully',
      data: {
        id: ledgerEntry._id,
        type: ledgerEntry.type,
        amountTk: ledgerEntry.amountTk,
        note: ledgerEntry.note,
        at: ledgerEntry.at
      }
    });
  } catch (error) {
    console.error('Record adjustment error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Helper function to record commission (called when booking is confirmed)
export const recordCommission = async (bookingId: string, amountTk: number) => {
  try {
    const ledgerEntry = new AccountLedger({
      type: 'commission',
      ref: { bookingId },
      amountTk,
      note: `Commission from booking ${bookingId}`,
      at: new Date()
    });

    await ledgerEntry.save();
    return ledgerEntry;
  } catch (error) {
    console.error('Record commission error:', error);
    throw error;
  }
};

// Helper function to record payout (called when payout is approved)
export const recordPayout = async (payoutRequestId: string, amountTk: number) => {
  try {
    const ledgerEntry = new AccountLedger({
      type: 'payout',
      ref: { payoutRequestId },
      amountTk: -Math.abs(amountTk), // Payout amounts are negative
      note: `Payout for request ${payoutRequestId}`,
      at: new Date()
    });

    await ledgerEntry.save();
    return ledgerEntry;
  } catch (error) {
    console.error('Record payout error:', error);
    throw error;
  }
};

export default router;
