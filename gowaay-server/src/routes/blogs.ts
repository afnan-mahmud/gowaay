import express from 'express';
import { Blog } from '../models';
import { requireAdmin } from '../middleware/auth';

const router: express.Router = express.Router();

// Get all published blogs (public)
router.get('/', async (req, res) => {
  try {
    const { category, tag, limit = '10', page = '1' } = req.query;
    
    const query: any = { published: true };
    
    if (category) {
      query.category = category;
    }
    
    if (tag) {
      query.tags = tag;
    }
    
    const limitNum = parseInt(limit as string);
    const pageNum = parseInt(page as string);
    const skip = (pageNum - 1) * limitNum;
    
    const [blogs, total] = await Promise.all([
      Blog.find(query)
        .select('-content') // Exclude full content for list view
        .sort({ publishedAt: -1 })
        .limit(limitNum)
        .skip(skip)
        .lean(),
      Blog.countDocuments(query),
    ]);
    
    res.json({
      blogs,
      pagination: {
        total,
        page: pageNum,
        limit: limitNum,
        pages: Math.ceil(total / limitNum),
      },
    });
  } catch (error: any) {
    res.status(500).json({ message: 'Failed to fetch blogs', error: error.message });
  }
});

// Get single blog by slug (public)
router.get('/slug/:slug', async (req, res): Promise<void> => {
  try {
    const { slug } = req.params;
    
    const blog = await Blog.findOne({ slug, published: true }).lean();
    
    if (!blog) {
      res.status(404).json({ message: 'Blog not found' });
      return;
    }
    
    res.json(blog);
  } catch (error: any) {
    res.status(500).json({ message: 'Failed to fetch blog', error: error.message });
  }
});

// Admin routes - Get all blogs (including unpublished)
router.get('/admin/all', requireAdmin, async (req, res) => {
  try {
    const { published, category, limit = '20', page = '1' } = req.query;
    
    const query: any = {};
    
    if (published !== undefined) {
      query.published = published === 'true';
    }
    
    if (category) {
      query.category = category;
    }
    
    const limitNum = parseInt(limit as string);
    const pageNum = parseInt(page as string);
    const skip = (pageNum - 1) * limitNum;
    
    const [blogs, total] = await Promise.all([
      Blog.find(query)
        .select('-content') // Exclude full content for list view
        .sort({ createdAt: -1 })
        .limit(limitNum)
        .skip(skip)
        .lean(),
      Blog.countDocuments(query),
    ]);
    
    res.json({
      blogs,
      pagination: {
        total,
        page: pageNum,
        limit: limitNum,
        pages: Math.ceil(total / limitNum),
      },
    });
  } catch (error: any) {
    res.status(500).json({ message: 'Failed to fetch blogs', error: error.message });
  }
});

// Admin routes - Get single blog by ID
router.get('/admin/:id', requireAdmin, async (req, res): Promise<void> => {
  try {
    const { id } = req.params;
    
    const blog = await Blog.findById(id).lean();
    
    if (!blog) {
      res.status(404).json({ message: 'Blog not found' });
      return;
    }
    
    res.json(blog);
  } catch (error: any) {
    res.status(500).json({ message: 'Failed to fetch blog', error: error.message });
  }
});

// Admin routes - Create blog
router.post('/admin', requireAdmin, async (req, res): Promise<void> => {
  try {
    const blogData = req.body;
    
    // Generate slug from title if not provided
    if (!blogData.slug && blogData.title) {
      blogData.slug = blogData.title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');
    }
    
    // Check if slug already exists
    const existingBlog = await Blog.findOne({ slug: blogData.slug });
    if (existingBlog) {
      res.status(400).json({ message: 'A blog with this slug already exists' });
      return;
    }
    
    const blog = new Blog(blogData);
    await blog.save();
    
    res.status(201).json({
      message: 'Blog created successfully',
      blog,
    });
  } catch (error: any) {
    if (error.name === 'ValidationError') {
      res.status(400).json({ message: 'Validation error', errors: error.errors });
      return;
    }
    res.status(500).json({ message: 'Failed to create blog', error: error.message });
  }
});

// Admin routes - Update blog
router.put('/admin/:id', requireAdmin, async (req, res): Promise<void> => {
  try {
    const { id } = req.params;
    const updateData = req.body;
    
    // If slug is being updated, check for uniqueness
    if (updateData.slug) {
      const existingBlog = await Blog.findOne({ slug: updateData.slug, _id: { $ne: id } });
      if (existingBlog) {
        res.status(400).json({ message: 'A blog with this slug already exists' });
        return;
      }
    }
    
    const blog = await Blog.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    );
    
    if (!blog) {
      res.status(404).json({ message: 'Blog not found' });
      return;
    }
    
    res.json({
      message: 'Blog updated successfully',
      blog,
    });
  } catch (error: any) {
    if (error.name === 'ValidationError') {
      res.status(400).json({ message: 'Validation error', errors: error.errors });
      return;
    }
    res.status(500).json({ message: 'Failed to update blog', error: error.message });
  }
});

// Admin routes - Delete blog
router.delete('/admin/:id', requireAdmin, async (req, res): Promise<void> => {
  try {
    const { id } = req.params;
    
    const blog = await Blog.findByIdAndDelete(id);
    
    if (!blog) {
      res.status(404).json({ message: 'Blog not found' });
      return;
    }
    
    res.json({
      message: 'Blog deleted successfully',
    });
  } catch (error: any) {
    res.status(500).json({ message: 'Failed to delete blog', error: error.message });
  }
});

// Admin routes - Toggle publish status
router.patch('/admin/:id/publish', requireAdmin, async (req, res): Promise<void> => {
  try {
    const { id } = req.params;
    const { published } = req.body;
    
    const blog = await Blog.findById(id);
    
    if (!blog) {
      res.status(404).json({ message: 'Blog not found' });
      return;
    }
    
    blog.published = published;
    if (published && !blog.publishedAt) {
      blog.publishedAt = new Date();
    }
    
    await blog.save();
    
    res.json({
      message: `Blog ${published ? 'published' : 'unpublished'} successfully`,
      blog,
    });
  } catch (error: any) {
    res.status(500).json({ message: 'Failed to update blog status', error: error.message });
  }
});

export default router;

