import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { User, HostProfile } from '../models';
import { registerSchema, loginSchema } from '../schemas';
import { validateBody } from '../middleware/validateRequest';

const router: express.Router = express.Router();

// @route   POST /api/auth/register
// @desc    Register a new user (optionally as host)
// @access  Public
router.post('/register', validateBody(registerSchema), async (req, res) => {
  try {
    const { name, email, password, phone, isHost, hostData } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'User already exists with this email'
      });
    }

    // Hash password
    const saltRounds = 12;
    const passwordHash = await bcrypt.hash(password, saltRounds);

    // Create user with appropriate role based on registration type
    const user = new User({
      name,
      email,
      passwordHash,
      phone,
      role: isHost ? 'host' : 'guest'
    });

    await user.save();

    // If this is a host registration, create host profile
    if (isHost && hostData) {
      try {
        const hostProfile = new HostProfile({
          userId: user._id,
          displayName: hostData.displayName || name,
          phone: hostData.phone || phone,
          whatsapp: hostData.whatsapp || phone,
          locationName: hostData.locationName,
          locationMapUrl: hostData.locationMapUrl,
          nidFrontUrl: hostData.nidFrontUrl,
          nidBackUrl: hostData.nidBackUrl,
          status: 'pending'
        });

        await hostProfile.save();
        console.log('Host profile created successfully');
      } catch (hostError) {
        console.error('Error creating host profile:', hostError);
        // Continue with user creation even if host profile fails
      }
    }

    // Check JWT_SECRET configuration
    if (!process.env.JWT_SECRET) {
      console.error('JWT_SECRET env var is not configured');
      return res.status(500).json({ success: false, message: 'Server configuration error (missing JWT secret)' });
    }

    // Generate JWT token
    const token = jwt.sign(
      {
        id: user._id,
        email: user.email,
        role: user.role,
        name: user.name,
        phone: user.phone
      },
      process.env.JWT_SECRET!,
      { expiresIn: '7d' }
    );

    return res.status(201).json({
      success: true,
      message: 'User registered successfully',
      data: {
        token,
        user: {
          id: user._id,
          email: user.email,
          name: user.name,
          phone: user.phone,
          role: user.role
        }
      }
    });
  } catch (error) {
    console.error('Registration error:', error);
    console.error('Error details:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// @route   POST /api/auth/login
// @desc    Login user
// @access  Public
router.post('/login', validateBody(loginSchema), async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user and include password hash
    const user = await User.findOne({ email }).select('+passwordHash');
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // Check password
    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // Check JWT_SECRET configuration
    if (!process.env.JWT_SECRET) {
      console.error('JWT_SECRET env var is not configured');
      return res.status(500).json({ success: false, message: 'Server configuration error (missing JWT secret)' });
    }

    // Generate JWT token
    const token = jwt.sign(
      {
        id: user._id,
        email: user.email,
        role: user.role,
        name: user.name,
        phone: user.phone
      },
      process.env.JWT_SECRET!,
      { expiresIn: '7d' }
    );

    return res.json({
      success: true,
      message: 'Login successful',
      data: {
        token,
        user: {
          id: user._id,
          email: user.email,
          name: user.name,
          phone: user.phone,
          role: user.role
        }
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// @route   GET /api/auth/verify
// @desc    Verify JWT token (for NextAuth callback)
// @access  Public
router.get('/verify', async (req, res) => {
  try {
    const token = req.query.token as string;
    
    if (!token) {
      return res.status(400).json({
        success: false,
        message: 'Token is required'
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any;
    
    // Find user to ensure they still exist
    const user = await User.findById(decoded.id).select('-passwordHash');
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'User not found'
      });
    }

    return res.json({
      success: true,
      data: {
        id: user._id,
        email: user.email,
        name: user.name,
        phone: user.phone,
        role: user.role
      }
    });
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: 'Invalid token'
    });
  }
});

export default router;