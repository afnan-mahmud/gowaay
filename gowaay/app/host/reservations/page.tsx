'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { 
  Search, 
  Eye, 
  Check, 
  X, 
  Calendar,
  User,
  Home,
  DollarSign,
  Phone,
  Mail,
  Clock
} from 'lucide-react';
import { format } from 'date-fns';
import { useHostBookings, HostBooking } from '@/lib/hooks/useHostData';
import { api } from '@/lib/api';

interface Booking extends HostBooking {
  // Extending the HostBooking interface from the hook
}

export default function HostReservations() {
  const { bookings, loading, error } = useHostBookings();
  const [filteredBookings, setFilteredBookings] = useState<Booking[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);

  useEffect(() => {
    filterBookings();
  }, [bookings, searchTerm, statusFilter]);

  const filterBookings = () => {
    let filtered = bookings || [];

    // Filter by status
    if (statusFilter !== 'all') {
      filtered = filtered.filter(booking => booking.status === statusFilter);
    }

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(booking =>
        booking.roomId.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        booking.userId.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        booking.userId.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        booking._id.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredBookings(filtered);
  };

  const handleApprove = async (bookingId: string) => {
    try {
      const response = await api.bookings.update(bookingId, { status: 'confirmed' });
      if (response.success) {
        // Refresh the bookings data
        window.location.reload();
      } else {
        console.error('Failed to approve booking:', response.message);
      }
    } catch (error) {
      console.error('Failed to approve booking:', error);
    }
  };

  const handleReject = async (bookingId: string) => {
    try {
      const response = await api.bookings.update(bookingId, { status: 'cancelled' });
      if (response.success) {
        // Refresh the bookings data
        window.location.reload();
      } else {
        console.error('Failed to reject booking:', response.message);
      }
    } catch (error) {
      console.error('Failed to reject booking:', error);
    }
  };

  const getStatusBadge = (status: string) => {
    const variants = {
      pending: 'bg-yellow-100 text-yellow-800',
      confirmed: 'bg-green-100 text-green-800',
      cancelled: 'bg-red-100 text-red-800',
      completed: 'bg-blue-100 text-blue-800',
    };
    return (
      <Badge className={variants[status as keyof typeof variants]}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  const getPaymentStatusBadge = (status: string) => {
    const variants = {
      unpaid: 'bg-gray-100 text-gray-800',
      paid: 'bg-green-100 text-green-800',
      failed: 'bg-red-100 text-red-800',
      refunded: 'bg-blue-100 text-blue-800',
    };
    return (
      <Badge className={variants[status as keyof typeof variants]}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  if (loading) {
    return (
      <div className="space-y-6 pb-20 md:pb-0">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Reservations</h1>
            <p className="text-gray-600">Manage your property bookings</p>
          </div>
        </div>
        <div className="text-center py-8">
          <p className="text-gray-600">Loading reservations...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6 pb-20 md:pb-0">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Reservations</h1>
            <p className="text-gray-600">Manage your property bookings</p>
          </div>
        </div>
        <div className="text-center py-8">
          <p className="text-red-600 mb-4">Error loading reservations: {error}</p>
          <Button onClick={() => window.location.reload()}>
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-20 md:pb-0">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Reservations</h1>
          <p className="text-gray-600">Manage your property bookings</p>
        </div>
      </div>

      {/* Summary Cards - Hidden on mobile */}
      <div className="hidden md:grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Total Bookings</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{bookings?.length || 0}</div>
            <p className="text-xs text-gray-500 mt-1">All time</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Pending</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">
              {bookings?.filter(b => b.status === 'pending').length || 0}
            </div>
            <p className="text-xs text-gray-500 mt-1">Awaiting approval</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Confirmed</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {bookings?.filter(b => b.status === 'confirmed').length || 0}
            </div>
            <p className="text-xs text-gray-500 mt-1">Active bookings</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Total Revenue</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              ৳{bookings?.reduce((sum, b) => sum + b.amountTk, 0).toLocaleString() || 0}
            </div>
            <p className="text-xs text-gray-500 mt-1">All bookings</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col space-y-4 md:flex-row md:items-center md:justify-between md:space-y-0">
            <CardTitle>Bookings</CardTitle>
            <div className="grid gap-3 md:flex md:items-center md:space-x-4 md:gap-0">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search bookings..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 w-full md:w-64"
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full md:w-40">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="confirmed">Confirmed</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {filteredBookings.map((booking) => (
              <div key={booking._id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-4 mb-2">
                      <h3 className="text-lg font-semibold text-gray-900">
                        Booking #{booking._id.slice(-8)}
                      </h3>
                      {getStatusBadge(booking.status)}
                      {getPaymentStatusBadge(booking.paymentStatus)}
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <h4 className="font-medium text-gray-900">{booking.roomId.title}</h4>
                        <p className="text-sm text-gray-600 flex items-center mt-1">
                          <User className="h-4 w-4 mr-1" />
                          {booking.userId.name}
                        </p>
                        <p className="text-sm text-gray-600 flex items-center">
                          <Mail className="h-4 w-4 mr-1" />
                          {booking.userId.email}
                        </p>
                        <p className="text-sm text-gray-600 flex items-center">
                          <Phone className="h-4 w-4 mr-1" />
                          {booking.userId.phone}
                        </p>
                      </div>
                      
                      <div>
                        <div className="flex items-center space-x-4 text-sm">
                          <div className="flex items-center">
                            <Calendar className="h-4 w-4 mr-2 text-gray-400" />
                            <div>
                              <p className="font-medium">Check-in</p>
                              <p>{format(new Date(booking.checkIn), 'MMM dd, yyyy')}</p>
                            </div>
                          </div>
                          <div className="flex items-center">
                            <Calendar className="h-4 w-4 mr-2 text-gray-400" />
                            <div>
                              <p className="font-medium">Check-out</p>
                              <p>{format(new Date(booking.checkOut), 'MMM dd, yyyy')}</p>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center mt-2">
                          <User className="h-4 w-4 mr-2 text-gray-400" />
                          <p className="text-sm">{booking.guests} {booking.guests === 1 ? 'guest' : 'guests'}</p>
                        </div>
                        <div className="flex items-center mt-1">
                          <DollarSign className="h-4 w-4 mr-2 text-gray-400" />
                          <p className="font-semibold">৳{booking.amountTk.toLocaleString()}</p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-4 mt-3 text-sm text-gray-500">
                      <div className="flex items-center">
                        <Clock className="h-4 w-4 mr-1" />
                        Booked: {format(new Date(booking.createdAt), 'MMM dd, yyyy')}
                      </div>
                    </div>
                  </div>
                  
                  <div className="ml-4 flex items-center space-x-2">
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button variant="outline" size="sm">
                          <Eye className="h-4 w-4 mr-1" />
                          View
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-2xl">
                        <DialogHeader>
                          <DialogTitle>Booking Details - #{booking._id.slice(-8)}</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-6">
                          {/* Guest Information */}
                          <div>
                            <h3 className="font-semibold text-lg mb-2">Guest Information</h3>
                            <div className="bg-gray-50 p-4 rounded-lg">
                              <p className="font-medium">{booking.userId.name}</p>
                              <p className="text-sm text-gray-600">{booking.userId.email}</p>
                              <p className="text-sm text-gray-600">{booking.userId.phone}</p>
                            </div>
                          </div>
                          
                          {/* Booking Details */}
                          <div>
                            <h3 className="font-semibold text-lg mb-2">Booking Details</h3>
                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <p className="text-sm font-medium text-gray-600">Property</p>
                                <p>{booking.roomId.title}</p>
                              </div>
                              <div>
                                <p className="text-sm font-medium text-gray-600">Total Amount</p>
                                <p className="font-semibold">৳{booking.amountTk.toLocaleString()}</p>
                              </div>
                              <div>
                                <p className="text-sm font-medium text-gray-600">Check-in</p>
                                <p>{format(new Date(booking.checkIn), 'EEEE, MMMM dd, yyyy')}</p>
                              </div>
                              <div>
                                <p className="text-sm font-medium text-gray-600">Check-out</p>
                                <p>{format(new Date(booking.checkOut), 'EEEE, MMMM dd, yyyy')}</p>
                              </div>
                              <div>
                                <p className="text-sm font-medium text-gray-600">Guests</p>
                                <p>{booking.guests} {booking.guests === 1 ? 'guest' : 'guests'}</p>
                              </div>
                              <div>
                                <p className="text-sm font-medium text-gray-600">Status</p>
                                {getStatusBadge(booking.status)}
                              </div>
                            </div>
                          </div>
                        </div>
                      </DialogContent>
                    </Dialog>
                    
                    {booking.status === 'pending' && (
                      <>
                        <Button
                          size="sm"
                          onClick={() => handleApprove(booking._id)}
                          className="bg-green-600 hover:bg-green-700"
                        >
                          <Check className="h-4 w-4 mr-1" />
                          Approve
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => handleReject(booking._id)}
                        >
                          <X className="h-4 w-4 mr-1" />
                          Reject
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            ))}
            
            {filteredBookings.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                No bookings found matching your criteria.
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

