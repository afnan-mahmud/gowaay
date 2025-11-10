'use client';

import { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { FilterModal } from '@/components/search/FilterModal';
import { SearchRoomCard } from '@/components/search/SearchRoomCard';
import { 
  ChevronLeft,
  ChevronRight,
  Loader2
} from 'lucide-react';
import { api } from '@/lib/api';

interface Room {
  _id: string;
  title: string;
  description: string;
  address: string;
  locationName: string;
  roomType: string;
  amenities: string[];
  basePriceTk: number;
  commissionTk: number;
  totalPriceTk: number;
  images: { url: string; w: number; h: number }[];
  instantBooking: boolean;
  averageRating?: number;
  totalReviews?: number;
  createdAt: string;
  host: {
    displayName: string;
    locationName: string;
  };
}

interface SearchFilters {
  location: string;
  minPrice: number;
  maxPrice: number;
  roomType: string;
}

interface SearchResults {
  rooms: Room[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
  filters: {
    query: string;
    location: string;
    minPrice: number;
    maxPrice: number;
    type: string;
    sort: string;
  };
}

export default function RoomSearch() {
  const searchParams = useSearchParams();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState<SearchFilters>({
    location: '',
    minPrice: 0,
    maxPrice: 50000,
    roomType: '',
  });
  const [sort, setSort] = useState('newest');
  const [page, setPage] = useState(1);
  const [results, setResults] = useState<SearchResults | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [initialized, setInitialized] = useState(false);

  // Initialize from URL parameters on mount
  useEffect(() => {
    if (initialized) return;
    
    const q = searchParams.get('q') || '';
    const location = searchParams.get('location') || '';
    const minPrice = parseInt(searchParams.get('minPrice') || '0');
    const maxPrice = parseInt(searchParams.get('maxPrice') || '50000');
    const roomType = searchParams.get('type') || '';
    const sortParam = searchParams.get('sort') || 'newest';
    
    console.log('Initializing search from URL params:', {
      q, location, minPrice, maxPrice, roomType, sortParam
    });
    
    setSearchQuery(q);
    setFilters({
      location: location || q, // Use q as location if location is empty
      minPrice,
      maxPrice,
      roomType,
    });
    setSort(sortParam);
    setInitialized(true);
  }, [searchParams, initialized]);

  const searchRooms = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const params = new URLSearchParams({
        page: page.toString(),
        limit: '12',
        sort,
      });

      if (searchQuery) params.append('q', searchQuery);
      if (filters.location) params.append('location', filters.location);
      if (filters.minPrice > 0) params.append('minPrice', filters.minPrice.toString());
      if (filters.maxPrice < 50000) params.append('maxPrice', filters.maxPrice.toString());
      if (filters.roomType) params.append('type', filters.roomType);

      const response = await api.rooms.search<SearchResults>(params.toString());
      
      if (response.success && response.data) {
        setResults(response.data);
      } else {
        setError(response.message || 'Failed to search rooms');
      }
    } catch (err) {
      console.error('Search error:', err);
      setError('Failed to search rooms. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [searchQuery, filters, sort, page]);

  useEffect(() => {
    if (initialized) {
      searchRooms();
    }
  }, [searchRooms, initialized]);

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    setPage(1); // Reset to first page on new search
  };

  const handleFiltersChange = (newFilters: SearchFilters) => {
    setFilters(newFilters);
    setPage(1); // Reset to first page on filter change
  };

  const handleSortChange = (newSort: string) => {
    setSort(newSort);
    setPage(1); // Reset to first page on sort change
  };

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-20 md:pb-0">
      {/* Floating Filter Button - All devices */}
      <div className="fixed bottom-20 md:bottom-6 right-4 z-20">
        <FilterModal
          onApplyFilters={handleFiltersChange}
          currentFilters={filters}
          className="h-14 w-14 rounded-full shadow-lg hover:shadow-xl transition-shadow bg-brand hover:bg-brand/90 border-0 text-white"
        />
      </div>

      {/* Results */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {loading && (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-brand" />
            <span className="ml-2 text-gray-600">Searching rooms...</span>
          </div>
        )}

        {error && (
          <div className="text-center py-12">
            <p className="text-red-600 mb-4">{error}</p>
            <Button onClick={searchRooms}>Try Again</Button>
          </div>
        )}

        {results && !loading && (
          <>
            {/* Results Header */}
            <div className="mb-6">
              <p className="text-sm text-gray-600 mb-2">
                Over {results.pagination.total} homes in {searchQuery || 'Bangladesh'}
              </p>
              <h1 className="text-3xl font-bold text-gray-900">
                Search Results
              </h1>
            </div>

            {/* Room Grid */}
            {results.rooms.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {results.rooms.map((room) => (
                  <SearchRoomCard key={room._id} room={room} />
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <p className="text-gray-600 mb-4">No rooms found matching your criteria.</p>
                <Button onClick={() => {
                  setSearchQuery('');
                  setFilters({ location: '', minPrice: 0, maxPrice: 50000, roomType: '' });
                  setPage(1);
                }}>
                  Clear Filters
                </Button>
              </div>
            )}

            {/* Pagination */}
            {results.pagination.pages > 1 && (
              <div className="flex items-center justify-center space-x-2 mt-8">
                <Button
                  variant="outline"
                  onClick={() => handlePageChange(page - 1)}
                  disabled={!results.pagination.hasPrev}
                >
                  <ChevronLeft className="h-4 w-4 mr-1" />
                  Previous
                </Button>
                
                <div className="flex items-center space-x-1">
                  {Array.from({ length: Math.min(5, results.pagination.pages) }, (_, i) => {
                    const pageNum = i + 1;
                    return (
                      <Button
                        key={pageNum}
                        variant={page === pageNum ? "default" : "outline"}
                        size="sm"
                        onClick={() => handlePageChange(pageNum)}
                      >
                        {pageNum}
                      </Button>
                    );
                  })}
                </div>
                
                <Button
                  variant="outline"
                  onClick={() => handlePageChange(page + 1)}
                  disabled={!results.pagination.hasNext}
                >
                  Next
                  <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
