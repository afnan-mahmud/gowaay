import mongoose, { Document, Schema } from 'mongoose';

export interface IPayoutRequest extends Document {
  hostId: mongoose.Types.ObjectId;
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
  createdAt: Date;
  updatedAt: Date;
}

const payoutRequestSchema = new Schema<IPayoutRequest>({
  hostId: {
    type: Schema.Types.ObjectId,
    ref: 'HostProfile',
    required: [true, 'Host ID is required']
  },
  method: {
    type: {
      type: String,
      enum: ['bkash', 'nagad', 'bank'],
      required: [true, 'Payout method type is required']
    },
    subtype: {
      type: String,
      enum: ['personal', 'merchant', 'agent']
    },
    accountNo: {
      type: String,
      trim: true,
      required: function() {
        return this.method.type === 'bkash' || this.method.type === 'nagad';
      }
    },
    bankFields: {
      bankName: {
        type: String,
        trim: true,
        required: function() {
          return this.method.type === 'bank';
        }
      },
      branchName: {
        type: String,
        trim: true,
        required: function() {
          return this.method.type === 'bank';
        }
      },
      accountHolderName: {
        type: String,
        trim: true,
        required: function() {
          return this.method.type === 'bank';
        }
      },
      routingNumber: {
        type: String,
        trim: true
      }
    }
  },
  amountTk: {
    type: Number,
    required: [true, 'Amount is required'],
    min: [100, 'Minimum payout amount is 100 Tk']
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending'
  }
}, {
  timestamps: true
});

// Indexes
payoutRequestSchema.index({ hostId: 1 });
payoutRequestSchema.index({ status: 1 });
payoutRequestSchema.index({ 'method.type': 1 });
payoutRequestSchema.index({ createdAt: -1 });
payoutRequestSchema.index({ amountTk: 1 });

export const PayoutRequest = mongoose.model<IPayoutRequest>('PayoutRequest', payoutRequestSchema);
