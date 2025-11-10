'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Layout } from '@/components/layout/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { api } from '@/lib/api';
import { Room } from '@/lib/store';
import { env } from '@/lib/env';
import { Calendar, Users, CreditCard, ArrowLeft } from 'lucide-react';
import Image from 'next/image';

function PaymentContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  
  const roomId = searchParams.get('roomId');
  const checkIn = searchParams.get('checkIn');
  const checkOut = searchParams.get('checkOut');
  const guests = searchParams.get('guests');
  
  const [room, setRoom] = useState<Room | null>(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    if (roomId) {
      loadRoom();
    } else {
      router.push('/');
    }
  }, [roomId]);

  const loadRoom = async () => {
    try {
      setLoading(true);
      const response = await api.rooms.get(roomId!);
      if (response.success && response.data) {
        setRoom(response.data.product);
      }
    } catch (error) {
      console.error('Failed to load room:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePayment = async () => {
    if (!room || !checkIn || !checkOut || !guests) return;

    try {
      setProcessing(true);
      
      const paymentData = {
        amount: room.price,
        currency: 'BDT',
        orderId: `ORDER_${Date.now()}`,
        products: [{
          id: room.id,
          name: room.name,
          quantity: 1,
          price: room.price,
        }],
      };

      const response = await api.payments.create<{ gatewayUrl: string }>(paymentData);
      
      if (response.success && response.data) {
        // Redirect to SSLCOMMERZ payment gateway
        window.location.href = response.data.gatewayUrl;
      } else {
        alert('Failed to create payment session');
      }
    } catch (error) {
      console.error('Payment error:', error);
      alert('Payment failed. Please try again.');
    } finally {
      setProcessing(false);
    }
  };

  const calculateTotal = () => {
    if (!room || !checkIn || !checkOut) return 0;
    
    const checkInDate = new Date(checkIn);
    const checkOutDate = new Date(checkOut);
    const nights = Math.ceil((checkOutDate.getTime() - checkInDate.getTime()) / (1000 * 60 * 60 * 24));
    
    return room.price * nights;
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
            <div className="h-8 bg-gray-200 rounded w-1/4"></div>
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

  if (!room) {
    return (
      <Layout>
        <div className="p-4 text-center">
          <h1 className="text-2xl font-bold mb-4">Room not found</h1>
          <Button onClick={() => router.push('/')}>Go Home</Button>
        </div>
      </Layout>
    );
  }

  const total = calculateTotal();
  const nights = checkIn && checkOut ? 
    Math.ceil((new Date(checkOut).getTime() - new Date(checkIn).getTime()) / (1000 * 60 * 60 * 24)) : 0;

  return (
    <Layout>
      <div className="p-4 space-y-6">
        {/* Header */}
        <div className="flex items-center space-x-4">
          <Button variant="ghost" size="icon" onClick={() => router.back()}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-2xl font-bold">Payment</h1>
        </div>

        {/* Room Summary */}
        <Card>
          <CardHeader>
            <CardTitle>Booking Summary</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex space-x-4">
              <div className="relative w-24 h-24 rounded-lg overflow-hidden">
                <Image
                  src={room.images[0].startsWith('http') ? room.images[0] : `${env.IMG_BASE_URL}${room.images[0]}`}
                  alt={room.name}
                  fill
                  className="object-cover"
                />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-lg">{room.name}</h3>
                <p className="text-gray-600">{room.category}</p>
                <div className="flex items-center space-x-4 mt-2 text-sm text-gray-600">
                  <div className="flex items-center space-x-1">
                    <Calendar className="h-4 w-4" />
                    <span>{nights} night{nights !== 1 ? 's' : ''}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Users className="h-4 w-4" />
                    <span>{guests} guest{guests !== '1' ? 's' : ''}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Dates */}
            <div className="border-t pt-4">
              <div className="flex justify-between items-center">
                <div>
                  <p className="font-medium">Check-in</p>
                  <p className="text-gray-600">{formatDate(checkIn!)}</p>
                </div>
                <div>
                  <p className="font-medium">Check-out</p>
                  <p className="text-gray-600">{formatDate(checkOut!)}</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Price Breakdown */}
        <Card>
          <CardHeader>
            <CardTitle>Price Breakdown</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between">
              <span>৳{room.price.toLocaleString()} × {nights} night{nights !== 1 ? 's' : ''}</span>
              <span>৳{total.toLocaleString()}</span>
            </div>
            <div className="flex justify-between font-bold text-lg border-t pt-3">
              <span>Total</span>
              <span>৳{total.toLocaleString()}</span>
            </div>
          </CardContent>
        </Card>

        {/* Payment Method */}
        <Card>
          <CardHeader>
            <CardTitle>Payment Method</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-3 p-4 border rounded-lg">
              <CreditCard className="h-6 w-6 text-primary" />
              <div>
                <p className="font-medium">SSLCOMMERZ</p>
                <p className="text-sm text-gray-600">Secure payment gateway</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Payment Button */}
        <Button 
          className="w-full" 
          size="lg"
          onClick={handlePayment}
          disabled={processing}
        >
          {processing ? 'Processing...' : `Pay ৳${total.toLocaleString()}`}
        </Button>

        {/* Security Notice */}
        <div className="text-center text-sm text-gray-600">
          <p>Your payment is secured by SSLCOMMERZ</p>
          <p>We use industry-standard encryption to protect your data</p>
        </div>
      </div>
    </Layout>
  );
}

export default function PaymentPage() {
  return (
    <Suspense fallback={
      <Layout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
            <p className="text-sm text-muted-foreground">Loading payment...</p>
          </div>
        </div>
      </Layout>
    }>
      <PaymentContent />
    </Suspense>
  );
}
