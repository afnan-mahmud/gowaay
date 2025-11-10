'use client';

import { useCallback } from 'react';

// Type assertions for tracking

export function usePixelEvents() {
  const firePageView = useCallback(() => {
    if (typeof window !== 'undefined') {
      // Google Analytics / GTM
      if ((window as any).dataLayer) {
        (window as any).dataLayer.push({
          event: 'page_view',
          page_title: document.title,
          page_location: window.location.href,
        });
      }

      // Meta Pixel
      if ((window as any).fbq) {
        (window as any).fbq('track', 'PageView');
      }

      // TikTok Pixel
      if ((window as any).ttq) {
        (window as any).ttq.page();
      }
    }
  }, []);

  const fireSearch = useCallback((searchTerm: string, filters?: any) => {
    if (typeof window !== 'undefined') {
      // Google Analytics / GTM
      if ((window as any).dataLayer) {
        (window as any).dataLayer.push({
          event: 'search',
          search_term: searchTerm,
          ...filters,
        });
      }

      // Meta Pixel
      if ((window as any).fbq) {
        (window as any).fbq('track', 'Search', {
          search_string: searchTerm,
          content_category: 'accommodation',
        });
      }

      // TikTok Pixel
      if ((window as any).ttq) {
        (window as any).ttq.track('Search', {
          search_string: searchTerm,
          content_category: 'accommodation',
        });
      }
    }
  }, []);

  const fireRoomView = useCallback((roomId: string, roomTitle: string, price: number) => {
    if (typeof window !== 'undefined') {
      // Google Analytics / GTM
      if ((window as any).dataLayer) {
        (window as any).dataLayer.push({
          event: 'view_item',
          item_id: roomId,
          item_name: roomTitle,
          value: price,
          currency: 'BDT',
        });
      }

      // Meta Pixel
      if ((window as any).fbq) {
        (window as any).fbq('track', 'ViewContent', {
          content_ids: [roomId],
          content_type: 'product',
          value: price,
          currency: 'BDT',
        });
      }

      // TikTok Pixel
      if ((window as any).ttq) {
        (window as any).ttq.track('ViewContent', {
          content_id: roomId,
          content_type: 'product',
          value: price,
          currency: 'BDT',
        });
      }
    }
  }, []);

  const firePurchase = useCallback((bookingId: string, value: number, currency: string = 'BDT') => {
    if (typeof window !== 'undefined') {
      // Google Analytics / GTM
      if ((window as any).dataLayer) {
        (window as any).dataLayer.push({
          event: 'purchase',
          transaction_id: bookingId,
          value: value,
          currency: currency,
        });
      }

      // Meta Pixel
      if ((window as any).fbq) {
        (window as any).fbq('track', 'Purchase', {
          value: value,
          currency: currency,
          content_type: 'product',
        });
      }

      // TikTok Pixel
      if ((window as any).ttq) {
        (window as any).ttq.track('CompletePayment', {
          value: value,
          currency: currency,
          content_type: 'product',
        });
      }
    }
  }, []);

  return {
    firePageView,
    fireSearch,
    fireRoomView,
    firePurchase,
  };
}
