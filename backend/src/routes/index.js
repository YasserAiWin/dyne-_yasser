const { Router } = require('express');
const authRouter = require('../modules/auth/auth.routes');
const adminShopsRouter = require('../modules/shops/shops.routes');
const { adminRouter: adminDashboardRouter, shopRouter: shopDashboardRouter } = require('../modules/dashboard/dashboard.routes');
const customersRouter = require('../modules/customers/customers.routes');
const transactionsRouter = require('../modules/transactions/transactions.routes');
const whatsappRouter = require('../modules/whatsapp/whatsapp.routes');

const router = Router();

// 1. Authentication routes (/api/auth)
router.use('/auth', authRouter);

// 2. Super Admin endpoints (/api/admin)
// - Shops management: GET/POST /api/admin/shops etc.
// - Dashboard metrics: GET /api/admin/dashboard, GET /api/admin/shops-expiring etc.
router.use('/admin', adminShopsRouter);
router.use('/admin', adminDashboardRouter);

// 3. Shop Owner endpoints (/api/shop)
// - Shop Dashboard: GET /api/shop/dashboard
// - Customers: GET/POST /api/shop/customers, GET/PUT/DELETE /api/shop/customers/:id
// - Transactions: GET /api/shop/customers/:customerId/transactions, POST /api/shop/customers/:customerId/debts, POST /api/shop/customers/:customerId/payments
// - WhatsApp status: GET /api/shop/whatsapp/settings
router.use('/shop', shopDashboardRouter);
router.use('/shop/customers', customersRouter);
router.use('/shop/customers', transactionsRouter);
router.use('/shop/whatsapp', whatsappRouter);

module.exports = router;
