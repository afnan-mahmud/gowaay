'use client';

import { SessionProvider } from 'next-auth/react';
import { AuthProvider } from '@/lib/auth-context';
import { ChatProvider } from '@/lib/chat-context';
import { Toaster } from 'sonner';

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <AuthProvider>
        <ChatProvider>
          {children}
          <Toaster 
            position="top-right"
            richColors
            expand={true}
            closeButton
          />
        </ChatProvider>
      </AuthProvider>
    </SessionProvider>
  );
}
