import express from 'express';
import { requireUser, AuthenticatedRequest } from '../middleware/auth';
import { validateBody } from '../middleware/validateRequest';
import { z } from 'zod';

const router: express.Router = express.Router();

// Event schemas
const metaEventSchema = z.object({
  event_name: z.string(),
  event_time: z.number(),
  user_data: z.object({
    em: z.array(z.string()).optional(),
    ph: z.array(z.string()).optional(),
    fn: z.array(z.string()).optional(),
    ln: z.array(z.string()).optional(),
    ct: z.array(z.string()).optional(),
    st: z.array(z.string()).optional(),
    zp: z.array(z.string()).optional(),
    country: z.array(z.string()).optional(),
  }),
  custom_data: z.object({
    content_name: z.string().optional(),
    content_category: z.string().optional(),
    content_ids: z.array(z.string()).optional(),
    value: z.number().optional(),
    currency: z.string().optional(),
  }).optional(),
  event_source_url: z.string().optional(),
  action_source: z.string().optional(),
  fbp: z.string().optional(),
  fbc: z.string().optional(),
});

const tiktokEventSchema = z.object({
  event: z.string(),
  event_id: z.string().optional(),
  timestamp: z.string(),
  context: z.object({
    user_agent: z.string().optional(),
    ip: z.string().optional(),
    page: z.object({
      url: z.string().optional(),
    }).optional(),
  }),
  properties: z.object({
    content_type: z.string().optional(),
    content_id: z.string().optional(),
    value: z.number().optional(),
    currency: z.string().optional(),
  }).optional(),
  user: z.object({
    external_id: z.string().optional(),
    phone_number: z.string().optional(),
    email: z.string().optional(),
  }).optional(),
});

// @route   POST /api/events/meta
// @desc    Forward Meta Conversions API events
// @access  Private
router.post('/meta', requireUser, validateBody(metaEventSchema), async (req, res) => {
  try {
    const eventData = req.body;
    const accessToken = process.env.FB_PIXEL_ACCESS_TOKEN;
    const pixelId = process.env.FB_PIXEL_ID;

    if (!accessToken || !pixelId) {
      console.log('[META_CAPI] Missing access token or pixel ID');
      return res.status(400).json({
        success: false,
        message: 'Meta pixel configuration missing'
      });
    }

    console.log(`[META_CAPI] Forwarding event: ${eventData.event_name}`);

    // Prepare Meta Conversions API payload
    const metaPayload = {
      data: [eventData],
      access_token: accessToken,
      test_event_code: process.env.NODE_ENV === 'development' ? process.env.FB_TEST_EVENT_CODE : undefined,
    };

    // Send to Meta Conversions API
    const response = await fetch(`https://graph.facebook.com/v18.0/${pixelId}/events`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(metaPayload),
    });

    const result = await response.json();

    if (response.ok) {
      console.log(`[META_CAPI] Event sent successfully: ${eventData.event_name}`);
      return res.json({
        success: true,
        message: 'Meta event sent successfully',
        data: result
      });
    } else {
      console.error(`[META_CAPI] Failed to send event:`, result);
      return res.status(400).json({
        success: false,
        message: 'Failed to send Meta event',
        error: result
      });
    }
  } catch (error) {
    console.error('[META_CAPI] Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// @route   POST /api/events/tiktok
// @desc    Forward TikTok Events API events
// @access  Private
router.post('/tiktok', requireUser, validateBody(tiktokEventSchema), async (req, res) => {
  try {
    const eventData = req.body;
    const accessToken = process.env.TIKTOK_ACCESS_TOKEN;
    const pixelId = process.env.TIKTOK_PIXEL_ID;

    if (!accessToken || !pixelId) {
      console.log('[TIKTOK_CAPI] Missing access token or pixel ID');
      return res.status(400).json({
        success: false,
        message: 'TikTok pixel configuration missing'
      });
    }

    console.log(`[TIKTOK_CAPI] Forwarding event: ${eventData.event}`);

    // Prepare TikTok Events API payload
    const tiktokPayload = {
      data: [eventData],
      partner_name: 'gowaay',
      app_id: pixelId,
    };

    // Send to TikTok Events API
    const response = await fetch('https://business-api.tiktok.com/open_api/v1.3/event/track/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Access-Token': accessToken,
      },
      body: JSON.stringify(tiktokPayload),
    });

    const result = await response.json();

    if (response.ok) {
      console.log(`[TIKTOK_CAPI] Event sent successfully: ${eventData.event}`);
      return res.json({
        success: true,
        message: 'TikTok event sent successfully',
        data: result
      });
    } else {
      console.error(`[TIKTOK_CAPI] Failed to send event:`, result);
      return res.status(400).json({
        success: false,
        message: 'Failed to send TikTok event',
        error: result
      });
    }
  } catch (error) {
    console.error('[TIKTOK_CAPI] Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// @route   POST /api/events/booking-created
// @desc    Track booking creation event (ViewContent)
// @access  Private
router.post('/booking-created', requireUser, async (req: AuthenticatedRequest, res) => {
  try {
    const { bookingId, roomId, amount, userEmail, userName, userPhone } = req.body;
    const fbp = req.headers['x-fbp'] as string;
    const fbc = req.headers['x-fbc'] as string;

    console.log(`[BOOKING_EVENT] Tracking booking creation: ${bookingId}`);

    // Meta ViewContent event
    const metaEvent = {
      event_name: 'ViewContent',
      event_time: Math.floor(Date.now() / 1000),
      user_data: {
        em: userEmail ? [userEmail] : undefined,
        ph: userPhone ? [userPhone] : undefined,
        fn: userName ? [userName.split(' ')[0]] : undefined,
        ln: userName && userName.includes(' ') ? [userName.split(' ').slice(1).join(' ')] : undefined,
      },
      custom_data: {
        content_type: 'product',
        content_ids: [roomId],
        value: amount,
        currency: 'BDT',
      },
      event_source_url: `${process.env.FRONTEND_URL}/room/${roomId}`,
      action_source: 'website',
      fbp: fbp,
      fbc: fbc,
    };

    // TikTok ViewContent event
    const tiktokEvent = {
      event: 'ViewContent',
      event_id: `booking_${bookingId}_${Date.now()}`,
      timestamp: new Date().toISOString(),
      context: {
        user_agent: req.headers['user-agent'],
        ip: req.ip,
        page: {
          url: `${process.env.FRONTEND_URL}/room/${roomId}`,
        },
      },
      properties: {
        content_type: 'product',
        content_id: roomId,
        value: amount,
        currency: 'BDT',
      },
      user: {
        external_id: req.user!.id,
        email: userEmail,
        phone_number: userPhone,
      },
    };

    // Send events to both platforms
    const [metaResponse, tiktokResponse] = await Promise.allSettled([
      fetch(`${process.env.BACKEND_URL}/api/events/meta`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(req.headers.authorization && { 'Authorization': req.headers.authorization }),
        },
        body: JSON.stringify(metaEvent),
      }),
      fetch(`${process.env.BACKEND_URL}/api/events/tiktok`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(req.headers.authorization && { 'Authorization': req.headers.authorization }),
        },
        body: JSON.stringify(tiktokEvent),
      }),
    ]);

    console.log(`[BOOKING_EVENT] Meta response: ${metaResponse.status}`);
    console.log(`[BOOKING_EVENT] TikTok response: ${tiktokResponse.status}`);

    return res.json({
      success: true,
      message: 'Booking creation event tracked',
      data: {
        meta: metaResponse.status === 'fulfilled' ? 'sent' : 'failed',
        tiktok: tiktokResponse.status === 'fulfilled' ? 'sent' : 'failed',
      }
    });
  } catch (error) {
    console.error('[BOOKING_EVENT] Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// @route   POST /api/events/payment-success
// @desc    Track payment success event (Purchase)
// @access  Private
router.post('/payment-success', requireUser, async (req: AuthenticatedRequest, res) => {
  try {
    const { bookingId, roomId, amount, userEmail, userName, userPhone } = req.body;
    const fbp = req.headers['x-fbp'] as string;
    const fbc = req.headers['x-fbc'] as string;

    console.log(`[PAYMENT_EVENT] Tracking payment success: ${bookingId}`);

    // Meta Purchase event
    const metaEvent = {
      event_name: 'Purchase',
      event_time: Math.floor(Date.now() / 1000),
      user_data: {
        em: userEmail ? [userEmail] : undefined,
        ph: userPhone ? [userPhone] : undefined,
        fn: userName ? [userName.split(' ')[0]] : undefined,
        ln: userName && userName.includes(' ') ? [userName.split(' ').slice(1).join(' ')] : undefined,
      },
      custom_data: {
        content_type: 'product',
        content_ids: [roomId],
        value: amount,
        currency: 'BDT',
      },
      event_source_url: `${process.env.FRONTEND_URL}/payment/success`,
      action_source: 'website',
      fbp: fbp,
      fbc: fbc,
    };

    // TikTok CompletePayment event
    const tiktokEvent = {
      event: 'CompletePayment',
      event_id: `payment_${bookingId}_${Date.now()}`,
      timestamp: new Date().toISOString(),
      context: {
        user_agent: req.headers['user-agent'],
        ip: req.ip,
        page: {
          url: `${process.env.FRONTEND_URL}/payment/success`,
        },
      },
      properties: {
        content_type: 'product',
        content_id: roomId,
        value: amount,
        currency: 'BDT',
      },
      user: {
        external_id: req.user!.id,
        email: userEmail,
        phone_number: userPhone,
      },
    };

    // Send events to both platforms
    const [metaResponse, tiktokResponse] = await Promise.allSettled([
      fetch(`${process.env.BACKEND_URL}/api/events/meta`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(req.headers.authorization && { 'Authorization': req.headers.authorization }),
        },
        body: JSON.stringify(metaEvent),
      }),
      fetch(`${process.env.BACKEND_URL}/api/events/tiktok`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(req.headers.authorization && { 'Authorization': req.headers.authorization }),
        },
        body: JSON.stringify(tiktokEvent),
      }),
    ]);

    console.log(`[PAYMENT_EVENT] Meta response: ${metaResponse.status}`);
    console.log(`[PAYMENT_EVENT] TikTok response: ${tiktokResponse.status}`);

    return res.json({
      success: true,
      message: 'Payment success event tracked',
      data: {
        meta: metaResponse.status === 'fulfilled' ? 'sent' : 'failed',
        tiktok: tiktokResponse.status === 'fulfilled' ? 'sent' : 'failed',
      }
    });
  } catch (error) {
    console.error('[PAYMENT_EVENT] Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

export default router;
