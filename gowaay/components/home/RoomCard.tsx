'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Heart, Star } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';

interface RoomCardProps {
  id: string;
  title: string;
  location: string;
  price: number;
  image: string;
  rating?: number;
  reviews?: number;
  className?: string;
}

export function RoomCard({ 
  id, 
  title, 
  location, 
  price, 
  image, 
  rating = 0, 
  reviews = 0,
  className 
}: RoomCardProps) {
  const [isLiked, setIsLiked] = useState(false);
  const hasReviews = reviews > 0 && rating > 0;

  const handleLike = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsLiked(!isLiked);
  };

  return (
    <Link href={`/room/${id}`} className="block group">
      <div className={cn(
        'relative bg-white rounded-2xl overflow-hidden transition-all duration-300 group-hover:shadow-xl',
        className
      )}>
        {/* Image Container */}
        <div className="relative aspect-[4/3] overflow-hidden">
          <Image
            src={image}
            alt={title}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, (max-width: 1024px) 33vw, (max-width: 1280px) 25vw, 20vw"
            className="object-cover group-hover:scale-105 transition-transform duration-300"
          />
          
          {/* Heart Icon Overlay */}
          <button
            onClick={handleLike}
            className="absolute top-3 right-3 p-2 bg-white/90 backdrop-blur-sm rounded-full hover:bg-white transition-colors shadow-sm z-10"
          >
            <Heart 
              className={cn(
                'h-4 w-4 transition-colors',
                isLiked ? 'fill-red-500 text-red-500' : 'text-gray-700 hover:text-red-500'
              )} 
            />
          </button>

          {/* Carousel Dots */}
          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5 z-10">
            <div className="h-1.5 w-1.5 rounded-full bg-white" />
            <div className="h-1.5 w-1.5 rounded-full bg-white/50" />
          </div>
        </div>

        {/* Content */}
        <div className="p-3 space-y-1.5">
          {/* Title */}
          <h3 className="font-semibold text-gray-900 text-sm line-clamp-1">
            {title}
          </h3>

          {/* Price and Rating */}
          <div className="flex items-center justify-between">
            <div className="flex items-baseline gap-1">
              <span className="text-base font-bold text-brand">৳{price.toLocaleString()}</span>
              <span className="text-xs text-gray-500">per night</span>
            </div>
            
            {/* Rating or New Badge */}
            {hasReviews ? (
              <div className="flex items-center gap-1">
                <Star className="h-3.5 w-3.5 fill-yellow-400 text-yellow-400" />
                <span className="text-xs font-semibold text-gray-900">{rating.toFixed(2)}</span>
              </div>
            ) : (
              <Badge variant="secondary" className="bg-gray-100 text-gray-700 text-xs font-medium px-2 py-0.5 hover:bg-gray-100">
                New
              </Badge>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
}
