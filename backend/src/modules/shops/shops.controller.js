const shopsService = require('./shops.service');
const { successResponse } = require('../../utils/apiResponse');

class ShopsController {
  /**
   * List all shops
   */
  getAllShops = async (req, res, next) => {
    try {
      const shops = await shopsService.getAllShops();
      return successResponse(res, 'Shops retrieved successfully', { shops });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Get shop by ID
   */
  getShopById = async (req, res, next) => {
    try {
      const { id } = req.params;
      const shop = await shopsService.getShopById(id);
      return successResponse(res, 'Shop retrieved successfully', { shop });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Create new shop with owner user and default whatsapp settings
   */
  createShop = async (req, res, next) => {
    try {
      const result = await shopsService.createShop(req.body);
      return successResponse(res, 'Shop and owner account created successfully', result, 201);
    } catch (error) {
      next(error);
    }
  };

  /**
   * Update shop basic details
   */
  updateShop = async (req, res, next) => {
    try {
      const { id } = req.params;
      const shop = await shopsService.updateShop(id, req.body);
      return successResponse(res, 'Shop details updated successfully', { shop });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Suspend a shop
   */
  suspendShop = async (req, res, next) => {
    try {
      const { id } = req.params;
      const shop = await shopsService.suspendShop(id);
      return successResponse(res, 'Shop suspended successfully', { shop });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Activate a suspended shop
   */
  activateShop = async (req, res, next) => {
    try {
      const { id } = req.params;
      const shop = await shopsService.activateShop(id);
      return successResponse(res, 'Shop activated successfully', { shop });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Extend a shop's subscription duration
   */
  extendSubscription = async (req, res, next) => {
    try {
      const { id } = req.params;
      const shop = await shopsService.extendSubscription(id, req.body);
      return successResponse(res, 'Shop subscription extended successfully', { shop });
    } catch (error) {
      next(error);
    }
  };
}

module.exports = new ShopsController();
