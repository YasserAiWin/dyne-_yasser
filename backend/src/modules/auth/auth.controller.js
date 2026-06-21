const authService = require('./auth.service');
const { successResponse } = require('../../utils/apiResponse');

class AuthController {
  login = async (req, res, next) => {
    try {
      const { phone, pin, email, password } = req.body;
      const result = await authService.login({ phone, pin, email, password });
      return successResponse(res, 'تم تسجيل الدخول بنجاح', result);
    } catch (error) {
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

  me = async (req, res, next) => {
    try {
      return successResponse(res, 'تم جلب بيانات المستخدم', { user: req.user });
    } catch (error) {
      next(error);
    }
  };
}

module.exports = new AuthController();
