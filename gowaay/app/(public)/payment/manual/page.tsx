'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Layout } from '@/components/layout/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { api } from '@/lib/api';
import { toast } from 'sonner';
import { Smartphone, Copy, CheckCircle2, AlertCircle } from 'lucide-react';
import Image from 'next/image';

function ManualPaymentContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const bookingId = searchParams.get('bookingId');
  const amount = searchParams.get('amount');
  
  const [txnId, setTxnId] = useState('');
  const [processing, setProcessing] = useState(false);
  const [copied, setCopied] = useState(false);

  const phoneNumber = '01611553628';

  useEffect(() => {
    if (!bookingId || !amount) {
      toast.error('Invalid payment request');
      router.push('/');
    }
  }, [bookingId, amount, router]);

  const handleCopyNumber = () => {
    navigator.clipboard.writeText(phoneNumber);
    setCopied(true);
    toast.success('Number copied to clipboard!');
    setTimeout(() => setCopied(false), 2000);
  };

  const handleConfirmPayment = async () => {
    if (!txnId.trim()) {
      toast.error('Please enter your transaction ID');
      return;
    }

    if (!bookingId) {
      toast.error('Booking ID not found');
      return;
    }

    try {
      setProcessing(true);

      // Call API to confirm manual payment
      const response = await api.payments.confirmManual({
        bookingId,
        txnId: txnId.trim(),
        amount: parseFloat(amount || '0'),
        method: 'manual' // bKash/Nagad
      });

      if (response.success) {
        toast.success('Payment submitted for verification!');
        // Redirect to bookings page after a short delay
        setTimeout(() => {
          router.push(`/bookings`);
        }, 1500);
      } else {
        toast.error(response.message || 'Failed to confirm payment');
        setProcessing(false);
      }
    } catch (error) {
      console.error('Payment confirmation error:', error);
      toast.error('Failed to confirm payment. Please try again.');
      setProcessing(false);
    }
  };

  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white py-12 px-4">
        <div className="max-w-2xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-brand/10 rounded-full mb-4">
              <Smartphone className="w-8 h-8 text-brand" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Complete Payment</h1>
            <p className="text-gray-600">Send money via bKash or Nagad to confirm your booking</p>
          </div>

          {/* Payment Amount Card */}
          <Card className="mb-6 border-2 border-brand/20">
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-sm text-gray-600 mb-2">Total Amount</p>
                <p className="text-4xl font-bold text-brand">৳{amount}</p>
              </div>
            </CardContent>
          </Card>

          {/* Instructions Card */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-blue-500" />
                Payment Instructions
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Step 1 */}
              <div className="flex gap-4">
                <div className="flex-shrink-0 w-8 h-8 bg-brand text-white rounded-full flex items-center justify-center font-bold">
                  1
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900 mb-1">Open bKash or Nagad App</h3>
                  <p className="text-sm text-gray-600">Open your mobile banking app on your phone</p>
                </div>
              </div>

              {/* Step 2 */}
              <div className="flex gap-4">
                <div className="flex-shrink-0 w-8 h-8 bg-brand text-white rounded-full flex items-center justify-center font-bold">
                  2
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900 mb-1">Send Money</h3>
                  <p className="text-sm text-gray-600 mb-2">Select "Send Money" option and send to:</p>
                  
                  {/* Phone Number Display */}
                  <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xs text-gray-500 mb-1">Send money to</p>
                        <p className="text-2xl font-bold text-gray-900 tracking-wide">{phoneNumber}</p>
                      </div>
                      <Button
                        onClick={handleCopyNumber}
                        variant="outline"
                        size="sm"
                        className="gap-2"
                      >
                        {copied ? (
                          <>
                            <CheckCircle2 className="w-4 h-4 text-green-500" />
                            Copied
                          </>
                        ) : (
                          <>
                            <Copy className="w-4 h-4" />
                            Copy
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Step 3 */}
              <div className="flex gap-4">
                <div className="flex-shrink-0 w-8 h-8 bg-brand text-white rounded-full flex items-center justify-center font-bold">
                  3
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900 mb-1">Enter Transaction ID</h3>
                  <p className="text-sm text-gray-600 mb-2">After successful payment, enter your transaction ID below</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* TXN ID Input Card */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="text-lg">Enter Transaction ID</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="txnId" className="text-sm font-medium">
                    Transaction ID (TXN ID) *
                  </Label>
                  <Input
                    id="txnId"
                    type="text"
                    placeholder="e.g., BKH12345ABCD"
                    value={txnId}
                    onChange={(e) => setTxnId(e.target.value.toUpperCase())}
                    className="mt-1.5 text-lg font-mono"
                    disabled={processing}
                  />
                  <p className="text-xs text-gray-500 mt-1.5">
                    You will receive this ID via SMS after successful payment
                  </p>
                </div>

                <Button
                  onClick={handleConfirmPayment}
                  disabled={!txnId.trim() || processing}
                  className="w-full bg-brand hover:bg-brand-dark text-white py-6 text-lg font-semibold"
                >
                  {processing ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2" />
                      Confirming...
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="w-5 h-5 mr-2" />
                      Confirm Payment
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Help Text */}
          <div className="text-center text-sm text-gray-500">
            <p className="mb-2">Having trouble? Contact us for assistance</p>
            <p className="font-medium text-gray-700">support@gowaay.com</p>
          </div>
        </div>
      </div>
    </Layout>
  );
}

export default function ManualPaymentPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand"></div>
      </div>
    }>
      <ManualPaymentContent />
    </Suspense>
  );
}

