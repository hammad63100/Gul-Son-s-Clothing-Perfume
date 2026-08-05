const jwt = require('jsonwebtoken');
const { User, Role, Permission } = require('../models');
const logger = require('../config/logger');

// Generate JWT token
const generateToken = (userId, roleId) => {
  const payload = {
    id: userId,
    roleId: roleId,
    iat: Math.floor(Date.now() / 1000),
    exp: Math.floor(Date.now() / 1000) + (parseInt(process.env.JWT_EXPIRE) || 7) * 24 * 60 * 60
  };

  return jwt.sign(payload, process.env.JWT_SECRET);
};

// Verify JWT token
const verifyToken = async (token) => {
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Check if user still exists and is active
    const user = await User.findByPk(decoded.id, {
      include: [{
        model: Role,
        as: 'role',
        attributes: ['id', 'name', 'isActive']
      }]
    });

    if (!user || !user.isActive) {
      throw new Error('User not found or inactive');
    }

    if (!user.role || !user.role.isActive) {
      throw new Error('Role not found or inactive');
    }

    // Check if password was changed after token was issued
    if (user.passwordChangedAt && new Date(user.passwordChangedAt).getTime() > decoded.iat * 1000) {
      throw new Error('Password changed, please login again');
    }

    return decoded;
  } catch (error) {
    logger.error('Token verification failed:', error.message);
    throw error;
  }
};

// Authentication middleware
const authenticate = async (req, res, next) => {
  try {
    let token;

    // Check for token in Authorization header
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    } 
    // Check for token in cookies
    else if (req.cookies && req.cookies.token) {
      token = req.cookies.token;
    }

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Access denied. No token provided.'
      });
    }

    const decoded = await verifyToken(token);
    
    // Get user with role and permissions
    const user = await User.findByPk(decoded.id, {
      include: [{
        model: Role,
        as: 'role',
        include: [{
          model: Permission,
          as: 'permissions',
          where: { isActive: true },
          required: false,
          through: { attributes: ['isGranted'] }
        }]
      }],
      attributes: { exclude: ['password', 'twoFactorSecret'] }
    });

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'User not found'
      });
    }

    // Attach user to request
    req.user = user;
    req.permissions = user.role?.permissions?.map(p => ({
      name: p.name,
      module: p.module,
      action: p.action,
      granted: p.RolePermission.isGranted
    })) || [];

    next();
  } catch (error) {
    logger.error('Authentication error:', error.message);
    
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

    return res.status(401).json({
      success: false,
      message: error.message || 'Authentication failed'
    });
  }
};

// Authorize based on permissions
const authorize = (...requiredPermissions) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'User not authenticated'
      });
    }

    // Super admin has all permissions
    if (req.user.role.name === 'super_admin') {
      return next();
    }

    const userPermissions = req.permissions.map(p => `${p.module}:${p.action}`);
    
    const hasPermission = requiredPermissions.every(requiredPerm => {
      // Check exact permission match
      if (userPermissions.includes(requiredPerm)) {
        return true;
      }
      
      // Check module-level manage permission
      const [module] = requiredPerm.split(':');
      if (userPermissions.includes(`${module}:manage`)) {
        return true;
      }
      
      return false;
    });

    if (!hasPermission) {
      return res.status(403).json({
        success: false,
        message: 'You do not have permission to perform this action'
      });
    }

    next();
  };
};

// Check if user has specific role
const requireRole = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'User not authenticated'
      });
    }

    if (!roles.includes(req.user.role.name)) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Insufficient role privileges'
      });
    }

    next();
  };
};

// Optional authentication (doesn't fail if no token)
const optionalAuth = async (req, res, next) => {
  try {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    } else if (req.cookies && req.cookies.token) {
      token = req.cookies.token;
    }

    if (token) {
      try {
        const decoded = await verifyToken(token);
        const user = await User.findByPk(decoded.id, {
          include: [{
            model: Role,
            as: 'role',
            attributes: ['id', 'name']
          }],
          attributes: { exclude: ['password', 'twoFactorSecret'] }
        });
        
        if (user && user.isActive) {
          req.user = user;
        }
      } catch (error) {
        // Token invalid but continue anyway
      }
    }

    next();
  } catch (error) {
    next();
  }
};

module.exports = {
  generateToken,
  verifyToken,
  authenticate,
  authorize,
  requireRole,
  optionalAuth
};
