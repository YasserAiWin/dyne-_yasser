const { Router } = require('express');
const transactionsController = require('./transactions.controller');
const authMiddleware = require('../../middlewares/auth.middleware');
const roleMiddleware = require('../../middlewares/role.middleware');
const shopAccessMiddleware = require('../../middlewares/shopAccess.middleware');
const validate = require('../../middlewares/validate.middleware');
const { createTransactionSchema, getTransactionsSchema } = require('./transactions.validation');

const router = Router();

// Apply shop owner validation and subscription access control globally to this module
router.use(authMiddleware);
router.use(roleMiddleware('SHOP_OWNER'));
router.use(shopAccessMiddleware);

router.get('/:customerId/transactions', validate(getTransactionsSchema), transactionsController.getCustomerTransactions);
router.post('/:customerId/debts', validate(createTransactionSchema), transactionsController.createDebt);
router.post('/:customerId/payments', validate(createTransactionSchema), transactionsController.createPayment);

module.exports = router;
