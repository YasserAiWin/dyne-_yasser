const bcrypt = require('bcryptjs');
const prisma = require('../../prisma/client');
const { getShopStatus, calculateNewExpiryDate } = require('../../utils/dates');

const sanitizeWhatsappSetting = (setting) => {
  if (!setting) return setting;
  const { apiKey, instanceToken, ...safeSetting } = setting;
  return {
    ...safeSetting,
    hasApiKey: Boolean(apiKey),
    hasInstanceToken: Boolean(instanceToken),
  };
};

class ShopsService {
  /**
   * Get all shops with their dynamically calculated statuses
   */
  async getAllShops() {
    const shops = await prisma.shop.findMany({
      include: {
        users: {
          select: {
            id: true,
            name: true,
            phone: true,
            isActive: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return shops.map((shop) => ({
      ...shop,
      status: getShopStatus(shop.expiryDate, shop.isSuspended),
    }));
  }

  /**
   * Get specific shop by ID
   */
  async getShopById(id) {
    const shop = await prisma.shop.findUnique({
      where: { id },
      include: {
        users: {
          select: {
            id: true,
            name: true,
            phone: true,
            role: true,
            isActive: true,
          },
        },
        whatsappSetting: true,
      },
    });

    if (!shop) {
      const error = new Error('Shop not found');
      error.statusCode = 404;
      throw error;
    }

    return {
      ...shop,
      whatsappSetting: sanitizeWhatsappSetting(shop.whatsappSetting),
      status: getShopStatus(shop.expiryDate, shop.isSuspended),
    };
  }

  /**
   * Create Shop, Owner User, and ShopWhatsappSetting inside a single prisma.$transaction
   */
  async createShop(shopData) {
    const { shopName, ownerName, phone, pin, startDate, expiryDate, subscriptionDuration } = shopData;
    const passwordHash = bcrypt.hashSync(pin, 10);

    // Calculate expiryDate from subscriptionDuration or use expiryDate directly
    let calculatedExpiry = expiryDate ? new Date(expiryDate) : null;
    
    if (subscriptionDuration) {
      const baseDate = new Date(startDate);
      calculatedExpiry = new Date(baseDate);
      
      if (subscriptionDuration === '1_month') {
        calculatedExpiry.setMonth(calculatedExpiry.getMonth() + 1);
      } else if (subscriptionDuration === '3_months') {
        calculatedExpiry.setMonth(calculatedExpiry.getMonth() + 3);
      } else if (subscriptionDuration === '6_months') {
        calculatedExpiry.setMonth(calculatedExpiry.getMonth() + 6);
      } else if (subscriptionDuration === '1_year') {
        calculatedExpiry.setFullYear(calculatedExpiry.getFullYear() + 1);
      }
    }

    if (!calculatedExpiry) {
      const error = new Error('Could not calculate subscription expiry date');
      error.statusCode = 400;
      throw error;
    }

    return prisma.$transaction(async (tx) => {
      // 1. Verify owner phone is unique
      const existingUser = await tx.user.findUnique({
        where: { phone },
      });

      if (existingUser) {
        const error = new Error('Owner phone number is already registered');
        error.statusCode = 409;
        throw error;
      }

      // 2. Create the Shop
      const shop = await tx.shop.create({
        data: {
          shopName,
          ownerName,
          phone,
          startDate: new Date(startDate),
          expiryDate: calculatedExpiry,
          isSuspended: false,
        },
      });

      // 3. Create the Shop Owner User
      const user = await tx.user.create({
        data: {
          name: ownerName,
          phone,
          passwordHash,
          role: 'SHOP_OWNER',
          shopId: shop.id,
          isActive: true,
        },
      });

      // 4. Create default Shop Whatsapp Settings
      const whatsapp = await tx.shopWhatsappSetting.create({
        data: {
          shopId: shop.id,
          provider: 'EVOLUTION',
          connectionStatus: 'DISCONNECTED',
        },
      });

      return {
        shop: {
          ...shop,
          status: getShopStatus(shop.expiryDate, shop.isSuspended),
        },
        user: {
          id: user.id,
          name: user.name,
          phone: user.phone,
          role: user.role,
          isActive: user.isActive,
        },
        whatsapp,
      };
    });
  }

  /**
   * Update shop details
   */
  async updateShop(id, updateData) {
    const shop = await prisma.shop.findUnique({ where: { id } });
    if (!shop) {
      const error = new Error('Shop not found');
      error.statusCode = 404;
      throw error;
    }

    const updatedShop = await prisma.shop.update({
      where: { id },
      data: updateData,
    });

    return {
      ...updatedShop,
      status: getShopStatus(updatedShop.expiryDate, updatedShop.isSuspended),
    };
  }

  /**
   * Suspend a shop
   */
  async suspendShop(id) {
    const shop = await prisma.shop.findUnique({ where: { id } });
    if (!shop) {
      const error = new Error('Shop not found');
      error.statusCode = 404;
      throw error;
    }

    const suspendedShop = await prisma.shop.update({
      where: { id },
      data: { isSuspended: true },
    });

    return {
      ...suspendedShop,
      status: getShopStatus(suspendedShop.expiryDate, suspendedShop.isSuspended),
    };
  }

  /**
   * Activate a suspended shop
   */
  async activateShop(id) {
    const shop = await prisma.shop.findUnique({ where: { id } });
    if (!shop) {
      const error = new Error('Shop not found');
      error.statusCode = 404;
      throw error;
    }

    const activatedShop = await prisma.shop.update({
      where: { id },
      data: { isSuspended: false },
    });

    return {
      ...activatedShop,
      status: getShopStatus(activatedShop.expiryDate, activatedShop.isSuspended),
    };
  }

  /**
   * Delete a shop and all related data (cascades via Prisma)
   */
  async deleteShop(id) {
    const shop = await prisma.shop.findUnique({ where: { id } });
    if (!shop) {
      const error = new Error('Shop not found');
      error.statusCode = 404;
      throw error;
    }
    await prisma.shop.delete({ where: { id } });
  }

  /**
   * Extend shop subscription
   */
  async extendSubscription(id, extensionOptions) {
    const shop = await prisma.shop.findUnique({ where: { id } });
    if (!shop) {
      const error = new Error('Shop not found');
      error.statusCode = 404;
      throw error;
    }

    const newExpiryDate = calculateNewExpiryDate(shop.expiryDate, extensionOptions);

    const updatedShop = await prisma.shop.update({
      where: { id },
      data: { expiryDate: newExpiryDate },
    });

    return {
      ...updatedShop,
      status: getShopStatus(updatedShop.expiryDate, updatedShop.isSuspended),
    };
  }
}

module.exports = new ShopsService();
