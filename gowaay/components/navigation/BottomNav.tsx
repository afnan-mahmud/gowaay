'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, CalendarCheck, MessageSquare, Phone, User, UserRound, LogOut, Settings, UserCheck, FileText, RefreshCw, Info, User as UserIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth-context';
import { signOut } from 'next-auth/react';
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

const HIDDEN_ROUTES = ['/join-host', '/host', '/admin'];

export function BottomNav() {
  const pathname = usePathname();
  const { isAuthenticated, user, isLoading } = useAuth();
  const [isVisible, setIsVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);
  const [isMobile, setIsMobile] = useState(false);
  const [isClient, setIsClient] = useState(false);
  const [isSheetOpen, setIsSheetOpen] = useState(false);

  useEffect(() => {
    // Mark as client-side rendered
    setIsClient(true);
    
    // Check if we're on mobile on mount and resize
    const checkMobile = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      if (!mobile) {
        setIsVisible(true); // Reset visibility on desktop
      }
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => {
      window.removeEventListener('resize', checkMobile);
    };
  }, []);

  useEffect(() => {
    // Only add scroll listener on mobile and after client is mounted
    if (!isClient || !isMobile) return;

    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      
      // Show nav when at top of page
      if (currentScrollY < 10) {
        setIsVisible(true);
      } else {
        // Hide when scrolling down, show when scrolling up
        if (currentScrollY > lastScrollY && currentScrollY > 100) {
          setIsVisible(false);
        } else if (currentScrollY < lastScrollY) {
          setIsVisible(true);
        }
      }
      
      setLastScrollY(currentScrollY);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, [isClient, isMobile, lastScrollY]);

  const navItems = [
    {
      href: '/',
      icon: Home,
      label: 'Home',
      isActive: pathname === '/',
    },
    {
      href: '/bookings',
      icon: CalendarCheck,
      label: 'Booking',
      isActive: pathname.startsWith('/bookings'),
    },
    {
      href: '/messages',
      icon: MessageSquare,
      label: 'Message',
      isActive: pathname.startsWith('/messages'),
    },
    {
      href: 'https://wa.me/+8801611553628',
      icon: Phone,
      label: 'Contact',
      isActive: false,
      external: true,
    },
  ];

  // Don't render anything on desktop or during SSR
  if (!isClient || !isMobile) {
    return null;
  }

  return (
    <nav className={cn(
      "fixed bottom-0 left-0 right-0 z-40 border-t bg-white/95 backdrop-blur supports-[padding-bottom:env(safe-area-inset-bottom)]:pb-[env(safe-area-inset-bottom)] no-flicker",
      isVisible ? "translate-y-0" : "translate-y-full"
    )}
    style={{ transition: 'transform 0.3s ease-in-out' }}>
      <div className="h-16 grid grid-cols-5 text-xs">
        {/* Navigation Items */}
        {navItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "flex flex-col items-center justify-center min-h-[44px] px-2 py-1 transition-colors",
              item.isActive ? "text-brand" : "text-gray-600 hover:text-gray-900"
            )}
            {...(item.external && {
              target: '_blank',
              rel: 'noopener noreferrer',
            })}
          >
            <item.icon className={cn(
              "h-5 w-5 mb-1",
              item.isActive ? "text-brand" : "text-gray-600"
            )} />
            <span className="text-xs font-medium">{item.label}</span>
          </Link>
        ))}

        {/* Login/Profile */}
        <div className="flex flex-col items-center justify-center min-h-[44px] px-2 py-1">
          {!isAuthenticated ? (
            <Link
              href="/login"
              className={cn(
                "flex flex-col items-center justify-center transition-colors",
                pathname === '/login' ? "text-brand" : "text-gray-600 hover:text-gray-900"
              )}
            >
              <User className={cn(
                "h-5 w-5 mb-1",
                pathname === '/login' ? "text-brand" : "text-gray-600"
              )} />
              <span className="text-xs font-medium">Login</span>
            </Link>
          ) : (
            <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
              <SheetTrigger asChild>
                <button className="flex flex-col items-center justify-center">
                  <UserRound className={cn(
                    "h-5 w-5 mb-1",
                    pathname.startsWith('/admin') || pathname.startsWith('/host') || pathname.startsWith('/bookings') 
                      ? "text-brand" 
                      : "text-gray-600"
                  )} />
                  <span className="text-xs font-medium">More</span>
                </button>
              </SheetTrigger>
              
              <SheetContent side="right" className="w-80 sm:w-96">
                <SheetHeader>
                  <SheetTitle className="sr-only">User Menu</SheetTitle>
                </SheetHeader>
                <div className="mt-6 space-y-6">
                  {/* User Profile Header */}
                  <div className="flex items-center space-x-3 p-4 bg-gray-50 rounded-lg">
                    <Avatar className="h-12 w-12">
                      <AvatarImage src="" alt={user?.name || ''} />
                      <AvatarFallback className="bg-brand text-white text-lg font-semibold">
                        {user?.name ? user.name.charAt(0).toUpperCase() : 'G'}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {user?.name || 'Guest'}
                      </p>
                      <p className="text-sm text-gray-500 capitalize">
                        {user?.role || 'Guest'}
                      </p>
                    </div>
                  </div>

                  {/* Menu Items */}
                  <div className="space-y-1">
                    <Link
                      href="/account"
                      onClick={() => setIsSheetOpen(false)}
                      className="flex items-center space-x-3 px-4 py-3 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                      <Settings className="h-5 w-5 text-gray-400" />
                      <span>Profile Settings</span>
                    </Link>
                    
                    <Link
                      href="/join-host"
                      onClick={() => setIsSheetOpen(false)}
                      className="flex items-center space-x-3 px-4 py-3 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                      <UserCheck className="h-5 w-5 text-gray-400" />
                      <span>Switch to Hosting</span>
                    </Link>
                    
                    <Link
                      href="/terms"
                      onClick={() => setIsSheetOpen(false)}
                      className="flex items-center space-x-3 px-4 py-3 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                      <FileText className="h-5 w-5 text-gray-400" />
                      <span>Terms & Conditions</span>
                    </Link>
                    
                    <Link
                      href="/refund-policy"
                      onClick={() => setIsSheetOpen(false)}
                      className="flex items-center space-x-3 px-4 py-3 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                      <RefreshCw className="h-5 w-5 text-gray-400" />
                      <span>Refund Policy</span>
                    </Link>
                    
                    <Link
                      href="/about"
                      onClick={() => setIsSheetOpen(false)}
                      className="flex items-center space-x-3 px-4 py-3 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                      <Info className="h-5 w-5 text-gray-400" />
                      <span>About Us</span>
                    </Link>
                  </div>

                  {/* Logout Button */}
                  <div className="pt-4 border-t border-gray-200">
                    <button
                      onClick={async () => {
                        setIsSheetOpen(false);
                        await signOut({ callbackUrl: '/' });
                      }}
                      className="w-full flex items-center space-x-3 px-4 py-3 text-sm font-medium text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <LogOut className="h-5 w-5" />
                      <span>Logout</span>
                    </button>
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          )}
        </div>
      </div>
    </nav>
  );
}
