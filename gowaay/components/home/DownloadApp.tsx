'use client';

import { Button } from '@/components/ui/button';
import { QrCode, Smartphone } from 'lucide-react';
import Image from 'next/image';

interface DownloadAppProps {
  className?: string;
}

export function DownloadApp({ className }: DownloadAppProps) {
  return (
    <section className={`py-16 md:py-24 bg-gradient-to-br from-brand/5 via-pink-50 to-purple-50 relative overflow-hidden ${className}`}>
      {/* Background Decoration */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/4 right-0 w-96 h-96 bg-brand/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-purple-200/30 rounded-full blur-3xl"></div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 md:gap-16 items-center">
          {/* Content */}
          <div className="text-center lg:text-left space-y-6 md:space-y-8">
            <div className="inline-block px-4 py-2 bg-brand/10 rounded-full mb-2">
              <span className="text-sm font-semibold text-brand">Coming Soon</span>
            </div>

            <h2 className="text-3xl md:text-4xl xl:text-5xl font-bold text-gray-900 leading-tight">
              Download, Search & Book Your Perfect Place
            </h2>
            
            <p className="text-lg md:text-xl text-gray-600 leading-relaxed">
              Get the GoWaay app for the best mobile experience. 
              Search, book, and manage your stays on the go with exclusive mobile-only features.
            </p>

            {/* Features List */}
            <div className="space-y-4 pt-4">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-lg">✓</span>
                </div>
                <div className="text-left">
                  <p className="font-semibold text-gray-900">Instant Booking</p>
                  <p className="text-sm text-gray-600">Book rooms in seconds</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-lg">✓</span>
                </div>
                <div className="text-left">
                  <p className="font-semibold text-gray-900">Secure Payments</p>
                  <p className="text-sm text-gray-600">100% safe and encrypted</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-lg">✓</span>
                </div>
                <div className="text-left">
                  <p className="font-semibold text-gray-900">Exclusive Deals</p>
                  <p className="text-sm text-gray-600">App-only discounts</p>
                </div>
              </div>
            </div>

            {/* App Store Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
              <Button
                size="lg"
                className="bg-black hover:bg-gray-800 text-white px-6 py-6 h-auto rounded-xl shadow-lg hover:shadow-xl transition-all"
              >
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center">
                    <span className="text-2xl">📱</span>
                  </div>
                  <div className="text-left">
                    <div className="text-xs opacity-80">Download on the</div>
                    <div className="text-lg font-bold">App Store</div>
                  </div>
                </div>
              </Button>

              <Button
                size="lg"
                className="bg-black hover:bg-gray-800 text-white px-6 py-6 h-auto rounded-xl shadow-lg hover:shadow-xl transition-all"
              >
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center">
                    <span className="text-2xl">🤖</span>
                  </div>
                  <div className="text-left">
                    <div className="text-xs opacity-80">Get it on</div>
                    <div className="text-lg font-bold">Google Play</div>
                  </div>
                </div>
              </Button>
            </div>

            {/* QR Code */}
            <div className="inline-flex items-center space-x-4 bg-white/80 backdrop-blur-sm rounded-xl p-4 shadow-md">
              <div className="w-20 h-20 bg-gray-100 rounded-lg flex items-center justify-center">
                <QrCode className="h-10 w-10 text-gray-400" />
              </div>
              <div className="text-sm text-gray-700 text-left">
                <div className="font-bold text-base">Scan to Download</div>
                <div className="text-gray-500">Coming Soon</div>
              </div>
            </div>
          </div>

          {/* Phone Mockups */}
          <div className="relative flex justify-center lg:justify-end">
            <div className="relative w-full max-w-md">
              {/* Phone 1 */}
              <div className="absolute -top-8 -left-8 w-56 h-[28rem] bg-gradient-to-br from-brand to-pink-500 rounded-[3rem] p-3 shadow-2xl transform rotate-12 hover:rotate-6 transition-transform duration-300">
                <div className="w-full h-full bg-white rounded-[2.5rem] overflow-hidden">
                  <div className="h-10 bg-gradient-to-r from-brand to-pink-500 rounded-t-[2.5rem]"></div>
                  <div className="p-6 space-y-4">
                    <div className="h-6 bg-gray-200 rounded-lg animate-pulse"></div>
                    <div className="h-6 bg-gray-200 rounded-lg w-3/4 animate-pulse"></div>
                    <div className="h-40 bg-gradient-to-br from-gray-200 to-gray-100 rounded-xl animate-pulse"></div>
                    <div className="space-y-2">
                      <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
                      <div className="h-4 bg-gray-200 rounded w-2/3 animate-pulse"></div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Phone 2 - Main */}
              <div className="relative w-56 h-[28rem] bg-gradient-to-br from-purple-500 to-pink-500 rounded-[3rem] p-3 shadow-2xl transform -rotate-6 hover:rotate-0 transition-transform duration-300">
                <div className="w-full h-full bg-white rounded-[2.5rem] overflow-hidden">
                  <div className="h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-t-[2.5rem]"></div>
                  <div className="p-6 space-y-4">
                    <div className="h-6 bg-gray-200 rounded-lg animate-pulse" style={{ animationDelay: '0.1s' }}></div>
                    <div className="h-6 bg-gray-200 rounded-lg w-3/4 animate-pulse" style={{ animationDelay: '0.2s' }}></div>
                    <div className="h-40 bg-gradient-to-br from-gray-200 to-gray-100 rounded-xl animate-pulse" style={{ animationDelay: '0.3s' }}></div>
                    <div className="space-y-2">
                      <div className="h-4 bg-gray-200 rounded animate-pulse" style={{ animationDelay: '0.4s' }}></div>
                      <div className="h-4 bg-gray-200 rounded w-2/3 animate-pulse" style={{ animationDelay: '0.5s' }}></div>
                    </div>
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
