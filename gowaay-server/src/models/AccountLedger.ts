import mongoose, { Document, Schema } from 'mongoose';

export interface IAccountLedger extends Document {
  type: 'commission' | 'payout' | 'spend' | 'adjustment';
  ref?: {
    bookingId?: mongoose.Types.ObjectId;
    payoutRequestId?: mongoose.Types.ObjectId;
  };
  amountTk: number;
  note: string;
  at: Date;
}

const accountLedgerSchema = new Schema<IAccountLedger>({
  type: {
    type: String,
    enum: ['commission', 'payout', 'spend', 'adjustment'],
    required: [true, 'Ledger type is required']
  },
  ref: {
    bookingId: {
      type: Schema.Types.ObjectId,
      ref: 'Booking'
    },
    payoutRequestId: {
      type: Schema.Types.ObjectId,
      ref: 'PayoutRequest'
    }
  },
  amountTk: {
    type: Number,
    required: [true, 'Amount is required']
  },
  note: {
    type: String,
    required: [true, 'Note is required'],
    trim: true,
    maxlength: [500, 'Note cannot exceed 500 characters']
  },
  at: {
    type: Date,
    required: [true, 'Date is required'],
    default: Date.now
  }
}, {
  timestamps: false
});

// Indexes
accountLedgerSchema.index({ type: 1 });
accountLedgerSchema.index({ at: -1 });
accountLedgerSchema.index({ 'ref.bookingId': 1 });
accountLedgerSchema.index({ 'ref.payoutRequestId': 1 });
accountLedgerSchema.index({ amountTk: 1 });

// Compound index for financial reporting
accountLedgerSchema.index({ type: 1, at: -1 });

export const AccountLedger = mongoose.model<IAccountLedger>('AccountLedger', accountLedgerSchema);
