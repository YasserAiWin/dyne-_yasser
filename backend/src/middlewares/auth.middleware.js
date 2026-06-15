const jwt = require('jsonwebtoken');
const env = require('../config/env');
const prisma = require('../prisma/client');
const { errorResponse } = require('../utils/apiResponse');

/**
 * JWT Authentication Middleware
 */
const authMiddleware = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return errorResponse(res, 'Authentication token required', 401);
    }

    const token = authHeader.split(' ')[1];
    
    let decoded;
    try {
      decoded = jwt.verify(token, env.JWT_SECRET);
    } catch (err) {
      return errorResponse(res, 'Invalid or expired token', 401, err.message);
    }

    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
      include: {
        shop: true,
      },
    });

    if (!user) {
      return errorResponse(res, 'User no longer exists', 401);
    }

    if (!user.isActive) {
      return errorResponse(res, 'User account is inactive', 403);
    }

    // Attach user to request
    req.user = {
      id: user.id,
      name: user.name,
      phone: user.phone,
      role: user.role,
      shopId: user.shopId,
      shop: user.shop,
    };

    next();
  } catch (error) {
    next(error);
  }
};

module.exports = authMiddleware;
