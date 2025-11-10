import express from 'express';
import { Booking, PaymentTransaction, AccountLedger, Room, User } from '../models';
import { requireUser, AuthenticatedRequest } from '../middleware/auth';
import { paymentInitSchema } from '../schemas';
import { validateBody, validateQuery } from '../middleware/validateRequest';
import { hasOverlap } from '../utils/bookingUtils';
import { sslConfig, getMaskedStoreId } from '../utils/sslConfig';
const SSLCommerzPayment = require('sslcommerz-lts');

const router: express.Router = express.Router();

// Initialize SSLCommerz with validated config
const store_id = sslConfig.storeId;
const store_passwd = sslConfig.storePassword;
const is_live = sslConfig.isLive;

// @route   POST /api/payments/ssl/init
// @desc    Initialize SSLCOMMERZ payment with comprehensive validation
// @access  Private
router.post('/ssl/init', requireUser, validateBody(paymentInitSchema), async (req: AuthenticatedRequest, res) => {
  try {
    const { bookingId } = req.body;
    
    console.log(`[PAYMENT_INIT] Starting payment initialization for booking: ${bookingId}`);

    // Get booking with all related data
    const booking = await Booking.findById(bookingId)
      .populate('roomId')
      .populate('userId')
      .populate('hostId');

    if (!booking) {
      console.log(`[PAYMENT_INIT] Booking not found: ${bookingId}`);
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }

    // Verify booking belongs to authenticated user
    if (booking.userId._id.toString() !== req.user!.id) {
      console.log(`[PAYMENT_INIT] Access denied for booking: ${bookingId}, user: ${req.user!.id}`);
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    // Check booking status
    if (booking.status !== 'pending') {
      console.log(`[PAYMENT_INIT] Invalid booking status: ${booking.status} for booking: ${bookingId}`);
      return res.status(400).json({
        success: false,
        message: 'Booking is not in pending status'
      });
    }

    if (booking.paymentStatus !== 'unpaid') {
      console.log(`[PAYMENT_INIT] Invalid payment status: ${booking.paymentStatus} for booking: ${bookingId}`);
      return res.status(400).json({
        success: false,
        message: 'Booking is already paid or processed'
      });
    }

    // Verify room status
    if ((booking.roomId as any).status !== 'approved') {
      console.log(`[PAYMENT_INIT] Room not approved: ${(booking.roomId as any).status} for booking: ${bookingId}`);
      return res.status(400).json({
        success: false,
        message: 'Room is not available for booking'
      });
    }

    // Check for booking overlaps
    const hasOverlappingBookings = await hasOverlap(
      booking.roomId._id.toString(),
      booking.checkIn,
      booking.checkOut,
      (booking._id as any).toString()
    );

    if (hasOverlappingBookings) {
      console.log(`[PAYMENT_INIT] Booking overlap detected for booking: ${bookingId}`);
      return res.status(400).json({
        success: false,
        message: 'Room is no longer available for the selected dates'
      });
    }

    // Calculate amount (room.totalPriceTk * nights)
    const checkInDate = new Date(booking.checkIn);
    const checkOutDate = new Date(booking.checkOut);
    const nights = Math.ceil((checkOutDate.getTime() - checkInDate.getTime()) / (1000 * 60 * 60 * 24));
    const totalAmount = (booking.roomId as any).totalPriceTk * nights;

    console.log(`[PAYMENT_INIT] Calculated amount: ${totalAmount} Tk for ${nights} nights`);

    // Create payment transaction record
    const paymentTransaction = new PaymentTransaction({
      bookingId: booking._id,
      gateway: 'sslcommerz',
      amountTk: totalAmount,
      status: 'pending'
    });

    await paymentTransaction.save();
    console.log(`[PAYMENT_INIT] Created payment transaction: ${paymentTransaction._id}`);

    // Prepare SSLCOMMERZ payment data
    const paymentData = {
      total_amount: totalAmount,
      currency: 'BDT',
      tran_id: (paymentTransaction._id as any).toString(),
      success_url: sslConfig.successUrl,
      fail_url: sslConfig.failUrl,
      cancel_url: sslConfig.cancelUrl,
      ipn_url: sslConfig.ipnUrl,
      shipping_method: 'NO',
      product_name: `Room Booking - ${(booking.roomId as any).title}`,
      product_category: 'Accommodation',
      product_profile: 'general',
      cus_name: (booking.userId as any).name,
      cus_email: (booking.userId as any).email,
      cus_phone: (booking.userId as any).phone,
      cus_add1: 'Dhaka',
      cus_city: 'Dhaka',
      cus_state: 'Dhaka',
      cus_postcode: '1000',
      cus_country: 'Bangladesh',
      cus_fax: (booking.userId as any).phone,
      ship_name: (booking.userId as any).name,
      ship_add1: 'Dhaka',
      ship_add2: 'Dhaka',
      ship_city: 'Dhaka',
      ship_state: 'Dhaka',
      ship_postcode: '1000',
      ship_country: 'Bangladesh',
      // Removed multi_card_name to enable ALL payment methods:
      // - Mobile Banking: bKash, Nagad, Rocket, Upay
      // - Cards: Visa, Mastercard, Amex, all local cards
      // - Internet Banking: All supported banks
      value_a: (booking._id as any).toString(),
      value_b: (booking.userId as any)._id.toString(),
      value_c: (booking.hostId as any)._id.toString(),
      value_d: totalAmount.toString()
    };

    console.log(`[PAYMENT_INIT] Creating SSL session for transaction: ${paymentTransaction._id}`);
    console.log(`[PAYMENT_INIT] SSL Config:`, { 
      store_id: getMaskedStoreId(store_id),
      is_live: is_live ? '🔴 LIVE' : '🟡 SANDBOX'
    });
    console.log(`[PAYMENT_INIT] Payment Data:`, JSON.stringify(paymentData, null, 2));

    // Create SSL session using official integration
    const sslcommerz = new SSLCommerzPayment(store_id, store_passwd, is_live);
    const sslSession = await sslcommerz.init(paymentData);
    
    console.log(`[PAYMENT_INIT] SSL Response:`, JSON.stringify(sslSession, null, 2));
    
    if (sslSession.status === 'SUCCESS') {
      // Update payment transaction with session key
      paymentTransaction.sslSessionKey = sslSession.sessionkey;
      await paymentTransaction.save();

      console.log(`[PAYMENT_INIT] SSL session created successfully: ${sslSession.sessionkey}`);

      return res.json({
        success: true,
        message: 'Payment session created successfully',
        data: {
          gatewayUrl: sslSession.GatewayPageURL,
          sessionKey: sslSession.sessionkey
        }
      });
    } else {
      console.error(`[PAYMENT_INIT] SSL session creation failed:`, sslSession);
      return res.status(400).json({
        success: false,
        message: sslSession.failedreason || 'Failed to create payment session',
        error: sslSession.failedreason || 'SSL session creation failed'
      });
    }
  } catch (error) {
    console.error('[PAYMENT_INIT] Error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Internal server error';
    return res.status(500).json({
      success: false,
      message: errorMessage,
      error: errorMessage
    });
  }
});

// @route   GET /api/payments/ssl/success
// @desc    Handle successful payment with comprehensive validation
// @access  Public
router.get('/ssl/success', async (req, res) => {
  try {
    const { val_id, amount, tran_id, status } = req.query;
    
    console.log(`[PAYMENT_SUCCESS] Processing success callback - val_id: ${val_id}, amount: ${amount}, tran_id: ${tran_id}, status: ${status}`);

    if (!val_id || !amount || !tran_id) {
      console.log('[PAYMENT_SUCCESS] Missing required parameters');
      return res.redirect(`${process.env.FRONTEND_URL}/payment/fail?error=missing_parameters`);
    }

    // Find payment transaction
    const paymentTransaction = await PaymentTransaction.findOne({ 
      _id: tran_id,
      sslSessionKey: { $exists: true }
    });

    if (!paymentTransaction) {
      console.log(`[PAYMENT_SUCCESS] Payment transaction not found: ${tran_id}`);
      return res.redirect(`${process.env.FRONTEND_URL}/payment/fail?error=transaction_not_found`);
    }

    // Verify payment with SSLCOMMERZ
    console.log(`[PAYMENT_SUCCESS] Verifying payment with SSLCOMMERZ for val_id: ${val_id}`);
    const sslcommerz = new SSLCommerzPayment(store_id, store_passwd, is_live);
    const verification = await sslcommerz.validate({ val_id: val_id as string });

    if (verification.status === 'VALID' && verification.amount === amount) {
      console.log(`[PAYMENT_SUCCESS] Payment verified successfully for transaction: ${tran_id}`);

      // Update payment transaction
      paymentTransaction.valId = val_id as string;
      paymentTransaction.status = 'completed';
      paymentTransaction.raw = verification;
      await paymentTransaction.save();

      // Update booking status
      const booking = await Booking.findById(paymentTransaction.bookingId).populate('roomId');
      if (booking) {
        booking.paymentStatus = 'paid';
        booking.status = 'confirmed';
        await booking.save();

        console.log(`[PAYMENT_SUCCESS] Booking confirmed: ${booking._id}`);

        // Track Purchase event for payment success
        try {
          const eventResponse = await fetch(`${process.env.BACKEND_URL}/api/events/payment-success`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'x-fbp': req.headers['x-fbp'] as string || '',
              'x-fbc': req.headers['x-fbc'] as string || '',
            },
            body: JSON.stringify({
              bookingId: booking._id,
              roomId: booking.roomId._id,
              amount: booking.amountTk,
              userEmail: (booking.userId as any)?.email || '',
              userName: (booking.userId as any)?.name || '',
              userPhone: (booking.userId as any)?.phone || '',
            }),
          });
          
          if (eventResponse.ok) {
            console.log(`[PAYMENT_SUCCESS] Purchase event tracked for booking: ${booking._id}`);
          }
        } catch (error) {
          console.warn('[PAYMENT_SUCCESS] Failed to track Purchase event:', error);
        }

        // Write commission to AccountLedger
        if (booking.roomId && (booking.roomId as any).commissionTk) {
          const commissionAmount = (booking.roomId as any).commissionTk;
          const ledgerEntry = new AccountLedger({
            type: 'commission',
            ref: { bookingId: booking._id },
            amountTk: commissionAmount,
            note: `Commission from booking ${booking._id}`,
            at: new Date()
          });
          await ledgerEntry.save();
          console.log(`[PAYMENT_SUCCESS] Commission ledger entry created: ${commissionAmount} Tk`);
        }

        return res.redirect(`${process.env.FRONTEND_URL}/booking/success?bookingId=${booking._id}&transactionId=${val_id}`);
      } else {
        console.error(`[PAYMENT_SUCCESS] Booking not found: ${paymentTransaction.bookingId}`);
        return res.redirect(`${process.env.FRONTEND_URL}/payment/fail?error=booking_not_found`);
      }
    } else {
      console.error(`[PAYMENT_SUCCESS] Payment verification failed: ${verification.status}, amount: ${verification.amount}`);
      return res.redirect(`${process.env.FRONTEND_URL}/payment/fail?error=verification_failed`);
    }
  } catch (error) {
    console.error('[PAYMENT_SUCCESS] Error:', error);
    return res.redirect(`${process.env.FRONTEND_URL}/payment/fail?error=server_error`);
  }
});

// @route   GET /api/payments/ssl/fail
// @desc    Handle failed payment
// @access  Public
router.get('/ssl/fail', async (req, res) => {
  try {
    const { val_id, tran_id, error } = req.query;
    
    console.log(`[PAYMENT_FAIL] Processing fail callback - val_id: ${val_id}, tran_id: ${tran_id}, error: ${error}`);

    if (tran_id) {
      // Update payment transaction status
      const paymentTransaction = await PaymentTransaction.findById(tran_id);
      if (paymentTransaction) {
        paymentTransaction.status = 'failed';
        paymentTransaction.raw = { error, val_id, timestamp: new Date() };
        await paymentTransaction.save();
        console.log(`[PAYMENT_FAIL] Updated transaction status to failed: ${tran_id}`);
      }
    }

    res.redirect(`${process.env.FRONTEND_URL}/booking/failed?error=${error || 'payment_failed'}&bookingId=${tran_id || ''}`);
  } catch (error) {
    console.error('[PAYMENT_FAIL] Error:', error);
    res.redirect(`${process.env.FRONTEND_URL}/payment/fail?error=server_error`);
  }
});

// @route   GET /api/payments/ssl/cancel
// @desc    Handle cancelled payment
// @access  Public
router.get('/ssl/cancel', async (req, res) => {
  try {
    const { tran_id } = req.query;
    
    console.log(`[PAYMENT_CANCEL] Processing cancel callback - tran_id: ${tran_id}`);

    if (tran_id) {
      // Update payment transaction status
      const paymentTransaction = await PaymentTransaction.findById(tran_id);
      if (paymentTransaction) {
        paymentTransaction.status = 'cancelled';
        paymentTransaction.raw = { cancelled: true, timestamp: new Date() };
        await paymentTransaction.save();
        console.log(`[PAYMENT_CANCEL] Updated transaction status to cancelled: ${tran_id}`);
      }
    }

    res.redirect(`${process.env.FRONTEND_URL}/booking/failed?status=cancelled&bookingId=${tran_id || ''}`);
  } catch (error) {
    console.error('[PAYMENT_CANCEL] Error:', error);
    res.redirect(`${process.env.FRONTEND_URL}/payment/cancel?error=server_error`);
  }
});

// @route   POST /api/payments/ssl/ipn
// @desc    Handle IPN (Instant Payment Notification) with robust validation
// @access  Public
router.post('/ssl/ipn', async (req, res) => {
  try {
    const { val_id, amount, tran_id, status, store_amount, currency, bank_tran_id, card_type, card_no, card_issuer, card_brand, card_issuer_country, card_issuer_country_code, store_id, verify_sign, currency_type, currency_amount, currency_rate, base_fair, value_a, value_b, value_c, value_d } = req.body;
    
    console.log(`[PAYMENT_IPN] Processing IPN - val_id: ${val_id}, amount: ${amount}, tran_id: ${tran_id}, status: ${status}`);

    // Validate required parameters
    if (!val_id || !amount || !tran_id || !status) {
      console.log('[PAYMENT_IPN] Missing required parameters');
      return res.status(400).json({ error: 'Missing required parameters' });
    }

    // Find payment transaction
    const paymentTransaction = await PaymentTransaction.findById(tran_id);
    if (!paymentTransaction) {
      console.log(`[PAYMENT_IPN] Payment transaction not found: ${tran_id}`);
      return res.status(404).json({ error: 'Transaction not found' });
    }

    // Verify payment with SSLCOMMERZ
    console.log(`[PAYMENT_IPN] Verifying payment with SSLCOMMERZ for val_id: ${val_id}`);
    const sslcommerz = new SSLCommerzPayment(store_id, store_passwd, is_live);
    const verification = await sslcommerz.validate({ val_id });

    if (verification.status === 'VALID') {
      console.log(`[PAYMENT_IPN] Payment verified successfully for transaction: ${tran_id}`);

      // Update payment transaction
      paymentTransaction.valId = val_id;
      paymentTransaction.status = status === 'VALID' ? 'completed' : 'failed';
      paymentTransaction.raw = {
        ...req.body,
        verification,
        ipn_timestamp: new Date()
      };
      await paymentTransaction.save();

      // If payment is valid and completed, update booking
      if (status === 'VALID' && paymentTransaction.status === 'completed') {
        const booking = await Booking.findById(paymentTransaction.bookingId).populate('roomId');
        if (booking && booking.paymentStatus !== 'paid') {
          booking.paymentStatus = 'paid';
          booking.status = 'confirmed';
          await booking.save();

          console.log(`[PAYMENT_IPN] Booking confirmed via IPN: ${booking._id}`);

          // Write commission to AccountLedger
          if (booking.roomId && (booking.roomId as any).commissionTk) {
            const commissionAmount = (booking.roomId as any).commissionTk;
            const ledgerEntry = new AccountLedger({
              type: 'commission',
              ref: { bookingId: booking._id },
              amountTk: commissionAmount,
              note: `Commission from booking ${booking._id} (IPN)`,
              at: new Date()
            });
            await ledgerEntry.save();
            console.log(`[PAYMENT_IPN] Commission ledger entry created: ${commissionAmount} Tk`);
          }
        }
      }

      return res.status(200).json({ status: 'success' });
    } else {
      console.error(`[PAYMENT_IPN] Payment verification failed: ${verification.status}`);
      return res.status(400).json({ error: 'Verification failed' });
    }
  } catch (error) {
    console.error('[PAYMENT_IPN] Error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
