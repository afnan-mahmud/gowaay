import mongoose, { Document, Schema } from 'mongoose';

export interface IPaymentTransaction extends Document {
  bookingId: mongoose.Types.ObjectId;
  gateway: 'sslcommerz';
  sslSessionKey?: string;
  valId?: string;
  amountTk: number;
  status: 'pending' | 'completed' | 'failed' | 'cancelled';
  raw: any;
  createdAt: Date;
  updatedAt: Date;
}

const paymentTransactionSchema = new Schema<IPaymentTransaction>({
  bookingId: {
    type: Schema.Types.ObjectId,
    ref: 'Booking',
    required: [true, 'Booking ID is required']
  },
  gateway: {
    type: String,
    enum: ['sslcommerz'],
    required: [true, 'Payment gateway is required']
  },
  sslSessionKey: {
    type: String,
    required: false,
    trim: true
  },
  valId: {
    type: String,
    required: false,
    trim: true
  },
  amountTk: {
    type: Number,
    required: [true, 'Amount is required'],
    min: [0, 'Amount cannot be negative']
  },
  status: {
    type: String,
    enum: ['pending', 'completed', 'failed', 'cancelled'],
    default: 'pending'
  },
  raw: {
    type: Schema.Types.Mixed,
    default: {}
  }
}, {
  timestamps: true
});

// Indexes
paymentTransactionSchema.index({ bookingId: 1 });
paymentTransactionSchema.index({ gateway: 1 });
paymentTransactionSchema.index({ status: 1 });
paymentTransactionSchema.index({ sslSessionKey: 1 });
paymentTransactionSchema.index({ valId: 1 });
paymentTransactionSchema.index({ createdAt: -1 });

export const PaymentTransaction = mongoose.model<IPaymentTransaction>('PaymentTransaction', paymentTransactionSchema);