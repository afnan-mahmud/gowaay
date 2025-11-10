'use client';

import { useEffect } from 'react';
import { BottomNav } from '@/components/navigation/BottomNav';
import { PixelProvider } from '@/lib/pixels';

interface LayoutProps {
  children: React.ReactNode;
}

export function Layout({ children }: LayoutProps) {
  useEffect(() => {
    // Initialize pixel tracking
    PixelProvider.getInstance().init();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      <main className="pb-20">
        {children}
      </main>
      <BottomNav />
    </div>
  );
}
