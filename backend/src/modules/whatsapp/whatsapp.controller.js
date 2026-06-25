const whatsappService = require('./whatsapp.service');
const { successResponse } = require('../../utils/apiResponse');

class WhatsappController {
  /**
   * Get whatsapp configuration settings for a shop
   */
  getSettings = async (req, res, next) => {
    try {
      const shopId = req.user.shopId;
      const settings = await whatsappService.getSettings(shopId);
      return successResponse(res, 'WhatsApp settings retrieved', { settings });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Get WhatsApp configuration settings for a shop as super admin.
   */
  getAdminSettings = async (req, res, next) => {
    try {
      const shopId = req.params.id;
      const settings = await whatsappService.getAdminSettings(shopId);
      return successResponse(res, 'WhatsApp settings retrieved', { settings });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Super admin updates the shop's Evolution configuration.
   */
  updateAdminSettings = async (req, res, next) => {
    try {
      const shopId = req.params.id;
      const settings = await whatsappService.updateAdminSettings(shopId, req.body);
      return successResponse(res, 'WhatsApp settings updated successfully', { settings });
    } catch (error) {
      next(error);
    }
  };
}

module.exports = new WhatsappController();
