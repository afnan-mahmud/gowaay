import { z } from 'zod';

// Auth DTOs
export const registerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(50, 'Name cannot exceed 50 characters'),
  email: z.string().email('Invalid email format'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  phone: z.string().min(1, 'Phone number is required'),
  isHost: z.boolean().optional(),
  hostData: z.object({
    displayName: z.string().optional(),
    phone: z.string().optional(),
    whatsapp: z.string().optional(),
    locationName: z.string().optional(),
    locationMapUrl: z.string().optional(),
    nidFrontUrl: z.string().optional(),
    nidBackUrl: z.string().optional(),
  }).optional(),
});

export const loginSchema = z.object({
  email: z.string().email('Invalid email format'),
  password: z.string().min(1, 'Password is required'),
});

// Host Profile DTOs
export const hostApplySchema = z.object({
  displayName: z.string().min(2, 'Display name must be at least 2 characters').max(100, 'Display name cannot exceed 100 characters'),
  phone: z.string().min(10, 'Phone number must be at least 10 characters'),
  whatsapp: z.string().min(10, 'WhatsApp number must be at least 10 characters'),
  locationName: z.string().min(2, 'Location name is required').max(200, 'Location name cannot exceed 200 characters'),
  locationMapUrl: z.string().url('Invalid map URL'),
  nidFrontUrl: z.string().url('Invalid NID front image URL'),
  nidBackUrl: z.string().url('Invalid NID back image URL'),
});

export const hostApprovalSchema = z.object({
  status: z.enum(['approved', 'rejected']),
  note: z.string().optional(),
});

export const roomApprovalSchema = z.object({
  status: z.enum(['approved', 'rejected']),
  commissionTk: z.number().min(0, 'Commission cannot be negative').optional(),
  note: z.string().optional(),
});

// Room DTOs
export const roomCreateSchema = z.object({
  title: z.string().min(5, 'Title must be at least 5 characters').max(200, 'Title cannot exceed 200 characters'),
  description: z.string().min(20, 'Description must be at least 20 characters').max(2000, 'Description cannot exceed 2000 characters'),
  address: z.string().min(5, 'Address is required').max(500, 'Address cannot exceed 500 characters'),
  locationName: z.string().min(2, 'Location name is required').max(200, 'Location name cannot exceed 200 characters'),
  geo: z.object({
    lat: z.number().min(-90).max(90),
    lng: z.number().min(-180).max(180),
  }).optional(),
  roomType: z.enum(['single', 'double', 'family', 'suite', 'other']),
  amenities: z.array(z.string()).max(20, 'Maximum 20 amenities allowed'),
  basePriceTk: z.number().min(0, 'Base price cannot be negative'),
  images: z.array(z.object({
    url: z.string().url('Invalid image URL'),
    w: z.number().min(1, 'Width must be at least 1'),
    h: z.number().min(1, 'Height must be at least 1'),
  })).min(1, 'At least 1 image is required').max(15, 'Maximum 15 images allowed'),
  instantBooking: z.boolean().default(false),
  unavailableDates: z.array(z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be in YYYY-MM-DD format')).default([]),
});

export const roomUpdateSchema = roomCreateSchema.partial();

// Room Search DTOs
export const roomSearchSchema = z.object({
  q: z.string().optional(),
  location: z.string().optional(),
  minPrice: z.coerce.number().min(0).optional(),
  maxPrice: z.coerce.number().min(0).optional(),
  type: z.enum(['single', 'double', 'family', 'suite', 'other']).optional(),
  sort: z.enum(['price_asc', 'price_desc', 'newest', 'oldest', 'rating']).default('newest'),
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(50).default(20),
});

// Availability DTOs
export const unavailableDatesSchema = z.object({
  dates: z.array(z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be in YYYY-MM-DD format')),
});

// Booking DTOs
export const bookingQuoteSchema = z.object({
  roomId: z.string().min(1, 'Room ID is required'),
  checkIn: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Check-in date must be in YYYY-MM-DD format'),
  checkOut: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Check-out date must be in YYYY-MM-DD format'),
  guests: z.number().min(1, 'At least 1 guest is required').max(20, 'Maximum 20 guests allowed'),
});

export const bookingCreateSchema = z.object({
  roomId: z.string().min(1, 'Room ID is required'),
  checkIn: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Check-in date must be in YYYY-MM-DD format'),
  checkOut: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Check-out date must be in YYYY-MM-DD format'),
  guests: z.number().min(1, 'At least 1 guest is required').max(20, 'Maximum 20 guests allowed'),
  mode: z.enum(['instant', 'request']),
});

export const bookingApprovalSchema = z.object({
  status: z.enum(['confirmed', 'rejected']),
  note: z.string().optional(),
});

// Payment DTOs
export const paymentInitSchema = z.object({
  bookingId: z.string().min(1, 'Booking ID is required'),
});

// Chat DTOs
export const messageCreateSchema = z.object({
  text: z.string().min(1, 'Message text is required').max(1000, 'Message cannot exceed 1000 characters'),
  threadId: z.string().optional(),
  roomId: z.string().optional(),
  userId: z.string().optional(),
  hostId: z.string().optional(),
}).refine(data => data.threadId || (data.roomId && data.userId && data.hostId), {
  message: 'Either threadId or (roomId, userId, hostId) must be provided',
});

// Account DTOs
export const accountSummarySchema = z.object({
  from: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'From date must be in YYYY-MM-DD format').optional(),
  to: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'To date must be in YYYY-MM-DD format').optional(),
});

export const accountSpendSchema = z.object({
  amountTk: z.number().min(0.01, 'Amount must be greater than 0'),
  note: z.string().min(1, 'Note is required').max(500, 'Note cannot exceed 500 characters'),
});

// Payout DTOs
export const payoutRequestSchema = z.object({
  method: z.object({
    type: z.enum(['bkash', 'nagad', 'bank']),
    subtype: z.enum(['personal', 'merchant', 'agent']).optional(),
    accountNo: z.string().optional(),
    bankFields: z.object({
      bankName: z.string().optional(),
      branchName: z.string().optional(),
      accountHolderName: z.string().optional(),
      routingNumber: z.string().optional(),
    }).optional(),
  }),
  amountTk: z.number().min(100, 'Minimum payout amount is 100 Tk'),
});

export const payoutApprovalSchema = z.object({
  status: z.enum(['approved', 'rejected']),
  note: z.string().optional(),
});

// Query DTOs
export const paginationSchema = z.object({
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(20),
});

export const statusFilterSchema = z.object({
  status: z.enum(['pending', 'approved', 'rejected', 'confirmed', 'cancelled', 'completed']).optional(),
});

export const dateRangeSchema = z.object({
  from: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'From date must be in YYYY-MM-DD format').optional(),
  to: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'To date must be in YYYY-MM-DD format').optional(),
});

// Export types
export type RegisterDto = z.infer<typeof registerSchema>;
export type LoginDto = z.infer<typeof loginSchema>;
export type HostApplyDto = z.infer<typeof hostApplySchema>;
export type HostApprovalDto = z.infer<typeof hostApprovalSchema>;
export type RoomCreateDto = z.infer<typeof roomCreateSchema>;
export type RoomUpdateDto = z.infer<typeof roomUpdateSchema>;
export type RoomApprovalDto = z.infer<typeof roomApprovalSchema>;
export type RoomSearchDto = z.infer<typeof roomSearchSchema>;
export type UnavailableDatesDto = z.infer<typeof unavailableDatesSchema>;
export type BookingQuoteDto = z.infer<typeof bookingQuoteSchema>;
export type BookingCreateDto = z.infer<typeof bookingCreateSchema>;
export type BookingApprovalDto = z.infer<typeof bookingApprovalSchema>;
export type PaymentInitDto = z.infer<typeof paymentInitSchema>;
export type MessageCreateDto = z.infer<typeof messageCreateSchema>;
export type AccountSummaryDto = z.infer<typeof accountSummarySchema>;
export type AccountSpendDto = z.infer<typeof accountSpendSchema>;
export type PayoutRequestDto = z.infer<typeof payoutRequestSchema>;
export type PayoutApprovalDto = z.infer<typeof payoutApprovalSchema>;
export type PaginationDto = z.infer<typeof paginationSchema>;
export type StatusFilterDto = z.infer<typeof statusFilterSchema>;
export type DateRangeDto = z.infer<typeof dateRangeSchema>;
