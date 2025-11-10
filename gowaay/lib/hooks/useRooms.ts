'use client';

import { useState, useEffect } from 'react';
import { api } from '@/lib/api';

export interface Room {
  _id: string;
  title: string;
  description: string;
  address: string;
  locationName: string;
  roomType: 'single' | 'double' | 'family' | 'suite' | 'other';
  amenities: string[];
  basePriceTk: number;
  commissionTk: number;
  totalPriceTk: number;
  images: Array<{
    url: string;
    w: number;
    h: number;
  }>;
  status: 'pending' | 'approved' | 'rejected';
  instantBooking: boolean;
  unavailableDates: string[];
  hostId: {
    _id: string;
    displayName: string;
    locationName: string;
  };
  createdAt: string;
  updatedAt: string;
}

interface UseRoomsOptions {
  limit?: number;
  status?: 'pending' | 'approved' | 'rejected';
  roomType?: string;
  location?: string;
  minPrice?: number;
  maxPrice?: number;
  search?: string;
  sortBy?: 'newest' | 'price' | 'rating';
}

interface UseRoomsResult {
  rooms: Room[];
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

export function useRooms(options: UseRoomsOptions = {}): UseRoomsResult {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchRooms = async () => {
    try {
      setLoading(true);
      setError(null);

      const queryParams = new URLSearchParams();
      if (options.limit) queryParams.append('limit', options.limit.toString());
      if (options.status) queryParams.append('status', options.status);
      if (options.roomType) queryParams.append('type', options.roomType);
      if (options.location) queryParams.append('location', options.location);
      if (options.minPrice) queryParams.append('minPrice', options.minPrice.toString());
      if (options.maxPrice) queryParams.append('maxPrice', options.maxPrice.toString());
      if (options.search) queryParams.append('q', options.search);
      if (options.sortBy) queryParams.append('sort', options.sortBy);

      const response = await api.rooms.search<{
        rooms: Room[];
        pagination: {
          page: number;
          limit: number;
          total: number;
          pages: number;
        };
      }>(queryParams.toString());

      if (response.success && response.data) {
        setRooms(response.data.rooms);
      } else {
        setError(response.message || 'Failed to fetch rooms');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRooms();
  }, [JSON.stringify(options)]);

  return {
    rooms,
    loading,
    error,
    refetch: fetchRooms,
  };
}
