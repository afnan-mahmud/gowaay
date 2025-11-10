'use client';

import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { api } from '@/lib/api';
import { env } from '@/lib/env';
import { 
  Clock,
  Users,
  CheckCircle2,
  AlertCircle,
  ChevronLeft
} from 'lucide-react';
import { format, differenceInDays, parseISO } from 'date-fns';

// Backend room response interface
interface BackendRoom {
  _id: string;
  title: string;
  description: string;
  address: string;
  locationName: string;
  totalPriceTk: number;
  images: Array<{
    url: string;
    w: number;
    h: number;
  }>;
  averageRating?: number;
  totalReviews?: number;
}

// Helper function to resolve image URLs
const resolveImageSrc = (image: string) => {
  if (image.startsWith('http://') || image.startsWith('https://')) return image;
  const normalized = image.startsWith('/') ? image : `/${image}`;
  return `${env.IMG_BASE_URL}${normalized}`;
};

function BookingDetailsContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const [room, setRoom] = useState<BackendRoom | null>(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [timeLeft, setTimeLeft] = useState(24 * 60 * 60); // 24 hours in seconds

  const roomId = searchParams.get('roomId');
  const checkIn = searchParams.get('checkIn');
  const checkOut = searchParams.get('checkOut');
  const adults = parseInt(searchParams.get('adults') || '1');
  const children = parseInt(searchParams.get('children') || '0');

  // Countdown timer
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  useEffect(() => {
    if (roomId) {
      loadRoom();
    }
  }, [roomId]);

  const loadRoom = async () => {
    try {
      setLoading(true);
      const response = await api.rooms.get<BackendRoom>(roomId!);
      if (response.success && response.data) {
        setRoom(response.data as BackendRoom);
      }
    } catch (error) {
      console.error('Failed to load room:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateNights = () => {
    if (checkIn && checkOut) {
      return differenceInDays(parseISO(checkOut), parseISO(checkIn));
    }
    return 0;
  };

  const calculateTotal = () => {
    const nights = calculateNights();
    return nights > 0 && room ? room.totalPriceTk * nights : 0;
  };

  const handleConfirmAndPay = async () => {
    if (!room || !checkIn || !checkOut) return;

    try {
      setProcessing(true);

      // Create booking - send dates exactly as received (YYYY-MM-DD)
      const bookingData = {
        roomId: room._id,
        checkIn: checkIn,
        checkOut: checkOut,
        guests: adults + children,
        mode: 'instant'
      };

      console.log('Creating booking with data:', bookingData);
      const bookingResponse = await api.bookings.create(bookingData);

      if (bookingResponse.success && bookingResponse.data) {
        const booking = bookingResponse.data as any;
        const bookingId = booking.bookingId || booking._id;
        
        console.log('Booking created successfully:', bookingId);

        // Initialize payment with SSLCommerz using the new helper
        console.log('Initializing payment with bookingId:', bookingId);
        const paymentResponse = await api.payments.initSsl({ bookingId });
        
        console.log('Payment response:', JSON.stringify(paymentResponse, null, 2));

        if (paymentResponse.success && paymentResponse.data?.gatewayUrl) {
          console.log('Payment session created, redirecting to gateway');
          // Redirect to SSLCommerz payment gateway
          window.location.href = paymentResponse.data.gatewayUrl;
        } else {
          console.error('Payment initialization failed:', paymentResponse);
          const errorMsg = paymentResponse.error || paymentResponse.message || 'Failed to initialize payment. Please try again.';
          console.error('Error message:', errorMsg);
          alert(errorMsg);
          setProcessing(false);
        }
      } else {
        console.error('Booking creation failed:', bookingResponse);
        const errorMessage = (bookingResponse as any).error || bookingResponse.message || 'Failed to create booking. Please try again.';
        alert(errorMessage);
        setProcessing(false);
      }
    } catch (error) {
      console.error('Booking error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to create booking. Please try again.';
      alert(errorMessage);
      setProcessing(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand"></div>
      </div>
    );
  }

  if (!room || !checkIn || !checkOut) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Invalid booking details</h1>
          <Button onClick={() => router.push('/')}>Go Home</Button>
        </div>
      </div>
    );
  }

  const nights = calculateNights();
  const totalAmount = calculateTotal();
  const totalGuests = adults + children;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 md:px-8 py-4">
          <button 
            onClick={() => router.back()}
            className="flex items-center gap-2 text-gray-700 hover:text-gray-900 transition"
          >
            <ChevronLeft className="h-5 w-5" />
            <span className="font-medium">Back</span>
          </button>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 md:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Booking Summary */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-start gap-4">
                <div className="relative w-32 h-24 rounded-lg overflow-hidden flex-shrink-0">
                  <Image
                    src={resolveImageSrc(room.images[0]?.url || '')}
                    alt={room.title}
                    fill
                    sizes="128px"
                    className="object-cover"
                    unoptimized
                  />
                  {room.totalReviews === 0 && (
                    <div className="absolute top-2 left-2 bg-yellow-100 text-yellow-800 text-xs font-medium px-2 py-1 rounded">
                      ⭐ New
                    </div>
                  )}
                </div>
                <div className="flex-1">
                  <h1 className="text-xl font-bold text-gray-900 mb-1">{room.title}</h1>
                  {room.totalReviews && room.totalReviews > 0 ? (
                    <p className="text-sm text-gray-600">
                      ⭐ {room.averageRating?.toFixed(1)} ({room.totalReviews} reviews)
                    </p>
                  ) : (
                    <p className="text-sm text-gray-600">⭐ New</p>
                  )}
                  <p className="text-lg font-bold text-brand mt-2">
                    BDT {room.totalPriceTk.toLocaleString()} <span className="text-sm font-normal text-gray-600">/day</span>
                  </p>
                </div>
              </div>
            </div>

            {/* Booking Details */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 space-y-4">
              <div className="flex items-center gap-3 pb-4 border-b border-gray-200">
                <div className="w-10 h-10 rounded-full bg-pink-100 flex items-center justify-center">
                  📅
                </div>
                <div className="flex-1">
                  <p className="text-sm text-gray-600">Dates</p>
                  <p className="font-semibold text-gray-900">
                    {format(parseISO(checkIn), 'dd MMM yy')} - {format(parseISO(checkOut), 'dd MMM yy')} ({nights} {nights === 1 ? 'day' : 'days'})
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3 pb-4 border-b border-gray-200">
                <div className="w-10 h-10 rounded-full bg-pink-100 flex items-center justify-center">
                  <Users className="h-5 w-5 text-brand" />
                </div>
                <div className="flex-1">
                  <p className="text-sm text-gray-600">Guests</p>
                  <p className="font-semibold text-gray-900">{totalGuests} Guest{totalGuests > 1 ? 's' : ''}</p>
                </div>
              </div>

              <div className="flex items-center gap-3 pb-4 border-b border-gray-200">
                <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
                  <Clock className="h-5 w-5 text-green-600" />
                </div>
                <div className="flex-1">
                  <p className="text-sm text-gray-600">Expires In</p>
                  <p className="font-semibold text-gray-900">{formatTime(timeLeft)}</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
                  <CheckCircle2 className="h-5 w-5 text-green-600" />
                </div>
                <div className="flex-1">
                  <p className="text-sm text-gray-600">Status</p>
                  <p className="font-semibold text-green-600">Accepted</p>
                </div>
              </div>
            </div>

            {/* Cancellation Policy */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-start gap-3 mb-4">
                <div className="w-8 h-8 rounded-full bg-pink-100 flex items-center justify-center flex-shrink-0">
                  📋
                </div>
                <h2 className="text-lg font-bold text-gray-900">Cancellation Policy</h2>
              </div>
              <ul className="space-y-2 text-sm text-gray-700">
                <li>- 80% of the total booking amount will be refunded if it's cancelled 24hours before the check in date.</li>
                <li className="text-gray-400">...</li>
              </ul>
            </div>

            {/* Warning Message */}
            <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-yellow-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-yellow-900 mb-1">
                  Your reservation won't be confirmed until the Host accepts your request (within 24 hours).
                </p>
                <p className="text-sm text-yellow-700">You won't be charged until then.</p>
              </div>
            </div>

            {/* Contact Details */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-start gap-3 mb-4">
                <div className="w-8 h-8 rounded-full bg-pink-100 flex items-center justify-center flex-shrink-0">
                  📞
                </div>
                <h2 className="text-lg font-bold text-gray-900">Contact Details</h2>
              </div>
              <div className="space-y-2 text-sm text-gray-700">
                <p>- Contact Number & Location will be provided once you Confirm & Pay.</p>
                <p>- "Confirm & Pay" বাটনে ক্লিক করে পেমেন্ট করার পর মোবাইল নাম্বার এবং লোকেশন দেয়া হবে।</p>
              </div>
            </div>
          </div>

          {/* Right Column - Price Details & Payment */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6 sticky top-24 space-y-6">
              <h2 className="text-lg font-bold text-gray-900">Price Details</h2>

              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">BDT {room.totalPriceTk.toLocaleString()} x {nights} night{nights > 1 ? 's' : ''}</span>
                  <span className="font-semibold text-gray-900">৳ {totalAmount.toLocaleString()}</span>
                </div>

                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Discount</span>
                  <span className="font-semibold text-green-600">৳ 0</span>
                </div>

                <div className="border-t border-gray-200 pt-3">
                  <div className="flex justify-between text-base font-bold">
                    <span className="text-gray-900">Total Payable</span>
                    <span className="text-gray-900">৳ {totalAmount.toLocaleString()}</span>
                  </div>
                </div>

                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Paid</span>
                  <span className="font-semibold text-gray-900">৳ 0</span>
                </div>

                <div className="flex justify-between text-base font-bold">
                  <span className="text-gray-900">Due</span>
                  <span className="text-brand">৳ {totalAmount.toLocaleString()}</span>
                </div>
              </div>

              <div className="pt-4 border-t border-gray-200">
                <Button
                  onClick={handleConfirmAndPay}
                  disabled={processing}
                  className="w-full bg-brand hover:bg-brand/90 text-white font-semibold py-6 text-base rounded-lg"
                >
                  {processing ? (
                    <span className="flex items-center justify-center gap-2">
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                      Processing...
                    </span>
                  ) : (
                    'Confirm & Pay'
                  )}
                </Button>

                <p className="text-xs text-gray-500 text-center mt-4">
                  Upon clicking on Confirm And Pay, I agree to{' '}
                  <a href="/terms" className="text-brand underline">Terms & Conditions</a>,{' '}
                  <a href="/privacy" className="text-brand underline">Privacy Policy</a> and{' '}
                  <a href="/refund" className="text-brand underline">Refund Policy</a>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function BookingDetailsPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand"></div>
      </div>
    }>
      <BookingDetailsContent />
    </Suspense>
  );
}
