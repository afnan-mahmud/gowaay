'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { 
  LayoutDashboard, 
  Home, 
  Calendar, 
  Users, 
  MessageSquare, 
  DollarSign, 
  UserCheck,
  CreditCard
} from 'lucide-react';

const navigation = [
  { name: 'Dashboard', href: '/admin', icon: LayoutDashboard },
  { name: 'Rooms', href: '/admin/rooms', icon: Home },
  { name: 'Bookings', href: '/admin/bookings', icon: Calendar },
  { name: 'Hosts', href: '/admin/hosts', icon: Users },
  { name: 'Chat', href: '/admin/chat', icon: MessageSquare },
  { name: 'Accounts', href: '/admin/accounts', icon: DollarSign },
  { name: 'Users', href: '/admin/users', icon: UserCheck },
  { name: 'Payments', href: '/admin/payments', icon: CreditCard },
];

export function AdminSidebar() {
  const pathname = usePathname();

  return (
    <div className="fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg">
      <div className="flex h-full flex-col">
        <div className="flex h-16 items-center px-6 border-b border-gray-200">
          <h2 className="text-xl font-bold text-primary">GoWaay Admin</h2>
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
      </div>
    </div>
  );
}
