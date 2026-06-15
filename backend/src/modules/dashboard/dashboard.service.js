const prisma = require('../../prisma/client');
const { getShopStatus } = require('../../utils/dates');
const { calculateCustomerBalance, calculateShopOutstandingDebt } = require('../../utils/balances');

class DashboardService {
  /**
   * Get Super Admin dashboard stats
   */
  async getAdminStats() {
    const shops = await prisma.shop.findMany();
    
    let totalShops = shops.length;
    let activeShops = 0;
    let suspendedShops = 0;
    let expiredShops = 0;
    let expiringSoonShops = 0;

    for (const shop of shops) {
      const status = getShopStatus(shop.expiryDate, shop.isSuspended);
      if (status === 'ACTIVE') activeShops++;
      else if (status === 'SUSPENDED') suspendedShops++;
      else if (status === 'EXPIRED') expiredShops++;
      else if (status === 'EXPIRING_SOON') expiringSoonShops++;
    }

    return {
      totalShops,
      activeShops,
      suspendedShops,
      expiredShops,
      expiringSoonShops,
    };
  }

  /**
   * Get list of shops expiring soon (<= 5 days)
   */
  async getExpiringShops() {
    const shops = await prisma.shop.findMany({
      include: {
        users: {
          select: {
            id: true,
            name: true,
            phone: true,
          },
        },
      },
    });

    const expiringSoon = shops
      .map((shop) => ({
        ...shop,
        status: getShopStatus(shop.expiryDate, shop.isSuspended),
      }))
      .filter((shop) => shop.status === 'EXPIRING_SOON');

    return expiringSoon;
  }

  /**
   * Get list of expired shops
   */
  async getExpiredShops() {
    const shops = await prisma.shop.findMany({
      include: {
        users: {
          select: {
            id: true,
            name: true,
            phone: true,
          },
        },
      },
    });

    const expired = shops
      .map((shop) => ({
        ...shop,
        status: getShopStatus(shop.expiryDate, shop.isSuspended),
      }))
      .filter((shop) => shop.status === 'EXPIRED');

    return expired;
  }

  /**
   * Get Shop Owner dashboard stats
   * 
   * @param {string} shopId 
   * @param {Object} shopObj - Shop details to check subscription limits
   */
  async getShopStats(shopId, shopObj) {
    // Fetch all active customers for this shop with their transactions
    const customers = await prisma.customer.findMany({
      where: {
        shopId,
        deletedAt: null, // exclude soft-deleted customers
      },
      include: {
        transactions: {
          select: {
            amount: true,
            type: true,
          },
        },
      },
    });

    const customerBalances = [];
    let debtCustomersCount = 0;
    let creditCustomersCount = 0;
    let settledCustomersCount = 0;

    for (const customer of customers) {
      const balance = calculateCustomerBalance(customer.transactions);
      customerBalances.push(balance);

      if (balance > 0) {
        debtCustomersCount++;
      } else if (balance < 0) {
        creditCustomersCount++;
      } else {
        settledCustomersCount++;
      }
    }

    // Calculate shop total outstanding debt (positive balances only)
    const totalOutstandingDebt = calculateShopOutstandingDebt(customerBalances);

    // Dynamic subscription properties
    const status = getShopStatus(shopObj.expiryDate, shopObj.isSuspended);
    const diffTime = new Date(shopObj.expiryDate).getTime() - new Date().getTime();
    const remainingDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    return {
      totalCustomers: customers.length,
      debtCustomersCount,
      creditCustomersCount,
      settledCustomersCount,
      totalOutstandingDebt,
      subscription: {
        status,
        expiryDate: shopObj.expiryDate,
        remainingDays: remainingDays > 0 ? remainingDays : 0,
      },
    };
  }
}

module.exports = new DashboardService();
