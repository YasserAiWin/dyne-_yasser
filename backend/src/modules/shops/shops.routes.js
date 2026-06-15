const { Router } = require('express');
const shopsController = require('./shops.controller');
const authMiddleware = require('../../middlewares/auth.middleware');
const roleMiddleware = require('../../middlewares/role.middleware');
const validate = require('../../middlewares/validate.middleware');
const { createShopSchema, updateShopSchema, extendSubscriptionSchema, getShopSchema } = require('./shops.validation');

const router = Router();

// Apply Super Admin authentication and authorization globally to all routes in this module
router.use(authMiddleware);
router.use(roleMiddleware('SUPER_ADMIN'));

router.get('/shops', shopsController.getAllShops);
router.post('/shops', validate(createShopSchema), shopsController.createShop);
router.get('/shops/:id', validate(getShopSchema), shopsController.getShopById);
router.put('/shops/:id', validate(updateShopSchema), shopsController.updateShop);
router.patch('/shops/:id/suspend', validate(getShopSchema), shopsController.suspendShop);
router.patch('/shops/:id/activate', validate(getShopSchema), shopsController.activateShop);
router.post('/shops/:id/extend-subscription', validate(extendSubscriptionSchema), shopsController.extendSubscription);

module.exports = router;
