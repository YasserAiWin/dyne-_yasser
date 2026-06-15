const authService = require('./auth.service');
const { successResponse } = require('../../utils/apiResponse');

class AuthController {
  /**
   * Handle user login request
   */
  login = async (req, res, next) => {
    try {
      const { phone, password } = req.body;
      const result = await authService.login({ phone, password });
      return successResponse(res, 'Login successful', result);
    } catch (error) {
      // Catch specific shop subscription/suspension errors and return them cleanly
      if (error.code === 'SHOP_SUSPENDED' || error.code === 'SUBSCRIPTION_EXPIRED') {
        return res.status(error.statusCode || 403).json({
          success: false,
          message: error.message,
          error: error.code,
        });
      }
      next(error);
    }
  };

  /**
   * Return the authenticated user profile
   */
  me = async (req, res, next) => {
    try {
      // req.user is attached by authMiddleware
      return successResponse(res, 'Current user profile retrieved', { user: req.user });
    } catch (error) {
      next(error);
    }
  };
}

module.exports = new AuthController();
