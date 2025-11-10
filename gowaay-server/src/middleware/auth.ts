import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { User } from '../models';

interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    email: string;
    role: 'guest' | 'host' | 'admin';
    name: string;
    phone?: string;
  };
}

export const requireUser = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ 
        success: false, 
        message: 'Access denied. No token provided.' 
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any;
    
    // Find user in database to ensure they still exist and are active
    const user = await User.findById(decoded.id).select('-passwordHash');
    
    if (!user) {
      return res.status(401).json({ 
        success: false, 
        message: 'Invalid token. User not found.' 
      });
    }

    req.user = {
      id: (user._id as any).toString(),
      email: user.email,
      role: user.role,
      name: user.name,
      phone: user.phone,
    };

    return next();
  } catch (error) {
    return res.status(401).json({ 
      success: false, 
      message: 'Invalid token.' 
    });
  }
};

export const requireRole = (roles: ('guest' | 'host' | 'admin')[]) => {
  return async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    // First authenticate the user
    return requireUser(req, res, (err) => {
      if (err) return;
      
      // Then check role
      if (!req.user) {
        return res.status(401).json({ 
          success: false, 
          message: 'Authentication required.' 
        });
      }

      if (!roles.includes(req.user.role)) {
        return res.status(403).json({ 
          success: false, 
          message: 'Access denied. Insufficient permissions.' 
        });
      }

      return next();
    });
  };
};

export const requireHost = requireRole(['host', 'admin']);
export const requireAdmin = requireRole(['admin']);

// JWT verification for NextAuth callback
export const verifyJWTForNextAuth = (token: string) => {
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any;
    return {
      id: decoded.id,
      email: decoded.email,
      role: decoded.role,
      name: decoded.name,
      phone: decoded.phone,
    };
  } catch (error) {
    return null;
  }
};

export { AuthenticatedRequest };