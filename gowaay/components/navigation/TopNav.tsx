'use client';

import Link from 'next/link';
import { UserMenu } from './UserMenu';
import { useAuth } from '@/lib/auth-context';
import { Menu, Home } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Search, User as UserIcon } from 'lucide-react';
import { usePixelEvents } from '@/hooks/usePixelEvents';
import { LocationCombobox } from '@/components/search/LocationCombobox';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { DateRange as ReactDayPickerDateRange } from 'react-day-picker';
import { format, isBefore, startOfDay } from 'date-fns';
import { Minus, Plus } from 'lucide-react';
import { Logo } from '@/components/ui/Logo';

export function TopNav() {
  const { isAuthenticated, user } = useAuth();
  const router = useRouter();
  const { fireSearch } = usePixelEvents();
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  
  const [formData, setFormData] = useState({
    location: '',
    checkIn: undefined as Date | undefined,
    checkOut: undefined as Date | undefined,
    guests: {
      adults: 1,
      children: 0,
    },
  });

  // Set mounted state to avoid hydration mismatch
  useEffect(() => {
    setIsMounted(true);
    
    const handleScroll = () => {
      const scrollPosition = window.scrollY;
      setIsScrolled(scrollPosition > 50);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleLocationSelect = (location: string) => {
    setFormData((prev) => ({ ...prev, location }));
    // Open date picker after location is selected
    setTimeout(() => setIsDatePickerOpen(true), 100);
  };

  const handleSearch = () => {
    fireSearch(formData.location, {
      check_in: formData.checkIn?.toISOString(),
      check_out: formData.checkOut?.toISOString(),
      guests: formData.guests.adults + formData.guests.children,
    });

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

  // Only render dynamic content after mount to prevent hydration mismatch
  const showCompactMode = isMounted && isScrolled;

  return (
    <header className={`hidden md:block sticky top-0 z-50 border-b border-gray-200 bg-white shadow-sm no-flicker ${showCompactMode ? 'py-2' : ''}`} style={{ transition: 'padding 0.3s ease' }}>
      <div className="mx-auto w-full max-w-[1400px] px-8">
        {/* Single Row Layout When Scrolled */}
        {showCompactMode ? (
          <div className="flex h-16 items-center justify-between gap-4">
        {/* Logo */}
        <Link
          href="/"
              className="flex flex-shrink-0 items-center transition-opacity hover:opacity-80"
        >
              <Logo size={80} textClassName="text-xl font-bold" />
        </Link>

            {/* Compact Search Bar */}
            <div className="flex h-12 flex-1 max-w-[700px] items-center rounded-full border border-gray-300 bg-white shadow-md hover:shadow-lg transition-shadow">
              {/* Where */}
              <div className="flex min-w-[160px] flex-1 relative px-4 py-2">
                <div className="flex flex-col w-full">
                  <label className="text-xs font-semibold text-gray-900 mb-0.5">Where</label>
                  <LocationCombobox
                    value={formData.location}
                    onChange={handleLocationSelect}
                    placeholder="Search"
                    size="compact"
                    className="w-full text-sm"
                  />
                </div>
              </div>

              <div className="h-6 w-px bg-gray-300" />

              {/* Dates */}
              <Popover open={isDatePickerOpen} onOpenChange={setIsDatePickerOpen}>
                <PopoverTrigger asChild>
                  <div className="flex min-w-[140px] flex-1 cursor-pointer px-4 py-2">
                    <div className="flex flex-col">
                      <label className="text-xs font-semibold text-gray-900">Date</label>
                      <div className="text-xs text-gray-600">
                        {formData.checkIn && formData.checkOut
                          ? `${format(formData.checkIn, 'MMM dd')} - ${format(formData.checkOut, 'MMM dd')}`
                          : 'Add dates'}
                      </div>
                    </div>
                  </div>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="center">
                  <div className="flex flex-col">
                    <Calendar
                      mode="range"
                      selected={{ from: formData.checkIn, to: formData.checkOut }}
                      onSelect={(range: ReactDayPickerDateRange | undefined) => {
                        if (range) {
                          setFormData((prev) => ({
                            ...prev,
                            checkIn: range.from,
                            checkOut: range.to,
                          }));
                        }
                      }}
                      disabled={(date) => isBefore(date, startOfDay(new Date()))}
                      numberOfMonths={2}
                      className="rounded-md"
                    />
                    <div className="border-t border-gray-200 p-4 flex justify-end">
                      <Button
                        onClick={() => setIsDatePickerOpen(false)}
                        className="bg-brand hover:bg-brand/90 text-white px-8"
                      >
                        OK
                      </Button>
                    </div>
                  </div>
                </PopoverContent>
              </Popover>

              <div className="h-6 w-px bg-gray-300" />

              {/* Guests */}
              <Popover>
                <PopoverTrigger asChild>
                  <div className="flex min-w-[100px] flex-1 flex-col justify-center px-4 py-2 cursor-pointer">
                    <label className="text-xs font-semibold text-gray-900">Guests</label>
                    <div className="text-xs text-gray-600">
                      {formData.guests.adults + formData.guests.children} guest{formData.guests.adults + formData.guests.children !== 1 ? 's' : ''}
                    </div>
                  </div>
                </PopoverTrigger>
                <PopoverContent className="w-80 p-4" align="end">
                  <div className="space-y-6">
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
                          onClick={() => setFormData((prev) => ({
                            ...prev,
                            guests: { ...prev.guests, adults: Math.max(1, prev.guests.adults - 1) }
                          }))}
                          disabled={formData.guests.adults <= 1}
                          className="h-8 w-8 rounded-full"
                        >
                          <Minus className="h-4 w-4" />
                        </Button>
                        <span className="w-8 text-center font-medium">{formData.guests.adults}</span>
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => setFormData((prev) => ({
                            ...prev,
                            guests: { ...prev.guests, adults: Math.min(16, prev.guests.adults + 1) }
                          }))}
                          disabled={formData.guests.adults >= 16}
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
                          onClick={() => setFormData((prev) => ({
                            ...prev,
                            guests: { ...prev.guests, children: Math.max(0, prev.guests.children - 1) }
                          }))}
                          disabled={formData.guests.children <= 0}
                          className="h-8 w-8 rounded-full"
                        >
                          <Minus className="h-4 w-4" />
                        </Button>
                        <span className="w-8 text-center font-medium">{formData.guests.children}</span>
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => setFormData((prev) => ({
                            ...prev,
                            guests: { ...prev.guests, children: Math.min(10, prev.guests.children + 1) }
                          }))}
                          disabled={formData.guests.children >= 10}
                          className="h-8 w-8 rounded-full"
                        >
                          <Plus className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </PopoverContent>
              </Popover>

              {/* Search Button */}
              <div className="flex items-center pr-1.5">
                <Button
                  onClick={handleSearch}
                  className="flex h-10 w-10 items-center justify-center rounded-full bg-brand text-white transition-colors hover:bg-brand/90 shadow-md"
                  size="icon"
                >
                  <Search className="h-4 w-4" />
                </Button>
          </div>
        </div>

            {/* Right Section */}
            <div className="flex flex-shrink-0 items-center gap-3">
              <Link
                href="/join-host"
                className="text-sm font-medium text-gray-700 transition-colors hover:text-gray-900 whitespace-nowrap"
              >
                Earn By hosting
              </Link>

              <div className="flex items-center gap-2 rounded-full border border-gray-300 px-3 py-2 hover:shadow-md transition-shadow">
                <Menu className="h-4 w-4 text-gray-700" />
                <UserMenu
                  isAuthenticated={isAuthenticated}
                  userRole={user?.role}
                  triggerIcon={
                    <div className="flex h-7 w-7 items-center justify-center rounded-full bg-gray-700 text-white">
                      <UserIcon className="h-4 w-4" />
                    </div>
                  }
                  triggerClassName="h-7 w-7 p-0 hover:bg-transparent"
                />
              </div>
            </div>
          </div>
        ) : (
          <>
            {/* Top Row: Logo and Right Menu */}
            <div className="flex h-20 items-center justify-between">
              {/* Logo */}
              <Link
                href="/"
                className="flex flex-shrink-0 items-center transition-opacity hover:opacity-80"
              >
                <Logo size={80} textClassName="text-2xl font-bold" />
              </Link>

              {/* Right Section */}
              <div className="flex flex-shrink-0 items-center gap-4">
          <Link
            href="/join-host"
                  className="text-sm font-medium text-gray-700 transition-colors hover:text-gray-900 whitespace-nowrap"
          >
                  Earn By hosting
          </Link>

                <div className="flex items-center gap-2 rounded-full border border-gray-300 px-3 py-2 hover:shadow-md transition-shadow">
                  <Menu className="h-4 w-4 text-gray-700" />
          <UserMenu
            isAuthenticated={isAuthenticated}
            userRole={user?.role}
                    triggerIcon={
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-700 text-white">
                        <UserIcon className="h-4 w-4" />
                      </div>
                    }
                    triggerClassName="h-8 w-8 p-0 hover:bg-transparent"
                  />
                </div>
              </div>
            </div>

            {/* Bottom Row: Centered Search Bar */}
            <div className="flex justify-center pb-6">
              <div className="flex h-16 w-full max-w-[900px] items-center rounded-full border border-gray-300 bg-white shadow-md hover:shadow-lg transition-shadow">
            {/* Where */}
            <div className="flex min-w-[200px] flex-1 relative px-6 py-2">
              <div className="flex flex-col w-full">
                <label className="text-xs font-semibold text-gray-900 mb-1">Where</label>
                <LocationCombobox
                  value={formData.location}
                  onChange={handleLocationSelect}
                  placeholder="Search destinations"
                  size="compact"
                  className="w-full"
                />
              </div>
            </div>

            {/* Divider */}
            <div className="h-8 w-px bg-gray-300" />

            {/* Check in & Check out with Date Picker */}
            <Popover open={isDatePickerOpen} onOpenChange={setIsDatePickerOpen}>
              <PopoverTrigger asChild>
                <div className="flex min-w-[280px] flex-1 cursor-pointer">
                  <div className="flex flex-1 flex-col justify-center px-6 py-2">
                    <label className="text-xs font-semibold text-gray-900">Check in</label>
                    <div className="text-sm text-gray-600">
                      {formData.checkIn 
                        ? format(formData.checkIn, 'MMM dd')
                        : 'Add dates'}
                    </div>
                  </div>
                  <div className="h-8 w-px bg-gray-300 self-center" />
                  <div className="flex flex-1 flex-col justify-center px-6 py-2">
                    <label className="text-xs font-semibold text-gray-900">Check out</label>
                    <div className="text-sm text-gray-600">
                      {formData.checkOut 
                        ? format(formData.checkOut, 'MMM dd')
                        : 'Add dates'}
                    </div>
                  </div>
                </div>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="center">
                <div className="flex flex-col">
                  <Calendar
                    mode="range"
                    selected={{ from: formData.checkIn, to: formData.checkOut }}
                    onSelect={(range: ReactDayPickerDateRange | undefined) => {
                      if (range) {
                        setFormData((prev) => ({
                          ...prev,
                          checkIn: range.from,
                          checkOut: range.to,
                        }));
                      }
                    }}
                    disabled={(date) => isBefore(date, startOfDay(new Date()))}
                    numberOfMonths={2}
                    className="rounded-md"
                  />
                  <div className="border-t border-gray-200 p-4 flex justify-end">
                    <Button
                      onClick={() => setIsDatePickerOpen(false)}
                      className="bg-brand hover:bg-brand/90 text-white px-8"
                    >
                      OK
                    </Button>
                  </div>
                </div>
              </PopoverContent>
            </Popover>

            {/* Divider */}
            <div className="h-8 w-px bg-gray-300" />

            {/* Who (Guests) */}
            <Popover>
              <PopoverTrigger asChild>
                <div className="flex min-w-[140px] flex-1 flex-col justify-center px-6 py-2 cursor-pointer">
                  <label className="text-xs font-semibold text-gray-900">Who</label>
                  <div className="text-sm text-gray-600">
                    {formData.guests.adults + formData.guests.children === 1 
                      ? '1 guest' 
                      : `${formData.guests.adults + formData.guests.children} guests`}
                  </div>
                </div>
              </PopoverTrigger>
              <PopoverContent className="w-80 p-4" align="end">
                <div className="space-y-6">
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
                        onClick={() => setFormData((prev) => ({
                          ...prev,
                          guests: { ...prev.guests, adults: Math.max(1, prev.guests.adults - 1) }
                        }))}
                        disabled={formData.guests.adults <= 1}
                        className="h-8 w-8 rounded-full"
                      >
                        <Minus className="h-4 w-4" />
                      </Button>
                      <span className="w-8 text-center font-medium">{formData.guests.adults}</span>
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => setFormData((prev) => ({
                          ...prev,
                          guests: { ...prev.guests, adults: Math.min(16, prev.guests.adults + 1) }
                        }))}
                        disabled={formData.guests.adults >= 16}
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
                        onClick={() => setFormData((prev) => ({
                          ...prev,
                          guests: { ...prev.guests, children: Math.max(0, prev.guests.children - 1) }
                        }))}
                        disabled={formData.guests.children <= 0}
                        className="h-8 w-8 rounded-full"
                      >
                        <Minus className="h-4 w-4" />
                      </Button>
                      <span className="w-8 text-center font-medium">{formData.guests.children}</span>
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => setFormData((prev) => ({
                          ...prev,
                          guests: { ...prev.guests, children: Math.min(10, prev.guests.children + 1) }
                        }))}
                        disabled={formData.guests.children >= 10}
                        className="h-8 w-8 rounded-full"
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </PopoverContent>
            </Popover>

            {/* Search Button */}
            <div className="flex items-center pr-2">
              <Button
                onClick={handleSearch}
                className="flex h-12 w-12 items-center justify-center rounded-full bg-brand text-white transition-colors hover:bg-brand/90 shadow-md"
                size="icon"
              >
                <Search className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </div>
          </>
        )}
      </div>
    </header>
  );
}
