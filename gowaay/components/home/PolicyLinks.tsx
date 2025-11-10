'use client';

import Link from 'next/link';

interface PolicyLinksProps {
  className?: string;
}

export function PolicyLinks({ className }: PolicyLinksProps) {
  return (
    <div className={`text-center space-y-4 ${className}`}>
      {/* Policy Links */}
      <div className="flex flex-wrap items-center justify-center gap-6 text-sm">
        <Link 
          href="/terms" 
          className="text-gray-600 hover:text-gray-900 transition-colors duration-200"
        >
          Terms & Conditions
        </Link>
        
        <span className="text-gray-300">|</span>
        
        <Link 
          href="/cancellation" 
          className="text-gray-600 hover:text-gray-900 transition-colors duration-200"
        >
          Cancellation Policy
        </Link>
        
        <span className="text-gray-300">|</span>
        
        <Link 
          href="/join-host" 
          className="text-brand hover:text-brand/80 font-medium underline decoration-2 underline-offset-2 hover:decoration-brand/60 transition-all duration-200"
        >
          Join as Host
        </Link>
      </div>

      {/* Copyright */}
      <div className="text-xs text-gray-500">
        ©2025 GoWaay. All rights reserved.
      </div>
    </div>
  );
}
