import express from 'express';
import { Message, MessageThread, Room, User, HostProfile } from '../models';
import { requireUser, requireHost, requireAdmin, AuthenticatedRequest } from '../middleware/auth';
import { paginationSchema } from '../schemas';
import { validateQuery } from '../middleware/validateRequest';
import { sanitizeText } from '../utils/sanitizer';

const router: express.Router = express.Router();

// @route   GET /api/messages/threads
// @desc    Get message threads for host
// @access  Private (host)
router.get('/threads', requireHost, validateQuery(paginationSchema), async (req: AuthenticatedRequest, res) => {
  try {
    const { page, limit } = req.query;
    const skip = (Number(page) - 1) * Number(limit);

    // Get host profile
    const hostProfile = await HostProfile.findOne({ userId: req.user!.id });
    if (!hostProfile) {
      return res.status(404).json({
        success: false,
        message: 'Host profile not found'
      });
    }

    // Get threads with populated data
    const threads = await MessageThread.find({ hostId: hostProfile._id })
      .populate('roomId', 'title images')
      .populate('userId', 'name email phone')
      .sort({ lastMessageAt: -1 })
      .skip(skip)
      .limit(Number(limit));

    // Get message counts and last messages for each thread
    const threadsWithMessages = await Promise.all(
      threads.map(async (thread) => {
        const messageCount = await Message.countDocuments({ threadId: thread._id });
        const lastMessage = await Message.findOne({ threadId: thread._id })
          .sort({ createdAt: -1 })
          .select('text senderRole createdAt blocked reason');

        return {
          _id: thread._id,
          roomId: {
            _id: (thread.roomId as any)._id,
            title: (thread.roomId as any).title,
            images: (thread.roomId as any).images
          },
          userId: {
            _id: (thread.userId as any)._id,
            name: (thread.userId as any).name,
            email: (thread.userId as any).email,
            phone: (thread.userId as any).phone
          },
          lastMessageAt: thread.lastMessageAt,
          messageCount,
          isActive: true, // You can implement logic to determine if thread is active
          lastMessage: lastMessage ? {
            text: lastMessage.text,
            senderRole: lastMessage.senderRole,
            timestamp: lastMessage.createdAt,
            blocked: lastMessage.blocked,
            reason: lastMessage.reason
          } : null
        };
      })
    );

    const total = await MessageThread.countDocuments({ hostId: hostProfile._id });

    return res.json({
      success: true,
      data: {
        threads: threadsWithMessages,
        pagination: {
          page: Number(page),
          limit: Number(limit),
          total,
          pages: Math.ceil(total / Number(limit))
        }
      }
    });
  } catch (error) {
    console.error('Get message threads error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// @route   GET /api/messages/threads/:threadId
// @desc    Get messages for a specific thread
// @access  Private (host)
router.get('/threads/:threadId', requireHost, validateQuery(paginationSchema), async (req: AuthenticatedRequest, res) => {
  try {
    const { threadId } = req.params;
    const { page, limit } = req.query;
    const skip = (Number(page) - 1) * Number(limit);

    // Verify thread belongs to host
    const hostProfile = await HostProfile.findOne({ userId: req.user!.id });
    if (!hostProfile) {
      return res.status(404).json({
        success: false,
        message: 'Host profile not found'
      });
    }

    const thread = await MessageThread.findOne({ 
      _id: threadId, 
      hostId: hostProfile._id 
    });

    if (!thread) {
      return res.status(404).json({
        success: false,
        message: 'Thread not found'
      });
    }

    // Get messages for the thread
    const messages = await Message.find({ threadId })
      .sort({ createdAt: 1 })
      .skip(skip)
      .limit(Number(limit));

    const total = await Message.countDocuments({ threadId });

    return res.json({
      success: true,
      data: {
        messages,
        pagination: {
          page: Number(page),
          limit: Number(limit),
          total,
          pages: Math.ceil(total / Number(limit))
        }
      }
    });
  } catch (error) {
    console.error('Get thread messages error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// @route   POST /api/messages/threads/:threadId
// @desc    Send a message in a thread
// @access  Private (host)
router.post('/threads/:threadId', requireHost, async (req: AuthenticatedRequest, res) => {
  try {
    const { threadId } = req.params;
    const { text } = req.body;

    if (!text || !text.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Message text is required'
      });
    }

    // Sanitize message to block contact information
    const sanitized = sanitizeText(text.trim());
    if (!sanitized.clean) {
      return res.status(400).json({
        success: false,
        message: 'Message blocked: Cannot share contact information (phone, email, URLs)',
        reason: sanitized.reason
      });
    }

    // Verify thread belongs to host
    const hostProfile = await HostProfile.findOne({ userId: req.user!.id });
    if (!hostProfile) {
      return res.status(404).json({
        success: false,
        message: 'Host profile not found'
      });
    }

    const thread = await MessageThread.findOne({ 
      _id: threadId, 
      hostId: hostProfile._id 
    });

    if (!thread) {
      return res.status(404).json({
        success: false,
        message: 'Thread not found'
      });
    }

    // Create new message
    const message = new Message({
      threadId,
      senderRole: 'host',
      text: text.trim(),
      blocked: false
    });

    await message.save();

    // Update thread's last message time
    thread.lastMessageAt = new Date();
    await thread.save();

    return res.status(201).json({
      success: true,
      message: 'Message sent successfully',
      data: {
        _id: message._id,
        text: message.text,
        senderRole: message.senderRole,
        timestamp: message.createdAt,
        blocked: message.blocked
      }
    });
  } catch (error) {
    console.error('Send message error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// @route   POST /api/messages/threads
// @desc    Create a new message thread
// @access  Private (host)
router.post('/threads', requireHost, async (req: AuthenticatedRequest, res) => {
  try {
    const { roomId, userId } = req.body;

    if (!roomId || !userId) {
      return res.status(400).json({
        success: false,
        message: 'Room ID and User ID are required'
      });
    }

    // Get host profile
    const hostProfile = await HostProfile.findOne({ userId: req.user!.id });
    if (!hostProfile) {
      return res.status(404).json({
        success: false,
        message: 'Host profile not found'
      });
    }

    // Check if thread already exists
    const existingThread = await MessageThread.findOne({ roomId, userId });
    if (existingThread) {
      return res.status(400).json({
        success: false,
        message: 'Thread already exists'
      });
    }

    // Create new thread
    const thread = new MessageThread({
      roomId,
      userId,
      hostId: hostProfile._id,
      lastMessageAt: new Date()
    });

    await thread.save();

    // Populate the thread data
    await thread.populate('roomId', 'title images');
    await thread.populate('userId', 'name email phone');

    return res.status(201).json({
      success: true,
      message: 'Thread created successfully',
      data: {
        _id: thread._id,
        roomId: {
          _id: (thread.roomId as any)._id,
          title: (thread.roomId as any).title,
          images: (thread.roomId as any).images
        },
        userId: {
          _id: (thread.userId as any)._id,
          name: (thread.userId as any).name,
          email: (thread.userId as any).email,
          phone: (thread.userId as any).phone
        },
        lastMessageAt: thread.lastMessageAt,
        messageCount: 0,
        isActive: true,
        lastMessage: null
      }
    });
  } catch (error) {
    console.error('Create thread error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

export default router;
