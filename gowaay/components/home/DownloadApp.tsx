'use client';

import { Button } from '@/components/ui/button';
import { QrCode, Smartphone } from 'lucide-react';
import Image from 'next/image';

interface DownloadAppProps {
  className?: string;
}

export function DownloadApp({ className }: DownloadAppProps) {
  return (
    <section className={`py-10 md:py-16 bg-gradient-to-b from-white to-pink-50 ${className}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 md:gap-12 items-center">
          {/* Content */}
          <div className="text-center lg:text-left">
            <h2 className="text-2xl md:text-3xl xl:text-4xl font-bold text-gray-900 mb-4 md:mb-6">
              Download, Search & Book Your Perfect Place
            </h2>
            <p className="text-lg text-gray-600 mb-8 leading-relaxed">
              Get the GoWaay app for the best mobile experience. 
              Search, book, and manage your stays on the go with exclusive mobile-only features.
            </p>

            {/* App Store Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start mb-8">
              <Button
                size="lg"
                className="bg-black hover:bg-gray-800 text-white px-8 py-4 h-auto"
              >
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center">
                    <span className="text-black font-bold text-sm">📱</span>
                  </div>
                  <div className="text-left">
                    <div className="text-xs">Download on the</div>
                    <div className="text-lg font-semibold">App Store</div>
                  </div>
                </div>
              </Button>

              <Button
                size="lg"
                className="bg-black hover:bg-gray-800 text-white px-8 py-4 h-auto"
              >
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center">
                    <span className="text-black font-bold text-sm">🤖</span>
                  </div>
                  <div className="text-left">
                    <div className="text-xs">Get it on</div>
                    <div className="text-lg font-semibold">Google Play</div>
                  </div>
                </div>
              </Button>
            </div>

            {/* QR Code */}
            <div className="flex items-center justify-center lg:justify-start space-x-4">
              <div className="w-20 h-20 bg-white rounded-lg shadow-md flex items-center justify-center">
                <QrCode className="h-8 w-8 text-gray-400" />
              </div>
              <div className="text-sm text-gray-600">
                <div className="font-medium">Scan to download</div>
                <div>QR code placeholder</div>
              </div>
            </div>
          </div>

          {/* Phone Mockups */}
          <div className="relative flex justify-center">
            <div className="relative">
              {/* Phone 1 */}
              <div className="absolute -top-4 -left-8 w-48 h-96 bg-gray-900 rounded-3xl p-2 shadow-2xl transform rotate-12">
                <div className="w-full h-full bg-white rounded-2xl overflow-hidden">
                  <div className="h-8 bg-gray-200 rounded-t-2xl"></div>
                  <div className="p-4 space-y-3">
                    <div className="h-4 bg-gray-200 rounded"></div>
                    <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                    <div className="h-32 bg-gray-200 rounded"></div>
                    <div className="h-4 bg-gray-200 rounded"></div>
                    <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                  </div>
                </div>
              </div>

              {/* Phone 2 */}
              <div className="relative w-48 h-96 bg-gray-900 rounded-3xl p-2 shadow-2xl transform -rotate-6">
                <div className="w-full h-full bg-white rounded-2xl overflow-hidden">
                  <div className="h-8 bg-gray-200 rounded-t-2xl"></div>
                  <div className="p-4 space-y-3">
                    <div className="h-4 bg-gray-200 rounded"></div>
                    <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                    <div className="h-32 bg-gray-200 rounded"></div>
                    <div className="h-4 bg-gray-200 rounded"></div>
                    <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
