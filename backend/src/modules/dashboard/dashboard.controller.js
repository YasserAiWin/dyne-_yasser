const dashboardService = require('./dashboard.service');
const { successResponse } = require('../../utils/apiResponse');

class DashboardController {
  /**
   * Super Admin stats summary
   */
  getAdminStats = async (req, res, next) => {
    try {
      const stats = await dashboardService.getAdminStats();
      return successResponse(res, 'Super Admin metrics retrieved', stats);
    } catch (error) {
      next(error);
    }
  };

  /**
   * List expiring soon shops
   */
  getExpiringShops = async (req, res, next) => {
    try {
      const shops = await dashboardService.getExpiringShops();
      return successResponse(res, 'Expiring soon shops retrieved', { shops });
    } catch (error) {
      next(error);
    }
  };

  /**
   * List expired shops
   */
  getExpiredShops = async (req, res, next) => {
    try {
      const shops = await dashboardService.getExpiredShops();
      return successResponse(res, 'Expired shops retrieved', { shops });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Shop Owner dashboard statistics
   */
  getShopStats = async (req, res, next) => {
    try {
      const shopId = req.user.shopId;
      const shopObj = req.user.shop;
      const stats = await dashboardService.getShopStats(shopId, shopObj);
      return successResponse(res, 'Shop owner metrics retrieved', stats);
    } catch (error) {
      next(error);
    }
  };
}

module.exports = new DashboardController();
