const transactionsService = require('./transactions.service');
const { successResponse } = require('../../utils/apiResponse');

class TransactionsController {
  /**
   * Get all transactions for a customer
   */
  getCustomerTransactions = async (req, res, next) => {
    try {
      const shopId = req.user.shopId;
      const { customerId } = req.params;
      const transactions = await transactionsService.getCustomerTransactions(shopId, customerId);
      return successResponse(res, 'Transactions retrieved successfully', { transactions });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Record a DEBT transaction for a customer
   */
  createDebt = async (req, res, next) => {
    try {
      const shopId = req.user.shopId;
      const createdById = req.user.id;
      const { customerId } = req.params;
      
      const transaction = await transactionsService.createTransaction(
        shopId,
        customerId,
        'DEBT',
        req.body,
        createdById
      );
      
      return successResponse(res, 'Debt transaction registered successfully', { transaction }, 201);
    } catch (error) {
      next(error);
    }
  };

  /**
   * Record a PAYMENT transaction for a customer
   */
  createPayment = async (req, res, next) => {
    try {
      const shopId = req.user.shopId;
      const createdById = req.user.id;
      const { customerId } = req.params;
      
      const transaction = await transactionsService.createTransaction(
        shopId,
        customerId,
        'PAYMENT',
        req.body,
        createdById
      );
      
      return successResponse(res, 'Payment transaction registered successfully', { transaction }, 201);
    } catch (error) {
      next(error);
    }
  };
}

module.exports = new TransactionsController();
