'use client';

import { createContext, useContext, useEffect, ReactNode } from 'react';
import { useSession } from 'next-auth/react';

declare module 'next-auth' {
  interface Session {
    accessToken?: string;
  }
  
  interface User {
    phone?: string;
  }
}

interface AuthContextType {
  isAuthenticated: boolean;
  user: {
    id: string;
    email: string;
    name: string;
    role: 'admin' | 'host' | 'guest';
    phone?: string;
    createdAt?: string;
  } | null;
  accessToken: string | null;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// Compatibility hook for existing components
export function useSessionUser() {
  return useAuth();
}

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const { data: session, status } = useSession();
  const isLoading = status === 'loading';

  // Sync NextAuth session with localStorage
  useEffect(() => {
    if (session?.accessToken) {
      localStorage.setItem('auth_token', session.accessToken);
    } else if (status === 'unauthenticated') {
      localStorage.removeItem('auth_token');
    }
  }, [session, status]);

  const user = session?.user ? {
    id: session.user.id || '',
    email: session.user.email || '',
    name: session.user.name || '',
    role: session.user.role as 'admin' | 'host' | 'guest',
    phone: (session.user as any).phone,
    createdAt: (session.user as any).createdAt,
  } : null;

  const value: AuthContextType = {
    isAuthenticated: !!session,
    user,
    accessToken: session?.accessToken || null,
    isLoading,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}