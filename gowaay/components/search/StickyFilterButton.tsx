'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { FilterModal } from '@/components/search/FilterModal';
import { Filter } from 'lucide-react';

interface SearchFilters {
  location: string;
  minPrice: number;
  maxPrice: number;
  roomType: string;
}

interface StickyFilterButtonProps {
  onApplyFilters: (filters: SearchFilters) => void;
  currentFilters: SearchFilters;
}

export function StickyFilterButton({ onApplyFilters, currentFilters }: StickyFilterButtonProps) {
  const getActiveFiltersCount = () => {
    let count = 0;
    if (currentFilters.location) count++;
    if (currentFilters.minPrice > 0 || currentFilters.maxPrice < 50000) count++;
    if (currentFilters.roomType) count++;
    return count;
  };

  const activeFiltersCount = getActiveFiltersCount();

  return (
    <div className="fixed bottom-6 right-6 z-50 md:hidden">
      <FilterModal
        onApplyFilters={onApplyFilters}
        currentFilters={currentFilters}
        className="shadow-lg"
      />
    </div>
  );
}
