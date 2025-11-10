'use client';

import { useState, useEffect } from 'react';
import { api } from '@/lib/api';

export interface HostStats {
  totalBookings: number;
  confirmedBookings: number;
  pendingBookings: number;
  totalEarnings: number;
  totalRooms: number;
  activeRooms: number;
}

export interface HostRoom {
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
  createdAt: string;
  updatedAt: string;
}

export interface HostBooking {
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

export interface HostMessageThread {
  _id: string;
  roomId: {
    _id: string;
    title: string;
    images: Array<{ url: string; w: number; h: number }>;
  };
  userId: {
    _id: string;
    name: string;
    email: string;
    phone: string;
  };
  lastMessageAt: string;
  messageCount: number;
  isActive: boolean;
  lastMessage: {
    text: string;
    senderRole: 'guest' | 'host' | 'admin';
    timestamp: string;
    blocked?: boolean;
    reason?: string;
  } | null;
}

export interface HostMessage {
  _id: string;
  text: string;
  senderRole: 'guest' | 'host' | 'admin';
  timestamp: string;
  blocked?: boolean;
  reason?: string;
}

export interface HostUnavailableDate {
  _id: string;
  roomId: string;
  roomTitle: string;
  date: string;
  createdAt: string;
}

export interface HostCalendarRoom {
  _id: string;
  title: string;
  unavailableDates: string[];
}

export interface HostBalance {
  totalEarnings: number;
  availableBalance: number;
  pendingAmount: number;
  monthlyEarnings: number;
  totalPayouts: number;
}

export interface HostTransaction {
  _id: string;
  type: 'booking' | 'payout';
  amount: number;
  description: string;
  date: string;
  status: 'completed' | 'pending' | 'approved' | 'rejected';
  user?: {
    _id: string;
    name: string;
    email: string;
  };
}

export interface HostPayoutRequest {
  _id: string;
  method: {
    type: 'bkash' | 'nagad' | 'bank';
    subtype?: 'personal' | 'merchant' | 'agent';
    accountNo?: string;
    bankFields?: {
      bankName?: string;
      branchName?: string;
      accountHolderName?: string;
      routingNumber?: string;
    };
  };
  amountTk: number;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: string;
  updatedAt: string;
}

export function useHostStats() {
  const [stats, setStats] = useState<HostStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const response = await api.hosts.stats();
        
        if (response.success && response.data) {
          setStats(response.data as HostStats);
        } else {
          setError(response.message || 'Failed to fetch host stats');
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

export function useHostRooms() {
  const [rooms, setRooms] = useState<HostRoom[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchRooms = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const response = await api.hosts.rooms();
        
        if (response.success && response.data) {
          setRooms(response.data as HostRoom[]);
        } else {
          setError(response.message || 'Failed to fetch host rooms');
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchRooms();
  }, []);

  return { rooms, loading, error };
}

export function useHostBookings() {
  const [bookings, setBookings] = useState<HostBooking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchBookings = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const response = await api.hosts.bookings();
        
        if (response.success && response.data) {
          setBookings(response.data as HostBooking[]);
        } else {
          setError(response.message || 'Failed to fetch host bookings');
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

export function useHostMessageThreads() {
  const [threads, setThreads] = useState<HostMessageThread[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchThreads = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const response = await api.messages.getThreads();
        
        if (response.success && response.data) {
          setThreads(response.data.threads as HostMessageThread[]);
        } else {
          setError(response.message || 'Failed to fetch message threads');
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchThreads();
  }, []);

  return { threads, loading, error };
}

export function useHostMessages(threadId: string | null) {
  const [messages, setMessages] = useState<HostMessage[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!threadId) {
      setMessages([]);
      return;
    }

    const fetchMessages = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const response = await api.messages.getThreadMessages(threadId);
        
        if (response.success && response.data) {
          setMessages(response.data.messages as HostMessage[]);
        } else {
          setError(response.message || 'Failed to fetch messages');
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchMessages();
  }, [threadId]);

  const sendMessage = async (text: string) => {
    if (!threadId) return;

    try {
      const response = await api.messages.sendMessage(threadId, { text });
      
      if (response.success && response.data) {
        // Add the new message to the local state
        setMessages(prev => [...prev, response.data as HostMessage]);
        return response.data;
      } else {
        throw new Error(response.message || 'Failed to send message');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to send message');
      throw err;
    }
  };

  return { messages, loading, error, sendMessage };
}

export function useHostCalendar() {
  const [unavailableDates, setUnavailableDates] = useState<HostUnavailableDate[]>([]);
  const [rooms, setRooms] = useState<HostCalendarRoom[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCalendarData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const response = await api.hosts.getUnavailableDates();
        
        if (response.success && response.data) {
          setUnavailableDates(response.data.unavailableDates as HostUnavailableDate[]);
          setRooms(response.data.rooms as HostCalendarRoom[]);
        } else {
          setError(response.message || 'Failed to fetch calendar data');
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchCalendarData();
  }, []);

  const addUnavailableDates = async (roomId: string, dates: string[]) => {
    try {
      const response = await api.rooms.setUnavailable(roomId, { dates });
      
      if (response.success) {
        // Refresh calendar data
        const refreshResponse = await api.hosts.getUnavailableDates();
        if (refreshResponse.success && refreshResponse.data) {
          setUnavailableDates(refreshResponse.data.unavailableDates as HostUnavailableDate[]);
          setRooms(refreshResponse.data.rooms as HostCalendarRoom[]);
        }
        return response.data;
      } else {
        throw new Error(response.message || 'Failed to add unavailable dates');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add unavailable dates');
      throw err;
    }
  };

  const removeUnavailableDates = async (roomId: string, dates: string[]) => {
    try {
      const response = await api.rooms.removeUnavailable(roomId, { dates });
      
      if (response.success) {
        // Refresh calendar data
        const refreshResponse = await api.hosts.getUnavailableDates();
        if (refreshResponse.success && refreshResponse.data) {
          setUnavailableDates(refreshResponse.data.unavailableDates as HostUnavailableDate[]);
          setRooms(refreshResponse.data.rooms as HostCalendarRoom[]);
        }
        return response.data;
      } else {
        throw new Error(response.message || 'Failed to remove unavailable dates');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to remove unavailable dates');
      throw err;
    }
  };

  return { 
    unavailableDates, 
    rooms, 
    loading, 
    error, 
    addUnavailableDates, 
    removeUnavailableDates 
  };
}

export function useHostBalance() {
  const [balance, setBalance] = useState<HostBalance | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchBalance = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const response = await api.hosts.balance();
        
        if (response.success && response.data) {
          setBalance(response.data as HostBalance);
        } else {
          setError(response.message || 'Failed to fetch balance data');
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchBalance();
  }, []);

  return { balance, loading, error };
}

export function useHostTransactions(params?: { page?: number; limit?: number }) {
  const [transactions, setTransactions] = useState<HostTransaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState<any>(null);

  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const response = await api.hosts.transactions(params);
        
        if (response.success && response.data) {
          setTransactions(response.data.transactions as HostTransaction[]);
          setPagination(response.data.pagination);
        } else {
          setError(response.message || 'Failed to fetch transactions');
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchTransactions();
  }, [params?.page, params?.limit]);

  return { transactions, pagination, loading, error };
}

export function useHostPayouts(params?: { page?: number; limit?: number; status?: string }) {
  const [payouts, setPayouts] = useState<HostPayoutRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState<any>(null);

  useEffect(() => {
    const fetchPayouts = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const response = await api.payouts.getMine(params);
        
        if (response.success && response.data) {
          setPayouts(response.data.payoutRequests as HostPayoutRequest[]);
          setPagination(response.data.pagination);
        } else {
          setError(response.message || 'Failed to fetch payout requests');
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchPayouts();
  }, [params?.page, params?.limit, params?.status]);

  const requestPayout = async (data: any) => {
    try {
      const response = await api.payouts.request(data);
      
      if (response.success) {
        // Refresh payouts
        const refreshResponse = await api.payouts.getMine(params);
        if (refreshResponse.success && refreshResponse.data) {
          setPayouts(refreshResponse.data.payoutRequests as HostPayoutRequest[]);
          setPagination(refreshResponse.data.pagination);
        }
        return response.data;
      } else {
        throw new Error(response.message || 'Failed to request payout');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to request payout');
      throw err;
    }
  };

  return { payouts, pagination, loading, error, requestPayout };
}
