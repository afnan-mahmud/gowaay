'use client';

import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { CheckCircle2, Home, FileText } from 'lucide-react';
import confetti from 'canvas-confetti';

function BookingSuccessContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [showConfetti, setShowConfetti] = useState(false);

  const bookingId = searchParams.get('bookingId');
  const transactionId = searchParams.get('transactionId');

  useEffect(() => {
    // Trigger confetti animation
    if (!showConfetti) {
      setShowConfetti(true);
      const duration = 3 * 1000;
      const animationEnd = Date.now() + duration;

      const randomInRange = (min: number, max: number) => {
        return Math.random() * (max - min) + min;
      };

      const interval = setInterval(() => {
        const timeLeft = animationEnd - Date.now();

        if (timeLeft <= 0) {
          clearInterval(interval);
          return;
        }

        const particleCount = 50 * (timeLeft / duration);

        confetti({
          particleCount,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#dc2626', '#ef4444', '#f87171', '#fca5a5'],
        });
      }, 250);

      return () => clearInterval(interval);
    }
  }, [showConfetti]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50 flex items-center justify-center p-4">
      <div className="max-w-2xl w-full">
        {/* Success Card */}
        <div className="bg-white rounded-2xl shadow-2xl p-8 md:p-12 text-center">
          {/* Success Icon */}
          <div className="flex justify-center mb-6">
            <div className="relative">
              <div className="absolute inset-0 bg-green-400 rounded-full animate-ping opacity-75"></div>
              <div className="relative bg-green-500 rounded-full p-6">
                <CheckCircle2 className="h-16 w-16 text-white" />
              </div>
            </div>
          </div>

          {/* Success Message */}
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            🎉 Booking Successful!
          </h1>
          <p className="text-lg text-gray-600 mb-8">
            Your payment has been processed successfully and your booking is confirmed.
          </p>

          {/* Booking Details */}
          <div className="bg-gray-50 rounded-xl p-6 mb-8 space-y-3">
            {bookingId && (
              <div className="flex justify-between items-center">
                <span className="text-gray-600 font-medium">Booking ID:</span>
                <span className="text-gray-900 font-bold">{bookingId.slice(0, 8).toUpperCase()}</span>
              </div>
            )}
            {transactionId && (
              <div className="flex justify-between items-center">
                <span className="text-gray-600 font-medium">Transaction ID:</span>
                <span className="text-gray-900 font-mono text-sm">{transactionId}</span>
              </div>
            )}
            <div className="pt-3 border-t border-gray-200">
              <p className="text-sm text-gray-600">
                A confirmation email has been sent to your registered email address.
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="space-y-3">
            <Button
              onClick={() => router.push('/bookings')}
              className="w-full bg-brand hover:bg-brand/90 text-white font-semibold py-6 text-base rounded-lg flex items-center justify-center gap-2"
            >
              <FileText className="h-5 w-5" />
              View My Bookings
            </Button>
            <Button
              onClick={() => router.push('/')}
              variant="outline"
              className="w-full border-2 border-gray-300 hover:bg-gray-50 text-gray-700 font-semibold py-6 text-base rounded-lg flex items-center justify-center gap-2"
            >
              <Home className="h-5 w-5" />
              Back to Home
            </Button>
          </div>

          {/* Additional Info */}
          <div className="mt-8 pt-8 border-t border-gray-200">
            <p className="text-sm text-gray-600">
              Need help? Contact us at{' '}
              <a href="mailto:support@gowaay.com" className="text-brand hover:underline font-medium">
                support@gowaay.com
              </a>
              {' '}or WhatsApp{' '}
              <a href="https://wa.me/8801611553628" className="text-brand hover:underline font-medium">
                +880 1820 500747
              </a>
            </p>
          </div>
        </div>

        {/* Thank You Message */}
        <div className="text-center mt-8">
          <p className="text-gray-600">
            Thank you for choosing <span className="font-bold text-brand">GoWaay</span>! 
            We hope you have a wonderful stay. 🏠✨
          </p>
        </div>
      </div>
    </div>
  );
}

export default function BookingSuccessPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    }>
      <BookingSuccessContent />
    </Suspense>
  );
}

