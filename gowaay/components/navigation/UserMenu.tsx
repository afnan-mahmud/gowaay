'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { signOut } from 'next-auth/react';
import { useAuth } from '@/lib/auth-context';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { MoreHorizontal, User, UserPlus, LogIn, LogOut, Calendar, MessageSquare, Repeat, LayoutDashboard } from 'lucide-react';
import { cn } from '@/lib/utils';

interface UserMenuProps {
  isAuthenticated?: boolean;
  userRole?: 'admin' | 'host' | 'guest';
  className?: string;
  triggerIcon?: React.ReactNode;
  triggerClassName?: string;
}

export function UserMenu({ 
  isAuthenticated: propIsAuthenticated, 
  userRole: propUserRole,
  className,
  triggerIcon,
  triggerClassName 
}: UserMenuProps) {
  const router = useRouter();
  const { isAuthenticated: authIsAuthenticated, user } = useAuth();
  
  // Use hook data with props as fallback
  const isAuthenticated = authIsAuthenticated || propIsAuthenticated;
  const userRole = user?.role || propUserRole || 'guest';

  const handleLogout = async () => {
    try {
      await signOut({ callbackUrl: '/' });
    } catch (error) {
      console.error('Logout error:', error);
      // Fallback: redirect to home
      router.push('/');
    }
  };

  const getDashboardPath = () => {
    if (userRole === 'admin') return '/admin';
    if (userRole === 'host') return '/host';
    return '/bookings';
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className={cn(
            "h-8 w-8 p-0 hover:bg-gray-100 flex items-center justify-center",
            triggerClassName
          )}
          aria-label="User menu"
        >
          {triggerIcon || <User className="h-4 w-4" />}
        </Button>
      </DropdownMenuTrigger>
      
      <DropdownMenuContent align="end" className="w-48">
        {!isAuthenticated ? (
          <>
            <DropdownMenuItem asChild>
              <Link href="/login" className="flex items-center">
                <LogIn className="mr-2 h-4 w-4" />
                Login
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href="/register" className="flex items-center">
                <UserPlus className="mr-2 h-4 w-4" />
                Sign Up
              </Link>
            </DropdownMenuItem>
          </>
        ) : (
          <>
            {userRole === 'admin' || userRole === 'host' ? (
              <>
                <DropdownMenuItem asChild>
                  <Link href={getDashboardPath()} className="flex items-center">
                    <LayoutDashboard className="mr-2 h-4 w-4" />
                    Dashboard
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout} className="text-red-600">
                  <LogOut className="mr-2 h-4 w-4" />
                  Logout
                </DropdownMenuItem>
              </>
            ) : (
              <>
                <DropdownMenuItem asChild>
                  <Link href="/bookings" className="flex items-center">
                    <Calendar className="mr-2 h-4 w-4" />
                    Bookings
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/messages" className="flex items-center">
                    <MessageSquare className="mr-2 h-4 w-4" />
                    Messages
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/account" className="flex items-center">
                    <User className="mr-2 h-4 w-4" />
                    Profile Settings
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/join-host" className="flex items-center">
                    <Repeat className="mr-2 h-4 w-4" />
                    Switch to Hosting
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout} className="text-red-600">
                  <LogOut className="mr-2 h-4 w-4" />
                  Logout
                </DropdownMenuItem>
              </>
            )}
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
