'use client';

import { useState, useEffect, useRef } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { MapPin, Search, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { env } from '@/lib/env';

interface Location {
  id: string;
  name: string;
  country: string;
  type: 'city' | 'region' | 'landmark';
}

interface LocationComboboxProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  size?: 'default' | 'compact';
}

// API-based location data
const fetchLocations = async (query: string): Promise<Location[]> => {
  try {
    // API_BASE_URL already includes /api, so we just add /locations
    const apiUrl = `${env.API_BASE_URL}/locations?s=${encodeURIComponent(query)}`;
    console.log('Fetching locations from:', apiUrl);
    
    const response = await fetch(apiUrl);
    
    if (!response.ok) {
      console.error('Location fetch failed:', response.status, response.statusText);
      return [];
    }
    
    const data = await response.json();
    console.log('Locations fetched:', data);
    
    return data.map((item: any) => ({
      id: item.id,
      name: item.label,
      country: 'Bangladesh',
      type: 'city' as const,
    }));
  } catch (error) {
    console.error('Failed to fetch locations:', error);
    return [];
  }
};

export function LocationCombobox({ 
  value, 
  onChange, 
  placeholder = "Where are you going?",
  className,
  size = 'default'
}: LocationComboboxProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [filteredLocations, setFilteredLocations] = useState<Location[]>([]);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Filter locations based on input
  useEffect(() => {
    const loadLocations = async () => {
      setLoading(true);
      try {
        if (value.trim() === '') {
          // Show top 10 cities by default when field is empty or just opened
          const defaultLocations = await fetchLocations('');
          console.log('Default locations loaded:', defaultLocations);
          setFilteredLocations(defaultLocations.slice(0, 10));
        } else {
          // Filter locations as user types
          const filtered = await fetchLocations(value);
          console.log(`Filtered locations for "${value}":`, filtered);
          setFilteredLocations(filtered.slice(0, 10));
        }
        setSelectedIndex(-1);
      } catch (error) {
        console.error('Error loading locations:', error);
        setFilteredLocations([]);
      } finally {
        setLoading(false);
      }
    };
    
    // Only load when dropdown is open
    if (isOpen) {
      // Add debounce for typing
      const timeoutId = setTimeout(() => {
        loadLocations();
      }, 500);
      
      return () => clearTimeout(timeoutId);
    }
  }, [value, isOpen]);

  // Handle input change
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(e.target.value);
    setIsOpen(true);
  };

  // Handle location selection
  const handleLocationSelect = (location: Location) => {
    onChange(location.name);
    setIsOpen(false);
    inputRef.current?.blur();
  };

  // Handle keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen) {
      if (e.key === 'ArrowDown' || e.key === 'Enter') {
        setIsOpen(true);
        return;
      }
    }

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex(prev => 
          prev < filteredLocations.length - 1 ? prev + 1 : 0
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex(prev => 
          prev > 0 ? prev - 1 : filteredLocations.length - 1
        );
        break;
      case 'Enter':
        e.preventDefault();
        if (selectedIndex >= 0 && selectedIndex < filteredLocations.length) {
          handleLocationSelect(filteredLocations[selectedIndex]);
        }
        break;
      case 'Escape':
        setIsOpen(false);
        inputRef.current?.blur();
        break;
    }
  };

  // Handle input focus/click - open dropdown immediately
  const handleFocus = () => {
    setIsOpen(true);
  };

  const handleClick = () => {
    setIsOpen(true);
  };

  // Handle click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        inputRef.current &&
        !inputRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  // Scroll selected item into view
  useEffect(() => {
    if (selectedIndex >= 0 && listRef.current) {
      const selectedItem = listRef.current.children[selectedIndex] as HTMLElement;
      if (selectedItem) {
        selectedItem.scrollIntoView({ block: 'nearest' });
      }
    }
  }, [selectedIndex]);

  return (
    <div className={cn('relative', className)}>
      <div className="relative">
        {size !== 'compact' && (
          <MapPin
            className={cn(
              'absolute left-3 top-1/2 -translate-y-1/2 transform text-gray-400',
              'h-5 w-5'
            )}
          />
        )}
        <Input
          ref={inputRef}
          type="text"
          placeholder={placeholder}
          value={value}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          onFocus={handleFocus}
          onClick={handleClick}
          className={cn(
            'border-0 focus:ring-0 placeholder:text-gray-400 cursor-pointer bg-transparent',
            size === 'compact'
              ? 'h-auto p-0 text-sm text-gray-600 shadow-none'
              : 'h-14 pl-10 pr-10 text-base text-gray-700'
          )}
        />
        {value && size !== 'compact' && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onChange('')}
            className="absolute right-2 top-1/2 -translate-y-1/2 transform p-0 h-8 w-8 hover:bg-gray-100"
          >
            ×
          </Button>
        )}
      </div>

      {/* Dropdown */}
      {isOpen && (
        <div 
          ref={dropdownRef}
          className="absolute z-[100] w-full mt-1 bg-white border border-gray-200 rounded-xl shadow-lg max-h-80 overflow-hidden"
        >
          {loading ? (
            <div className="px-4 py-6 text-center text-gray-500">
              <Loader2 className="h-6 w-6 mx-auto mb-2 text-gray-400 animate-spin" />
              <p className="text-sm">Loading locations...</p>
            </div>
          ) : filteredLocations.length > 0 ? (
            <>
              <div className="px-4 py-3 border-b border-gray-100">
                <h3 className="text-sm font-semibold text-gray-600">Suggested destinations</h3>
              </div>
              <div ref={listRef} className="py-2 max-h-64 overflow-y-auto">
                {filteredLocations.map((location, index) => (
                  <button
                    key={location.id}
                    type="button"
                    onClick={() => handleLocationSelect(location)}
                    className={cn(
                      'w-full px-4 py-3 text-left hover:bg-gray-50 transition-colors',
                      selectedIndex === index && 'bg-gray-50',
                      'flex items-center space-x-3'
                    )}
                  >
                    <MapPin className="h-4 w-4 text-brand flex-shrink-0" />
                    <div className="flex-1">
                      <div className="font-medium text-gray-900">{location.name}</div>
                    </div>
                  </button>
                ))}
              </div>
            </>
          ) : (
            <div className="px-4 py-6 text-center text-gray-500">
              <Search className="h-8 w-8 mx-auto mb-2 text-gray-300" />
              <p className="font-medium">No locations found</p>
              <p className="text-sm mt-1">Try searching for a city or area in Bangladesh</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
