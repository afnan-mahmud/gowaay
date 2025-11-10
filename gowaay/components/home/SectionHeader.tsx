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
    <div className={`mb-4 flex flex-row items-center justify-between ${className}`}>
      <div>
        <h2 className="text-lg font-semibold text-gray-900 md:text-xl">
          {title}
        </h2>
      </div>
      
      {viewAllHref && (
        <Link href={viewAllHref}>
          <Button 
            variant="ghost" 
            size="sm"
            className="group h-8 rounded-full text-sm font-medium text-gray-600 hover:text-brand"
          >
            {viewAllText}
            <ArrowRight className="h-3.5 w-3.5 ml-1.5 group-hover:translate-x-1 transition-transform" />
          </Button>
        </Link>
      )}
    </div>
  );
}
