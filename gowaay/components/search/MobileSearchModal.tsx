'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import * as Dialog from '@radix-ui/react-dialog';
import { X, Search, MapPin, Calendar, Users } from 'lucide-react';
import { LocationCombobox } from './LocationCombobox';
import { DateRangePopover } from './DateRangePopover';
import { GuestsPopover } from './GuestsPopover';
import { usePixelEvents } from '@/hooks/usePixelEvents';

interface MobileSearchModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface SearchFormData {
  location: string;
  checkIn: Date | undefined;
  checkOut: Date | undefined;
  guests: {
    adults: number;
    children: number;
  };
}

export function MobileSearchModal({ open, onOpenChange }: MobileSearchModalProps) {
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
    if (formData.location) params.append('q', formData.location);
    if (formData.checkIn) params.append('checkIn', formData.checkIn.toISOString().split('T')[0]);
    if (formData.checkOut) params.append('checkOut', formData.checkOut.toISOString().split('T')[0]);
    if (formData.guests.adults > 0) params.append('adults', formData.guests.adults.toString());
    if (formData.guests.children > 0) params.append('children', formData.guests.children.toString());

    // Close modal and navigate
    onOpenChange(false);
    router.push(`/search?${params.toString()}`);
  };

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/30 z-50" />
        <Dialog.Content className="fixed inset-0 bg-white overflow-y-auto animate-slideUp z-50">
          <div className="p-5 space-y-4">
            {/* Header */}
            <div className="flex justify-between items-center pb-4 border-b border-gray-100 shadow-sm">
              <Dialog.Title className="text-lg font-semibold">Stays</Dialog.Title>
              <button 
                onClick={() => onOpenChange(false)}
                className="p-1 hover:bg-gray-100 rounded-full transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Inputs */}
            <div className="space-y-3">
              {/* Location */}
              <div className="border rounded-xl px-4 py-3 flex items-center gap-3 focus-within:bg-gray-100 transition-colors">
                <MapPin className="h-5 w-5 text-gray-400" />
                <div className="flex-1">
                  <LocationCombobox
                    value={formData.location}
                    onChange={(value) => setFormData(prev => ({ ...prev, location: value }))}
                    placeholder="Where are you going?"
                    className="border-0 shadow-none focus:ring-0 p-0 focus:bg-gray-100 rounded-xl"
                  />
                </div>
              </div>

              {/* Date Range */}
              <div className="border rounded-xl px-4 py-3 flex items-center gap-3 focus-within:bg-gray-100 transition-colors">
                <Calendar className="h-5 w-5 text-gray-400" />
                <div className="flex-1">
                  <DateRangePopover
                    value={{ from: formData.checkIn, to: formData.checkOut }}
                    onChange={(range) => setFormData(prev => ({ 
                      ...prev, 
                      checkIn: range.from, 
                      checkOut: range.to 
                    }))}
                    placeholder="Check in – Check out"
                    className="border-0 shadow-none focus:ring-0 p-0 focus:bg-gray-100 rounded-xl"
                  />
                </div>
              </div>

              {/* Guests */}
              <div className="border rounded-xl px-4 py-3 flex items-center gap-3 focus-within:bg-gray-100 transition-colors">
                <Users className="h-5 w-5 text-gray-400" />
                <div className="flex-1">
                  <GuestsPopover
                    value={formData.guests}
                    onChange={(guests) => setFormData(prev => ({ ...prev, guests }))}
                    placeholder="Guests"
                    className="border-0 shadow-none focus:ring-0 p-0 focus:bg-gray-100 rounded-xl"
                  />
                </div>
              </div>
            </div>

            {/* Search Button */}
            <button
              onClick={handleSearch}
              className="w-full h-12 rounded-lg bg-brand text-white font-medium flex items-center justify-center gap-2 hover:brightness-90 transition-all duration-200"
            >
              <Search className="h-5 w-5" />
              Search
            </button>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
