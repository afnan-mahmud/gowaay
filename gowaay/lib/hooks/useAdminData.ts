'use client';

import { useState, useEffect } from 'react';
import { api } from '@/lib/api';

export interface AdminStats {
  totalBookings: number;
  confirmedBookings: number;
  cancelledBookings: number;
  totalRevenue: number;
  totalHosts: number;
  activeHosts: number;
  totalRooms: number;
  activeRooms: number;
}

export interface HostApplication {
  _id: string;
  userId: {
    _id: string;
    name: string;
    email: string;
    phone: string;
  };
  displayName: string;
  phone: string;
  whatsapp: string;
  locationName: string;
  status: 'pending' | 'approved' | 'rejected';
  propertyCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface Booking {
  _id: string;
  roomId: {
    _id: string;
    title: string;
    locationName: string;
    images: Array<{ url: string; w: number; h: number }>;
  };
  userId: {
    _id: string;
    name: string;
    email: string;
    phone: string;
  };
  hostId: {
    _id: string;
    displayName: string;
  };
  checkIn: string;
  checkOut: string;
  guests: number;
  mode: 'instant' | 'request';
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed';
  paymentStatus: 'pending' | 'paid' | 'failed' | 'refunded';
  amountTk: number;
  createdAt: string;
  updatedAt: string;
}

export function useAdminStats() {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const response = await api.admin.stats();
        
        if (response.success && response.data) {
          setStats(response.data as AdminStats);
        } else {
          setError(response.message || 'Failed to fetch stats');
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  return { stats, loading, error };
}

export function useHostApplications() {
  const [applications, setApplications] = useState<HostApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchApplications = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const response = await api.admin.hosts();
        
        if (response.success && response.data) {
          setApplications(response.data as HostApplication[]);
        } else {
          setError(response.message || 'Failed to fetch host applications');
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchApplications();
  }, []);

  return { applications, loading, error };
}

export function useAdminBookings() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchBookings = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const response = await api.admin.bookings();
        
        if (response.success && response.data) {
          // Handle both response structures
          const bookingsData = Array.isArray(response.data) ? response.data : (response.data as any).bookings;
          setBookings(bookingsData as Booking[]);
        } else {
          setError(response.message || 'Failed to fetch bookings');
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchBookings();
  }, []);

  return { bookings, loading, error };
}
