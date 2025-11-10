import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'user' | 'host' | 'admin';
  avatar?: string;
  phone?: string;
}

export interface Room {
  id: string;
  name: string;
  description: string;
  price: number;
  originalPrice?: number;
  images: string[];
  category: string;
  subcategory?: string;
  brand?: string;
  stock: number;
  ratings: {
    average: number;
    count: number;
  };
  sellerId: string;
  hostId?: string;
  instantBooking?: boolean;
  isActive: boolean;
  isFeatured: boolean;
  amenities?: string[];
  createdAt: string;
  updatedAt: string;
}

export interface Booking {
  id: string;
  roomId: string;
  room: Room;
  userId: string;
  checkIn: string;
  checkOut: string;
  guests: number;
  totalAmount: number;
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed';
  paymentStatus: 'unpaid' | 'paid' | 'failed' | 'refunded';
  createdAt: string;
}

export interface Message {
  id: string;
  senderId: string;
  receiverId: string;
  content: string;
  timestamp: number;
  isRead: boolean;
}

export interface Chat {
  id: string;
  participants: string[];
  lastMessage?: Message;
  unreadCount: number;
  updatedAt: string;
}

interface AppState {
  // User state
  user: User | null;
  isAuthenticated: boolean;
  setUser: (user: User | null) => void;
  logout: () => void;

  // UI state
  isLoading: boolean;
  setLoading: (loading: boolean) => void;

  // Search state
  searchQuery: string;
  searchFilters: {
    priceRange: [number, number];
    roomType: string;
    sortBy: string;
  };
  setSearchQuery: (query: string) => void;
  setSearchFilters: (filters: Partial<AppState['searchFilters']>) => void;

  // Booking state
  selectedDates: { checkIn: Date | null; checkOut: Date | null };
  selectedGuests: number;
  setSelectedDates: (dates: { checkIn: Date | null; checkOut: Date | null }) => void;
  setSelectedGuests: (guests: number) => void;

  // Messages state
  chats: Chat[];
  activeChat: string | null;
  setChats: (chats: Chat[]) => void;
  setActiveChat: (chatId: string | null) => void;
  addMessage: (chatId: string, message: Message) => void;
  markAsRead: (chatId: string) => void;

  // Modal state
  isFilterModalOpen: boolean;
  isChatDrawerOpen: boolean;
  isProfileMenuOpen: boolean;
  setFilterModalOpen: (open: boolean) => void;
  setChatDrawerOpen: (open: boolean) => void;
  setProfileMenuOpen: (open: boolean) => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      // User state
      user: null,
      isAuthenticated: false,
      setUser: (user) => set({ user, isAuthenticated: !!user }),
      logout: () => set({ user: null, isAuthenticated: false }),

      // UI state
      isLoading: false,
      setLoading: (loading) => set({ isLoading: loading }),

      // Search state
      searchQuery: '',
      searchFilters: {
        priceRange: [0, 10000],
        roomType: '',
        sortBy: 'newest',
      },
      setSearchQuery: (query) => set({ searchQuery: query }),
      setSearchFilters: (filters) =>
        set((state) => ({
          searchFilters: { ...state.searchFilters, ...filters },
        })),

      // Booking state
      selectedDates: { checkIn: null, checkOut: null },
      selectedGuests: 1,
      setSelectedDates: (dates) => set({ selectedDates: dates }),
      setSelectedGuests: (guests) => set({ selectedGuests: guests }),

      // Messages state
      chats: [],
      activeChat: null,
      setChats: (chats) => set({ chats }),
      setActiveChat: (chatId) => set({ activeChat: chatId }),
      addMessage: (chatId, message) =>
        set((state) => ({
          chats: state.chats.map((chat) =>
            chat.id === chatId
              ? {
                  ...chat,
                  lastMessage: message,
                  updatedAt: new Date().toISOString(),
                }
              : chat
          ),
        })),
      markAsRead: (chatId) =>
        set((state) => ({
          chats: state.chats.map((chat) =>
            chat.id === chatId
              ? { ...chat, unreadCount: 0 }
              : chat
          ),
        })),

      // Modal state
      isFilterModalOpen: false,
      isChatDrawerOpen: false,
      isProfileMenuOpen: false,
      setFilterModalOpen: (open) => set({ isFilterModalOpen: open }),
      setChatDrawerOpen: (open) => set({ isChatDrawerOpen: open }),
      setProfileMenuOpen: (open) => set({ isProfileMenuOpen: open }),
    }),
    {
      name: 'gowaay-store',
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
        searchQuery: state.searchQuery,
        searchFilters: state.searchFilters,
        selectedDates: state.selectedDates,
        selectedGuests: state.selectedGuests,
      }),
    }
  )
);
