'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';

interface SectionHeaderProps {
  title: string;
  subtitle?: string;
  viewAllHref?: string;
  viewAllText?: string;
  className?: string;
}

export function SectionHeader({ 
  title, 
  subtitle, 
  viewAllHref, 
  viewAllText = "View All",
  className 
}: SectionHeaderProps) {
  return (
    <div className={`mb-6 md:mb-8 flex flex-row items-center justify-between ${className}`}>
      <div className="space-y-1">
        <h2 className="text-2xl md:text-3xl font-bold text-gray-900 tracking-tight">
          {title}
        </h2>
        {subtitle && (
          <p className="text-sm md:text-base text-gray-600">{subtitle}</p>
        )}
      </div>
      
      {viewAllHref && (
        <Link href={viewAllHref}>
          <Button 
            variant="ghost" 
            size="sm"
            className="group h-10 px-4 rounded-full text-sm font-semibold text-gray-700 hover:text-brand hover:bg-brand/5 transition-all"
          >
            {viewAllText}
            <ArrowRight className="h-4 w-4 ml-2 group-hover:translate-x-1 transition-transform" />
          </Button>
        </Link>
      )}
    </div>
  );
}
