'use client';

import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import { Filter, X } from 'lucide-react';

interface FilterOptions {
  location: string;
  minPrice: number;
  maxPrice: number;
  roomType: string;
}

interface FilterModalProps {
  onApplyFilters: (filters: FilterOptions) => void;
  currentFilters: FilterOptions;
  className?: string;
}

const ROOM_TYPES = [
  { value: 'single', label: 'Single Room' },
  { value: 'double', label: 'Double Room' },
  { value: 'family', label: 'Family Room' },
  { value: 'suite', label: 'Suite' },
  { value: 'other', label: 'Other' },
];

const PRICE_RANGES = [
  { label: 'Under ৳2,000', min: 0, max: 2000 },
  { label: '৳2,000 - ৳5,000', min: 2000, max: 5000 },
  { label: '৳5,000 - ৳10,000', min: 5000, max: 10000 },
  { label: '৳10,000 - ৳20,000', min: 10000, max: 20000 },
  { label: 'Over ৳20,000', min: 20000, max: 100000 },
];

export function FilterModal({ onApplyFilters, currentFilters, className }: FilterModalProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [filters, setFilters] = useState<FilterOptions>(currentFilters);
  const [priceRange, setPriceRange] = useState([currentFilters.minPrice || 0, currentFilters.maxPrice || 50000]);

  // Sync internal state when currentFilters prop changes
  useEffect(() => {
    setFilters(currentFilters);
    setPriceRange([currentFilters.minPrice || 0, currentFilters.maxPrice || 50000]);
  }, [currentFilters]);

  const handleApply = () => {
    const updatedFilters = {
      ...filters,
      minPrice: priceRange[0],
      maxPrice: priceRange[1],
    };
    onApplyFilters(updatedFilters);
    setIsOpen(false);
  };

  const handleClear = () => {
    const clearedFilters = {
      location: '',
      minPrice: 0,
      maxPrice: 50000,
      roomType: '',
    };
    setFilters(clearedFilters);
    setPriceRange([0, 50000]);
    onApplyFilters(clearedFilters);
    setIsOpen(false);
  };

  const handlePriceRangeSelect = (range: { min: number; max: number }) => {
    setPriceRange([range.min, range.max]);
    setFilters(prev => ({
      ...prev,
      minPrice: range.min,
      maxPrice: range.max,
    }));
  };

  const getActiveFiltersCount = () => {
    let count = 0;
    if (filters.location) count++;
    if (filters.minPrice > 0 || filters.maxPrice < 50000) count++;
    if (filters.roomType) count++;
    return count;
  };

  const activeFiltersCount = getActiveFiltersCount();

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button 
          variant="outline" 
          className={`relative ${className}`}
        >
          <Filter className="h-4 w-4 md:mr-2" />
          <span className="hidden md:inline">Filters</span>
          {activeFiltersCount > 0 && (
            <Badge 
              variant="secondary" 
              className="absolute -top-2 -right-2 md:static md:ml-2 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs bg-white md:bg-brand text-brand md:text-white border border-brand"
            >
              {activeFiltersCount}
            </Badge>
          )}
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span>Filter Rooms</span>
            {activeFiltersCount > 0 && (
              <Button variant="ghost" size="sm" onClick={handleClear}>
                <X className="h-4 w-4 mr-1" />
                Clear All
              </Button>
            )}
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Location Filter */}
          <div>
            <Label htmlFor="location">Location</Label>
            <Input
              id="location"
              placeholder="Enter city or area..."
              value={filters.location}
              onChange={(e) => setFilters(prev => ({ ...prev, location: e.target.value }))}
            />
          </div>

          {/* Price Range */}
          <div>
            <Label>Price Range (৳)</Label>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <Label htmlFor="minPrice" className="text-sm">Min Price</Label>
                  <Input
                    id="minPrice"
                    type="number"
                    placeholder="0"
                    value={priceRange[0]}
                    onChange={(e) => setPriceRange([Number(e.target.value), priceRange[1]])}
                  />
                </div>
                <div>
                  <Label htmlFor="maxPrice" className="text-sm">Max Price</Label>
                  <Input
                    id="maxPrice"
                    type="number"
                    placeholder="50000"
                    value={priceRange[1]}
                    onChange={(e) => setPriceRange([priceRange[0], Number(e.target.value)])}
                  />
                </div>
              </div>
              
              <Slider
                value={priceRange}
                onValueChange={setPriceRange}
                max={50000}
                min={0}
                step={500}
                className="w-full"
              />
              
              <div className="text-sm text-gray-600 text-center">
                ৳{priceRange[0].toLocaleString()} - ৳{priceRange[1].toLocaleString()}
              </div>
              
              {/* Quick Price Range Buttons */}
              <div className="grid grid-cols-2 gap-2">
                {PRICE_RANGES.map((range, index) => (
                  <Button
                    key={index}
                    variant="outline"
                    size="sm"
                    onClick={() => handlePriceRangeSelect(range)}
                    className="text-xs"
                  >
                    {range.label}
                  </Button>
                ))}
              </div>
            </div>
          </div>

          {/* Room Type */}
          <div>
            <Label htmlFor="roomType">Room Type</Label>
            <Select 
              value={filters.roomType || 'all'} 
              onValueChange={(value) => setFilters(prev => ({ ...prev, roomType: value === 'all' ? '' : value }))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select room type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                {ROOM_TYPES.map((type) => (
                  <SelectItem key={type.value} value={type.value}>
                    {type.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Action Buttons */}
          <div className="flex space-x-3 pt-4">
            <Button variant="outline" onClick={() => setIsOpen(false)} className="flex-1">
              Cancel
            </Button>
            <Button onClick={handleApply} className="flex-1">
              Apply Filters
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}