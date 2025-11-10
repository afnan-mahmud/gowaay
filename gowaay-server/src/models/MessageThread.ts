import mongoose, { Document, Schema } from 'mongoose';

export interface IMessageThread extends Document {
  roomId: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  hostId: mongoose.Types.ObjectId;
  lastMessageAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

const messageThreadSchema = new Schema<IMessageThread>({
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
  lastMessageAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Indexes
messageThreadSchema.index({ roomId: 1 });
messageThreadSchema.index({ userId: 1 });
messageThreadSchema.index({ hostId: 1 });
messageThreadSchema.index({ lastMessageAt: -1 });
messageThreadSchema.index({ createdAt: -1 });

// Compound unique index to prevent duplicate threads
messageThreadSchema.index({ roomId: 1, userId: 1 }, { unique: true });

export const MessageThread = mongoose.model<IMessageThread>('MessageThread', messageThreadSchema);
