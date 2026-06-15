const { Router } = require('express');
const customersController = require('./customers.controller');
const authMiddleware = require('../../middlewares/auth.middleware');
const roleMiddleware = require('../../middlewares/role.middleware');
const shopAccessMiddleware = require('../../middlewares/shopAccess.middleware');
const validate = require('../../middlewares/validate.middleware');
const { createCustomerSchema, updateCustomerSchema, getCustomerSchema } = require('./customers.validation');

const router = Router();

// Apply shop owner validation and subscription access control globally to this module
router.use(authMiddleware);
router.use(roleMiddleware('SHOP_OWNER'));
router.use(shopAccessMiddleware);

router.get('/', customersController.getAllCustomers);
router.post('/', validate(createCustomerSchema), customersController.createCustomer);
router.get('/:id', validate(getCustomerSchema), customersController.getCustomerById);
router.put('/:id', validate(updateCustomerSchema), customersController.updateCustomer);
router.delete('/:id', validate(getCustomerSchema), customersController.deleteCustomer);

module.exports = router;
