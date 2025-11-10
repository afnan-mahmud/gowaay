'use client';

import { useState } from 'react';
import { Calendar } from 'lucide-react';
import { DayPicker } from 'react-day-picker';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { format } from 'date-fns';
import 'react-day-picker/dist/style.css';

interface DateRangePickerProps {
  checkIn: Date | null;
  checkOut: Date | null;
  onDatesChange: (dates: { checkIn: Date | null; checkOut: Date | null }) => void;
  disabled?: boolean;
}

export function DateRangePicker({ 
  checkIn, 
  checkOut, 
  onDatesChange, 
  disabled = false 
}: DateRangePickerProps) {
  const [isOpen, setIsOpen] = useState(false);

  const handleDateSelect = (date: Date | undefined) => {
    if (!date) return;

    if (!checkIn || (checkIn && checkOut)) {
      // Start new selection
      onDatesChange({ checkIn: date, checkOut: null });
    } else if (checkIn && !checkOut) {
      // Complete selection
      if (date < checkIn) {
        onDatesChange({ checkIn: date, checkOut: checkIn });
      } else {
        onDatesChange({ checkIn, checkOut: date });
      }
      setIsOpen(false);
    }
  };

  const formatDate = (date: Date | null) => {
    return date ? format(date, 'MMM dd') : '';
  };

  return (
    <div className="relative">
      <Button
        variant="outline"
        className="w-full justify-start text-left font-normal"
        onClick={() => !disabled && setIsOpen(!isOpen)}
        disabled={disabled}
      >
        <Calendar className="mr-2 h-4 w-4" />
        {checkIn && checkOut ? (
          `${formatDate(checkIn)} - ${formatDate(checkOut)}`
        ) : checkIn ? (
          `${formatDate(checkIn)} - Select checkout`
        ) : (
          'Select dates'
        )}
      </Button>

      {isOpen && (
        <Card className="absolute top-full left-0 right-0 z-50 mt-2">
          <CardContent className="p-4">
            <DayPicker
              mode="single"
              selected={checkIn || checkOut || undefined}
              onSelect={handleDateSelect}
              disabled={(date) => date < new Date()}
              className="w-full"
            />
          </CardContent>
        </Card>
      )}
    </div>
  );
}
