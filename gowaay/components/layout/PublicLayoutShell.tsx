'use client';

import { Suspense } from 'react';
import { usePathname } from 'next/navigation';
import { TopNav } from '@/components/navigation/TopNav';
import { BottomNav } from '@/components/navigation/BottomNav';
import MobileHeaderBar from '@/components/navigation/MobileHeaderBar';
import { Footer } from '@/components/layout/Footer';

const HIDE_SEARCH_PATHS = ['/room', '/search'];
const HIDE_ALL_NAV_MOBILE_PATHS = ['/room/'];
const HIDE_ALL_NAV_PATHS = ['/booking/details', '/booking/success', '/booking/failed'];

interface PublicLayoutShellProps {
  children: React.ReactNode;
}

export function PublicLayoutShell({ 
  children
}: PublicLayoutShellProps) {
  const pathname = usePathname();
  const hideSearch = HIDE_SEARCH_PATHS.some(path => pathname.startsWith(path));
  const hideAllNavOnMobile = HIDE_ALL_NAV_MOBILE_PATHS.some(path => pathname.startsWith(path));
  const hideAllNav = HIDE_ALL_NAV_PATHS.some(path => pathname.startsWith(path));

  return (
    <>
      {/* Desktop TopNav - hide on booking pages */}
      {!hideAllNav && <TopNav />}
      
      {/* Mobile TopNav and HeaderBar - hide on room details and booking pages */}
      {!hideAllNavOnMobile && !hideAllNav && (
        <>
          {!hideSearch && (
            <Suspense fallback={<div className="h-16 md:hidden" />}>
              <MobileHeaderBar />
            </Suspense>
          )}
        </>
      )}
      
      <main className={`min-h-screen ${hideAllNavOnMobile || hideAllNav ? 'pb-0 md:pb-0' : 'pb-20 md:pb-0'}`}>
        {children}
      </main>
      
      {/* Footer - hide on booking pages (all) and only on desktop for booking details */}
      {!hideAllNav && <Footer />}
      
      {/* BottomNav - hide on mobile for room details and booking pages */}
      {!hideAllNavOnMobile && !hideAllNav && <BottomNav />}
    </>
  );
}
