const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const env = require('../../config/env');
const prisma = require('../../prisma/client');
const { getShopStatus } = require('../../utils/dates');
const { normalizePhone } = require('../../utils/phones');

class AuthService {
  /**
   * Unified login: shop owners use phone + pin, admins use email + password.
   */
  async login({ phone, pin, email, password }) {
    if (email) {
      return this._adminLogin(email, password);
    }
    return this._shopOwnerLogin(phone, pin);
  }

  async _shopOwnerLogin(phone, pin) {
    const normalized = normalizePhone(phone);

    const user = await prisma.user.findUnique({
      where: { phone: normalized },
      include: { shop: true },
    });

    if (!user || user.role !== 'SHOP_OWNER') {
      const error = new Error('رقم الهاتف أو الرمز السري غير صحيح');
      error.statusCode = 401;
      throw error;
    }

    if (!user.isActive) {
      const error = new Error('تم تعطيل هذا الحساب.');
      error.statusCode = 403;
      throw error;
    }

    const isPinValid = bcrypt.compareSync(pin, user.passwordHash);
    if (!isPinValid) {
      const error = new Error('رقم الهاتف أو الرمز السري غير صحيح');
      error.statusCode = 401;
      throw error;
    }

    if (!user.shop) {
      const error = new Error('لا يوجد متجر مرتبط بهذا الحساب.');
      error.statusCode = 403;
      throw error;
    }

    const status = getShopStatus(user.shop.expiryDate, user.shop.isSuspended);

    if (status === 'SUSPENDED') {
      const error = new Error('تم تعليق متجرك من قِبل المدير.');
      error.statusCode = 403;
      error.code = 'SHOP_SUSPENDED';
      throw error;
    }

    if (status === 'EXPIRED') {
      const error = new Error('انتهت صلاحية اشتراك متجرك.');
      error.statusCode = 403;
      error.code = 'SUBSCRIPTION_EXPIRED';
      throw error;
    }

    return this._buildTokenResponse(user);
  }

  async _adminLogin(email, password) {
    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase().trim() },
      include: { shop: true },
    });

    if (!user || user.role !== 'SUPER_ADMIN') {
      const error = new Error('البريد الإلكتروني أو كلمة المرور غير صحيحة');
      error.statusCode = 401;
      throw error;
    }

    if (!user.isActive) {
      const error = new Error('تم تعطيل هذا الحساب.');
      error.statusCode = 403;
      throw error;
    }

    const isPasswordValid = bcrypt.compareSync(password, user.passwordHash);
    if (!isPasswordValid) {
      const error = new Error('البريد الإلكتروني أو كلمة المرور غير صحيحة');
      error.statusCode = 401;
      throw error;
    }

    return this._buildTokenResponse(user);
  }

  _buildTokenResponse(user) {
    const token = jwt.sign(
      {
        id: user.id,
        phone: user.phone,
        email: user.email,
        role: user.role,
        shopId: user.shopId,
      },
      env.JWT_SECRET,
      { expiresIn: env.JWT_EXPIRES_IN }
    );

    return {
      token,
      user: {
        id: user.id,
        name: user.name,
        phone: user.phone,
        email: user.email,
        role: user.role,
        shopId: user.shopId,
        shop: user.shop
          ? {
              id: user.shop.id,
              shopName: user.shop.shopName,
              ownerName: user.shop.ownerName,
              expiryDate: user.shop.expiryDate,
              isSuspended: user.shop.isSuspended,
            }
          : null,
      },
    };
  }
}

module.exports = new AuthService();
