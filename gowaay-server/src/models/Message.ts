import mongoose, { Document, Schema } from 'mongoose';

export interface IMessage extends Document {
  threadId: mongoose.Types.ObjectId;
  senderRole: 'guest' | 'host' | 'admin';
  text: string;
  blocked: boolean;
  reason?: 'contact-info';
  createdAt: Date;
}

const messageSchema = new Schema<IMessage>({
  threadId: {
    type: Schema.Types.ObjectId,
    ref: 'MessageThread',
    required: [true, 'Thread ID is required']
  },
  senderRole: {
    type: String,
    enum: ['guest', 'host', 'admin'],
    required: [true, 'Sender role is required']
  },
  text: {
    type: String,
    required: [true, 'Message text is required'],
    trim: true,
    maxlength: [1000, 'Message cannot exceed 1000 characters']
  },
  blocked: {
    type: Boolean,
    default: false
  },
  reason: {
    type: String,
    enum: ['contact-info'],
    required: function() {
      return this.blocked === true;
    }
  }
}, {
  timestamps: { createdAt: true, updatedAt: false }
});

// Indexes
messageSchema.index({ threadId: 1 });
messageSchema.index({ senderRole: 1 });
messageSchema.index({ blocked: 1 });
messageSchema.index({ createdAt: -1 });

// Compound index for thread messages
messageSchema.index({ threadId: 1, createdAt: -1 });

export const Message = mongoose.model<IMessage>('Message', messageSchema);
