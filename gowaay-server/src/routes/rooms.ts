import express, { Request, Response } from 'express';
import { Room, HostProfile } from '../models';
import { requireUser, requireHost, requireAdmin } from '../middleware/auth';
import { roomCreateSchema, roomUpdateSchema, roomApprovalSchema, roomSearchSchema, unavailableDatesSchema } from '../schemas';
import { validateBody, validateQuery } from '../middleware/validateRequest';
import { checkBookingOverlap } from '../utils/bookingUtils';
import { deleteRoomImages } from '../middleware/upload';

// Extend Express Request interface to include user
interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    role: string;
  };
}

const router: express.Router = express.Router();

// @route   POST /api/rooms
// @desc    Create a new room (host only)
// @access  Private (host)
router.post('/', requireHost, validateBody(roomCreateSchema), async (req: AuthenticatedRequest, res: Response) => {
  try {
    console.log('Room creation request received:', {
      userId: req.user?.id,
      body: req.body
    });

    // Get host profile
    const hostProfile = await HostProfile.findOne({ userId: req.user!.id });
    if (!hostProfile) {
      console.log('Host profile not found for user:', req.user!.id);
      return res.status(404).json({
        success: false,
        message: 'Host profile not found'
      });
    }

    console.log('Host profile found:', hostProfile._id);

    // Calculate commission (10% of base price)
    const commissionTk = Math.round(req.body.basePriceTk * 0.1);
    const totalPriceTk = req.body.basePriceTk + commissionTk;
    console.log('Commission calculated:', commissionTk);
    console.log('Total price calculated:', totalPriceTk);

    // Create room
    const room = new Room({
      hostId: hostProfile._id,
      ...req.body,
      commissionTk,
      totalPriceTk,
      status: 'pending'
    });

    console.log('Room object created, saving...');
    console.log('Room data before save:', {
      basePriceTk: room.basePriceTk,
      commissionTk: room.commissionTk,
      totalPriceTk: room.totalPriceTk
    });
    await room.save();
    console.log('Room saved successfully:', room._id);

    return res.status(201).json({
      success: true,
      message: 'Room created successfully',
      data: {
        id: room._id,
        title: room.title,
        status: room.status,
        createdAt: room.createdAt
      }
    });
  } catch (error) {
    console.error('Create room error:', error);
    console.error('Error details:', {
      message: (error as Error).message,
      stack: (error as Error).stack,
      name: (error as Error).name
    });
    return res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// @route   PUT /api/rooms/:id
// @desc    Update a room (host only)
// @access  Private (host)
router.put('/:id', requireHost, validateBody(roomUpdateSchema), async (req: AuthenticatedRequest, res: Response) => {
  try {
    const room = await Room.findById(req.params.id);
    if (!room) {
      return res.status(404).json({
        success: false,
        message: 'Room not found'
      });
    }

    // Check if user owns this room
    const hostProfile = await HostProfile.findOne({ userId: req.user!.id });
    if (!hostProfile || room.hostId.toString() !== (hostProfile._id as any).toString()) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    // Update room
    Object.assign(room, req.body);
    await room.save();

    return res.json({
      success: true,
      message: 'Room updated successfully',
      data: {
        id: room._id,
        title: room.title,
        status: room.status,
        updatedAt: room.updatedAt
      }
    });
  } catch (error) {
    console.error('Update room error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// @route   DELETE /api/rooms/:id
// @desc    Delete a room (host only)
// @access  Private (host)
router.delete('/:id', requireHost, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const room = await Room.findById(req.params.id);
    if (!room) {
      return res.status(404).json({
        success: false,
        message: 'Room not found'
      });
    }

    // Check if user owns this room
    const hostProfile = await HostProfile.findOne({ userId: req.user!.id });
    if (!hostProfile || room.hostId.toString() !== (hostProfile._id as any).toString()) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    // Delete associated images
    if (room.images && room.images.length > 0) {
      const imageUrls = room.images.map((img: any) => typeof img === 'string' ? img : img.url);
      await deleteRoomImages(req.params.id, imageUrls);
    }

    await Room.findByIdAndDelete(req.params.id);

    return res.json({
      success: true,
      message: 'Room deleted successfully'
    });
  } catch (error) {
    console.error('Delete room error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// @route   GET /api/rooms/mine
// @desc    Get current host's rooms
// @access  Private (host)
router.get('/mine', requireHost, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { page, limit, status } = req.query;
    const skip = (Number(page) - 1) * Number(limit);

    const hostProfile = await HostProfile.findOne({ userId: req.user!.id });
    if (!hostProfile) {
      return res.status(404).json({
        success: false,
        message: 'Host profile not found'
      });
    }

    const filter: any = { hostId: hostProfile._id };
    if (status) filter.status = status;

    const rooms = await Room.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit));

    const total = await Room.countDocuments(filter);

    return res.json({
      success: true,
      data: {
        rooms,
        pagination: {
          page: Number(page),
          limit: Number(limit),
          total,
          pages: Math.ceil(total / Number(limit))
        }
      }
    });
  } catch (error) {
    console.error('Get my rooms error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// @route   GET /api/rooms/search
// @desc    Search rooms (public)
// @access  Public
router.get('/search', validateQuery(roomSearchSchema), async (req: Request, res: Response) => {
  try {
    const { q, location, minPrice, maxPrice, type, sort, page, limit } = req.query;
    const skip = (Number(page) - 1) * Number(limit);

    const filter: any = { status: 'approved' };

    // Search across multiple fields (title, location, description, address)
    if (q) {
      const searchRegex = { $regex: q, $options: 'i' };
      filter.$or = [
        { title: searchRegex },
        { locationName: searchRegex },
        { description: searchRegex },
        { address: searchRegex }
      ];
    }

    // Additional location filter (for when search page applies specific location filter)
    if (location && !q) {
      filter.$or = [
        { locationName: { $regex: location, $options: 'i' } },
        { address: { $regex: location, $options: 'i' } }
      ];
    } else if (location && q) {
      // If both q and location are provided, add location as an additional constraint
      filter.$and = [
        { $or: filter.$or },
        {
          $or: [
            { locationName: { $regex: location, $options: 'i' } },
            { address: { $regex: location, $options: 'i' } }
          ]
        }
      ];
      delete filter.$or;
    }

    // Price filter
    if (minPrice || maxPrice) {
      filter.totalPriceTk = {};
      if (minPrice) filter.totalPriceTk.$gte = Number(minPrice);
      if (maxPrice) filter.totalPriceTk.$lte = Number(maxPrice);
    }

    // Room type filter
    if (type) {
      filter.roomType = type;
    }

    // Sort options
    let sortOption: any = { createdAt: -1 };
    switch (sort) {
      case 'price_asc':
        sortOption = { totalPriceTk: 1 };
        break;
      case 'price_desc':
        sortOption = { totalPriceTk: -1 };
        break;
      case 'newest':
        sortOption = { createdAt: -1 };
        break;
      case 'oldest':
        sortOption = { createdAt: 1 };
        break;
      case 'rating':
        sortOption = { averageRating: -1, totalReviews: -1 };
        break;
    }

    const rooms = await Room.find(filter)
      .populate('hostId', 'displayName locationName')
      .sort(sortOption)
      .skip(skip)
      .limit(Number(limit));

    const total = await Room.countDocuments(filter);

    return res.json({
      success: true,
      data: {
        rooms,
        pagination: {
          page: Number(page),
          limit: Number(limit),
          total,
          pages: Math.ceil(total / Number(limit)),
          hasNext: Number(page) < Math.ceil(total / Number(limit)),
          hasPrev: Number(page) > 1
        },
        filters: {
          query: q,
          location,
          minPrice,
          maxPrice,
          type,
          sort
        }
      }
    });
  } catch (error) {
    console.error('Search rooms error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// @route   GET /api/rooms/:id
// @desc    Get room details (public)
// @access  Public
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const room = await Room.findById(req.params.id)
      .populate('hostId', 'displayName phone whatsapp locationName locationMapUrl');

    if (!room) {
      return res.status(404).json({
        success: false,
        message: 'Room not found'
      });
    }

    return res.json({
      success: true,
      data: room
    });
  } catch (error) {
    console.error('Get room error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// @route   POST /api/rooms/:id/unavailable
// @desc    Set unavailable dates for a room (host only)
// @access  Private (host)
router.post('/:id/unavailable', requireHost, validateBody(unavailableDatesSchema), async (req: AuthenticatedRequest, res: Response) => {
  try {
    const room = await Room.findById(req.params.id);
    if (!room) {
      return res.status(404).json({
        success: false,
        message: 'Room not found'
      });
    }

    // Check if user owns this room
    const hostProfile = await HostProfile.findOne({ userId: req.user!.id });
    if (!hostProfile || room.hostId.toString() !== (hostProfile._id as any).toString()) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    // Add new unavailable dates
    const newDates = req.body.dates.filter((date: string) => !room.unavailableDates.includes(date));
    room.unavailableDates.push(...newDates);
    await room.save();

    return res.json({
      success: true,
      message: 'Unavailable dates updated successfully',
      data: {
        unavailableDates: room.unavailableDates
      }
    });
  } catch (error) {
    console.error('Set unavailable dates error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// @route   GET /api/rooms/:id/unavailable
// @desc    Get unavailable dates for a room (public)
// @access  Public
router.get('/:id/unavailable', async (req: Request, res: Response) => {
  try {
    const room = await Room.findById(req.params.id).select('unavailableDates');
    if (!room) {
      return res.status(404).json({
        success: false,
        message: 'Room not found'
      });
    }

    return res.json({
      success: true,
      data: {
        unavailableDates: room.unavailableDates
      }
    });
  } catch (error) {
    console.error('Get unavailable dates error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// @route   GET /api/hosts/rooms/unavailable
// @desc    Get all unavailable dates for host's rooms
// @access  Private (host)
router.get('/hosts/rooms/unavailable', requireHost, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const hostProfile = await HostProfile.findOne({ userId: req.user!.id });
    if (!hostProfile) {
      return res.status(404).json({
        success: false,
        message: 'Host profile not found'
      });
    }

    const rooms = await Room.find({ hostId: hostProfile._id, status: 'approved' })
      .select('_id title unavailableDates');

    const unavailableDates = rooms.flatMap(room => 
      room.unavailableDates.map(date => ({
        _id: `${(room._id as any)}-${date}`,
        roomId: (room._id as any).toString(),
        roomTitle: room.title,
        date: date,
        createdAt: new Date().toISOString()
      }))
    );

    return res.json({
      success: true,
      data: {
        unavailableDates,
        rooms: rooms.map(room => ({
          _id: room._id,
          title: room.title,
          unavailableDates: room.unavailableDates
        }))
      }
    });
  } catch (error) {
    console.error('Get host unavailable dates error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// @route   DELETE /api/rooms/:id/unavailable
// @desc    Remove unavailable dates for a room (host only)
// @access  Private (host)
router.delete('/:id/unavailable', requireHost, validateBody(unavailableDatesSchema), async (req: AuthenticatedRequest, res: Response) => {
  try {
    const room = await Room.findById(req.params.id);
    if (!room) {
      return res.status(404).json({
        success: false,
        message: 'Room not found'
      });
    }

    // Check if user owns this room
    const hostProfile = await HostProfile.findOne({ userId: req.user!.id });
    if (!hostProfile || room.hostId.toString() !== (hostProfile._id as any).toString()) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    // Remove specified unavailable dates
    const datesToRemove = req.body.dates;
    room.unavailableDates = room.unavailableDates.filter(date => !datesToRemove.includes(date));
    await room.save();

    return res.json({
      success: true,
      message: 'Unavailable dates removed successfully',
      data: {
        unavailableDates: room.unavailableDates
      }
    });
  } catch (error) {
    console.error('Remove unavailable dates error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});




export default router;
