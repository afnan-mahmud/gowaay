import mongoose, { Document, Schema } from 'mongoose';

export interface IHostProfile extends Document {
  userId: mongoose.Types.ObjectId;
  displayName: string;
  phone: string;
  whatsapp: string;
  locationName: string;
  locationMapUrl: string;
  nidFrontUrl: string;
  nidBackUrl: string;
  status: 'pending' | 'approved' | 'rejected';
  propertyCount: number;
  createdAt: Date;
  updatedAt: Date;
}

const hostProfileSchema = new Schema<IHostProfile>({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User ID is required'],
    unique: true
  },
  displayName: {
    type: String,
    required: [true, 'Display name is required'],
    trim: true,
    minlength: [2, 'Display name must be at least 2 characters long'],
    maxlength: [100, 'Display name cannot exceed 100 characters']
  },
  phone: {
    type: String,
    required: [true, 'Phone number is required'],
    trim: true,
    match: [/^[0-9+\-\s()]+$/, 'Please provide a valid phone number']
  },
  whatsapp: {
    type: String,
    required: [true, 'WhatsApp number is required'],
    trim: true,
    match: [/^[0-9+\-\s()]+$/, 'Please provide a valid WhatsApp number']
  },
  locationName: {
    type: String,
    required: [true, 'Location name is required'],
    trim: true,
    maxlength: [200, 'Location name cannot exceed 200 characters']
  },
  locationMapUrl: {
    type: String,
    required: [true, 'Location map URL is required'],
    trim: true,
    match: [/^https?:\/\/.+/, 'Please provide a valid map URL']
  },
  nidFrontUrl: {
    type: String,
    required: [true, 'NID front image URL is required'],
    trim: true
  },
  nidBackUrl: {
    type: String,
    required: [true, 'NID back image URL is required'],
    trim: true
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending'
  },
  propertyCount: {
    type: Number,
    default: 0,
    min: [0, 'Property count cannot be negative']
  }
}, {
  timestamps: true
});

// Indexes
hostProfileSchema.index({ userId: 1 }, { unique: true });
hostProfileSchema.index({ status: 1 });
hostProfileSchema.index({ createdAt: -1 });
hostProfileSchema.index({ locationName: 'text' });

export const HostProfile = mongoose.model<IHostProfile>('HostProfile', hostProfileSchema);
