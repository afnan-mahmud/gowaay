'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import BlogForm from '@/components/admin/BlogForm';

export default function NewBlogPage() {
  const router = useRouter();
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (data: any) => {
    try {
      setSaving(true);
      const response = await api.adminBlogs.create(data);
      
      if (response.success) {
        router.push('/admin/blogs');
      } else {
        alert(response.error || 'Failed to create blog');
      }
    } catch (error) {
      console.error('Failed to create blog:', error);
      alert('Failed to create blog');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-5xl">
      {/* Header */}
      <div className="mb-8">
        <Link href="/admin/blogs">
          <Button variant="ghost" className="mb-4">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Blogs
          </Button>
        </Link>
        <h1 className="text-3xl font-bold text-gray-900">Create New Blog Post</h1>
        <p className="text-gray-600 mt-1">Write and publish a new blog article</p>
      </div>

      {/* Form */}
      <BlogForm onSubmit={handleSubmit} saving={saving} />
    </div>
  );
}

