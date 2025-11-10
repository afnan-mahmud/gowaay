import mongoose, { Schema, Document } from 'mongoose';

export interface IBlog extends Document {
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  image: {
    url: string;
    width: number;
    height: number;
  };
  author: {
    name: string;
    avatar?: string;
  };
  category: string;
  tags: string[];
  published: boolean;
  publishedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const blogSchema = new Schema<IBlog>(
  {
    title: {
      type: String,
      required: [true, 'Title is required'],
      trim: true,
      maxlength: [200, 'Title cannot exceed 200 characters'],
    },
    slug: {
      type: String,
      required: [true, 'Slug is required'],
      unique: true,
      trim: true,
      lowercase: true,
    },
    excerpt: {
      type: String,
      required: [true, 'Excerpt is required'],
      trim: true,
      maxlength: [500, 'Excerpt cannot exceed 500 characters'],
    },
    content: {
      type: String,
      required: [true, 'Content is required'],
    },
    image: {
      url: {
        type: String,
        required: [true, 'Image URL is required'],
      },
      width: {
        type: Number,
        default: 1200,
      },
      height: {
        type: Number,
        default: 630,
      },
    },
    author: {
      name: {
        type: String,
        required: [true, 'Author name is required'],
        default: 'GoWaay Team',
      },
      avatar: {
        type: String,
        default: '',
      },
    },
    category: {
      type: String,
      required: [true, 'Category is required'],
      enum: ['Travel Tips', 'Accommodation Guide', 'Local Insights', 'News', 'Other'],
      default: 'Other',
    },
    tags: {
      type: [String],
      default: [],
    },
    published: {
      type: Boolean,
      default: false,
    },
    publishedAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
blogSchema.index({ slug: 1 });
blogSchema.index({ published: 1, publishedAt: -1 });
blogSchema.index({ category: 1 });
blogSchema.index({ tags: 1 });

// Pre-save hook to set publishedAt when published status changes
blogSchema.pre('save', function (next) {
  if (this.isModified('published') && this.published && !this.publishedAt) {
    this.publishedAt = new Date();
  }
  next();
});

export const Blog = mongoose.model<IBlog>('Blog', blogSchema);

