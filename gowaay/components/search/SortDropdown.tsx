'use client';

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowUpDown } from 'lucide-react';

interface SortOption {
  value: string;
  label: string;
}

interface SortDropdownProps {
  onSortChange: (sort: string) => void;
  currentSort: string;
  className?: string;
}

const SORT_OPTIONS: SortOption[] = [
  { value: 'newest', label: 'Newest First' },
  { value: 'oldest', label: 'Oldest First' },
  { value: 'price_asc', label: 'Price: Low to High' },
  { value: 'price_desc', label: 'Price: High to Low' },
  { value: 'rating', label: 'Highest Rated' },
];

export function SortDropdown({ onSortChange, currentSort, className }: SortDropdownProps) {
  const getCurrentLabel = () => {
    const option = SORT_OPTIONS.find(opt => opt.value === currentSort);
    return option ? option.label : 'Sort by';
  };

  return (
    <Select value={currentSort} onValueChange={onSortChange}>
      <SelectTrigger className={className}>
        <div className="flex items-center">
          <ArrowUpDown className="h-4 w-4 mr-2 text-gray-500" />
          <SelectValue placeholder={getCurrentLabel()} />
        </div>
      </SelectTrigger>
      <SelectContent>
        {SORT_OPTIONS.map((option) => (
          <SelectItem key={option.value} value={option.value}>
            {option.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
