'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon, TrendingUp, Users, Home, DollarSign, CheckCircle, XCircle } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { DateRange } from 'react-day-picker';
import { useAdminStats } from '@/lib/hooks/useAdminData';
import { Skeleton } from '@/components/ui/skeleton';

export default function AdminDashboard() {
  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: new Date(new Date().getFullYear(), new Date().getMonth(), 1), // First day of current month
    to: new Date(), // Today
  });
  
  const { stats, loading, error } = useAdminStats();

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">Admin Dashboard</h1>
          <Skeleton className="h-10 w-48" />
        </div>
        
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
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
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">Admin Dashboard</h1>
        </div>
        <div className="text-center py-8">
          <p className="text-red-600 mb-4">Error loading dashboard data: {error}</p>
          <Button onClick={() => window.location.reload()}>
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  const kpis = stats || {
    totalBookings: 0,
    confirmedBookings: 0,
    cancelledBookings: 0,
    totalRevenue: 0,
    totalHosts: 0,
    activeHosts: 0,
    totalRooms: 0,
    activeRooms: 0,
  };

  const kpiCards = [
    {
      title: 'Total Bookings',
      value: kpis.totalBookings.toLocaleString(),
      description: 'All time bookings',
      icon: TrendingUp,
      color: 'text-blue-600',
    },
    {
      title: 'Confirmed Bookings',
      value: kpis.confirmedBookings.toLocaleString(),
      description: 'Successfully confirmed',
      icon: CheckCircle,
      color: 'text-green-600',
    },
    {
      title: 'Cancelled Bookings',
      value: kpis.cancelledBookings.toLocaleString(),
      description: 'Cancelled by users',
      icon: XCircle,
      color: 'text-red-600',
    },
    {
      title: 'Total Revenue',
      value: `৳${kpis.totalRevenue.toLocaleString()}`,
      description: 'From confirmed bookings',
      icon: DollarSign,
      color: 'text-green-600',
    },
    {
      title: 'Total Hosts',
      value: kpis.totalHosts.toLocaleString(),
      description: 'Registered hosts',
      icon: Users,
      color: 'text-purple-600',
    },
    {
      title: 'Active Hosts',
      value: kpis.activeHosts.toLocaleString(),
      description: 'Approved hosts',
      icon: Users,
      color: 'text-green-600',
    },
    {
      title: 'Total Rooms',
      value: kpis.totalRooms.toLocaleString(),
      description: 'All room listings',
      icon: Home,
      color: 'text-blue-600',
    },
    {
      title: 'Active Rooms',
      value: kpis.activeRooms.toLocaleString(),
      description: 'Approved rooms',
      icon: Home,
      color: 'text-green-600',
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Admin Dashboard</h1>
        
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className={cn(
                "w-[280px] justify-start text-left font-normal",
                !dateRange && "text-muted-foreground"
              )}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {dateRange?.from ? (
                dateRange.to ? (
                  <>
                    {format(dateRange.from, "LLL dd, y")} -{" "}
                    {format(dateRange.to, "LLL dd, y")}
                  </>
                ) : (
                  format(dateRange.from, "LLL dd, y")
                )
              ) : (
                <span>Pick a date range</span>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0">
            <Calendar
              mode="range"
              defaultMonth={dateRange?.from}
              selected={dateRange}
              onSelect={setDateRange}
              numberOfMonths={2}
            />
          </PopoverContent>
        </Popover>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {kpiCards.map((kpi, index) => (
          <Card key={index}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {kpi.title}
              </CardTitle>
              <kpi.icon className={`h-4 w-4 ${kpi.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{kpi.value}</div>
              <p className="text-xs text-muted-foreground">
                {kpi.description}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4">
          <CardHeader>
            <CardTitle>Overview</CardTitle>
          </CardHeader>
          <CardContent className="pl-2">
            <div className="space-y-4">
              <div className="flex items-center">
                <div className="space-y-1">
                  <p className="text-sm font-medium leading-none">
                    Booking Success Rate
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {kpis.totalBookings > 0 
                      ? ((kpis.confirmedBookings / kpis.totalBookings) * 100).toFixed(1)
                      : 0}% of bookings are confirmed
                  </p>
                </div>
                <div className="ml-auto font-medium">
                  {kpis.totalBookings > 0 
                    ? ((kpis.confirmedBookings / kpis.totalBookings) * 100).toFixed(1)
                    : 0}%
                </div>
              </div>
              <div className="flex items-center">
                <div className="space-y-1">
                  <p className="text-sm font-medium leading-none">
                    Host Approval Rate
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {kpis.totalHosts > 0 
                      ? ((kpis.activeHosts / kpis.totalHosts) * 100).toFixed(1)
                      : 0}% of hosts are approved
                  </p>
                </div>
                <div className="ml-auto font-medium">
                  {kpis.totalHosts > 0 
                    ? ((kpis.activeHosts / kpis.totalHosts) * 100).toFixed(1)
                    : 0}%
                </div>
              </div>
              <div className="flex items-center">
                <div className="space-y-1">
                  <p className="text-sm font-medium leading-none">
                    Room Approval Rate
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {kpis.totalRooms > 0 
                      ? ((kpis.activeRooms / kpis.totalRooms) * 100).toFixed(1)
                      : 0}% of rooms are approved
                  </p>
                </div>
                <div className="ml-auto font-medium">
                  {kpis.totalRooms > 0 
                    ? ((kpis.activeRooms / kpis.totalRooms) * 100).toFixed(1)
                    : 0}%
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="col-span-3">
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <Button className="w-full justify-start" variant="outline">
              <Users className="mr-2 h-4 w-4" />
              Review Host Applications
            </Button>
            <Button className="w-full justify-start" variant="outline">
              <Home className="mr-2 h-4 w-4" />
              Review Room Listings
            </Button>
            <Button className="w-full justify-start" variant="outline">
              <TrendingUp className="mr-2 h-4 w-4" />
              View All Bookings
            </Button>
            <Button className="w-full justify-start" variant="outline">
              <DollarSign className="mr-2 h-4 w-4" />
              Financial Reports
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}