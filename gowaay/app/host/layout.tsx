'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { HostSidebar } from '@/components/host/HostSidebar';
import { HostHeader } from '@/components/host/HostHeader';
import { HostBottomNav } from '@/components/host/HostBottomNav';

export default function HostLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === 'loading') return;
    
    if (!session) {
      router.push('/auth/signin');
      return;
    }
    
    if (session.user?.role !== 'host') {
      router.push('/');
      return;
    }
  }, [session, status, router]);

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!session || session.user?.role !== 'host') {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <HostHeader />
      <div className="md:flex">
        <HostSidebar />
        <main className="flex-1 p-6 md:ml-64 pb-20 md:pb-6">
          {children}
        </main>
      </div>
      <HostBottomNav />
    </div>
  );
}
