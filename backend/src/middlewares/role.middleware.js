const { errorResponse } = require('../utils/apiResponse');

/**
 * Role authorization middleware
 * 
 * @param {...string} allowedRoles - List of allowed roles for the route
 */
const roleMiddleware = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return errorResponse(res, 'Unauthenticated', 401);
    }

    if (!allowedRoles.includes(req.user.role)) {
      return errorResponse(res, 'Access denied. Insufficient permissions.', 403);
    }

    next();
  };
};

module.exports = roleMiddleware;
