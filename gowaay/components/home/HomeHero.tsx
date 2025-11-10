'use client';

import { SearchBarLarge } from '@/components/home/SearchBarLarge';
import { SectionHeader } from '@/components/home/SectionHeader';
import { RoomRail } from '@/components/home/RoomRail';
import { WhyChoose } from '@/components/home/WhyChoose';
import { DownloadApp } from '@/components/home/DownloadApp';
import { BlogSection } from '@/components/home/BlogSection';
import { PolicyLinks } from '@/components/home/PolicyLinks';
import { usePixelEvents } from '@/hooks/usePixelEvents';
import { useEffect } from 'react';

// Mock data for room sections
const mockRooms = {
  bangladeshGateways: [
    {
      id: '1',
      title: 'Luxury Apartment in Gulshan',
      location: 'Gulshan, Dhaka',
      price: 8000,
      image: '/images/rooms/gulshan-luxury.jpg',
      rating: 4.8,
      reviews: 124,
    },
    {
      id: '2',
      title: 'Modern Studio in Dhanmondi',
      location: 'Dhanmondi, Dhaka',
      price: 5500,
      image: '/images/rooms/dhanmondi-studio.jpg',
      rating: 4.6,
      reviews: 89,
    },
    {
      id: '3',
      title: 'Cozy Home in Uttara',
      location: 'Uttara, Dhaka',
      price: 4500,
      image: '/images/rooms/uttara-cozy.jpg',
      rating: 4.7,
      reviews: 156,
    },
  ],
  signatureApartments: [
    {
      id: '4',
      title: 'Penthouse with City View',
      location: 'Banani, Dhaka',
      price: 12000,
      image: '/images/rooms/banani-penthouse.jpg',
      rating: 4.9,
      reviews: 67,
    },
    {
      id: '5',
      title: 'Executive Suite',
      location: 'Gulshan, Dhaka',
      price: 9500,
      image: '/images/rooms/gulshan-executive.jpg',
      rating: 4.8,
      reviews: 92,
    },
    {
      id: '6',
      title: 'Luxury Condo',
      location: 'Baridhara, Dhaka',
      price: 11000,
      image: '/images/rooms/baridhara-condo.jpg',
      rating: 4.7,
      reviews: 78,
    },
  ],
  dhakaHomes: [
    {
      id: '7',
      title: 'Traditional House in Old Dhaka',
      location: 'Old Dhaka',
      price: 3500,
      image: '/images/rooms/old-dhaka-traditional.jpg',
      rating: 4.5,
      reviews: 203,
    },
    {
      id: '8',
      title: 'Family House in Mirpur',
      location: 'Mirpur, Dhaka',
      price: 4200,
      image: '/images/rooms/mirpur-family.jpg',
      rating: 4.6,
      reviews: 145,
    },
    {
      id: '9',
      title: 'Modern Villa in Bashundhara',
      location: 'Bashundhara, Dhaka',
      price: 6800,
      image: '/images/rooms/bashundhara-villa.jpg',
      rating: 4.8,
      reviews: 112,
    },
  ],
  chittagongComfort: [
    {
      id: '10',
      title: 'Seaside Apartment',
      location: 'Patenga, Chittagong',
      price: 6000,
      image: '/images/rooms/patenga-seaside.jpg',
      rating: 4.7,
      reviews: 89,
    },
    {
      id: '11',
      title: 'Hill Station Retreat',
      location: 'Chittagong Hill Tracts',
      price: 4500,
      image: '/images/rooms/hill-station.jpg',
      rating: 4.6,
      reviews: 134,
    },
    {
      id: '12',
      title: 'City Center Apartment',
      location: 'Chittagong City',
      price: 3800,
      image: '/images/rooms/chittagong-city.jpg',
      rating: 4.5,
      reviews: 167,
    },
  ],
  studioApartments: [
    {
      id: '13',
      title: 'Compact Studio in Motijheel',
      location: 'Motijheel, Dhaka',
      price: 2800,
      image: '/images/rooms/motijheel-studio.jpg',
      rating: 4.4,
      reviews: 98,
    },
    {
      id: '14',
      title: 'Modern Studio in Tejgaon',
      location: 'Tejgaon, Dhaka',
      price: 3200,
      image: '/images/rooms/tejgaon-studio.jpg',
      rating: 4.5,
      reviews: 76,
    },
    {
      id: '15',
      title: 'Cozy Studio in Wari',
      location: 'Wari, Dhaka',
      price: 2500,
      image: '/images/rooms/wari-studio.jpg',
      rating: 4.3,
      reviews: 123,
    },
  ],
  smallGatherings: [
    {
      id: '16',
      title: 'Party House in Gulshan',
      location: 'Gulshan, Dhaka',
      price: 15000,
      image: '/images/rooms/gulshan-party.jpg',
      rating: 4.8,
      reviews: 45,
    },
    {
      id: '17',
      title: 'Event Space in Dhanmondi',
      location: 'Dhanmondi, Dhaka',
      price: 12000,
      image: '/images/rooms/dhanmondi-event.jpg',
      rating: 4.7,
      reviews: 67,
    },
    {
      id: '18',
      title: 'Garden Villa for Events',
      location: 'Uttara, Dhaka',
      price: 18000,
      image: '/images/rooms/uttara-garden.jpg',
      rating: 4.9,
      reviews: 34,
    },
  ],
};

export function HomeHero() {
  const { firePageView } = usePixelEvents();

  useEffect(() => {
    firePageView();
  }, [firePageView]);

  return (
    <>
      {/* Hero Section - Desktop Only */}
      <section className="relative hidden md:block min-h-[60vh] flex items-center justify-center overflow-hidden">
        {/* Background Gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-brand to-red-800">
          {/* Background Pattern */}
          <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg%20width%3D%2260%22%20height%3D%2260%22%20viewBox%3D%220%200%2060%2060%22%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%3E%3Cg%20fill%3D%22none%22%20fill-rule%3D%22evenodd%22%3E%3Cg%20fill%3D%22%23ffffff%22%20fill-opacity%3D%220.05%22%3E%3Ccircle%20cx%3D%2230%22%20cy%3D%2230%22%20r%3D%222%22/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')] opacity-20"></div>
        </div>

        {/* Content */}
        <div className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            {/* Desktop: Headline + Background Only */}
            <div className="hidden md:block">
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6">
                Find Your{' '}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-200">
                  Perfect Stay
                </span>
              </h1>
              
              <p className="text-lg md:text-xl text-white/90 mb-8 max-w-2xl mx-auto">
                Discover amazing rooms and experiences across Bangladesh. 
                Book your next adventure with trusted hosts.
              </p>

              {/* Scroll Indicator */}
              <div className="mt-16 animate-bounce">
                <div className="w-6 h-10 border-2 border-white rounded-full flex justify-center">
                  <div className="w-1 h-3 bg-white rounded-full mt-2"></div>
                </div>
              </div>
            </div>

          </div>
        </div>

        {/* Decorative Elements */}
        <div className="absolute top-20 left-10 w-20 h-20 bg-white/10 rounded-full blur-xl"></div>
        <div className="absolute bottom-20 right-10 w-32 h-32 bg-white/10 rounded-full blur-xl"></div>
        <div className="absolute top-1/2 left-1/4 w-16 h-16 bg-white/5 rounded-full blur-lg"></div>
      </section>

      {/* Featured Rooms Sections */}
      <div className="container space-y-14 py-8 md:py-12">
        {/* Bangladesh Gateways */}
        <SectionHeader 
          title="Bangladesh Gateways" 
          subtitle="Discover the best accommodations across Bangladesh"
          viewAllHref="/search?location=bangladesh"
        />
        <RoomRail items={mockRooms.bangladeshGateways} />

        {/* Signature Apartments */}
        <SectionHeader 
          title="Signature Apartments" 
          subtitle="Premium accommodations with exceptional amenities"
          viewAllHref="/search?type=signature"
        />
        <RoomRail items={mockRooms.signatureApartments} />

        {/* Dhaka Homes */}
        <SectionHeader 
          title="Dhaka Homes" 
          subtitle="Experience the capital city like a local"
          viewAllHref="/search?location=dhaka"
        />
        <RoomRail items={mockRooms.dhakaHomes} />

        {/* Chittagong Comfort Homes */}
        <SectionHeader 
          title="Chittagong Comfort Homes" 
          subtitle="Relax in the port city's finest accommodations"
          viewAllHref="/search?location=chittagong"
        />
        <RoomRail items={mockRooms.chittagongComfort} />

        {/* Studio Apartments */}
        <SectionHeader 
          title="Studio Apartments" 
          subtitle="Perfect for solo travelers and short stays"
          viewAllHref="/search?type=studio"
        />
        <RoomRail items={mockRooms.studioApartments} />

        {/* Small Gatherings */}
        <SectionHeader 
          title="Small Gatherings" 
          subtitle="Spaces perfect for events and group stays"
          viewAllHref="/search?type=event"
        />
        <RoomRail items={mockRooms.smallGatherings} />

        {/* Why Choose Section */}
        <WhyChoose />

        {/* Download App Section */}
        <DownloadApp />

        {/* Blog Section */}
        <BlogSection />

        {/* Policy Links */}
        <div className="py-10 md:py-16 bg-gray-50 -mx-4 md:-mx-6 px-4 md:px-6">
          <PolicyLinks />
        </div>
      </div>
    </>
  );
}