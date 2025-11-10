'use client';

import { useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { Star, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface SearchRoomCardProps {
  room: {
    _id: string;
    title: string;
    locationName: string;
    basePriceTk: number;
    totalPriceTk: number;
    images: { url: string; w: number; h: number }[];
    averageRating?: number;
    totalReviews?: number;
    instantBooking?: boolean;
  };
}

export function SearchRoomCard({ room }: SearchRoomCardProps) {
  const searchParams = useSearchParams();
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const images = room.images.length > 0 ? room.images : [{ url: '/placeholder-room.jpg', w: 400, h: 300 }];

  const nextImage = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setCurrentImageIndex((prev) => (prev + 1) % images.length);
  };

  const prevImage = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  const hasReviews = room.totalReviews && room.totalReviews > 0;

  // Build room URL with date parameters if they exist
  const getRoomUrl = () => {
    const checkIn = searchParams.get('checkIn');
    const checkOut = searchParams.get('checkOut');
    const adults = searchParams.get('adults');
    const children = searchParams.get('children');
    
    const params = new URLSearchParams();
    if (checkIn) params.append('checkIn', checkIn);
    if (checkOut) params.append('checkOut', checkOut);
    if (adults) params.append('adults', adults);
    if (children) params.append('children', children);
    
    const queryString = params.toString();
    return `/room/${room._id}${queryString ? `?${queryString}` : ''}`;
  };

  return (
    <Link href={getRoomUrl()} className="group block">
      <div className="bg-white rounded-xl overflow-hidden hover:shadow-lg transition-all duration-300">
        {/* Image Carousel */}
        <div className="relative aspect-[4/3] overflow-hidden">
          <Image
            src={images[currentImageIndex].url}
            alt={room.title}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 25vw"
            className="object-cover"
          />
          
          {/* Instant Book Badges */}
          {room.instantBooking && (
            <div className="absolute top-3 right-3 flex gap-2">
              <div className="bg-green-600 text-white text-xs font-semibold px-3 py-1 rounded-full">
                ✓100% Safe
              </div>
              <div className="bg-brand text-white text-xs font-semibold px-3 py-1 rounded-full">
                Instant Book
              </div>
            </div>
          )}

          {/* Navigation Arrows */}
          {images.length > 1 && (
            <>
              <button
                onClick={prevImage}
                className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white rounded-full p-1.5 shadow-md opacity-0 group-hover:opacity-100 transition-opacity"
                aria-label="Previous image"
              >
                <ChevronLeft className="h-4 w-4 text-gray-800" />
              </button>
              <button
                onClick={nextImage}
                className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white rounded-full p-1.5 shadow-md opacity-0 group-hover:opacity-100 transition-opacity"
                aria-label="Next image"
              >
                <ChevronRight className="h-4 w-4 text-gray-800" />
              </button>

              {/* Dots Indicator */}
              <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1">
                {images.map((_, index) => (
                  <div
                    key={index}
                    className={`h-1.5 rounded-full transition-all ${
                      index === currentImageIndex 
                        ? 'w-6 bg-white' 
                        : 'w-1.5 bg-white/60'
                    }`}
                  />
                ))}
              </div>
            </>
          )}
        </div>

        {/* Content */}
        <div className="p-3">
          {/* Title */}
          <h3 className="font-semibold text-base line-clamp-2 mb-2">
            {room.title}
          </h3>

          {/* Price and Rating */}
          <div className="flex items-center justify-between">
            <div>
              <p className="text-brand font-bold text-lg">
                ৳{room.totalPriceTk.toLocaleString()}
                <span className="text-xs text-gray-600 font-normal">per night</span>
              </p>
            </div>

            {/* Rating or New Badge */}
            {hasReviews ? (
              <div className="flex items-center gap-1">
                <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                <span className="font-semibold text-sm">
                  {room.averageRating?.toFixed(1) || '0.0'}
                </span>
              </div>
            ) : (
              <div className="bg-yellow-400 text-white text-xs font-semibold px-2 py-1 rounded">
                New
              </div>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
}

