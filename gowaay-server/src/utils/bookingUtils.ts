import { Booking, IBooking } from '../models/Booking';
import mongoose from 'mongoose';

/**
 * Check if a booking overlaps with existing pending or confirmed bookings
 * @param roomId - The room ID to check
 * @param checkIn - Check-in date
 * @param checkOut - Check-out date
 * @returns Promise<boolean> - true if there's an overlap, false otherwise
 */
export async function hasOverlap(
  roomId: string,
  checkIn: Date,
  checkOut: Date,
  excludeBookingId?: string
): Promise<boolean> {
  const query: Record<string, unknown> = {
    roomId,
    status: { $in: ['pending', 'confirmed'] },
    $expr: {
      $and: [
        { $lt: ['$checkIn', checkOut] },
        { $gt: ['$checkOut', checkIn] }
      ]
    }
  };

  if (excludeBookingId) {
    query._id = { $ne: new mongoose.Types.ObjectId(excludeBookingId) };
  }

  const overlap = await Booking.exists(query);
  return !!overlap;
}

/**
 * Check if a booking overlaps with existing confirmed bookings for a room
 * @param roomId - The room ID to check
 * @param checkIn - Check-in date
 * @param checkOut - Check-out date
 * @param excludeBookingId - Optional booking ID to exclude from overlap check (for updates)
 * @returns Promise<boolean> - true if there's an overlap, false otherwise
 */
export async function checkBookingOverlap(
  roomId: mongoose.Types.ObjectId,
  checkIn: Date,
  checkOut: Date,
  excludeBookingId?: mongoose.Types.ObjectId
): Promise<boolean> {
  const query: any = {
    roomId,
    status: { $in: ['pending', 'confirmed'] },
    $expr: {
      $and: [
        { $lt: ['$checkIn', checkOut] },
        { $gt: ['$checkOut', checkIn] }
      ]
    }
  };
  
  if (excludeBookingId) {
    query._id = { $ne: excludeBookingId };
  }
  
  const overlap = await Booking.exists(query);
  return !!overlap;
}

/**
 * Get all overlapping bookings for a room within a date range
 * @param roomId - The room ID to check
 * @param checkIn - Check-in date
 * @param checkOut - Check-out date
 * @returns Promise<IBooking[]> - Array of overlapping bookings
 */
export async function getOverlappingBookings(
  roomId: mongoose.Types.ObjectId,
  checkIn: Date,
  checkOut: Date
): Promise<IBooking[]> {
  return Booking.find({
    roomId,
    status: 'confirmed',
    checkIn: { $lt: checkOut },
    checkOut: { $gt: checkIn }
  }).sort({ checkIn: 1 });
}

/**
 * Get available dates for a room (excluding unavailable dates and confirmed bookings)
 * @param roomId - The room ID
 * @param startDate - Start date to check from
 * @param endDate - End date to check to
 * @returns Promise<string[]> - Array of available dates in YYYY-MM-DD format
 */
export async function getAvailableDates(
  roomId: mongoose.Types.ObjectId,
  startDate: Date,
  endDate: Date
): Promise<string[]> {
  const room = await mongoose.model('Room').findById(roomId);
  if (!room) {
    throw new Error('Room not found');
  }

  const unavailableDates = new Set(room.unavailableDates);
  const confirmedBookings = await Booking.find({
    roomId,
    status: 'confirmed',
    checkIn: { $lt: endDate },
    checkOut: { $gt: startDate }
  });

  // Add all dates from confirmed bookings to unavailable set
  confirmedBookings.forEach(booking => {
    const current = new Date(booking.checkIn);
    const checkout = new Date(booking.checkOut);
    
    while (current < checkout) {
      unavailableDates.add(current.toISOString().split('T')[0]);
      current.setDate(current.getDate() + 1);
    }
  });

  // Generate available dates
  const availableDates: string[] = [];
  const current = new Date(startDate);
  
  while (current <= endDate) {
    const dateStr = current.toISOString().split('T')[0];
    if (!unavailableDates.has(dateStr)) {
      availableDates.push(dateStr);
    }
    current.setDate(current.getDate() + 1);
  }

  return availableDates;
}
