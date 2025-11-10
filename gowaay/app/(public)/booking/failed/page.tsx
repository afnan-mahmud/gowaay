'use client';

import { Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { XCircle, Home, RefreshCw, Phone } from 'lucide-react';

function BookingFailedContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const bookingId = searchParams.get('bookingId');
  const error = searchParams.get('error') || 'Payment failed';
  const isCancelled = searchParams.get('status') === 'cancelled';

  const handleRetry = () => {
    if (bookingId) {
      router.push(`/booking/details?bookingId=${bookingId}`);
    } else {
      router.push('/');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-orange-50 flex items-center justify-center p-4">
      <div className="max-w-2xl w-full">
        {/* Failed Card */}
        <div className="bg-white rounded-2xl shadow-2xl p-8 md:p-12 text-center">
          {/* Error Icon */}
          <div className="flex justify-center mb-6">
            <div className="relative">
              <div className="bg-red-500 rounded-full p-6">
                <XCircle className="h-16 w-16 text-white" />
              </div>
            </div>
          </div>

          {/* Error Message */}
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            {isCancelled ? '❌ Payment Cancelled' : '⚠️ Payment Failed'}
          </h1>
          <p className="text-lg text-gray-600 mb-8">
            {isCancelled 
              ? 'You have cancelled the payment process. Your booking was not confirmed.'
              : 'Unfortunately, we couldn\'t process your payment. Please try again.'}
          </p>

          {/* Error Details */}
          <div className="bg-red-50 border border-red-200 rounded-xl p-6 mb-8">
            <p className="text-sm font-medium text-red-900 mb-2">Error Details:</p>
            <p className="text-sm text-red-700">{error}</p>
            {bookingId && (
              <p className="text-xs text-red-600 mt-3">
                Booking Reference: {bookingId.slice(0, 8).toUpperCase()}
              </p>
            )}
          </div>

          {/* Reasons */}
          <div className="bg-gray-50 rounded-xl p-6 mb-8 text-left">
            <p className="font-semibold text-gray-900 mb-3">Common reasons for payment failure:</p>
            <ul className="space-y-2 text-sm text-gray-600">
              <li className="flex items-start gap-2">
                <span className="text-brand mt-0.5">•</span>
                <span>Insufficient balance in your account</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-brand mt-0.5">•</span>
                <span>Incorrect card details or OTP</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-brand mt-0.5">•</span>
                <span>Network connectivity issues</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-brand mt-0.5">•</span>
                <span>Payment method not supported</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-brand mt-0.5">•</span>
                <span>Transaction timeout</span>
              </li>
            </ul>
          </div>

          {/* Action Buttons */}
          <div className="space-y-3">
            <Button
              onClick={handleRetry}
              className="w-full bg-brand hover:bg-brand/90 text-white font-semibold py-6 text-base rounded-lg flex items-center justify-center gap-2"
            >
              <RefreshCw className="h-5 w-5" />
              Try Again
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

          {/* Support Info */}
          <div className="mt-8 pt-8 border-t border-gray-200">
            <div className="flex items-start gap-3 bg-blue-50 border border-blue-200 rounded-lg p-4">
              <Phone className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
              <div className="text-left">
                <p className="text-sm font-semibold text-blue-900 mb-1">
                  Need Assistance?
                </p>
                <p className="text-sm text-blue-700">
                  Contact our support team at{' '}
                  <a href="mailto:support@gowaay.com" className="font-medium underline">
                    support@gowaay.com
                  </a>
                  {' '}or call{' '}
                  <a href="tel:+8801611553628" className="font-medium underline">
                    +880 1870 274378
                  </a>
                </p>
                <p className="text-sm text-blue-700 mt-1">
                  WhatsApp:{' '}
                  <a href="https://wa.me/8801611553628" className="font-medium underline">
                    +880 1820 500747
                  </a>
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Additional Info */}
        <div className="text-center mt-8">
          <p className="text-gray-600 text-sm">
            Your booking has not been confirmed. No charges have been made to your account.
          </p>
        </div>
      </div>
    </div>
  );
}

export default function BookingFailedPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-orange-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    }>
      <BookingFailedContent />
    </Suspense>
  );
}

