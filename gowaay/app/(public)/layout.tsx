'use client';

import { Suspense } from 'react';
import { PublicLayoutShell } from '@/components/layout/PublicLayoutShell';

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <Suspense fallback={<div className="min-h-screen bg-white" />}>
      <PublicLayoutShell>
        {children}
      </PublicLayoutShell>
    </Suspense>
  )
}
