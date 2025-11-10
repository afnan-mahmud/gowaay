'use client';

import { useEffect } from 'react';
import { usePixelTracking } from '@/hooks/usePixelTracking';

export function PageTracker() {
  const { trackPageView } = usePixelTracking();

  useEffect(() => {
    // Track page view on every page load
    trackPageView();
  }, [trackPageView]);

  return null; // This component doesn't render anything
}
