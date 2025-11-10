'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Calendar, 
  Home, 
  DollarSign, 
  MessageSquare,
  TrendingUp,
  Users,
  Clock,
  CheckCircle
} from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { useHostStats, useHostBookings } from '@/lib/hooks/useHostData';
import { Skeleton } from '@/components/ui/skeleton';

interface RecentBooking {
  _id: string;
  roomId: {
    _id: string;
    title: string;
    locationName: string;
    images: Array<{ url: string; w: number; h: number }>;
  };
  userId: {
    _id: string;
    name: string;
    email: string;
    phone: string;
  };
  checkIn: string;
  checkOut: string;
  amountTk: number;
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed';
  createdAt: string;
}

export default function HostDashboard() {
  const { stats, loading: statsLoading, error: statsError } = useHostStats();
  const { bookings, loading: bookingsLoading, error: bookingsError } = useHostBookings();
  
  const recentBookings = bookings?.slice(0, 5) || [];

  if (statsLoading || bookingsLoading) {
    return (
      <div className="space-y-6 pb-20 md:pb-0">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">Host Dashboard</h1>
        </div>
        
        <div className="hidden md:grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Card key={i}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-4 w-4" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-8 w-16 mb-1" />
                <Skeleton className="h-3 w-20" />
              </CardContent>
            </Card>
          ))}
        </div>
        
        <div className="grid gap-4 md:grid-cols-2">
          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-32" />
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {Array.from({ length: 3 }).map((_, i) => (
                  <Skeleton key={i} className="h-16 w-full" />
                ))}
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-32" />
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {Array.from({ length: 3 }).map((_, i) => (
                  <Skeleton key={i} className="h-16 w-full" />
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (statsError || bookingsError) {
    return (
      <div className="space-y-6 pb-20 md:pb-0">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">Host Dashboard</h1>
        </div>
        <div className="text-center py-8">
          <p className="text-red-600 mb-4">
            Error loading dashboard: {statsError || bookingsError}
          </p>
          <Button onClick={() => window.location.reload()}>
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  const hostStats = stats || {
    totalBookings: 0,
    confirmedBookings: 0,
    pendingBookings: 0,
    totalEarnings: 0,
    totalRooms: 0,
    activeRooms: 0,
  };

  const statCards = [
    {
      title: 'Total Bookings',
      value: hostStats.totalBookings.toLocaleString(),
      description: 'All time bookings',
      icon: Calendar,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
    },
    {
      title: 'Confirmed Bookings',
      value: hostStats.confirmedBookings.toLocaleString(),
      description: 'Successfully confirmed',
      icon: CheckCircle,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
    },
    {
      title: 'Pending Bookings',
      value: hostStats.pendingBookings.toLocaleString(),
      description: 'Awaiting confirmation',
      icon: Clock,
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-50',
    },
    {
      title: 'Total Earnings',
      value: `৳${hostStats.totalEarnings.toLocaleString()}`,
      description: 'From confirmed bookings',
      icon: DollarSign,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
    },
  ];

  const quickActions = [
    {
      title: 'Manage Listings',
      description: 'Add, edit, or remove your room listings',
      icon: Home,
      href: '/host/listings',
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
    },
    {
      title: 'View Reservations',
      description: 'See all your bookings and reservations',
      icon: Calendar,
      href: '/host/reservations',
      color: 'text-green-600',
      bgColor: 'bg-green-50',
    },
    {
      title: 'Messages',
      description: 'Communicate with your guests',
      icon: MessageSquare,
      href: '/host/messages',
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
    },
    {
      title: 'Analytics',
      description: 'View your performance metrics',
      icon: TrendingUp,
      href: '/host/analytics',
      color: 'text-orange-600',
      bgColor: 'bg-orange-50',
    },
  ];

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'confirmed':
        return <Badge className="bg-green-100 text-green-800">Confirmed</Badge>;
      case 'cancelled':
        return <Badge className="bg-red-100 text-red-800">Cancelled</Badge>;
      case 'pending':
        return <Badge className="bg-yellow-100 text-yellow-800">Pending</Badge>;
      case 'completed':
        return <Badge className="bg-blue-100 text-blue-800">Completed</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  return (
    <div className="space-y-6 pb-20 md:pb-0">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Host Dashboard</h1>
        <div className="flex items-center space-x-2">
          <Badge variant="outline" className="text-sm">
            {hostStats.activeRooms} Active Listings
          </Badge>
        </div>
      </div>

      {/* Stats Cards - Hidden on mobile */}
      <div className="hidden md:grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {statCards.map((stat, index) => (
          <Card key={index}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {stat.title}
              </CardTitle>
              <div className={cn("p-2 rounded-full", stat.bgColor)}>
                <stat.icon className={cn("h-4 w-4", stat.color)} />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className="text-xs text-muted-foreground">
                {stat.description}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {/* Recent Bookings */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Recent Bookings</CardTitle>
              <Link href="/host/reservations">
                <Button variant="outline" size="sm">
                  View All
                </Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            {recentBookings.length === 0 ? (
              <div className="text-center py-4">
                <Calendar className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                <p className="text-sm text-muted-foreground">No bookings yet</p>
              </div>
            ) : (
              <div className="space-y-4">
                {recentBookings.map((booking) => (
                  <div key={booking._id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="space-y-1">
                      <p className="font-medium text-sm">{booking.roomId.title}</p>
                      <p className="text-xs text-muted-foreground">
                        {booking.userId.name} • {new Date(booking.checkIn).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium text-sm">৳{booking.amountTk.toLocaleString()}</p>
                      {getStatusBadge(booking.status)}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3">
              {quickActions.map((action, index) => (
                <Link key={index} href={action.href}>
                  <div className="flex items-center space-x-3 p-3 rounded-lg border hover:bg-muted/50 transition-colors cursor-pointer">
                    <div className={cn("p-2 rounded-full", action.bgColor)}>
                      <action.icon className={cn("h-4 w-4", action.color)} />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-sm">{action.title}</p>
                      <p className="text-xs text-muted-foreground">{action.description}</p>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Performance Overview */}
      <Card>
        <CardHeader>
          <CardTitle>Performance Overview</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {hostStats.totalBookings > 0 
                  ? ((hostStats.confirmedBookings / hostStats.totalBookings) * 100).toFixed(1)
                  : 0}%
              </div>
              <p className="text-sm text-muted-foreground">Booking Success Rate</p>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                {hostStats.totalRooms > 0 
                  ? ((hostStats.activeRooms / hostStats.totalRooms) * 100).toFixed(1)
                  : 0}%
              </div>
              <p className="text-sm text-muted-foreground">Listing Approval Rate</p>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">
                ৳{hostStats.totalEarnings > 0 
                  ? (hostStats.totalEarnings / Math.max(hostStats.confirmedBookings, 1)).toFixed(0)
                  : 0}
              </div>
              <p className="text-sm text-muted-foreground">Average per Booking</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}