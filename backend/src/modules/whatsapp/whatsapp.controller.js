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
   * Update whatsapp configuration settings
   */
  updateSettings = async (req, res, next) => {
    try {
      const shopId = req.user.shopId;
      const settings = await whatsappService.updateSettings(shopId, req.body);
      return successResponse(res, 'WhatsApp settings updated successfully', { settings });
    } catch (error) {
      next(error);
    }
  };
}

module.exports = new WhatsappController();
