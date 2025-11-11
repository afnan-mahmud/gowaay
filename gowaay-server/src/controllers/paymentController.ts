import { Request, Response, NextFunction } from 'express';
const SSLCommerz = require('sslcommerz');
import { PaymentTransaction } from '../models';
import { AppError } from '../middleware/errorHandler';
import { AuthenticatedRequest } from '../middleware/auth';

// Initialize SSLCommerz
const sslcommerz = SSLCommerz({
  store_id: process.env.SSL_STORE_ID!,
  store_passwd: process.env.SSL_STORE_PASSWD!,
  is_sandbox: process.env.NODE_ENV !== 'production' // sandbox mode for development
});

export const createPayment = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const { amount, currency, orderId, products } = req.body;

    // Validate input
    if (!amount || !currency || !orderId) {
      return next(new AppError('Missing required payment parameters', 400));
    }

    if (!req.user || !req.user.id) {
      return next(new AppError('User authentication required', 401));
    }

    // Create payment record
    const payment = await PaymentTransaction.create({
      userId: req.user.id,
      orderId,
      amount,
      currency,
      status: 'pending',
      products,
      paymentMethod: 'sslcommerz'
    });

    if (!payment) {
      return next(new AppError('Failed to create payment record', 500));
    }

    // Prepare SSLCommerz data
    const data = {
      total_amount: amount,
      currency: currency,
      tran_id: (payment._id as any).toString(),
      success_url: process.env.SSL_SUCCESS_URL!,
      fail_url: process.env.SSL_FAIL_URL!,
      cancel_url: process.env.SSL_CANCEL_URL!,
      ipn_url: process.env.SSL_IPN_URL!,
      shipping_method: 'NO',
      product_name: 'GoWaay Order',
      product_category: 'General',
      product_profile: 'general',
      cus_name: req.user.name || 'Guest',
      cus_email: req.user.email,
      cus_add1: 'Dhaka',
      cus_add2: 'Dhaka',
      cus_city: 'Dhaka',
      cus_state: 'Dhaka',
      cus_postcode: '1000',
      cus_country: 'Bangladesh',
      cus_phone: req.user.phone || '01700000000',
      cus_fax: '01700000000',
      ship_name: req.user.name || 'Guest',
      ship_add1: 'Dhaka',
      ship_add2: 'Dhaka',
      ship_city: 'Dhaka',
      ship_state: 'Dhaka',
      ship_postcode: '1000',
      ship_country: 'Bangladesh',
    };

    // Create SSLCommerz session with timeout
    let session;
    try {
      session = await Promise.race([
        sslcommerz.init(data),
        new Promise((_, reject) => 
          setTimeout(() => reject(new Error('SSL Commerce timeout')), 30000)
        )
      ]);
    } catch (sslError) {
      console.error('SSLCommerz initialization error:', sslError);
      // Update payment status to failed
      await PaymentTransaction.findByIdAndUpdate(payment._id, {
        status: 'failed',
        paymentDetails: { error: 'SSL Commerce initialization failed' }
      });
      return next(new AppError('Payment gateway unavailable. Please try again later.', 503));
    }

    if (!session || !session.GatewayPageURL) {
      return next(new AppError('Failed to create payment session', 500));
    }

    res.json({
      success: true,
      message: 'Payment session created',
      data: {
        paymentId: payment._id,
        gatewayUrl: session.GatewayPageURL,
        sessionId: session.sessionkey
      }
    });
  } catch (error) {
    console.error('Create payment error:', error);
    next(error);
  }
};

export const verifyPayment = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { val_id, tran_id } = req.query;

    if (!val_id || !tran_id) {
      return next(new AppError('Missing payment verification parameters', 400));
    }

    // Verify payment with SSLCommerz with timeout
    let verification;
    try {
      verification = await Promise.race([
        sslcommerz.validate({ val_id: val_id as string }),
        new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Verification timeout')), 30000)
        )
      ]);
    } catch (verifyError) {
      console.error('SSLCommerz verification error:', verifyError);
      return next(new AppError('Payment verification unavailable. Please try again later.', 503));
    }

    if (!verification) {
      return next(new AppError('Failed to verify payment', 500));
    }

    if (verification.status === 'VALID' || verification.status === 'VALIDATED') {
      // Update payment status
      const updatedPayment = await PaymentTransaction.findByIdAndUpdate(
        tran_id,
        {
          status: 'completed',
          transactionId: verification.tran_id,
          paymentDetails: verification
        },
        { new: true }
      );

      if (!updatedPayment) {
        console.error('Failed to update payment record:', tran_id);
      }

      res.json({
        success: true,
        message: 'Payment verified successfully',
        data: verification
      });
    } else {
      // Update payment status as failed
      await PaymentTransaction.findByIdAndUpdate(tran_id, {
        status: 'failed',
        paymentDetails: verification
      });

      res.status(400).json({
        success: false,
        message: 'Payment verification failed',
        data: verification
      });
    }
  } catch (error) {
    console.error('Verify payment error:', error);
    next(error);
  }
};

export const handleSSLIPN = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // SSLCommerz IPN (Instant Payment Notification) handler
    const { tran_id, val_id, status, amount, store_amount, currency, bank_tran_id } = req.body;

    if (status === 'VALID') {
      await PaymentTransaction.findByIdAndUpdate(tran_id, {
        status: 'completed',
        transactionId: val_id,
        bankTransactionId: bank_tran_id,
        paymentDetails: req.body
      });
    } else {
      await PaymentTransaction.findByIdAndUpdate(tran_id, {
        status: 'failed',
        paymentDetails: req.body
      });
    }

    res.status(200).send('IPN received successfully');
  } catch (error) {
    next(error);
  }
};

export const getPaymentStatus = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const { transactionId } = req.params;

    const payment = await PaymentTransaction.findOne({
      _id: transactionId,
      userId: req.user!.id
    });

    if (!payment) {
      return next(new AppError('Payment not found', 404));
    }

    res.json({
      success: true,
      data: { payment }
    });
  } catch (error) {
    next(error);
  }
};
