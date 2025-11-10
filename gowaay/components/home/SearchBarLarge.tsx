'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Search } from 'lucide-react';
import { cn } from '@/lib/utils';
import { LocationCombobox } from '@/components/search/LocationCombobox';
import { DateRangePopover } from '@/components/search/DateRangePopover';
import { GuestsPopover } from '@/components/search/GuestsPopover';
import { usePixelEvents } from '@/hooks/usePixelEvents';

// Type assertions for tracking

interface SearchFormData {
  location: string;
  checkIn: Date | undefined;
  checkOut: Date | undefined;
  guests: {
    adults: number;
    children: number;
  };
}

interface SearchBarLargeProps {
  variant?: 'hero' | 'header';
}

export function SearchBarLarge({ variant = 'hero' }: SearchBarLargeProps) {
  const router = useRouter();
  const { fireSearch } = usePixelEvents();
  const [formData, setFormData] = useState<SearchFormData>({
    location: '',
    checkIn: undefined,
    checkOut: undefined,
    guests: {
      adults: 1,
      children: 0,
    },
  });

  const handleSearch = () => {
    // Fire search tracking events
    fireSearch(formData.location, {
      check_in: formData.checkIn?.toISOString(),
      check_out: formData.checkOut?.toISOString(),
      guests: formData.guests.adults + formData.guests.children,
    });

    // Build query parameters
    const params = new URLSearchParams();
    
    // Use 'q' for general search across title, location, description, address
    if (formData.location) {
      params.append('q', formData.location);
    }
    if (formData.checkIn) params.append('checkIn', formData.checkIn.toISOString().split('T')[0]);
    if (formData.checkOut) params.append('checkOut', formData.checkOut.toISOString().split('T')[0]);
    if (formData.guests.adults > 0) params.append('adults', formData.guests.adults.toString());
    if (formData.guests.children > 0) params.append('children', formData.guests.children.toString());

    router.push(`/search?${params.toString()}`);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  if (variant === 'header') {
    return (
      <div className="flex h-11 w-full items-center rounded-full border border-gray-200 bg-white/95 px-2 shadow-sm">
        {/* Location */}
        <div className="flex min-w-[160px] flex-1 items-center px-2.5">
          <LocationCombobox
            value={formData.location}
            onChange={(value) =>
              setFormData((prev) => ({ ...prev, location: value }))
            }
            placeholder="Where to?"
            className="w-full"
            size="compact"
          />
        </div>

        {/* Divider */}
        <div className="hidden h-7 w-px bg-gray-200 md:block" />

        {/* Date Range */}
        <div className="hidden min-w-[160px] flex-1 items-center px-2.5 md:flex">
          <DateRangePopover
            value={{ from: formData.checkIn, to: formData.checkOut }}
            onChange={(range) =>
              setFormData((prev) => ({
                ...prev,
                checkIn: range.from,
                checkOut: range.to,
              }))
            }
            placeholder="Check-in · Check-out"
            className="w-full"
            size="compact"
          />
        </div>

        {/* Divider */}
        <div className="hidden h-7 w-px bg-gray-200 md:block" />

        {/* Guests */}
        <div className="hidden min-w-[140px] flex-1 items-center px-2.5 md:flex">
          <GuestsPopover
            value={formData.guests}
            onChange={(guests) =>
              setFormData((prev) => ({ ...prev, guests }))
            }
            placeholder="Guests"
            className="w-full"
            size="compact"
          />
        </div>

        {/* Search Button */}
        <Button
          onClick={handleSearch}
          onKeyPress={handleKeyPress}
          className="ml-2 flex h-9 w-9 items-center justify-center rounded-full bg-brand text-white transition-colors hover:bg-brand/90"
        >
          <Search className="h-4 w-4" />
        </Button>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-md border border-gray-200 p-2">
      {/* Desktop Layout: | Location | Check in – Check out | Guests | Search Button | */}
      <div className="hidden md:grid md:grid-cols-4 gap-2">
        {/* Location */}
        <LocationCombobox
          value={formData.location}
          onChange={(value) => setFormData(prev => ({ ...prev, location: value }))}
          placeholder="Where are you going?"
        />

        {/* Date Range */}
        <DateRangePopover
          value={{ from: formData.checkIn, to: formData.checkOut }}
          onChange={(range) => setFormData(prev => ({ 
            ...prev, 
            checkIn: range.from, 
            checkOut: range.to 
          }))}
          placeholder="Check in – Check out"
        />

        {/* Guests */}
        <GuestsPopover
          value={formData.guests}
          onChange={(guests) => setFormData(prev => ({ ...prev, guests }))}
          placeholder="Guests"
        />

        {/* Search Button */}
        <Button
          onClick={handleSearch}
          onKeyPress={handleKeyPress}
          className="h-14 bg-brand hover:bg-brand/90 text-white font-semibold text-lg rounded-xl shadow-lg hover:shadow-xl transition-all duration-200"
        >
          <Search className="h-5 w-5 mr-2" />
          Search
        </Button>
      </div>

      {/* Mobile Layout: Stacked 3 rows */}
      <div className="md:hidden space-y-3">
        {/* Row 1: Location input */}
        <LocationCombobox
          value={formData.location}
          onChange={(value) => setFormData(prev => ({ ...prev, location: value }))}
          placeholder="Where are you going?"
          className="w-full"
        />

        {/* Row 2: [Dates] [Guests] side-by-side */}
        <div className="grid grid-cols-2 gap-2">
          <DateRangePopover
            value={{ from: formData.checkIn, to: formData.checkOut }}
            onChange={(range) => setFormData(prev => ({ 
              ...prev, 
              checkIn: range.from, 
              checkOut: range.to 
            }))}
            placeholder="Check in – Check out"
            className="w-full"
          />

          <GuestsPopover
            value={formData.guests}
            onChange={(guests) => setFormData(prev => ({ ...prev, guests }))}
            placeholder="Guests"
            className="w-full"
          />
        </div>

        {/* Row 3: Full-width brand Search Button */}
        <Button
          onClick={handleSearch}
          onKeyPress={handleKeyPress}
          className="w-full h-14 bg-brand hover:bg-brand/90 text-white font-semibold text-lg rounded-xl shadow-lg hover:shadow-xl transition-all duration-200"
        >
          <Search className="h-5 w-5 mr-2" />
          Search Rooms
        </Button>
      </div>

      {/* Quick Filters - Hidden on mobile to save space */}
      <div className="hidden md:block mt-4 flex flex-wrap gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setFormData(prev => ({ ...prev, location: 'Dhaka' }))}
          className="text-xs hover:bg-brand hover:text-white transition-colors"
        >
          Dhaka
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setFormData(prev => ({ ...prev, location: 'Chittagong' }))}
          className="text-xs hover:bg-brand hover:text-white transition-colors"
        >
          Chittagong
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setFormData(prev => ({ ...prev, location: 'Sylhet' }))}
          className="text-xs hover:bg-brand hover:text-white transition-colors"
        >
          Sylhet
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setFormData(prev => ({ ...prev, location: 'Cox\'s Bazar' }))}
          className="text-xs hover:bg-brand hover:text-white transition-colors"
        >
          Cox's Bazar
        </Button>
      </div>
    </div>
  );
}
