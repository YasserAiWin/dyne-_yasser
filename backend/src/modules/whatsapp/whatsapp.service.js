const prisma = require('../../prisma/client');

class WhatsappService {
  /**
   * Get WhatsApp settings for the shop.
   */
  async getSettings(shopId) {
    let settings = await prisma.shopWhatsappSetting.findUnique({
      where: { shopId },
    });

    // Fallback self-healing if settings record is somehow missing
    if (!settings) {
      settings = await prisma.shopWhatsappSetting.create({
        data: {
          shopId,
          provider: 'EVOLUTION',
          connectionStatus: 'DISCONNECTED',
        },
      });
    }

    return settings;
  }

  /**
   * Update WhatsApp settings
   */
  async updateSettings(shopId, updateData) {
    return prisma.shopWhatsappSetting.upsert({
      where: { shopId },
      update: updateData,
      create: {
        shopId,
        provider: updateData.provider || 'EVOLUTION',
        instanceId: updateData.instanceId,
        instanceToken: updateData.instanceToken,
        connectionStatus: updateData.connectionStatus || 'DISCONNECTED',
        qrCode: updateData.qrCode,
        webhookUrl: updateData.webhookUrl,
      },
    });
  }
}

module.exports = new WhatsappService();
