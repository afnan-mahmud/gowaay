'use client';

import { SectionHeader } from '@/components/home/SectionHeader';
import { RoomRail } from '@/components/home/RoomRail';
import { WhyChoose } from '@/components/home/WhyChoose';
import { DownloadApp } from '@/components/home/DownloadApp';
import { BlogSection } from '@/components/home/BlogSection';
import { PolicyLinks } from '@/components/home/PolicyLinks';
import { useRooms, Room } from '@/lib/hooks/useRooms';
import { Skeleton } from '@/components/ui/skeleton';

function RoomRailSkeleton() {
  return (
    <div className="flex gap-4 overflow-x-auto pb-4">
      {Array.from({ length: 3 }).map((_, i) => (
        <div key={i} className="flex-shrink-0 w-72">
          <Skeleton className="w-full h-48 rounded-xl mb-3" />
          <Skeleton className="h-4 w-3/4 mb-2" />
          <Skeleton className="h-3 w-1/2 mb-2" />
          <Skeleton className="h-4 w-1/3" />
        </div>
      ))}
    </div>
  );
}

function ErrorState({ message, onRetry }: { message: string; onRetry: () => void }) {
  return (
    <div className="text-center py-8">
      <p className="text-gray-600 mb-4">{message}</p>
      <button
        onClick={onRetry}
        className="px-4 py-2 bg-brand text-white rounded-lg hover:bg-brand/90 transition-colors"
      >
        Try Again
      </button>
    </div>
  );
}

export default function HomePageContent() {
  // Fetch different categories of rooms
  
  // 1. New Arrivals - Newly approved rooms
  const { rooms: newArrivals, loading: loadingNewArrivals, error: errorNewArrivals, refetch: refetchNewArrivals } = useRooms({
    limit: 6,
    status: 'approved',
    sortBy: 'newest'
  });

  // 2. Bashundhara Apartment
  const { rooms: bashundharaRooms, loading: loadingBashundhara, error: errorBashundhara, refetch: refetchBashundhara } = useRooms({
    limit: 6,
    status: 'approved',
    location: 'Bashundhara'
  });

  // 3. Uttara Apartment
  const { rooms: uttaraRooms, loading: loadingUttara, error: errorUttara, refetch: refetchUttara } = useRooms({
    limit: 6,
    status: 'approved',
    location: 'Uttara'
  });

  // 4. Gulshan & Banani Apartment (we'll filter this client-side or use search)
  const { rooms: gulshanBananiRooms, loading: loadingGulshanBanani, error: errorGulshanBanani, refetch: refetchGulshanBanani } = useRooms({
    limit: 12,
    status: 'approved',
    search: 'Gulshan Banani'
  });

  // 5. All Over Dhaka
  const { rooms: dhakaRooms, loading: loadingDhaka, error: errorDhaka, refetch: refetchDhaka } = useRooms({
    limit: 6,
    status: 'approved',
    location: 'Dhaka'
  });

  // 6. All Over Bangladesh
  const { rooms: bangladeshRooms, loading: loadingBangladesh, error: errorBangladesh, refetch: refetchBangladesh } = useRooms({
    limit: 6,
    status: 'approved'
  });

  // Convert API rooms to the format expected by RoomRail
  const convertRooms = (rooms: Room[]) => {
    return rooms.map(room => ({
      id: room._id,
      title: room.title,
      location: room.locationName,
      price: room.totalPriceTk,
      image: room.images[0]?.url || '/images/placeholder-room.jpg',
      rating: (room as any).averageRating || 0,
      reviews: (room as any).totalReviews || 0,
    }));
  };

  return (
    <div className="min-h-screen">
      {/* Hero Section with Gradient */}
      <div className="relative bg-gradient-to-br from-brand/10 via-pink-50 to-purple-50 py-12 md:py-20 overflow-hidden">
        {/* Decorative Background Elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-24 -right-24 w-96 h-96 bg-brand/5 rounded-full blur-3xl"></div>
          <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-purple-200/20 rounded-full blur-3xl"></div>
        </div>

        <div className="container relative z-10">
          <div className="max-w-4xl mx-auto text-center space-y-6 md:space-y-8">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/80 backdrop-blur-sm rounded-full shadow-sm">
              <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
              <span className="text-sm font-medium text-gray-700">1000+ Happy Guests</span>
            </div>

            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 leading-tight">
              Find Your Perfect
              <span className="text-brand block md:inline md:ml-3">Stay in Bangladesh</span>
            </h1>

            <p className="text-lg md:text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
              Discover amazing rooms and apartments at unbeatable prices. Book your next adventure with confidence.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-4">
              <a 
                href="/search" 
                className="px-8 py-4 bg-brand hover:bg-brand/90 text-white font-semibold rounded-full shadow-lg hover:shadow-xl transition-all transform hover:scale-105"
              >
                Explore Rooms
              </a>
              <a 
                href="/join-host" 
                className="px-8 py-4 bg-white hover:bg-gray-50 text-gray-900 font-semibold rounded-full shadow-md hover:shadow-lg transition-all border-2 border-gray-200"
              >
                Become a Host
              </a>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-3 gap-6 max-w-2xl mx-auto pt-8">
              <div className="text-center">
                <div className="text-2xl md:text-3xl font-bold text-brand">500+</div>
                <div className="text-sm text-gray-600">Rooms Available</div>
              </div>
              <div className="text-center">
                <div className="text-2xl md:text-3xl font-bold text-brand">50+</div>
                <div className="text-sm text-gray-600">Verified Hosts</div>
              </div>
              <div className="text-center">
                <div className="text-2xl md:text-3xl font-bold text-brand">4.8★</div>
                <div className="text-sm text-gray-600">Average Rating</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container space-y-12 md:space-y-16 py-12 md:py-16">
        {/* 1. New Arrivals */}
        <section>
          <SectionHeader 
            title="✨ New Arrivals"
            viewAllHref="/search?sort=newest"
          />
          {loadingNewArrivals ? (
            <RoomRailSkeleton />
          ) : errorNewArrivals ? (
            <ErrorState message={errorNewArrivals} onRetry={refetchNewArrivals} />
          ) : (
            <RoomRail items={convertRooms(newArrivals)} />
          )}
        </section>

        {/* 2. Bashundhara Apartment */}
        <section>
          <SectionHeader 
            title="🏙️ Bashundhara Apartment"
            viewAllHref="/search?location=Bashundhara"
          />
          {loadingBashundhara ? (
            <RoomRailSkeleton />
          ) : errorBashundhara ? (
            <ErrorState message={errorBashundhara} onRetry={refetchBashundhara} />
          ) : (
            <RoomRail items={convertRooms(bashundharaRooms)} />
          )}
        </section>

        {/* 3. Uttara Apartment */}
        <section>
          <SectionHeader 
            title="🌆 Uttara Apartment"
            viewAllHref="/search?location=Uttara"
          />
          {loadingUttara ? (
            <RoomRailSkeleton />
          ) : errorUttara ? (
            <ErrorState message={errorUttara} onRetry={refetchUttara} />
          ) : (
            <RoomRail items={convertRooms(uttaraRooms)} />
          )}
        </section>

        {/* Featured Banner - Promotional Section */}
        <div className="my-12 md:my-16 relative rounded-3xl overflow-hidden bg-gradient-to-r from-brand via-pink-500 to-purple-500 p-8 md:p-12 shadow-xl">
          <div className="relative z-10 max-w-3xl">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              🎉 Special Offer for New Users!
            </h2>
            <p className="text-lg text-white/90 mb-6">
              Get 10% off on your first booking. Use code <span className="font-bold bg-white/20 px-3 py-1 rounded-full">GOWAAY10</span>
            </p>
            <a 
              href="/search" 
              className="inline-block px-8 py-3 bg-white text-brand font-semibold rounded-full hover:bg-gray-100 transition-colors shadow-lg"
            >
              Book Now
            </a>
          </div>
          <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-white/5 backdrop-blur-sm hidden md:block"></div>
        </div>

        {/* 4. Gulshan & Banani Apartment */}
        <section>
          <SectionHeader 
            title="🏢 Gulshan & Banani Apartment"
            viewAllHref="/search?q=Gulshan Banani"
          />
          {loadingGulshanBanani ? (
            <RoomRailSkeleton />
          ) : errorGulshanBanani ? (
            <ErrorState message={errorGulshanBanani} onRetry={refetchGulshanBanani} />
          ) : (
            <RoomRail items={convertRooms(gulshanBananiRooms.slice(0, 6))} />
          )}
        </section>

        {/* 5. All Over Dhaka */}
        <section>
          <SectionHeader 
            title="🌃 All Over Dhaka"
            viewAllHref="/search?location=Dhaka"
          />
          {loadingDhaka ? (
            <RoomRailSkeleton />
          ) : errorDhaka ? (
            <ErrorState message={errorDhaka} onRetry={refetchDhaka} />
          ) : (
            <RoomRail items={convertRooms(dhakaRooms)} />
          )}
        </section>

        {/* 6. All Over Bangladesh */}
        <section>
          <SectionHeader 
            title="🗺️ All Over Bangladesh"
            viewAllHref="/search"
          />
          {loadingBangladesh ? (
            <RoomRailSkeleton />
          ) : errorBangladesh ? (
            <ErrorState message={errorBangladesh} onRetry={refetchBangladesh} />
          ) : (
            <RoomRail items={convertRooms(bangladeshRooms)} />
          )}
        </section>
      </div>

      {/* Why Choose Section */}
      <WhyChoose />

      {/* Download App Section */}
      <DownloadApp />

      {/* Blog Section */}
      <div className="container pb-12 md:pb-16">
        <BlogSection />
      </div>
    </div>
  );
}
