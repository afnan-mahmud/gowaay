'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Star, MapPin } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Room } from '@/lib/store';
import { env } from '@/lib/env';

// Helper function to resolve image URLs (supports both relative and absolute URLs)
const resolveImageSrc = (image: string) => {
  if (image.startsWith('http://') || image.startsWith('https://')) return image;
  const normalized = image.startsWith('/') ? image : `/${image}`;
  return `${env.IMG_BASE_URL}${normalized}`;
};

interface RoomCardProps {
  room: Room;
}

export function RoomCard({ room }: RoomCardProps) {
  const imageUrl = room.images[0] 
    ? resolveImageSrc(room.images[0])
    : '/placeholder-room.jpg';

  return (
    <Link href={`/room/${room.id}`}>
      <Card className="overflow-hidden hover:shadow-lg transition-shadow">
        <div className="relative h-48">
          <Image
            src={imageUrl}
            alt={room.name}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
          {room.isFeatured && (
            <div className="absolute top-2 left-2 bg-primary text-white px-2 py-1 rounded text-xs font-semibold">
              Featured
            </div>
          )}
        </div>
        
        <CardContent className="p-4">
          <div className="space-y-2">
            <h3 className="font-semibold text-lg line-clamp-1">{room.name}</h3>
            
            <div className="flex items-center space-x-1 text-sm text-gray-600">
              <MapPin className="h-4 w-4" />
              <span className="line-clamp-1">{room.category}</span>
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-1">
                <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                <span className="text-sm font-medium">
                  {room.ratings.average.toFixed(1)}
                </span>
                <span className="text-sm text-gray-500">
                  ({room.ratings.count})
                </span>
              </div>
              
              <div className="text-right">
                <div className="font-bold text-lg text-primary">
                  ৳{room.price.toLocaleString()}
                </div>
                {room.originalPrice && room.originalPrice > room.price && (
                  <div className="text-sm text-gray-500 line-through">
                    ৳{room.originalPrice.toLocaleString()}
                  </div>
                )}
                <div className="text-xs text-gray-500">per night</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
