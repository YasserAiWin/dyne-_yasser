const { Router } = require('express');
const dashboardController = require('./dashboard.controller');
const authMiddleware = require('../../middlewares/auth.middleware');
const roleMiddleware = require('../../middlewares/role.middleware');
const shopAccessMiddleware = require('../../middlewares/shopAccess.middleware');

const adminRouter = Router();
adminRouter.use(authMiddleware);
adminRouter.use(roleMiddleware('SUPER_ADMIN'));

adminRouter.get('/dashboard', dashboardController.getAdminStats);
adminRouter.get('/shops-expiring', dashboardController.getExpiringShops);
adminRouter.get('/shops-expired', dashboardController.getExpiredShops);

const shopRouter = Router();
shopRouter.use(authMiddleware);
shopRouter.use(roleMiddleware('SHOP_OWNER'));
shopRouter.use(shopAccessMiddleware); // Check if expired or suspended

shopRouter.get('/dashboard', dashboardController.getShopStats);

module.exports = {
  adminRouter,
  shopRouter,
};
