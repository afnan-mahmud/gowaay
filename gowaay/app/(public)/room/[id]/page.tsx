'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { ChatDrawer } from '@/components/chat/ChatDrawer';
import { api } from '@/lib/api';
import { Room } from '@/lib/store';
import { useAppStore } from '@/lib/store';
import { usePixelTracking } from '@/hooks/usePixelTracking';
import { useAuth } from '@/lib/auth-context';
import { env } from '@/lib/env';
import { 
  Star, 
  MapPin, 
  Users,
  MessageCircle,
  ChevronLeft,
  ChevronRight,
  Share2,
  Heart
} from 'lucide-react';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { DateRange as ReactDayPickerDateRange } from 'react-day-picker';
import { format, isBefore, startOfDay, differenceInDays } from 'date-fns';
import { Minus, Plus } from 'lucide-react';
import { toast } from 'sonner';

// Backend room response interface
interface BackendRoom {
  _id: string;
  title: string;
  description: string;
  address: string;
  locationName: string;
  locationMapUrl?: string;
  roomType: 'single' | 'double' | 'family' | 'suite' | 'other';
  amenities: string[];
  basePriceTk: number;
  commissionTk: number;
  totalPriceTk: number;
  maxGuests?: number;
  bedrooms?: number;
  beds?: number;
  baths?: number;
  images: Array<{
    url: string;
    w: number;
    h: number;
  }>;
  status: 'pending' | 'approved' | 'rejected';
  instantBooking: boolean;
  unavailableDates: string[];
  hostId: {
    _id: string;
    displayName: string;
    locationName: string;
    locationMapUrl?: string;
  };
  averageRating?: number;
  totalReviews?: number;
  createdAt: string;
  updatedAt: string;
}

// Helper function to resolve image URLs
const resolveImageSrc = (image: string) => {
  if (image.startsWith('http://') || image.startsWith('https://')) {
    return image;
  }
  const normalized = image.startsWith('/') ? image : `/${image}`;
  return `${env.IMG_BASE_URL}${normalized}`;
};

// Helper function to create Google Maps embed URL from any maps URL
const createMapEmbedUrl = (mapUrl: string): string => {
  if (!mapUrl) {
    return `https://www.google.com/maps/embed/v1/view?key=AIzaSyBFw0Qbyq9zTFTd-tUY6dZWTgaQzuU17R8&center=23.8103,90.4125&zoom=15`;
  }

  // Try to extract coordinates from the URL
  try {
    // Pattern 1: @lat,lng format
    const coordMatch = mapUrl.match(/@(-?\d+\.\d+),(-?\d+\.\d+)/);
    if (coordMatch) {
      return `https://www.google.com/maps/embed/v1/view?key=AIzaSyBFw0Qbyq9zTFTd-tUY6dZWTgaQzuU17R8&center=${coordMatch[1]},${coordMatch[2]}&zoom=15`;
    }

    // Pattern 2: /place/ format
    const placeMatch = mapUrl.match(/\/place\/[^/]+\/@(-?\d+\.\d+),(-?\d+\.\d+)/);
    if (placeMatch) {
      return `https://www.google.com/maps/embed/v1/view?key=AIzaSyBFw0Qbyq9zTFTd-tUY6dZWTgaQzuU17R8&center=${placeMatch[1]},${placeMatch[2]}&zoom=15`;
    }

    // Pattern 3: Query parameters (?ll=lat,lng)
    const llMatch = mapUrl.match(/[?&]ll=(-?\d+\.\d+),(-?\d+\.\d+)/);
    if (llMatch) {
      return `https://www.google.com/maps/embed/v1/view?key=AIzaSyBFw0Qbyq9zTFTd-tUY6dZWTgaQzuU17R8&center=${llMatch[1]},${llMatch[2]}&zoom=15`;
    }

    // If it's a shortened URL (goo.gl) or we can't extract coordinates,
    // try using the URL directly as a place search
    if (mapUrl.includes('goo.gl') || mapUrl.includes('maps.app.goo.gl')) {
      // For shortened URLs, we need to open them in a new window since embed doesn't support them
      // As a fallback, use a clickable link approach
      console.warn('Shortened URL detected, using place mode as fallback:', mapUrl);
      return `https://www.google.com/maps/embed/v1/place?key=AIzaSyBFw0Qbyq9zTFTd-tUY6dZWTgaQzuU17R8&q=${encodeURIComponent(mapUrl)}&zoom=15`;
    }

    // Last resort: try to use it as a place query
    return `https://www.google.com/maps/embed/v1/place?key=AIzaSyBFw0Qbyq9zTFTd-tUY6dZWTgaQzuU17R8&q=${encodeURIComponent(mapUrl)}&zoom=15`;
  } catch (error) {
    console.error('Error creating map embed URL:', error);
    // Default to Dhaka
    return `https://www.google.com/maps/embed/v1/view?key=AIzaSyBFw0Qbyq9zTFTd-tUY6dZWTgaQzuU17R8&center=23.8103,90.4125&zoom=15`;
  }
};

export default function RoomDetails() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const roomId = params.id as string;
  const { trackRoomView } = usePixelTracking();
  const { isAuthenticated } = useAuth();
  
  const [room, setRoom] = useState<Room | null>(null);
  const [backendRoom, setBackendRoom] = useState<BackendRoom | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [showAllPhotos, setShowAllPhotos] = useState(false);
  const [isMobile, setIsMobile] = useState<boolean | null>(null);
  
  const { selectedDates, setSelectedDates } = useAppStore();
  const [guests, setGuests] = useState({
    adults: 1,
    children: 0,
  });

  const [checkIn, setCheckIn] = useState<Date | undefined>(undefined);
  const [checkOut, setCheckOut] = useState<Date | undefined>(undefined);

  // Parse dates from URL parameters on mount
  useEffect(() => {
    const checkInParam = searchParams.get('checkIn');
    const checkOutParam = searchParams.get('checkOut');
    
    if (checkInParam) {
      const checkInDate = new Date(checkInParam);
      if (!isNaN(checkInDate.getTime())) {
        setCheckIn(checkInDate);
      }
    }
    
    if (checkOutParam) {
      const checkOutDate = new Date(checkOutParam);
      if (!isNaN(checkOutDate.getTime())) {
        setCheckOut(checkOutDate);
      }
    }
  }, [searchParams]);

  // Detect mobile view - only on client side
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    loadRoom();
  }, [roomId]);

  const loadRoom = async () => {
    try {
      setLoading(true);
      const response = await api.rooms.get<BackendRoom>(roomId);
      if (response.success && response.data) {
        const backendRoom = response.data as BackendRoom;
        setBackendRoom(backendRoom);
        
        // Map backend data to frontend Room structure
        const roomData: Room = {
          id: backendRoom._id,
          name: backendRoom.title,
          description: backendRoom.description,
          price: backendRoom.totalPriceTk,
          originalPrice: backendRoom.basePriceTk,
          images: backendRoom.images.map(img => img.url),
          category: backendRoom.locationName,
          subcategory: backendRoom.roomType,
          stock: 1,
          ratings: {
            average: backendRoom.averageRating || 0,
            count: backendRoom.totalReviews || 0,
          },
          sellerId: backendRoom.hostId._id,
          hostId: backendRoom.hostId._id,
          instantBooking: backendRoom.instantBooking,
          isActive: backendRoom.status === 'approved',
          isFeatured: false,
          amenities: backendRoom.amenities,
          createdAt: backendRoom.createdAt,
          updatedAt: backendRoom.updatedAt,
        };
        
        setRoom(roomData);
        trackRoomView(roomData.id, roomData.price);
      } else {
        console.error('Room not found or API error:', response);
        setRoom(null);
      }
    } catch (error) {
      console.error('Failed to load room:', error);
      setRoom(null);
    } finally {
      setLoading(false);
    }
  };

  const handleBooking = async () => {
    if (!checkIn || !checkOut) {
      toast.error('Please select check-in and check-out dates');
      return;
    }
    
    if (!room) return;

    // Check if user is authenticated using auth context
    if (!isAuthenticated) {
      // Store booking details in session storage for after login
      const bookingDetails = {
        roomId: room.id,
        checkIn: checkIn.toISOString(),
        checkOut: checkOut.toISOString(),
        adults: guests.adults,
        children: guests.children,
        returnUrl: window.location.pathname + window.location.search
      };
      sessionStorage.setItem('pendingBooking', JSON.stringify(bookingDetails));
      
      // Redirect to login with return URL
      router.push(`/login?redirect=${encodeURIComponent(window.location.pathname + window.location.search)}`);
      return;
    }

    // Redirect to booking details page
    const bookingParams = new URLSearchParams({
      roomId: room.id,
      checkIn: checkIn.toISOString().split('T')[0],
      checkOut: checkOut.toISOString().split('T')[0],
      adults: guests.adults.toString(),
      children: guests.children.toString(),
    });
    
    router.push(`/booking/details?${bookingParams.toString()}`);
  };

  const nextImage = () => {
    if (room) {
      setCurrentImageIndex((prev) => (prev + 1) % room.images.length);
    }
  };

  const prevImage = () => {
    if (room) {
      setCurrentImageIndex((prev) => (prev - 1 + room.images.length) % room.images.length);
    }
  };

  const calculateNights = () => {
    if (checkIn && checkOut) {
      return differenceInDays(checkOut, checkIn);
    }
    return 0;
  };

  const calculateTotal = () => {
    const nights = calculateNights();
    return nights > 0 && room ? room.price * nights : 0;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white">
        <div className="animate-pulse max-w-7xl mx-auto px-4 md:px-8 py-6">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div className="h-96 bg-gray-200 rounded"></div>
            <div className="h-96 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!room || !backendRoom) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Room not found</h1>
          <Button onClick={() => router.push('/')}>Go Home</Button>
        </div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-white">
      {/* Mobile Image Carousel - Only on Mobile - Full width from top */}
      <div className="md:hidden relative">
        <div className="relative aspect-[4/3]">
          <Image
            src={resolveImageSrc(room.images[currentImageIndex])}
            alt={room.name}
            fill
            sizes="100vw"
            className="object-cover"
            priority
            unoptimized
          />
          
          {/* Overlay Header with Back and Share buttons */}
          <div className="absolute top-0 left-0 right-0 z-10">
            <div className="flex items-center justify-between px-4 py-3">
              <button 
                onClick={() => router.back()} 
                className="p-2 bg-white/90 backdrop-blur-sm rounded-full shadow-lg hover:bg-white transition"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
              <div className="flex items-center gap-2">
                <button className="p-2 bg-white/90 backdrop-blur-sm rounded-full shadow-lg hover:bg-white transition">
                  <Share2 className="h-5 w-5" />
                </button>
                <button className="p-2 bg-white/90 backdrop-blur-sm rounded-full shadow-lg hover:bg-white transition">
                  <Heart className="h-5 w-5" />
                </button>
              </div>
            </div>
          </div>
          
          {/* Image Navigation */}
          {room.images.length > 1 && (
            <>
              <button
                onClick={prevImage}
                className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/90 rounded-full p-2 shadow-lg"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
              <button
                onClick={nextImage}
                className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/90 rounded-full p-2 shadow-lg"
              >
                <ChevronRight className="h-5 w-5" />
              </button>
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/60 text-white text-sm px-3 py-1 rounded-full">
                {currentImageIndex + 1} / {room.images.length}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Desktop Image Grid - Only on Desktop */}
      <div className="hidden md:block max-w-7xl mx-auto px-8 py-6">
        <div className="grid grid-cols-4 gap-2 rounded-xl overflow-hidden" style={{ height: '500px' }}>
          {/* Main Large Image */}
          <div className="col-span-2 row-span-2 relative cursor-pointer" onClick={() => setShowAllPhotos(true)}>
            <Image
              src={resolveImageSrc(room.images[0])}
              alt={room.name}
              fill
              sizes="50vw"
              className="object-cover hover:brightness-95 transition"
              priority
              unoptimized
            />
        </div>

          {/* Four Smaller Images */}
          {room.images.slice(1, 5).map((image, index) => (
            <div 
              key={index} 
              className="relative cursor-pointer"
              onClick={() => setShowAllPhotos(true)}
            >
              <Image
                src={resolveImageSrc(image)}
                alt={`${room.name} ${index + 2}`}
                fill
                sizes="25vw"
                className="object-cover hover:brightness-95 transition"
                unoptimized
              />
              {index === 3 && room.images.length > 5 && (
                <div className="absolute inset-0 bg-black/50 flex items-center justify-center text-white font-semibold">
                  + {room.images.length - 5} more
                </div>
              )}
            </div>
          ))}
        </div>

        <button
          onClick={() => setShowAllPhotos(true)}
          className="mt-4 flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
        >
          Show all photos
        </button>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 md:px-8 pb-24 md:pb-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 md:gap-12">
          {/* Left Column - Room Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Title and Info */}
            <div className="space-y-2">
              <div className="flex items-start justify-between">
                <h1 className="text-2xl md:text-3xl font-bold text-gray-900">{room.name}</h1>
                <div className="hidden md:flex items-center gap-2">
                  <button className="p-2 hover:bg-gray-100 rounded-full transition">
                    <Share2 className="h-5 w-5" />
                  </button>
                  <button className="p-2 hover:bg-gray-100 rounded-full transition">
                    <Heart className="h-5 w-5" />
                  </button>
                </div>
              </div>
              
              <div className="flex items-center gap-4 text-sm">
                <div className="flex items-center gap-1">
                  <MapPin className="h-4 w-4 text-gray-600" />
                  <span className="text-gray-600">{backendRoom.locationName}</span>
                </div>
                {backendRoom.maxGuests && (
                  <div className="flex items-center gap-1">
                    <Users className="h-4 w-4 text-gray-600" />
                    <span className="text-gray-600">{backendRoom.maxGuests} guests</span>
                  </div>
                )}
                {backendRoom.bedrooms && (
                  <span className="text-gray-600">{backendRoom.bedrooms} Bedroom{backendRoom.bedrooms > 1 ? 's' : ''}</span>
                )}
                {backendRoom.beds && (
                  <span className="text-gray-600">{backendRoom.beds} Bed{backendRoom.beds > 1 ? 's' : ''}</span>
                )}
                {backendRoom.baths && (
                  <span className="text-gray-600">{backendRoom.baths} Bath{backendRoom.baths > 1 ? 's' : ''}</span>
                )}
              </div>

              <div className="flex items-center gap-3">
                {room.ratings.count > 0 ? (
                  <div className="flex items-center gap-1">
                <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                    <span className="font-semibold">{room.ratings.average.toFixed(1)}</span>
                    <span className="text-gray-600">({room.ratings.count} reviews)</span>
                  </div>
                ) : (
                  <span className="inline-flex items-center px-3 py-1 rounded-full bg-yellow-100 text-yellow-800 text-sm font-medium">
                    ⭐ New
                  </span>
                )}
                
                {room.instantBooking && (
                  <span className="inline-flex items-center px-3 py-1 rounded-full bg-brand/10 text-brand text-sm font-medium">
                    Instant Book
                  </span>
                )}
              </div>
            </div>

            <hr className="border-gray-200" />

            {/* About This Home */}
            <div className="space-y-3">
              <h2 className="text-xl font-bold text-gray-900">About This Home</h2>
              <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">{room.description}</p>
            </div>

            {/* Facilities & Features */}
            {room.amenities && room.amenities.length > 0 && (
              <div className="space-y-3">
                <h2 className="text-xl font-bold text-gray-900">Facilities & Features</h2>
                <div className="grid grid-cols-2 gap-3">
                  {room.amenities.map((amenity, index) => (
                    <div key={index} className="flex items-center gap-2 text-gray-700">
                      <div className="w-1.5 h-1.5 rounded-full bg-gray-400"></div>
                      <span>{amenity}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Select date range - Calendar */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-xl md:text-2xl font-bold text-gray-900">📅 Select Your Dates</h2>
                {(checkIn || checkOut) && (
                  <button 
                    onClick={() => {
                      setCheckIn(undefined);
                      setCheckOut(undefined);
                    }}
                    className="text-sm font-medium text-brand hover:text-brand/80 underline transition"
                  >
                    Clear dates
                  </button>
                )}
              </div>

              {/* Selected Date Display */}
              {checkIn && checkOut && (
                <div className="bg-brand/5 border-2 border-brand/20 rounded-xl p-4">
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex-1">
                      <div className="text-xs font-medium text-gray-600 mb-1">Check-in</div>
                      <div className="text-lg font-bold text-gray-900">
                        {format(checkIn, 'MMM dd, yyyy')}
                      </div>
                      <div className="text-sm text-gray-600">{format(checkIn, 'EEEE')}</div>
                    </div>
                    <div className="flex flex-col items-center justify-center px-4">
                      <ChevronRight className="h-5 w-5 text-brand" />
                      <div className="text-xs font-semibold text-brand mt-1">
                        {calculateNights()} night{calculateNights() > 1 ? 's' : ''}
                      </div>
                    </div>
                    <div className="flex-1">
                      <div className="text-xs font-medium text-gray-600 mb-1">Check-out</div>
                      <div className="text-lg font-bold text-gray-900">
                        {format(checkOut, 'MMM dd, yyyy')}
                      </div>
                      <div className="text-sm text-gray-600">{format(checkOut, 'EEEE')}</div>
                    </div>
                  </div>
                </div>
              )}

              {/* Calendar Card */}
              <div className="border-2 border-gray-200 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                <div className="bg-gradient-to-r from-brand/10 to-pink-50 px-6 py-4 border-b-2 border-gray-100">
                  <p className="text-sm font-semibold text-gray-700">
                    {!checkIn && !checkOut && 'Select your check-in and check-out dates'}
                    {checkIn && !checkOut && 'Now select your check-out date'}
                    {checkIn && checkOut && 'Perfect! Your dates are selected'}
                  </p>
                  {backendRoom.unavailableDates && backendRoom.unavailableDates.length > 0 && (
                    <p className="text-xs text-gray-600 mt-1">
                      <span className="inline-block w-3 h-3 bg-red-100 border border-red-400 rounded mr-1"></span>
                      Crossed out dates are unavailable
                    </p>
                  )}
                </div>
                
                <div className="p-6">
                  {isMobile !== null && (
                    <Calendar
                      mode="range"
                      selected={{ from: checkIn, to: checkOut }}
                      onSelect={(range: ReactDayPickerDateRange | undefined) => {
                        if (range) {
                          setCheckIn(range.from);
                          setCheckOut(range.to);
                        } else {
                          setCheckIn(undefined);
                          setCheckOut(undefined);
                        }
                      }}
                      disabled={(date) => {
                        // Disable past dates
                        if (isBefore(date, startOfDay(new Date()))) return true;
                        
                        // Disable unavailable dates from backend
                        if (backendRoom.unavailableDates && backendRoom.unavailableDates.length > 0) {
                          const dateStr = format(date, 'yyyy-MM-dd');
                          return backendRoom.unavailableDates.includes(dateStr);
                        }
                        
                        return false;
                      }}
                      numberOfMonths={isMobile ? 1 : 2}
                      className="w-full"
                      classNames={{
                        months: "flex flex-col sm:flex-row space-y-4 sm:space-x-4 sm:space-y-0",
                        month: "space-y-4",
                        caption: "flex justify-center pt-1 relative items-center",
                        caption_label: "text-base font-bold text-gray-900",
                        nav: "space-x-1 flex items-center",
                        nav_button: "h-8 w-8 bg-transparent hover:bg-gray-100 p-0 opacity-50 hover:opacity-100 rounded-md transition-all",
                        nav_button_previous: "absolute left-1",
                        nav_button_next: "absolute right-1",
                        table: "w-full border-collapse space-y-1",
                        head_row: "flex",
                        head_cell: "text-gray-600 rounded-md w-9 font-medium text-sm",
                        row: "flex w-full mt-2",
                        cell: "h-10 w-10 text-center text-sm p-0 relative [&:has([aria-selected].day-range-end)]:rounded-r-md [&:has([aria-selected].day-outside)]:bg-gray-100/50 [&:has([aria-selected])]:bg-brand/10 first:[&:has([aria-selected])]:rounded-l-md last:[&:has([aria-selected])]:rounded-r-md focus-within:relative focus-within:z-20",
                        day: "h-10 w-10 p-0 font-normal rounded-md hover:bg-brand/20 aria-selected:opacity-100 transition-colors",
                        day_range_start: "day-range-start bg-brand text-white hover:bg-brand hover:text-white focus:bg-brand focus:text-white",
                        day_range_end: "day-range-end bg-brand text-white hover:bg-brand hover:text-white focus:bg-brand focus:text-white",
                        day_selected: "bg-brand text-white hover:bg-brand hover:text-white focus:bg-brand focus:text-white",
                        day_today: "bg-gray-100 text-gray-900 font-bold",
                        day_outside: "day-outside text-gray-400 opacity-50 aria-selected:bg-gray-100/50 aria-selected:text-gray-500",
                        day_disabled: "text-gray-300 line-through opacity-50 cursor-not-allowed hover:bg-transparent",
                        day_range_middle: "aria-selected:bg-brand/20 aria-selected:text-gray-900",
                        day_hidden: "invisible",
                      }}
                      modifiers={{
                        unavailable: (date) => {
                          if (backendRoom.unavailableDates && backendRoom.unavailableDates.length > 0) {
                            const dateStr = format(date, 'yyyy-MM-dd');
                            return backendRoom.unavailableDates.includes(dateStr);
                          }
                          return false;
                        }
                      }}
                      modifiersClassNames={{
                        unavailable: "bg-red-50 text-red-600 line-through hover:bg-red-50"
                      }}
                    />
                  )}
                </div>
              </div>

              {/* Quick Date Selection Shortcuts */}
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => {
                    const today = new Date();
                    const tomorrow = new Date(today);
                    tomorrow.setDate(tomorrow.getDate() + 1);
                    setCheckIn(today);
                    setCheckOut(tomorrow);
                  }}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border-2 border-gray-200 rounded-full hover:border-brand hover:text-brand hover:bg-brand/5 transition-all"
                >
                  Tonight
                </button>
                <button
                  onClick={() => {
                    const today = new Date();
                    const nextWeek = new Date(today);
                    nextWeek.setDate(nextWeek.getDate() + 7);
                    setCheckIn(today);
                    setCheckOut(nextWeek);
                  }}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border-2 border-gray-200 rounded-full hover:border-brand hover:text-brand hover:bg-brand/5 transition-all"
                >
                  1 Week
                </button>
                <button
                  onClick={() => {
                    const today = new Date();
                    const nextMonth = new Date(today);
                    nextMonth.setDate(nextMonth.getDate() + 30);
                    setCheckIn(today);
                    setCheckOut(nextMonth);
                  }}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border-2 border-gray-200 rounded-full hover:border-brand hover:text-brand hover:bg-brand/5 transition-all"
                >
                  1 Month
                </button>
              </div>
            </div>

          {/* Host Info */}
            <div className="border border-gray-200 rounded-xl p-6 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-full bg-brand flex items-center justify-center text-white text-xl font-bold">
                    {backendRoom.hostId.displayName?.charAt(0)?.toUpperCase() || 'H'}
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900">Hello, I am {backendRoom.hostId.displayName}</h3>
                    <div className="flex items-center gap-1 text-sm text-green-600">
                      <div className="w-2 h-2 rounded-full bg-green-600"></div>
                      <span>Identity verified</span>
                    </div>
                  </div>
                </div>
                <Button 
                  variant="outline" 
                  onClick={() => setIsChatOpen(true)}
                  className="border-brand text-brand hover:bg-brand/5"
                >
                  <MessageCircle className="h-4 w-4 mr-2" />
                  Contact Host
                </Button>
              </div>
              
              <div className="text-sm text-gray-600 space-y-1">
                <p>🗣️ Languages: Bangla, English</p>
              </div>
            </div>

            {/* Things to know */}
            <div className="space-y-3">
              <h2 className="text-xl font-bold text-gray-900">Things to know ↓</h2>
              <div className="space-y-4">
          <div>
                  <h3 className="font-semibold text-gray-900 mb-2">Cancellation Policy</h3>
                  <ul className="space-y-1 text-sm text-gray-700">
                    <li>- 80% of the total booking amount will be refunded if it's canceled 24hours before the check-in date.</li>
                    <li>- No amount will be refunded for bookings within 24 hours of check-in.</li>
                    <li>- Refund processing time: 2-3 working days</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Map */}
            <div className="space-y-3">
              <h2 className="text-xl font-bold text-gray-900">Map</h2>
              {(backendRoom?.locationMapUrl || backendRoom?.hostId?.locationMapUrl) ? (
                (() => {
                  const mapUrl = backendRoom.locationMapUrl || backendRoom.hostId?.locationMapUrl || '';
                  
                  return (
                    <div className="w-full h-96 rounded-xl overflow-hidden border border-gray-200 relative">
                      <iframe
                        src={createMapEmbedUrl(mapUrl)}
                        width="100%"
                        height="100%"
                        style={{ border: 0 }}
                        allowFullScreen
                        loading="lazy"
                        referrerPolicy="no-referrer-when-downgrade"
                        title="Property Location Map"
                      />
                      {/* Circle overlay to indicate approximate area */}
                      <div 
                        className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 pointer-events-none"
                        style={{
                          width: '120px',
                          height: '120px',
                          borderRadius: '50%',
                          backgroundColor: 'rgba(239, 68, 68, 0.25)',
                          border: '3px solid rgba(239, 68, 68, 0.6)',
                          boxShadow: '0 0 20px rgba(239, 68, 68, 0.3)'
                        }}
                      />
                    </div>
                  );
                })()
              ) : (
                <div className="w-full h-64 bg-gray-200 rounded-xl flex items-center justify-center text-gray-500">
                  <div className="text-center">
                    <MapPin className="h-8 w-8 mx-auto mb-2" />
                    <p>Map not available</p>
                  </div>
                </div>
              )}
          </div>

            {/* Review */}
            <div className="space-y-3">
              <h2 className="text-xl font-bold text-gray-900">Review</h2>
              {room.ratings.count > 0 ? (
                <div className="flex items-center gap-2">
                  <Star className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                  <span className="font-semibold">{room.ratings.average.toFixed(1)}</span>
                  <span className="text-gray-600">({room.ratings.count} reviews)</span>
                </div>
              ) : (
                <div className="flex items-center gap-2 text-gray-600">
                  <span className="text-2xl">⭐</span>
                  <span>New</span>
                </div>
              )}
            </div>
          </div>

          {/* Right Column - Booking Card (Desktop Only) */}
          <div className="hidden lg:block">
            <div className="sticky top-24 border border-gray-300 rounded-xl shadow-lg p-6 space-y-4">
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-bold text-gray-900">BDT {room.price.toLocaleString()}</span>
                <span className="text-gray-600">/day</span>
              </div>

              {/* Date Selection */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-bold text-gray-900">Select Dates</label>
                  {(checkIn || checkOut) && (
                    <button 
                      onClick={() => {
                        setCheckIn(undefined);
                        setCheckOut(undefined);
                      }}
                      className="text-xs font-medium text-brand hover:text-brand/80 underline transition"
                    >
                      Clear
                    </button>
                  )}
                </div>
                
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className="w-full justify-start text-left font-normal border-2 border-gray-300 hover:border-brand/50 h-12 transition-all"
                    >
                      {checkIn && checkOut ? (
                        <div className="flex flex-col items-start">
                          <span className="text-xs text-gray-500">Check-in → Check-out</span>
                          <span className="text-sm font-semibold text-gray-900">
                            {format(checkIn, 'MMM dd')} - {format(checkOut, 'MMM dd, yyyy')}
                          </span>
                        </div>
                      ) : (
                        <div className="flex flex-col items-start">
                          <span className="text-xs text-gray-500">Select dates</span>
                          <span className="text-sm text-gray-400">Check-in → Check-out</span>
                        </div>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start" side="bottom">
                    <div className="bg-gradient-to-r from-brand/10 to-pink-50 px-4 py-3 border-b">
                      <p className="text-xs font-semibold text-gray-700">
                        {!checkIn && !checkOut && 'Select check-in and check-out'}
                        {checkIn && !checkOut && 'Now select check-out date'}
                        {checkIn && checkOut && `${calculateNights()} night${calculateNights() > 1 ? 's' : ''} selected`}
                      </p>
                    </div>
                    <Calendar
                      mode="range"
                      selected={{ from: checkIn, to: checkOut }}
                      onSelect={(range: ReactDayPickerDateRange | undefined) => {
                        if (range) {
                          setCheckIn(range.from);
                          setCheckOut(range.to);
                        } else {
                          setCheckIn(undefined);
                          setCheckOut(undefined);
                        }
                      }}
                      disabled={(date) => {
                        if (isBefore(date, startOfDay(new Date()))) return true;
                        if (backendRoom.unavailableDates && backendRoom.unavailableDates.length > 0) {
                          const dateStr = format(date, 'yyyy-MM-dd');
                          return backendRoom.unavailableDates.includes(dateStr);
                        }
                        return false;
                      }}
                      numberOfMonths={2}
                      className="rounded-md p-4"
                      classNames={{
                        months: "flex flex-col sm:flex-row space-y-4 sm:space-x-4 sm:space-y-0",
                        month: "space-y-4",
                        caption: "flex justify-center pt-1 relative items-center",
                        caption_label: "text-sm font-bold text-gray-900",
                        nav: "space-x-1 flex items-center",
                        nav_button: "h-7 w-7 bg-transparent hover:bg-gray-100 p-0 opacity-50 hover:opacity-100 rounded-md transition-all",
                        nav_button_previous: "absolute left-1",
                        nav_button_next: "absolute right-1",
                        table: "w-full border-collapse space-y-1",
                        head_row: "flex",
                        head_cell: "text-gray-600 rounded-md w-9 font-medium text-xs",
                        row: "flex w-full mt-2",
                        cell: "h-9 w-9 text-center text-sm p-0 relative [&:has([aria-selected].day-range-end)]:rounded-r-md [&:has([aria-selected].day-outside)]:bg-gray-100/50 [&:has([aria-selected])]:bg-brand/10 first:[&:has([aria-selected])]:rounded-l-md last:[&:has([aria-selected])]:rounded-r-md focus-within:relative focus-within:z-20",
                        day: "h-9 w-9 p-0 font-normal text-sm rounded-md hover:bg-brand/20 aria-selected:opacity-100 transition-colors",
                        day_range_start: "day-range-start bg-brand text-white hover:bg-brand hover:text-white focus:bg-brand focus:text-white",
                        day_range_end: "day-range-end bg-brand text-white hover:bg-brand hover:text-white focus:bg-brand focus:text-white",
                        day_selected: "bg-brand text-white hover:bg-brand hover:text-white focus:bg-brand focus:text-white",
                        day_today: "bg-gray-100 text-gray-900 font-bold",
                        day_outside: "day-outside text-gray-400 opacity-50 aria-selected:bg-gray-100/50 aria-selected:text-gray-500",
                        day_disabled: "text-gray-300 line-through opacity-50 cursor-not-allowed hover:bg-transparent",
                        day_range_middle: "aria-selected:bg-brand/20 aria-selected:text-gray-900",
                        day_hidden: "invisible",
                      }}
                      modifiers={{
                        unavailable: (date) => {
                          if (backendRoom.unavailableDates && backendRoom.unavailableDates.length > 0) {
                            const dateStr = format(date, 'yyyy-MM-dd');
                            return backendRoom.unavailableDates.includes(dateStr);
                          }
                          return false;
                        }
                      }}
                      modifiersClassNames={{
                        unavailable: "bg-red-50 text-red-600 line-through hover:bg-red-50"
                      }}
                    />
                  </PopoverContent>
                </Popover>
              </div>

              {/* Guests Selection */}
              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-900 block">Guests</label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className="w-full justify-start text-left font-normal border-gray-300"
                    >
                      <span className="text-sm">{guests.adults + guests.children} guest{guests.adults + guests.children !== 1 ? 's' : ''}</span>
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-80 p-4" align="start">
                    <div className="space-y-4">
                      {/* Adults */}
                      <div className="flex items-center justify-between">
              <div>
                          <div className="font-medium text-gray-900">Adults</div>
                          <div className="text-sm text-gray-500">Ages 13 or above</div>
                        </div>
                        <div className="flex items-center space-x-3">
                  <Button
                    variant="outline"
                    size="icon"
                            onClick={() => setGuests((prev) => ({
                              ...prev,
                              adults: Math.max(1, prev.adults - 1)
                            }))}
                            disabled={guests.adults <= 1}
                            className="h-8 w-8 rounded-full"
                          >
                            <Minus className="h-4 w-4" />
                  </Button>
                          <span className="w-8 text-center font-medium">{guests.adults}</span>
                  <Button
                    variant="outline"
                    size="icon"
                            onClick={() => setGuests((prev) => ({
                              ...prev,
                              adults: Math.min(16, prev.adults + 1)
                            }))}
                            disabled={guests.adults >= 16}
                            className="h-8 w-8 rounded-full"
                          >
                            <Plus className="h-4 w-4" />
                  </Button>
                </div>
              </div>

                      {/* Children */}
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="font-medium text-gray-900">Children</div>
                          <div className="text-sm text-gray-500">Ages 2-12</div>
                        </div>
                        <div className="flex items-center space-x-3">
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() => setGuests((prev) => ({
                              ...prev,
                              children: Math.max(0, prev.children - 1)
                            }))}
                            disabled={guests.children <= 0}
                            className="h-8 w-8 rounded-full"
                          >
                            <Minus className="h-4 w-4" />
                          </Button>
                          <span className="w-8 text-center font-medium">{guests.children}</span>
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() => setGuests((prev) => ({
                              ...prev,
                              children: Math.min(10, prev.children + 1)
                            }))}
                            disabled={guests.children >= 10}
                            className="h-8 w-8 rounded-full"
                          >
                            <Plus className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </PopoverContent>
                </Popover>
              </div>

              {/* Price Breakdown */}
              {calculateNights() > 0 && (
                <div className="pt-4 border-t border-gray-200 space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">৳{room.price.toLocaleString()} x {calculateNights()} night{calculateNights() > 1 ? 's' : ''}</span>
                    <span className="text-gray-900">৳{calculateTotal().toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between font-semibold text-base pt-2 border-t border-gray-200">
                    <span>Total</span>
                    <span>৳{calculateTotal().toLocaleString()}</span>
                  </div>
                </div>
              )}

              <Button 
                onClick={handleBooking}
                className="w-full bg-brand hover:bg-brand/90 text-white font-semibold py-6 text-base"
              >
                BOOK NOW
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Sticky Booking Bar */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 shadow-lg z-40">
        <div className="flex items-center justify-between gap-4">
          <div>
            <div className="flex items-baseline gap-2">
              <span className="text-xl font-bold">BDT {room.price.toLocaleString()}</span>
              <span className="text-sm text-gray-600">/day</span>
            </div>
            {calculateNights() > 0 && (
              <p className="text-xs text-gray-500">{calculateNights()} night{calculateNights() > 1 ? 's' : ''}: ৳{calculateTotal().toLocaleString()}</p>
            )}
          </div>
          <Button
            onClick={handleBooking}
            className="bg-brand hover:bg-brand/90 text-white px-8 py-6"
          >
            Reserve
          </Button>
        </div>
      </div>

      {/* All Photos Modal */}
      {showAllPhotos && (
        <div className="fixed inset-0 bg-white z-50 overflow-y-auto">
          <div className="sticky top-0 bg-white border-b border-gray-200 px-8 py-4 flex items-center justify-between">
            <h2 className="text-xl font-semibold">All Photos</h2>
            <button
              onClick={() => setShowAllPhotos(false)}
              className="p-2 hover:bg-gray-100 rounded-full"
            >
              <ChevronLeft className="h-6 w-6" />
            </button>
          </div>
          <div className="max-w-5xl mx-auto px-8 py-8 grid grid-cols-1 gap-4">
            {room.images.map((image, index) => (
              <div key={index} className="relative aspect-video">
                <Image
                  src={resolveImageSrc(image)}
                  alt={`${room.name} ${index + 1}`}
                  fill
                  sizes="100vw"
                  className="object-cover rounded-lg"
                  unoptimized
                />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Chat Drawer */}
      {room && (
        <ChatDrawer
          roomId={room.id}
          hostId={room.hostId || 'unknown'}
          isOpen={isChatOpen}
          onClose={() => setIsChatOpen(false)}
        />
      )}
    </div>
  );
}
