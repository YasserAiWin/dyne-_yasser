const { Router } = require('express');
const whatsappController = require('./whatsapp.controller');
const authMiddleware = require('../../middlewares/auth.middleware');
const roleMiddleware = require('../../middlewares/role.middleware');
const shopAccessMiddleware = require('../../middlewares/shopAccess.middleware');

const router = Router();

// Secure whatsapp endpoints globally in this module
router.use(authMiddleware);
router.use(roleMiddleware('SHOP_OWNER'));
router.use(shopAccessMiddleware);

router.get('/settings', whatsappController.getSettings);

module.exports = router;
