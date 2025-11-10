'use client';

import { useCallback } from 'react';
import { env } from '@/lib/env';

declare global {
  interface Window {
    fbq: any;
    ttq: any;
  }
}

export function usePixelTracking() {
  const trackPageView = useCallback(() => {
    if (typeof window === 'undefined') return;

    // Facebook Pixel
    if (env.FB_PIXEL_ID && window.fbq && typeof window.fbq === 'function') {
      try {
        window.fbq('track', 'PageView');
        console.log('[PIXEL] Facebook PageView tracked');
      } catch (error) {
        console.warn('[PIXEL] Facebook PageView failed:', error);
      }
    }

    // TikTok Pixel
    if (env.TIKTOK_PIXEL_ID && window.ttq && typeof window.ttq === 'function') {
      try {
        window.ttq('page');
        console.log('[PIXEL] TikTok PageView tracked');
      } catch (error) {
        console.warn('[PIXEL] TikTok PageView failed:', error);
      }
    }
  }, []);

  const trackRoomView = useCallback((roomId: string, amountTk: number) => {
    if (typeof window === 'undefined') return;

    // Facebook Pixel
    if (env.FB_PIXEL_ID && window.fbq && typeof window.fbq === 'function') {
      try {
        window.fbq('track', 'ViewContent', {
          content_type: 'product',
          content_ids: [roomId],
          value: amountTk,
          currency: 'BDT',
        });
        console.log('[PIXEL] Facebook ViewContent tracked:', { roomId, amountTk });
      } catch (error) {
        console.warn('[PIXEL] Facebook ViewContent failed:', error);
      }
    }

    // TikTok Pixel
    if (env.TIKTOK_PIXEL_ID && window.ttq && typeof window.ttq === 'function') {
      try {
        window.ttq('track', 'ViewContent', {
          content_type: 'product',
          content_id: roomId,
          value: amountTk,
          currency: 'BDT',
        });
        console.log('[PIXEL] TikTok ViewContent tracked:', { roomId, amountTk });
      } catch (error) {
        console.warn('[PIXEL] TikTok ViewContent failed:', error);
      }
    }
  }, []);

  const trackPurchase = useCallback((name: string, phone: string, amount: number) => {
    if (typeof window === 'undefined') return;

    // Facebook Pixel
    if (env.FB_PIXEL_ID && window.fbq && typeof window.fbq === 'function') {
      try {
        window.fbq('track', 'Purchase', {
          value: amount,
          currency: 'BDT',
          content_name: name,
          content_category: 'accommodation',
        });
        console.log('[PIXEL] Facebook Purchase tracked:', { name, phone, amount });
      } catch (error) {
        console.warn('[PIXEL] Facebook Purchase failed:', error);
      }
    }

    // TikTok Pixel
    if (env.TIKTOK_PIXEL_ID && window.ttq && typeof window.ttq === 'function') {
      try {
        window.ttq('track', 'CompletePayment', {
          value: amount,
          currency: 'BDT',
          content_name: name,
        });
        console.log('[PIXEL] TikTok CompletePayment tracked:', { name, phone, amount });
      } catch (error) {
        console.warn('[PIXEL] TikTok CompletePayment failed:', error);
      }
    }
  }, []);

  return {
    trackPageView,
    trackRoomView,
    trackPurchase,
  };
}
