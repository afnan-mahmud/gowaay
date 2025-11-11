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
        'relative bg-white rounded-2xl overflow-hidden shadow-md hover:shadow-2xl transition-all duration-300 border border-gray-100 group-hover:border-brand/20',
        className
      )}>
        {/* Image Container */}
        <div className="relative aspect-[4/3] overflow-hidden bg-gray-100">
          <Image
            src={image}
            alt={title}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, (max-width: 1024px) 33vw, (max-width: 1280px) 25vw, 20vw"
            className="object-cover group-hover:scale-110 transition-transform duration-500"
          />
          
          {/* Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          
          {/* Heart Icon Overlay */}
          <button
            onClick={handleLike}
            className="absolute top-3 right-3 p-2.5 bg-white/95 backdrop-blur-md rounded-full hover:bg-white hover:scale-110 transition-all shadow-lg z-10"
          >
            <Heart 
              className={cn(
                'h-4 w-4 transition-all duration-200',
                isLiked ? 'fill-red-500 text-red-500 scale-110' : 'text-gray-700 hover:text-red-500'
              )} 
            />
          </button>

          {/* Carousel Dots */}
          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5 z-10">
            <div className="h-1.5 w-1.5 rounded-full bg-white shadow-sm" />
            <div className="h-1.5 w-1.5 rounded-full bg-white/60" />
          </div>
        </div>

        {/* Content */}
        <div className="p-4 space-y-2">
          {/* Title */}
          <h3 className="font-bold text-gray-900 text-base line-clamp-1 group-hover:text-brand transition-colors">
            {title}
          </h3>

          {/* Location */}
          <p className="text-sm text-gray-500 line-clamp-1">
            {location}
          </p>

          {/* Price and Rating */}
          <div className="flex items-center justify-between pt-1">
            <div className="flex items-baseline gap-1">
              <span className="text-lg font-bold text-brand">৳{price.toLocaleString()}</span>
              <span className="text-xs text-gray-500 font-medium">/night</span>
            </div>
            
            {/* Rating or New Badge */}
            {hasReviews ? (
              <div className="flex items-center gap-1 bg-yellow-50 px-2 py-1 rounded-full">
                <Star className="h-3.5 w-3.5 fill-yellow-400 text-yellow-400" />
                <span className="text-xs font-bold text-gray-900">{rating.toFixed(1)}</span>
              </div>
            ) : (
              <Badge variant="secondary" className="bg-brand/10 text-brand text-xs font-semibold px-2.5 py-1 hover:bg-brand/20 border border-brand/20">
                New
              </Badge>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
}
