'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useSession, signOut } from 'next-auth/react';
import { useState, useEffect } from 'react';
import { 
  LayoutDashboard, 
  Calendar, 
  Home, 
  MessageSquare, 
  MoreHorizontal,
  User,
  Settings,
  DollarSign,
  LogOut
} from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

const navItems = [
  { href: '/host', icon: LayoutDashboard, label: 'Dashboard' },
  { href: '/host/reservations', icon: Calendar, label: 'Reservations' },
  { href: '/host/listings', icon: Home, label: 'Listings' },
  { href: '/host/messages', icon: MessageSquare, label: 'Messages' },
];

const moreMenuItems = [
  { href: '/host/profile', icon: Settings, label: 'Profile Settings' },
  { href: '/host/calendar', icon: Calendar, label: 'Calendar' },
  { href: '/host/balance', icon: DollarSign, label: 'Balance' },
];

export function HostBottomNav() {
  const pathname = usePathname();
  const { data: session } = useSession();
  const [isClient, setIsClient] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [isMoreOpen, setIsMoreOpen] = useState(false);

  useEffect(() => {
    setIsClient(true);
    
    const checkMobile = () => {
      const mobile = window.innerWidth < 768; // md breakpoint
      setIsMobile(mobile);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => {
      window.removeEventListener('resize', checkMobile);
    };
  }, []);

  const handleLogout = () => {
    signOut({ callbackUrl: '/' });
  };

  const handleMoreItemClick = () => {
    setIsMoreOpen(false);
  };

  // Don't render on desktop or during SSR
  if (!isClient || !isMobile) {
    return null;
  }

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 border-t bg-white/95 backdrop-blur supports-[padding-bottom:env(safe-area-inset-bottom)]:pb-[env(safe-area-inset-bottom)]">
      <div className="h-16 grid grid-cols-5 text-xs">
        {/* Navigation Items */}
        {navItems.map((item) => {
          const isActive = pathname === item.href || 
            (item.href !== '/host' && pathname.startsWith(item.href));
          
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex flex-col items-center justify-center py-2 px-1 transition-colors',
                isActive
                  ? 'text-brand'
                  : 'text-gray-600 hover:text-brand'
              )}
            >
              <item.icon className={cn(
                'h-5 w-5 mb-1',
                isActive ? 'text-brand' : 'text-gray-600'
              )} />
              <span className="text-xs font-medium">{item.label}</span>
            </Link>
          );
        })}
        
        {/* More Button */}
        <Sheet open={isMoreOpen} onOpenChange={setIsMoreOpen}>
          <SheetTrigger asChild>
            <button className="flex flex-col items-center justify-center py-2 px-1 text-gray-600 hover:text-brand transition-colors">
              <MoreHorizontal className="h-5 w-5 mb-1" />
              <span className="text-xs font-medium">More</span>
            </button>
          </SheetTrigger>
          
          <SheetContent side="right" className="w-80 sm:w-96">
            <SheetHeader>
              <SheetTitle className="text-left">Host Menu</SheetTitle>
            </SheetHeader>
            
            <div className="mt-6 space-y-6">
              {/* Host Profile Header */}
              <div className="flex items-center space-x-3 p-4 bg-gray-50 rounded-lg">
                <Avatar className="h-12 w-12">
                  <AvatarImage src={session?.user?.image || ''} alt={session?.user?.name || ''} />
                  <AvatarFallback className="bg-brand text-white text-lg font-semibold">
                    {session?.user?.name ? session.user.name.charAt(0).toUpperCase() : 'H'}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {session?.user?.name || 'Host User'}
                  </p>
                  <p className="text-sm text-gray-500 truncate">
                    {session?.user?.email || 'host@example.com'}
                  </p>
                </div>
              </div>

              {/* More Menu Items */}
              <div className="space-y-1">
                {moreMenuItems.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={handleMoreItemClick}
                    className="flex items-center space-x-3 px-4 py-3 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <item.icon className="h-5 w-5 text-gray-400" />
                    <span>{item.label}</span>
                  </Link>
                ))}
              </div>

              {/* Logout Button */}
              <div className="pt-4 border-t border-gray-200">
                <Button
                  variant="ghost"
                  onClick={handleLogout}
                  className="w-full justify-start px-4 py-3 h-auto text-red-600 hover:text-red-700 hover:bg-red-50"
                >
                  <LogOut className="h-5 w-5 mr-3" />
                  <span className="font-medium">Logout</span>
                </Button>
              </div>
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </nav>
  );
}
