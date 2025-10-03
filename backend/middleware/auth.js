const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Generate JWT token
const generateToken = (userId) => {
  return jwt.sign({ userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE || '7d'
  });
};

// Generate refresh token
const generateRefreshToken = (userId) => {
  return jwt.sign({ userId }, process.env.JWT_REFRESH_SECRET, {
    expiresIn: process.env.JWT_REFRESH_EXPIRE || '30d'
  });
};

// Verify JWT token
const verifyToken = (token) => {
  return jwt.verify(token, process.env.JWT_SECRET);
};

// Verify refresh token
const verifyRefreshToken = (token) => {
  return jwt.verify(token, process.env.JWT_REFRESH_SECRET);
};

// Authentication middleware
const authenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Access token is required'
      });
    }

    const decoded = verifyToken(token);
    const user = await User.findById(decoded.userId).select('-password');

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid token - user not found'
      });
    }

    if (!user.isActive) {
      return res.status(401).json({
        success: false,
        message: 'Account is deactivated'
      });
    }

    req.user = user;
    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        success: false,
        message: 'Invalid token'
      });
    }
    
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Token expired'
      });
    }

    return res.status(500).json({
      success: false,
      message: 'Token verification failed'
    });
  }
};

// Authorization middleware - check if user has required role
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: 'Insufficient permissions'
      });
    }

    next();
  };
};

// Optional authentication middleware - doesn't fail if no token
const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1];

    if (token) {
      const decoded = verifyToken(token);
      const user = await User.findById(decoded.userId).select('-password');
      
      if (user && user.isActive) {
        req.user = user;
      }
    }
    
    next();
  } catch (error) {
    // Continue without authentication if token is invalid
    next();
  }
};

// Check if user can access resource
const canAccessResource = (resourceType) => {
  return async (req, res, next) => {
    try {
      const { id } = req.params;
      const user = req.user;

      if (!user) {
        return res.status(401).json({
          success: false,
          message: 'Authentication required'
        });
      }

      // Admin can access everything
      if (user.role === 'admin') {
        return next();
      }

      // Check resource-specific access
      switch (resourceType) {
        case 'user':
          if (user._id.toString() === id || user.role === 'admin') {
            return next();
          }
          break;
        
        case 'bus':
          // Drivers can access their assigned bus
          if (user.role === 'driver' && user.assignedBus && user.assignedBus.toString() === id) {
            return next();
          }
          // Staff and students can view bus info
          if (['staff', 'student'].includes(user.role)) {
            return next();
          }
          break;
        
        case 'route':
          // All authenticated users can view routes
          return next();
        
        case 'schedule':
          // Drivers can access their schedules
          if (user.role === 'driver') {
            return next();
          }
          // Staff and students can view schedules
          if (['staff', 'student'].includes(user.role)) {
            return next();
          }
          break;
        
        default:
          return next();
      }

      return res.status(403).json({
        success: false,
        message: 'Access denied to this resource'
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: 'Authorization check failed'
      });
    }
  };
};

// Rate limiting per user
const userRateLimit = (maxRequests = 100, windowMs = 15 * 60 * 1000) => {
  const requests = new Map();

  return (req, res, next) => {
    if (!req.user) {
      return next();
    }

    const userId = req.user._id.toString();
    const now = Date.now();
    const windowStart = now - windowMs;

    // Clean old entries
    for (const [key, value] of requests.entries()) {
      if (value.timestamp < windowStart) {
        requests.delete(key);
      }
    }

    const userRequests = requests.get(userId) || { count: 0, timestamp: now };
    
    if (userRequests.timestamp < windowStart) {
      userRequests.count = 1;
      userRequests.timestamp = now;
    } else {
      userRequests.count++;
    }

    requests.set(userId, userRequests);

    if (userRequests.count > maxRequests) {
      return res.status(429).json({
        success: false,
        message: 'Too many requests, please try again later'
      });
    }

    next();
  };
};

module.exports = {
  generateToken,
  generateRefreshToken,
  verifyToken,
  verifyRefreshToken,
  authenticateToken,
  authorize,
  optionalAuth,
  canAccessResource,
  userRateLimit
};
