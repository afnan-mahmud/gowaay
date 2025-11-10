'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { Calendar as CalendarIcon } from 'lucide-react';
import { format, isAfter, isBefore, startOfDay } from 'date-fns';
import { cn } from '@/lib/utils';
import { DateRange as ReactDayPickerDateRange } from 'react-day-picker';

interface DateRange {
  from: Date | undefined;
  to: Date | undefined;
}

interface DateRangePopoverProps {
  value: DateRange;
  onChange: (range: DateRange) => void;
  placeholder?: string;
  className?: string;
  size?: 'default' | 'compact';
}

export function DateRangePopover({ 
  value, 
  onChange, 
  placeholder = "Select dates",
  className,
  size = 'default'
}: DateRangePopoverProps) {
  const [isOpen, setIsOpen] = useState(false);

  const handleSelect = (range: ReactDayPickerDateRange | undefined) => {
    if (range) {
      const dateRange: DateRange = {
        from: range.from,
        to: range.to,
      };
      onChange(dateRange);
      // Close popover when both dates are selected
      if (range.from && range.to) {
        setIsOpen(false);
      }
    }
  };

  const formatDateRange = () => {
    if (!value.from) return placeholder;
    if (!value.to) return format(value.from, 'MMM dd');
    return `${format(value.from, 'MMM dd')} – ${format(value.to, 'MMM dd')}`;
  };

  const isDateDisabled = (date: Date) => {
    const today = startOfDay(new Date());
    return isBefore(date, today);
  };

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          className={cn(
            'w-full justify-start text-left font-normal',
            size === 'compact' ? 'h-11 px-2.5 text-sm' : 'h-14 px-3',
            !value.from && 'text-gray-400',
            className
          )}
        >
          <CalendarIcon
            className={cn(
              'mr-3 text-gray-400',
              size === 'compact' ? 'h-4 w-4' : 'h-5 w-5'
            )}
          />
          <span className="truncate">{formatDateRange()}</span>
        </Button>
      </PopoverTrigger>
      <PopoverContent 
        className="w-auto p-0" 
        align="start"
        side="bottom"
        sideOffset={4}
      >
        <Calendar
          mode="range"
          selected={value}
          onSelect={handleSelect}
          disabled={isDateDisabled}
          numberOfMonths={2}
          className="rounded-md border-0"
          classNames={{
            months: "flex flex-col sm:flex-row space-y-4 sm:space-x-4 sm:space-y-0",
            month: "space-y-4",
            caption: "flex justify-center pt-1 relative items-center",
            caption_label: "text-sm font-medium",
            nav: "space-x-1 flex items-center",
            nav_button: "h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100",
            nav_button_previous: "absolute left-1",
            nav_button_next: "absolute right-1",
            table: "w-full border-collapse space-y-1",
            head_row: "flex",
            head_cell: "text-gray-500 rounded-md w-9 font-normal text-[0.8rem]",
            row: "flex w-full mt-2",
            cell: "text-center text-sm p-0 relative [&:has([aria-selected])]:bg-brand [&:has([aria-selected])]:text-white first:[&:has([aria-selected])]:rounded-l-md last:[&:has([aria-selected])]:rounded-r-md focus-within:relative focus-within:z-20",
            day: "h-9 w-9 p-0 font-normal aria-selected:opacity-100",
            day_selected: "bg-brand text-white hover:bg-brand hover:text-white focus:bg-brand focus:text-white",
            day_today: "bg-gray-100 text-gray-900",
            day_outside: "text-gray-400 opacity-50",
            day_disabled: "text-gray-400 opacity-50",
            day_range_middle: "aria-selected:bg-brand aria-selected:text-white",
            day_hidden: "invisible",
          }}
        />
        
        {/* Footer with clear button */}
        {(value.from || value.to) && (
          <div className="p-3 border-t border-gray-200">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                onChange({ from: undefined, to: undefined });
                setIsOpen(false);
              }}
              className="w-full"
            >
              Clear dates
            </Button>
          </div>
        )}
      </PopoverContent>
    </Popover>
  );
}
