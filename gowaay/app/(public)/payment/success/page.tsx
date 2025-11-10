'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Layout } from '@/components/layout/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { api } from '@/lib/api';
import { usePixelTracking } from '@/hooks/usePixelTracking';
import { CheckCircle, Calendar, Users, CreditCard, Home } from 'lucide-react';
import Image from 'next/image';
import { env } from '@/lib/env';

interface BookingSummary {
  id: string;
  room: {
    id: string;
    name: string;
    images: string[];
  };
  checkIn: string;
  checkOut: string;
  guests: number;
  totalAmount: number;
  status: string;
}

function PaymentSuccessContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { trackPurchase } = usePixelTracking();
  
  const [booking, setBooking] = useState<BookingSummary | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const val_id = searchParams.get('val_id');
    const tran_id = searchParams.get('tran_id');
    
    if (val_id && tran_id) {
      verifyPayment(val_id, tran_id);
    } else {
      // If no payment params, show mock success for demo
      setBooking({
        id: 'DEMO_BOOKING_123',
        room: {
          id: 'demo_room',
          name: 'Demo Room',
          images: ['/placeholder-room.jpg'],
        },
        checkIn: new Date().toISOString(),
        checkOut: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
        guests: 2,
        totalAmount: 5000,
        status: 'confirmed',
      });
      setLoading(false);
    }
  }, []);

  const verifyPayment = async (val_id: string, tran_id: string) => {
    try {
      setLoading(true);
      const response = await api.payments.verify({ val_id, tran_id });
      
      if (response.success && response.data) {
        // Track purchase event
        const amount = (response.data as any)?.amount || 5000;
        trackPurchase('Demo User', '+8801234567890', amount);
        
        // In a real app, you'd fetch the actual booking details
        setBooking({
          id: tran_id,
          room: {
            id: 'room_id',
            name: 'Booked Room',
            images: ['/placeholder-room.jpg'],
          },
          checkIn: new Date().toISOString(),
          checkOut: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
          guests: 2,
          totalAmount: amount,
          status: 'confirmed',
        });
      }
    } catch (error) {
      console.error('Payment verification failed:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  if (loading) {
    return (
      <Layout>
        <div className="p-4">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-gray-200 rounded w-1/2 mx-auto"></div>
            <div className="h-32 bg-gray-200 rounded"></div>
            <div className="space-y-2">
              <div className="h-6 bg-gray-200 rounded"></div>
              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  if (!booking) {
    return (
      <Layout>
        <div className="p-4 text-center">
          <h1 className="text-2xl font-bold mb-4">Payment verification failed</h1>
          <Button onClick={() => router.push('/')}>Go Home</Button>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="p-4 space-y-6">
        {/* Success Header */}
        <div className="text-center">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="h-10 w-10 text-green-600" />
          </div>
          <h1 className="text-3xl font-bold text-green-600 mb-2">Payment Successful!</h1>
          <p className="text-gray-600">Your booking has been confirmed</p>
        </div>

        {/* Booking Summary */}
        <Card>
          <CardHeader>
            <CardTitle>Booking Summary</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex space-x-4">
              <div className="relative w-24 h-24 rounded-lg overflow-hidden">
                <Image
                  src={booking.room.images[0].startsWith('http') ? booking.room.images[0] : `${env.IMG_BASE_URL}${booking.room.images[0]}`}
                  alt={booking.room.name}
                  fill
                  className="object-cover"
                />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-lg">{booking.room.name}</h3>
                <p className="text-gray-600">Booking ID: {booking.id}</p>
                <div className="flex items-center space-x-4 mt-2 text-sm text-gray-600">
                  <div className="flex items-center space-x-1">
                    <Calendar className="h-4 w-4" />
                    <span>{formatDate(booking.checkIn)} - {formatDate(booking.checkOut)}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Users className="h-4 w-4" />
                    <span>{booking.guests} guest{booking.guests !== 1 ? 's' : ''}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Payment Details */}
            <div className="border-t pt-4">
              <div className="flex justify-between items-center">
                <div className="flex items-center space-x-2">
                  <CreditCard className="h-5 w-5 text-primary" />
                  <span className="font-medium">Total Paid</span>
                </div>
                <span className="text-2xl font-bold text-primary">
                  ৳{booking.totalAmount.toLocaleString()}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Next Steps */}
        <Card>
          <CardHeader>
            <CardTitle>What's Next?</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-start space-x-3">
              <div className="w-6 h-6 bg-primary rounded-full flex items-center justify-center text-white text-sm font-bold">
                1
              </div>
              <div>
                <p className="font-medium">Check your email</p>
                <p className="text-sm text-gray-600">We've sent you a confirmation email with all the details</p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <div className="w-6 h-6 bg-primary rounded-full flex items-center justify-center text-white text-sm font-bold">
                2
              </div>
              <div>
                <p className="font-medium">Contact the host</p>
                <p className="text-sm text-gray-600">You can now message the host for check-in details</p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <div className="w-6 h-6 bg-primary rounded-full flex items-center justify-center text-white text-sm font-bold">
                3
              </div>
              <div>
                <p className="font-medium">Enjoy your stay!</p>
                <p className="text-sm text-gray-600">Have a wonderful time at your booked accommodation</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="space-y-3">
          <Button 
            className="w-full" 
            size="lg"
            onClick={() => router.push('/bookings')}
          >
            View My Bookings
          </Button>
          <Button 
            variant="outline" 
            className="w-full"
            onClick={() => router.push('/')}
          >
            <Home className="h-4 w-4 mr-2" />
            Back to Home
          </Button>
        </div>

        {/* Support */}
        <div className="text-center text-sm text-gray-600">
          <p>Need help? Contact our support team</p>
          <p className="text-primary">support@gowaay.com</p>
        </div>
      </div>
    </Layout>
  );
}

export default function PaymentSuccess() {
  return (
    <Suspense fallback={
      <Layout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
            <p className="text-sm text-muted-foreground">Loading payment details...</p>
          </div>
        </div>
      </Layout>
    }>
      <PaymentSuccessContent />
    </Suspense>
  );
}
