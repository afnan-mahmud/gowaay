import mongoose, { Document, Schema } from 'mongoose';

export interface IBooking extends Document {
  roomId: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  hostId: mongoose.Types.ObjectId;
  checkIn: Date;
  checkOut: Date;
  guests: number;
  mode: 'instant' | 'request';
  status: 'pending' | 'confirmed' | 'cancelled' | 'rejected';
  transactionId: string;
  paymentStatus: 'unpaid' | 'paid' | 'refunded';
  amountTk: number;
  hasReview: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const bookingSchema = new Schema<IBooking>({
  roomId: {
    type: Schema.Types.ObjectId,
    ref: 'Room',
    required: [true, 'Room ID is required']
  },
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User ID is required']
  },
  hostId: {
    type: Schema.Types.ObjectId,
    ref: 'HostProfile',
    required: [true, 'Host ID is required']
  },
  checkIn: {
    type: Date,
    required: [true, 'Check-in date is required']
  },
  checkOut: {
    type: Date,
    required: [true, 'Check-out date is required']
  },
  guests: {
    type: Number,
    required: [true, 'Number of guests is required'],
    min: [1, 'At least 1 guest is required'],
    max: [20, 'Maximum 20 guests allowed']
  },
  mode: {
    type: String,
    enum: ['instant', 'request'],
    required: [true, 'Booking mode is required']
  },
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'cancelled', 'rejected'],
    default: 'pending'
  },
  transactionId: {
    type: String,
    required: [true, 'Transaction ID is required'],
    trim: true
  },
  paymentStatus: {
    type: String,
    enum: ['unpaid', 'paid', 'refunded'],
    default: 'unpaid'
  },
  amountTk: {
    type: Number,
    required: [true, 'Amount is required'],
    min: [0, 'Amount cannot be negative']
  },
  hasReview: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

// Indexes
bookingSchema.index({ roomId: 1 });
bookingSchema.index({ userId: 1 });
bookingSchema.index({ hostId: 1 });
bookingSchema.index({ status: 1 });
bookingSchema.index({ paymentStatus: 1 });
bookingSchema.index({ checkIn: 1, checkOut: 1 });
bookingSchema.index({ createdAt: -1 });
bookingSchema.index({ transactionId: 1 });

// Compound index for overlap checking
bookingSchema.index({ roomId: 1, checkIn: 1, checkOut: 1 });

// Validation: check-out must be after check-in
bookingSchema.pre('save', function(next) {
  if (this.checkOut <= this.checkIn) {
    next(new Error('Check-out date must be after check-in date'));
  } else {
    next();
  }
});

// Static method to check for overlapping bookings
bookingSchema.statics.checkOverlap = async function(
  roomId: mongoose.Types.ObjectId,
  checkIn: Date,
  checkOut: Date,
  excludeBookingId?: mongoose.Types.ObjectId
) {
  const query: any = {
    roomId,
    status: 'confirmed',
    checkIn: { $lt: checkOut },
    checkOut: { $gt: checkIn }
  };

  if (excludeBookingId) {
    query._id = { $ne: excludeBookingId };
  }

  return this.findOne(query);
};

export const Booking = mongoose.model<IBooking>('Booking', bookingSchema);
