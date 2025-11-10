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
    <div className="container space-y-8 py-8 md:py-12">
      {/* 1. New Arrivals */}
      <SectionHeader 
        title="New Arrivals"
        viewAllHref="/search?sort=newest"
      />
      {loadingNewArrivals ? (
        <RoomRailSkeleton />
      ) : errorNewArrivals ? (
        <ErrorState message={errorNewArrivals} onRetry={refetchNewArrivals} />
      ) : (
        <RoomRail items={convertRooms(newArrivals)} />
      )}

      {/* 2. Bashundhara Apartment */}
      <SectionHeader 
        title="Bashundhara Apartment"
        viewAllHref="/search?location=Bashundhara"
      />
      {loadingBashundhara ? (
        <RoomRailSkeleton />
      ) : errorBashundhara ? (
        <ErrorState message={errorBashundhara} onRetry={refetchBashundhara} />
      ) : (
        <RoomRail items={convertRooms(bashundharaRooms)} />
      )}

      {/* 3. Uttara Apartment */}
      <SectionHeader 
        title="Uttara Apartment"
        viewAllHref="/search?location=Uttara"
      />
      {loadingUttara ? (
        <RoomRailSkeleton />
      ) : errorUttara ? (
        <ErrorState message={errorUttara} onRetry={refetchUttara} />
      ) : (
        <RoomRail items={convertRooms(uttaraRooms)} />
      )}

      {/* 4. Gulshan & Banani Apartment */}
      <SectionHeader 
        title="Gulshan & Banani Apartment"
        viewAllHref="/search?q=Gulshan Banani"
      />
      {loadingGulshanBanani ? (
        <RoomRailSkeleton />
      ) : errorGulshanBanani ? (
        <ErrorState message={errorGulshanBanani} onRetry={refetchGulshanBanani} />
      ) : (
        <RoomRail items={convertRooms(gulshanBananiRooms.slice(0, 6))} />
      )}

      {/* 5. All Over Dhaka */}
      <SectionHeader 
        title="All Over Dhaka"
        viewAllHref="/search?location=Dhaka"
      />
      {loadingDhaka ? (
        <RoomRailSkeleton />
      ) : errorDhaka ? (
        <ErrorState message={errorDhaka} onRetry={refetchDhaka} />
      ) : (
        <RoomRail items={convertRooms(dhakaRooms)} />
      )}

      {/* 6. All Over Bangladesh */}
      <SectionHeader 
        title="All Over Bangladesh"
        viewAllHref="/search"
      />
      {loadingBangladesh ? (
        <RoomRailSkeleton />
      ) : errorBangladesh ? (
        <ErrorState message={errorBangladesh} onRetry={refetchBangladesh} />
      ) : (
        <RoomRail items={convertRooms(bangladeshRooms)} />
      )}

      {/* Why Choose Section */}
      <WhyChoose />

      {/* Download App Section */}
      <DownloadApp />

      {/* Blog Section */}
      <BlogSection />
    </div>
  );
}
