'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Users, Minus, Plus } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Guests {
  adults: number;
  children: number;
}

interface GuestsPopoverProps {
  value: Guests;
  onChange: (guests: Guests) => void;
  placeholder?: string;
  className?: string;
  size?: 'default' | 'compact';
}

export function GuestsPopover({ 
  value, 
  onChange, 
  placeholder = "Guests",
  className,
  size = 'default'
}: GuestsPopoverProps) {
  const [isOpen, setIsOpen] = useState(false);

  const totalGuests = value.adults + value.children;

  const formatGuests = () => {
    if (totalGuests === 0) return placeholder;
    if (totalGuests === 1) return '1 Guest';
    return `${totalGuests} Guests`;
  };

  const handleIncrement = (type: 'adults' | 'children') => {
    const maxValue = type === 'adults' ? 16 : 10;
    if (value[type] < maxValue) {
      onChange({
        ...value,
        [type]: value[type] + 1
      });
    }
  };

  const handleDecrement = (type: 'adults' | 'children') => {
    const minValue = type === 'adults' ? 1 : 0;
    if (value[type] > minValue) {
      onChange({
        ...value,
        [type]: value[type] - 1
      });
    }
  };

  const handleApply = () => {
    setIsOpen(false);
  };

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          className={cn(
            'w-full justify-start text-left font-normal',
            size === 'compact' ? 'h-11 px-2.5 text-sm' : 'h-14 px-3',
            totalGuests === 0 && 'text-gray-400',
            className
          )}
        >
          <Users
            className={cn(
              'mr-3 text-gray-400',
              size === 'compact' ? 'h-4 w-4' : 'h-5 w-5'
            )}
          />
          <span className="truncate">{formatGuests()}</span>
        </Button>
      </PopoverTrigger>
      <PopoverContent 
        className="w-80 p-4" 
        align="start"
        side="bottom"
        sideOffset={4}
      >
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
                onClick={() => handleDecrement('adults')}
                disabled={value.adults <= 1}
                className="h-8 w-8 rounded-full"
              >
                <Minus className="h-4 w-4" />
              </Button>
              <span className="w-8 text-center font-medium">{value.adults}</span>
              <Button
                variant="outline"
                size="icon"
                onClick={() => handleIncrement('adults')}
                disabled={value.adults >= 16}
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
                onClick={() => handleDecrement('children')}
                disabled={value.children <= 0}
                className="h-8 w-8 rounded-full"
              >
                <Minus className="h-4 w-4" />
              </Button>
              <span className="w-8 text-center font-medium">{value.children}</span>
              <Button
                variant="outline"
                size="icon"
                onClick={() => handleIncrement('children')}
                disabled={value.children >= 10}
                className="h-8 w-8 rounded-full"
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Info text */}
          <div className="text-xs text-gray-500 bg-gray-50 p-3 rounded-lg">
            <p>This place has a maximum of 16 guests, not including infants.</p>
            <p className="mt-1">Infants don't count toward the number of guests.</p>
          </div>

          {/* Apply button */}
          <Button
            onClick={handleApply}
            className="w-full bg-brand hover:bg-brand/90 text-white"
          >
            Apply
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
}
