'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { 
  LayoutDashboard, 
  Calendar, 
  Home, 
  MessageSquare, 
  DollarSign,
  Plus
} from 'lucide-react';

const navigation = [
  { name: 'Dashboard', href: '/host', icon: LayoutDashboard },
  { name: 'Reservations', href: '/host/reservations', icon: Calendar },
  { name: 'Listings', href: '/host/listings', icon: Home },
  { name: 'Messages', href: '/host/messages', icon: MessageSquare },
  { name: 'Calendar', href: '/host/calendar', icon: Calendar },
  { name: 'Balance', href: '/host/balance', icon: DollarSign },
];

export function HostSidebar() {
  const pathname = usePathname();

  return (
    <div className="hidden md:block fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg">
      <div className="flex h-full flex-col">
        <div className="flex h-16 items-center px-6 border-b border-gray-200">
          <h2 className="text-xl font-bold text-primary">GoWaay Host</h2>
        </div>
        
        <nav className="flex-1 space-y-1 px-3 py-4">
          {navigation.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  'group flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors',
                  isActive
                    ? 'bg-primary text-white'
                    : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
                )}
              >
                <item.icon
                  className={cn(
                    'mr-3 h-5 w-5 flex-shrink-0',
                    isActive ? 'text-white' : 'text-gray-400 group-hover:text-gray-500'
                  )}
                />
                {item.name}
              </Link>
            );
          })}
        </nav>
        
        <div className="p-3 border-t border-gray-200">
          <Link
            href="/host/listings/new"
            className="flex items-center px-3 py-2 text-sm font-medium text-white bg-primary rounded-md hover:bg-primary/90 transition-colors"
          >
            <Plus className="mr-3 h-5 w-5" />
            Add New Listing
          </Link>
        </div>
      </div>
    </div>
  );
}
