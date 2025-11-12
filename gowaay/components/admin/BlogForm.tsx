'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import Image from 'next/image';
import { Upload, X } from 'lucide-react';
import { toast } from 'sonner';

interface BlogFormProps {
  onSubmit: (data: any) => void;
  saving: boolean;
  initialData?: any;
}

const CATEGORIES = [
  'Travel Tips',
  'Accommodation Guide',
  'Local Insights',
  'News',
  'Other',
];

export default function BlogForm({ onSubmit, saving, initialData }: BlogFormProps) {
  const [formData, setFormData] = useState({
    title: '',
    slug: '',
    excerpt: '',
    content: '',
    imageUrl: '',
    imageWidth: 1200,
    imageHeight: 630,
    authorName: 'GoWaay Team',
    authorAvatar: '',
    category: 'Other',
    tags: '',
    published: false,
  });

  useEffect(() => {
    if (initialData) {
      setFormData({
        title: initialData.title || '',
        slug: initialData.slug || '',
        excerpt: initialData.excerpt || '',
        content: initialData.content || '',
        imageUrl: initialData.image?.url || '',
        imageWidth: initialData.image?.width || 1200,
        imageHeight: initialData.image?.height || 630,
        authorName: initialData.author?.name || 'GoWaay Team',
        authorAvatar: initialData.author?.avatar || '',
        category: initialData.category || 'Other',
        tags: initialData.tags?.join(', ') || '',
        published: initialData.published || false,
      });
    }
  }, [initialData]);

  const handleChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Auto-generate slug from title
    if (field === 'title' && !initialData) {
      const slug = value
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');
      setFormData(prev => ({ ...prev, slug }));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate required fields
    if (!formData.title || !formData.slug || !formData.excerpt || !formData.content || !formData.imageUrl) {
      toast.error('Please fill in all required fields');
      return;
    }

    // Convert tags string to array
    const tags = formData.tags
      .split(',')
      .map(tag => tag.trim())
      .filter(tag => tag.length > 0);

    const data = {
      title: formData.title,
      slug: formData.slug,
      excerpt: formData.excerpt,
      content: formData.content,
      image: {
        url: formData.imageUrl,
        width: formData.imageWidth,
        height: formData.imageHeight,
      },
      author: {
        name: formData.authorName,
        avatar: formData.authorAvatar,
      },
      category: formData.category,
      tags,
      published: formData.published,
    };

    onSubmit(data);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* Main Content Section */}
      <div className="bg-white rounded-lg shadow-sm p-6 space-y-6">
        <h2 className="text-xl font-semibold text-gray-900">Content</h2>
        
        {/* Title */}
        <div>
          <Label htmlFor="title">
            Title <span className="text-red-500">*</span>
          </Label>
          <Input
            id="title"
            value={formData.title}
            onChange={(e) => handleChange('title', e.target.value)}
            placeholder="Enter blog post title"
            required
            className="mt-1"
          />
        </div>

        {/* Slug */}
        <div>
          <Label htmlFor="slug">
            Slug <span className="text-red-500">*</span>
          </Label>
          <Input
            id="slug"
            value={formData.slug}
            onChange={(e) => handleChange('slug', e.target.value)}
            placeholder="blog-post-url"
            required
            className="mt-1"
          />
          <p className="text-sm text-gray-500 mt-1">
            URL-friendly version of the title (lowercase, hyphens)
          </p>
        </div>

        {/* Excerpt */}
        <div>
          <Label htmlFor="excerpt">
            Excerpt <span className="text-red-500">*</span>
          </Label>
          <Textarea
            id="excerpt"
            value={formData.excerpt}
            onChange={(e) => handleChange('excerpt', e.target.value)}
            placeholder="Brief summary of the blog post (max 500 characters)"
            required
            rows={3}
            maxLength={500}
            className="mt-1"
          />
          <p className="text-sm text-gray-500 mt-1">
            {formData.excerpt.length}/500 characters
          </p>
        </div>

        {/* Content */}
        <div>
          <Label htmlFor="content">
            Content <span className="text-red-500">*</span>
          </Label>
          <Textarea
            id="content"
            value={formData.content}
            onChange={(e) => handleChange('content', e.target.value)}
            placeholder="Write your blog post content here..."
            required
            rows={15}
            className="mt-1 font-mono text-sm"
          />
          <p className="text-sm text-gray-500 mt-1">
            You can use markdown formatting
          </p>
        </div>
      </div>

      {/* Featured Image Section */}
      <div className="bg-white rounded-lg shadow-sm p-6 space-y-6">
        <h2 className="text-xl font-semibold text-gray-900">Featured Image</h2>
        
        {/* Image URL */}
        <div>
          <Label htmlFor="imageUrl">
            Image URL <span className="text-red-500">*</span>
          </Label>
          <Input
            id="imageUrl"
            value={formData.imageUrl}
            onChange={(e) => handleChange('imageUrl', e.target.value)}
            placeholder="https://example.com/image.jpg"
            required
            className="mt-1"
          />
          <p className="text-sm text-gray-500 mt-1">
            Upload image to Cloudflare R2 first, then paste URL here
          </p>
        </div>

        {/* Image Preview */}
        {formData.imageUrl && (
          <div className="relative aspect-video w-full max-w-2xl bg-gray-100 rounded-lg overflow-hidden">
            <Image
              src={formData.imageUrl}
              alt="Preview"
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 700px"
            />
          </div>
        )}

        {/* Image Dimensions */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="imageWidth">Width (px)</Label>
            <Input
              id="imageWidth"
              type="number"
              value={formData.imageWidth}
              onChange={(e) => handleChange('imageWidth', parseInt(e.target.value))}
              className="mt-1"
            />
          </div>
          <div>
            <Label htmlFor="imageHeight">Height (px)</Label>
            <Input
              id="imageHeight"
              type="number"
              value={formData.imageHeight}
              onChange={(e) => handleChange('imageHeight', parseInt(e.target.value))}
              className="mt-1"
            />
          </div>
        </div>
      </div>

      {/* Metadata Section */}
      <div className="bg-white rounded-lg shadow-sm p-6 space-y-6">
        <h2 className="text-xl font-semibold text-gray-900">Metadata</h2>
        
        {/* Category */}
        <div>
          <Label htmlFor="category">
            Category <span className="text-red-500">*</span>
          </Label>
          <Select value={formData.category} onValueChange={(value) => handleChange('category', value)}>
            <SelectTrigger className="mt-1">
              <SelectValue placeholder="Select a category" />
            </SelectTrigger>
            <SelectContent>
              {CATEGORIES.map((category) => (
                <SelectItem key={category} value={category}>
                  {category}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Tags */}
        <div>
          <Label htmlFor="tags">Tags</Label>
          <Input
            id="tags"
            value={formData.tags}
            onChange={(e) => handleChange('tags', e.target.value)}
            placeholder="travel, tips, dhaka (comma-separated)"
            className="mt-1"
          />
          <p className="text-sm text-gray-500 mt-1">
            Separate tags with commas
          </p>
        </div>

        {/* Author Name */}
        <div>
          <Label htmlFor="authorName">Author Name</Label>
          <Input
            id="authorName"
            value={formData.authorName}
            onChange={(e) => handleChange('authorName', e.target.value)}
            placeholder="GoWaay Team"
            className="mt-1"
          />
        </div>

        {/* Author Avatar */}
        <div>
          <Label htmlFor="authorAvatar">Author Avatar URL</Label>
          <Input
            id="authorAvatar"
            value={formData.authorAvatar}
            onChange={(e) => handleChange('authorAvatar', e.target.value)}
            placeholder="https://example.com/avatar.jpg (optional)"
            className="mt-1"
          />
        </div>
      </div>

      {/* Publishing Section */}
      <div className="bg-white rounded-lg shadow-sm p-6 space-y-6">
        <h2 className="text-xl font-semibold text-gray-900">Publishing</h2>
        
        {/* Publish Toggle */}
        <div className="flex items-center justify-between">
          <div>
            <Label htmlFor="published">Published</Label>
            <p className="text-sm text-gray-500 mt-1">
              Make this blog post visible to the public
            </p>
          </div>
          <Switch
            id="published"
            checked={formData.published}
            onCheckedChange={(checked) => handleChange('published', checked)}
          />
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-4">
        <Button
          type="submit"
          disabled={saving}
          className="bg-brand hover:bg-brand/90 flex-1"
        >
          {saving ? 'Saving...' : initialData ? 'Update Blog Post' : 'Create Blog Post'}
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={() => window.history.back()}
          disabled={saving}
        >
          Cancel
        </Button>
      </div>
    </form>
  );
}

