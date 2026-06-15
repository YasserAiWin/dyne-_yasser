const { errorResponse } = require('../utils/apiResponse');
const { getShopStatus } = require('../utils/dates');

/**
 * Middleware to enforce subscription and suspension constraints.
 * Blocks Shop Owner access if their shop is suspended or expired.
 * Super Admin bypasses these checks.
 */
const shopAccessMiddleware = (req, res, next) => {
  // Super Admin has global access to everything
  if (req.user && req.user.role === 'SUPER_ADMIN') {
    return next();
  }

  if (!req.user || req.user.role !== 'SHOP_OWNER') {
    return errorResponse(res, 'Access denied. Shop owner role required.', 403);
  }

  const shop = req.user.shop;
  
  if (!shop) {
    return errorResponse(res, 'Access denied. No shop associated with this user.', 403);
  }

  // Calculate status dynamically
  const status = getShopStatus(shop.expiryDate, shop.isSuspended);

  if (status === 'SUSPENDED') {
    return res.status(403).json({
      success: false,
      message: 'Your shop has been suspended by the administrator.',
      error: 'SHOP_SUSPENDED'
    });
  }

  if (status === 'EXPIRED') {
    return res.status(403).json({
      success: false,
      message: 'Your shop subscription has expired.',
      error: 'SUBSCRIPTION_EXPIRED'
    });
  }

  // ACTIVE or EXPIRING_SOON are allowed
  next();
};

module.exports = shopAccessMiddleware;
