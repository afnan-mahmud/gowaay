'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { api } from '@/lib/api';

interface BlogPost {
  _id: string;
  title: string;
  slug: string;
  excerpt: string;
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
  publishedAt: string;
}

interface BlogSectionProps {
  className?: string;
}

export function BlogSection({ className }: BlogSectionProps) {
  const [blogPosts, setBlogPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadBlogs();
  }, []);

  const loadBlogs = async () => {
    try {
      setLoading(true);
      const response = await api.blogs.getAll({ limit: 4 });
      if (response.success && response.data) {
        setBlogPosts(response.data.blogs || []);
      }
    } catch (error) {
      console.error('Failed to load blogs:', error);
    } finally {
      setLoading(false);
    }
  };

  // Calculate read time based on excerpt length (rough estimation)
  const calculateReadTime = (excerpt: string): string => {
    const wordsPerMinute = 200;
    const words = excerpt.split(' ').length;
    const minutes = Math.ceil(words / wordsPerMinute);
    return `${Math.max(3, minutes)} min read`;
  };

  if (loading) {
    return (
      <section className={`py-10 md:py-16 bg-gray-50 ${className}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8 md:mb-12">
            <h2 className="text-2xl md:text-3xl xl:text-4xl font-bold text-gray-900 mb-4">
              GoWaay Stories & Blogs
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Read insights, travel guides and tips from our community
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="bg-white rounded-xl shadow-md overflow-hidden animate-pulse">
                <div className="h-48 bg-gray-200"></div>
                <div className="p-6">
                  <div className="h-4 bg-gray-200 rounded mb-3"></div>
                  <div className="h-6 bg-gray-200 rounded mb-3"></div>
                  <div className="h-4 bg-gray-200 rounded mb-4"></div>
                  <div className="h-10 bg-gray-200 rounded"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (blogPosts.length === 0) {
    return null; // Don't show section if no blogs
  }

  return (
    <section className={`py-10 md:py-16 bg-gray-50 ${className}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-8 md:mb-12">
          <h2 className="text-2xl md:text-3xl xl:text-4xl font-bold text-gray-900 mb-4">
            GoWaay Stories & Blogs
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Read insights, travel guides and tips from our community
          </p>
        </div>

        {/* Blog Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
          {blogPosts.map((post) => (
            <Link key={post._id} href={`/blog/${post.slug}`}>
              <article className="bg-white rounded-xl shadow-md hover:shadow-lg transition-shadow duration-300 overflow-hidden group cursor-pointer">
                {/* Image */}
                <div className="relative h-48 overflow-hidden">
                  <Image
                    src={post.image.url}
                    alt={post.title}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                    sizes="(max-width: 768px) 100vw, 50vw"
                  />
                  <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm rounded-full px-3 py-1">
                    <span className="text-sm font-medium text-gray-700">{calculateReadTime(post.excerpt)}</span>
                  </div>
                  <div className="absolute top-4 right-4 bg-brand/90 backdrop-blur-sm rounded-full px-3 py-1">
                    <span className="text-xs font-medium text-white">{post.category}</span>
                  </div>
                </div>

                {/* Content */}
                <div className="p-6">
                  <h3 className="text-xl font-semibold text-gray-900 mb-3 line-clamp-2 group-hover:text-brand transition-colors">
                    {post.title}
                  </h3>
                  
                  <p className="text-gray-600 mb-4 line-clamp-3">
                    {post.excerpt}
                  </p>

                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-500">
                      {new Date(post.publishedAt).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </span>
                    
                    <Button
                      variant="outline"
                      size="sm"
                      className="group/btn hover:bg-brand hover:text-white hover:border-brand transition-all duration-200"
                      asChild
                    >
                      <span>
                        Read More
                        <ArrowRight className="h-4 w-4 ml-2 group-hover/btn:translate-x-1 transition-transform" />
                      </span>
                    </Button>
                  </div>
                </div>
              </article>
            </Link>
          ))}
        </div>

        {/* View All Button */}
        <div className="text-center">
          <Link href="/blogs">
            <Button
              size="lg"
              variant="outline"
              className="group hover:bg-brand hover:text-white hover:border-brand transition-all duration-200"
            >
              View All Stories
              <ArrowRight className="h-5 w-5 ml-2 group-hover:translate-x-1 transition-transform" />
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
}
