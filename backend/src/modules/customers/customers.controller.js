const customersService = require('./customers.service');
const { successResponse } = require('../../utils/apiResponse');

class CustomersController {
  /**
   * List all active customers for the shop owner
   */
  getAllCustomers = async (req, res, next) => {
    try {
      const shopId = req.user.shopId;
      const customers = await customersService.getAllCustomers(shopId);
      return successResponse(res, 'Customers list retrieved', { customers });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Get specific customer profile
   */
  getCustomerById = async (req, res, next) => {
    try {
      const shopId = req.user.shopId;
      const customerId = req.params.id;
      const customer = await customersService.getCustomerById(shopId, customerId);
      return successResponse(res, 'Customer profile retrieved', { customer });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Create customer under current shop owner's shop
   */
  createCustomer = async (req, res, next) => {
    try {
      const shopId = req.user.shopId;
      const customer = await customersService.createCustomer(shopId, req.body);
      return successResponse(res, 'Customer created successfully', { customer }, 201);
    } catch (error) {
      next(error);
    }
  };

  /**
   * Update customer profile info
   */
  updateCustomer = async (req, res, next) => {
    try {
      const shopId = req.user.shopId;
      const customerId = req.params.id;
      const customer = await customersService.updateCustomer(shopId, customerId, req.body);
      return successResponse(res, 'Customer profile updated', { customer });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Soft delete customer
   */
  deleteCustomer = async (req, res, next) => {
    try {
      const shopId = req.user.shopId;
      const customerId = req.params.id;
      await customersService.deleteCustomer(shopId, customerId);
      return successResponse(res, 'Customer soft-deleted successfully');
    } catch (error) {
      next(error);
    }
  };
}

module.exports = new CustomersController();
