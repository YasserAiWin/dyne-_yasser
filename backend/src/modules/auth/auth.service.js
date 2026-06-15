const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const env = require('../../config/env');
const prisma = require('../../prisma/client');
const { getShopStatus } = require('../../utils/dates');
const { normalizePhone } = require('../../utils/phones');

class AuthService {
  /**
   * Log in user using phone and password
   * 
   * @param {Object} credentials
   * @param {string} credentials.phone
   * @param {string} credentials.password
   * @returns {Promise<Object>} { token, user }
   */
  async login({ phone, password }) {
    // Standardize input phone
    const normalized = normalizePhone(phone);

    const user = await prisma.user.findUnique({
      where: { phone: normalized },
      include: {
        shop: true,
      },
    });

    // Verify user exists
    if (!user) {
      const error = new Error('Invalid phone number or password');
      error.statusCode = 401;
      throw error;
    }

    // Verify account is active
    if (!user.isActive) {
      const error = new Error('Your user account has been deactivated.');
      error.statusCode = 403;
      throw error;
    }

    // Compare passwords
    const isPasswordValid = bcrypt.compareSync(password, user.passwordHash);
    if (!isPasswordValid) {
      const error = new Error('Invalid phone number or password');
      error.statusCode = 401;
      throw error;
    }

    // If the user is a Shop Owner, verify shop status
    if (user.role === 'SHOP_OWNER') {
      if (!user.shop) {
        const error = new Error('No shop profile associated with this account.');
        error.statusCode = 403;
        throw error;
      }

      const status = getShopStatus(user.shop.expiryDate, user.shop.isSuspended);

      if (status === 'SUSPENDED') {
        const error = new Error('Your shop has been suspended by the administrator.');
        error.statusCode = 403;
        error.code = 'SHOP_SUSPENDED';
        throw error;
      }

      if (status === 'EXPIRED') {
        const error = new Error('Your shop subscription has expired.');
        error.statusCode = 403;
        error.code = 'SUBSCRIPTION_EXPIRED';
        throw error;
      }
    }

    // Generate JWT token
    const token = jwt.sign(
      {
        id: user.id,
        phone: user.phone,
        role: user.role,
        shopId: user.shopId,
      },
      env.JWT_SECRET,
      { expiresIn: env.JWT_EXPIRES_IN }
    );

    // Format user response
    const userResponse = {
      id: user.id,
      name: user.name,
      phone: user.phone,
      role: user.role,
      shopId: user.shopId,
      shop: user.shop ? {
        id: user.shop.id,
        shopName: user.shop.shopName,
        ownerName: user.shop.ownerName,
        expiryDate: user.shop.expiryDate,
        isSuspended: user.shop.isSuspended,
      } : null,
    };

    return { token, user: userResponse };
  }
}

module.exports = new AuthService();
