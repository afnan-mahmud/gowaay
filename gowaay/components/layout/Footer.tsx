'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Facebook, Instagram, Phone, Mail, MessageCircle, MapPin } from 'lucide-react';
import { Logo } from '@/components/ui/Logo';

export function Footer() {
  const quickLinks = [
    { label: 'Rooms', href: '/search?type=room' },
    { label: 'Hotels', href: '/search?type=hotel' },
    { label: 'Popular Locations', href: '/search' },
    { label: 'Join as Host', href: '/join-host' },
    { label: 'Refund Policy', href: '/refund' },
  ];

  const paymentMethods = [
    { name: 'bKash', logo: '/payments/bkash.png' },
    { name: 'Nagad', logo: '/payments/nagad.png' },
    { name: 'Rocket', logo: '/payments/rocket.png' },
    { name: 'Upay', logo: '/payments/upay.png' },
    { name: 'SureCash', logo: '/payments/surecash.png' },
    { name: 'MCash', logo: '/payments/mcash.png' },
    { name: 'Visa', logo: '/payments/visa.png' },
    { name: 'Mastercard', logo: '/payments/mastercard.png' },
    { name: 'American Express', logo: '/payments/amex.png' },
    { name: 'Nexus Pay', logo: '/payments/nexus.png' },
    { name: 'DBBL Pay', logo: '/payments/dbbl.png' },
    { name: 'City Pay', logo: '/payments/city.png' },
  ];

  return (
    <footer className="bg-gray-50 border-t border-gray-200 mt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {/* Brand Section */}
          <div className="space-y-4">
            <Link href="/" className="inline-block transition-opacity hover:opacity-80">
              <Logo size={100} textClassName="text-2xl font-bold" />
            </Link>
            
            <p className="text-gray-600 text-sm">
              Wherever you go, there is always a place for you.
            </p>
            
            {/* Social Media */}
            <div className="flex items-center gap-3">
              <a 
                href="https://www.facebook.com/gowaay.official" 
                target="_blank" 
                rel="noopener noreferrer"
                className="w-10 h-10 bg-gray-900 rounded-full flex items-center justify-center hover:bg-brand transition-colors"
              >
                <Facebook className="w-5 h-5 text-white" />
              </a>
              <a 
                href="https://www.instagram.com/gowaay.official" 
                target="_blank" 
                rel="noopener noreferrer"
                className="w-10 h-10 bg-gray-900 rounded-full flex items-center justify-center hover:bg-brand transition-colors"
              >
                <Instagram className="w-5 h-5 text-white" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Links</h3>
            <ul className="space-y-3">
              {quickLinks.map((link) => (
                <li key={link.href}>
                  <Link 
                    href={link.href}
                    className="text-gray-600 hover:text-brand transition-colors text-sm"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Us */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Contact Us</h3>
            <div className="space-y-3">
              {/* Address */}
              <div className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-brand flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-gray-900 text-sm mb-1">Address:</p>
                  <p className="text-gray-600 text-sm">
                    H-05, R-13, Nikunja-02,<br />
                    Dhaka, Bangladesh
                  </p>
                </div>
              </div>

              {/* Phone */}
              <div className="flex items-start gap-3">
                <Phone className="w-5 h-5 text-brand flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-gray-900 text-sm mb-1">Contact:</p>
                  <a 
                    href="tel:+8801611553628" 
                    className="text-gray-600 hover:text-brand transition-colors text-sm block"
                  >
                    Call us: +8801611553628
                  </a>
                </div>
              </div>

              {/* Email */}
              <div className="flex items-start gap-3">
                <Mail className="w-5 h-5 text-brand flex-shrink-0 mt-0.5" />
                <div>
                  <a 
                    href="mailto:support@gowaay.com" 
                    className="text-gray-600 hover:text-brand transition-colors text-sm"
                  >
                    Email: support@gowaay.com
                  </a>
                </div>
              </div>

              {/* WhatsApp */}
              <div className="flex items-start gap-3">
                <MessageCircle className="w-5 h-5 text-brand flex-shrink-0 mt-0.5" />
                <div>
                  <a 
                    href="https://wa.me/8801611553628" 
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-gray-600 hover:text-brand transition-colors text-sm"
                  >
                    WhatsApp: +8801611553628
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Accepted Payments - Full Width Section */}
        <div className="mt-12 pt-8 border-t border-gray-200">
          {/* SSLCommerz Payment Methods Image - Full Width */}
          <div className="bg-white rounded-xl border-2 border-gray-200 p-6 shadow-sm">
            <Image
              src="/images/sslcommerz-payment-methods.jpg"
              alt="SSLCommerz Payment Methods - Visa, Mastercard, American Express, bKash, Nagad, Rocket, and more"
              width={1400}
              height={400}
              className="w-full h-auto"
              priority={false}
              unoptimized
            />
          </div>
          
          {/* SSL Commerce Verified Badge */}
          <div className="mt-4 flex items-center justify-center gap-2">
            <div className="flex items-center gap-2 bg-gradient-to-r from-green-50 to-blue-50 border-2 border-green-300 rounded-lg px-5 py-2.5 shadow-sm">
              <svg className="w-6 h-6 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <span className="text-base font-bold text-gray-800">100% Secure Payment - Verified by SSLCommerz</span>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 pt-8 border-t border-gray-200">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-sm text-gray-600">
              © {new Date().getFullYear()} GoWaay. All rights reserved.
            </p>
            <div className="flex items-center gap-6">
              <Link href="/privacy" className="text-sm text-gray-600 hover:text-brand transition-colors">
                Privacy Policy
              </Link>
              <Link href="/terms" className="text-sm text-gray-600 hover:text-brand transition-colors">
                Terms of Service
              </Link>
              <Link href="/refund" className="text-sm text-gray-600 hover:text-brand transition-colors">
                Refund Policy
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}

