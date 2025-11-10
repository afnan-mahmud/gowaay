import mongoose, { Document, Schema } from 'mongoose';

export interface IRoom extends Document {
  hostId: mongoose.Types.ObjectId;
  title: string;
  description: string;
  address: string;
  locationName: string;
  locationMapUrl?: string;
  geo?: {
    lat: number;
    lng: number;
  };
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
  averageRating: number;
  totalReviews: number;
  createdAt: Date;
  updatedAt: Date;
}

const roomSchema = new Schema<IRoom>({
  hostId: {
    type: Schema.Types.ObjectId,
    ref: 'HostProfile',
    required: [true, 'Host ID is required']
  },
  title: {
    type: String,
    required: [true, 'Room title is required'],
    trim: true,
    minlength: [5, 'Title must be at least 5 characters long'],
    maxlength: [200, 'Title cannot exceed 200 characters']
  },
  description: {
    type: String,
    required: [true, 'Room description is required'],
    trim: true,
    minlength: [20, 'Description must be at least 20 characters long'],
    maxlength: [2000, 'Description cannot exceed 2000 characters']
  },
  address: {
    type: String,
    required: [true, 'Address is required'],
    trim: true,
    maxlength: [500, 'Address cannot exceed 500 characters']
  },
  locationName: {
    type: String,
    required: [true, 'Location name is required'],
    trim: true,
    maxlength: [200, 'Location name cannot exceed 200 characters']
  },
  locationMapUrl: {
    type: String,
    required: false,
    trim: true,
    match: [/^https?:\/\/.+/, 'Please provide a valid map URL']
  },
  geo: {
    lat: {
      type: Number,
      min: -90,
      max: 90
    },
    lng: {
      type: Number,
      min: -180,
      max: 180
    }
  },
  roomType: {
    type: String,
    required: [true, 'Room type is required'],
    enum: ['single', 'double', 'family', 'suite', 'other']
  },
  amenities: [{
    type: String,
    trim: true
  }],
  basePriceTk: {
    type: Number,
    required: [true, 'Base price is required'],
    min: [0, 'Base price cannot be negative']
  },
  commissionTk: {
    type: Number,
    default: 0,
    min: [0, 'Commission cannot be negative']
  },
  totalPriceTk: {
    type: Number,
    required: [true, 'Total price is required'],
    min: [0, 'Total price cannot be negative']
  },
  images: [{
    url: {
      type: String,
      required: true,
      trim: true
    },
    w: {
      type: Number,
      required: true,
      min: 1
    },
    h: {
      type: Number,
      required: true,
      min: 1
    }
  }],
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending'
  },
  instantBooking: {
    type: Boolean,
    default: false
  },
  unavailableDates: [{
    type: String,
    match: [/^\d{4}-\d{2}-\d{2}$/, 'Date must be in YYYY-MM-DD format']
  }],
  averageRating: {
    type: Number,
    default: 0,
    min: [0, 'Rating cannot be negative'],
    max: [5, 'Rating cannot exceed 5']
  },
  totalReviews: {
    type: Number,
    default: 0,
    min: [0, 'Total reviews cannot be negative']
  }
}, {
  timestamps: true
});

// Compound text index for search
roomSchema.index({
  title: 'text',
  description: 'text',
  address: 'text',
  locationName: 'text'
});

// Other indexes
roomSchema.index({ hostId: 1 });
roomSchema.index({ status: 1 });
roomSchema.index({ roomType: 1 });
roomSchema.index({ totalPriceTk: 1 });
roomSchema.index({ instantBooking: 1 });
roomSchema.index({ createdAt: -1 });
roomSchema.index({ geo: '2dsphere' });

// Validation for max 15 images
roomSchema.pre('save', function(next) {
  if (this.images.length > 15) {
    next(new Error('Maximum 15 images allowed'));
  } else {
    next();
  }
});

// Auto-calculate total price
roomSchema.pre('save', function(next) {
  this.totalPriceTk = this.basePriceTk + this.commissionTk;
  next();
});

export const Room = mongoose.model<IRoom>('Room', roomSchema);
