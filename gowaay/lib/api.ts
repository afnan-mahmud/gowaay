import { env } from './env';
import { getPixelCookies } from './cookies';

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

class ApiClient {
  private baseURL: string;

  constructor() {
    this.baseURL = env.API_BASE_URL;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const url = `${this.baseURL}${endpoint}`;
    
    const defaultHeaders: HeadersInit = {
      'Content-Type': 'application/json',
    };

    // Add auth token if available
    const token = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null;
    if (token) {
      defaultHeaders.Authorization = `Bearer ${token}`;
    }

    // Add pixel cookies for server-side tracking
    if (typeof window !== 'undefined') {
      const { fbp, fbc } = getPixelCookies();
      if (fbp) {
        defaultHeaders['x-fbp'] = fbp;
      }
      if (fbc) {
        defaultHeaders['x-fbc'] = fbc;
      }
    }

    const config: RequestInit = {
      ...options,
      headers: {
        ...defaultHeaders,
        ...options.headers,
      },
    };

    try {
      const response = await fetch(url, config);
      const data = await response.json();

      if (!response.ok) {
        console.error('API request failed:', { status: response.status, data });
        return {
          success: false,
          error: data.error || data.message || 'Request failed',
          message: data.message || data.error || 'Request failed',
        };
      }

      return data;
    } catch (error) {
      console.error('API request failed:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        message: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  // GET request
  async get<T>(endpoint: string, params?: Record<string, any>): Promise<ApiResponse<T>> {
    const url = new URL(endpoint, this.baseURL);
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          url.searchParams.append(key, String(value));
        }
      });
    }
    return this.request<T>(url.pathname + url.search);
  }

  // POST request
  async post<T>(endpoint: string, data?: any): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  // PUT request
  async put<T>(endpoint: string, data?: any): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  // PATCH request
  async patch<T>(endpoint: string, data?: any): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'PATCH',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  // DELETE request
  async delete<T>(endpoint: string): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'DELETE',
    });
  }

  // DELETE request with body
  async deleteWithBody<T>(endpoint: string, data: any): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'DELETE',
      body: JSON.stringify(data),
    });
  }

  // Upload file
  async upload<T>(endpoint: string, file: File, isPublic: boolean = false): Promise<ApiResponse<T>> {
    const formData = new FormData();
    formData.append('image', file);

    const uploadEndpoint = isPublic ? '/uploads/public/image' : endpoint;

    // For file uploads, we need to handle headers differently
    const url = `${this.baseURL}${uploadEndpoint}`;
    
    // Add auth token if available
    const headers: HeadersInit = {};
    const token = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null;
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }

    // Add pixel cookies for server-side tracking
    if (typeof window !== 'undefined') {
      const { fbp, fbc } = getPixelCookies();
      if (fbp) {
        headers['x-fbp'] = fbp;
      }
      if (fbc) {
        headers['x-fbc'] = fbc;
      }
    }

    const response = await fetch(url, {
      method: 'POST',
      body: formData,
      headers, // Don't set Content-Type, let browser set it with boundary
    });

    const data = await response.json();
    return data;
  }

  // Upload multiple files
  async uploadMultiple<T>(endpoint: string, files: File[]): Promise<ApiResponse<T>> {
    const formData = new FormData();
    files.forEach((file, index) => {
      formData.append('images', file);
    });

    return this.request<T>(endpoint, {
      method: 'POST',
      body: formData,
      headers: {}, // Let browser set Content-Type for FormData
    });
  }

  // Set auth token
  setAuthToken(token: string) {
    if (typeof window !== 'undefined') {
      localStorage.setItem('auth_token', token);
    }
  }

  // Clear auth token
  clearAuthToken() {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('auth_token');
    }
  }
}

export const apiClient = new ApiClient();

// API endpoints
export const api = {
  // Auth
  auth: {
    register: (data: { 
      name: string; 
      email: string; 
      password: string; 
      phone: string;
      isHost?: boolean;
      hostData?: {
        displayName?: string;
        phone?: string;
        whatsapp?: string;
        locationName?: string;
        locationMapUrl?: string;
        nidFrontUrl?: string;
        nidBackUrl?: string;
      };
    }) =>
      apiClient.post('/auth/register', data),
    login: (data: { email: string; password: string }) =>
      apiClient.post('/auth/login', data),
    logout: () => apiClient.post('/auth/logout'),
    profile: () => apiClient.get('/auth/profile'),
  },

  // Users
  users: {
    getProfile: () => apiClient.get('/users/me'),
    update: (data: { name?: string; phone?: string }) => apiClient.put('/users/me', data),
    changePassword: (data: { currentPassword: string; newPassword: string }) => 
      apiClient.post('/users/change-password', data),
  },

  // Rooms
  rooms: {
    list: <T = any>(params?: { page?: number; limit?: number; category?: string; search?: string }) =>
      apiClient.get<T>('/rooms/search', params),
    search: <T = any>(queryString: string) => apiClient.get<T>(`/rooms/search?${queryString}`),
    get: <T = any>(id: string) => apiClient.get<T>(`/rooms/${id}`),
    create: (data: any) => apiClient.post('/rooms', data),
    update: (id: string, data: any) => apiClient.put(`/rooms/${id}`, data),
    delete: (id: string) => apiClient.delete(`/rooms/${id}`),
    getUnavailable: <T = any>(id: string) => apiClient.get<T>(`/rooms/${id}/unavailable`),
    setUnavailable: (id: string, data: { dates: string[] }) => apiClient.post(`/rooms/${id}/unavailable`, data),
    removeUnavailable: (id: string, data: { dates: string[] }) => apiClient.deleteWithBody(`/rooms/${id}/unavailable`, data),
  },

  // Bookings
  bookings: {
    create: (data: any) => apiClient.post('/bookings/create', data),
    list: <T = any>(params?: any) => apiClient.get<T>('/bookings/mine', params),
    get: <T = any>(id: string) => apiClient.get<T>(`/bookings/${id}`),
    update: (id: string, data: any) => apiClient.put(`/bookings/${id}`, data),
    cancel: (id: string) => apiClient.post(`/bookings/${id}/cancel`),
  },

  // Payments
  payments: {
    create: <T = any>(data: any) => apiClient.post<T>('/payments/ssl/create', data),
    initSsl: (data: { bookingId: string }) => apiClient.post<{ gatewayUrl: string; sessionKey: string }>('/payments/ssl/init', data),
    verify: <T = any>(params: { val_id: string; tran_id: string }) =>
      apiClient.post<T>('/payments/ssl/verify', params),
    status: <T = any>(transactionId: string) => apiClient.get<T>(`/payments/status/${transactionId}`),
  },

  // Uploads
  uploads: {
    image: (file: File, isPublic: boolean = false) => apiClient.upload('/uploads/image', file, isPublic),
    delete: (filename: string) => apiClient.delete(`/uploads/image/${filename}`),
    // Room images
    roomImages: <T = any>(roomId: string, files: File[]) => apiClient.uploadMultiple<T>(`/uploads/rooms/${roomId}/images`, files),
    deleteRoomImages: <T = any>(roomId: string, imageUrls: string[]) => apiClient.post<T>(`/uploads/rooms/${roomId}/images`, { imageUrls }),
  },

  // Chat
  chat: {
    getThreadIds: () => apiClient.get('/chat/threads/ids'),
    getThreads: (params?: any) => apiClient.get('/chat/threads', { params }),
    createThread: (data: any) => apiClient.post('/chat/threads', data),
    sendMessage: (data: any) => apiClient.post('/chat/messages', data),
    getMessages: (threadId: string, params?: any) => apiClient.get(`/chat/threads/${threadId}/messages`, { params }),
  },

  // Admin endpoints
  admin: {
    stats: () => apiClient.get('/admin/stats'),
    hosts: (params?: { page?: number; limit?: number; status?: string }) =>
      apiClient.get('/admin/hosts', { page: params?.page ?? 1, limit: params?.limit ?? 20, status: params?.status }),
    bookings: (params?: { page?: number; limit?: number; status?: string; from?: string; to?: string }) =>
      apiClient.get('/admin/bookings', params),
    rooms: () => apiClient.get('/admin/rooms'),
    approveHost: (id: string, data: any) => apiClient.post(`/admin/hosts/${id}/approve`, data),
    rejectHost: (id: string, data: any) => apiClient.post(`/admin/hosts/${id}/reject`, data),
    approveRoom: (id: string, data: any) => apiClient.post(`/admin/rooms/${id}/approve`, data),
    rejectRoom: (id: string, data: any) => apiClient.post(`/admin/rooms/${id}/reject`, data),
    accounts: {
      summary: (params?: { from?: string; to?: string }) => apiClient.get('/accounts/summary', params),
      ledger: (params?: { from?: string; to?: string }) => apiClient.get('/accounts/ledger', params),
      addSpend: (data: { amountTk: number; note: string }) => apiClient.post('/accounts/spend', data),
      addAdjustment: (data: { amountTk: number; note: string }) => apiClient.post('/accounts/adjustment', data),
    },
    users: (params?: { page?: number; limit?: number }) => apiClient.get('/admin/users', params),
    payouts: {
      list: (params?: { page?: number; limit?: number; status?: string }) => apiClient.get('/admin/payouts', params),
      approve: (id: string, data?: any) => apiClient.post(`/admin/payouts/${id}/approve`, data),
      reject: (id: string, data?: any) => apiClient.post(`/admin/payouts/${id}/reject`, data),
    },
  },

  // Host endpoints
  hosts: {
    stats: () => apiClient.get('/hosts/stats'),
    rooms: () => apiClient.get('/hosts/rooms'),
    bookings: () => apiClient.get('/hosts/bookings'),
    profile: () => apiClient.get('/hosts/me'),
    updateProfile: (data: any) => apiClient.put('/hosts/me', data),
    createRoom: (data: any) => apiClient.post('/rooms', data),
    updateRoom: (id: string, data: any) => apiClient.put(`/rooms/${id}`, data),
    deleteRoom: (id: string) => apiClient.delete(`/rooms/${id}`),
    getUnavailableDates: <T = any>() => apiClient.get<T>('/hosts/rooms/unavailable'),
    setUnavailable: (id: string, data: { dates: string[] }) => apiClient.post(`/rooms/${id}/unavailable`, data),
    removeUnavailable: (id: string, data: { dates: string[] }) => apiClient.deleteWithBody(`/rooms/${id}/unavailable`, data),
    balance: <T = any>() => apiClient.get<T>('/hosts/balance'),
    transactions: <T = any>(params?: { page?: number; limit?: number }) => apiClient.get<T>('/hosts/transactions', params),
    apply: (data: {
      displayName: string;
      phone: string;
      whatsapp: string;
      locationName: string;
      locationMapUrl: string;
      nidFrontUrl: string;
      nidBackUrl: string;
    }) => apiClient.post('/hosts/apply', data),
  },

  // Messages
  messages: {
    getThreads: <T = any>(params?: { page?: number; limit?: number }) =>
      apiClient.get<T>('/messages/threads', params),
    getThreadMessages: <T = any>(threadId: string, params?: { page?: number; limit?: number }) =>
      apiClient.get<T>(`/messages/threads/${threadId}`, params),
    sendMessage: (threadId: string, data: { text: string }) =>
      apiClient.post(`/messages/threads/${threadId}`, data),
    createThread: (data: { roomId: string; userId: string }) =>
      apiClient.post('/messages/threads', data),
  },

  // Reviews
  reviews: {
    create: (data: { bookingId: string; rating: number; comment: string }) =>
      apiClient.post('/reviews', data),
    getRoomReviews: <T = any>(roomId: string, params?: { page?: number; limit?: number }) =>
      apiClient.get<T>(`/reviews/room/${roomId}`, params),
    getMyReviews: <T = any>(params?: { page?: number; limit?: number }) =>
      apiClient.get<T>('/reviews/my', params),
    checkBookingReview: <T = any>(bookingId: string) =>
      apiClient.get<T>(`/reviews/booking/${bookingId}`),
  },

  // Payouts
  payouts: {
    getMine: <T = any>(params?: { page?: number; limit?: number; status?: string }) =>
      apiClient.get<T>('/payouts/mine', params),
    request: (data: any) => apiClient.post('/payouts/request', data),
    get: <T = any>(id: string) => apiClient.get<T>(`/payouts/${id}`),
  },

  // Blogs (Public)
  blogs: {
    getAll: <T = any>(params?: { category?: string; tag?: string; page?: number; limit?: number }) =>
      apiClient.get<T>('/blogs', params),
    getBySlug: <T = any>(slug: string) =>
      apiClient.get<T>(`/blogs/slug/${slug}`),
  },

  // Blogs (Admin)
  adminBlogs: {
    getAll: <T = any>(params?: { published?: boolean; category?: string; page?: number; limit?: number }) =>
      apiClient.get<T>('/blogs/admin/all', params),
    getById: <T = any>(id: string) =>
      apiClient.get<T>(`/blogs/admin/${id}`),
    create: (data: {
      title: string;
      slug?: string;
      excerpt: string;
      content: string;
      image: { url: string; width?: number; height?: number };
      author?: { name: string; avatar?: string };
      category: string;
      tags?: string[];
      published?: boolean;
    }) => apiClient.post('/blogs/admin', data),
    update: (id: string, data: any) =>
      apiClient.put(`/blogs/admin/${id}`, data),
    delete: (id: string) =>
      apiClient.delete(`/blogs/admin/${id}`),
    togglePublish: (id: string, published: boolean) =>
      apiClient.patch(`/blogs/admin/${id}/publish`, { published }),
  },
};
