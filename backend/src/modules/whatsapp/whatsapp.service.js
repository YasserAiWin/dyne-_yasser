const prisma = require('../../prisma/client');
const { calculateCustomerBalance } = require('../../utils/balances');
const { normalizePhone, isValidMauritanianPhone, toMauritanianWhatsappNumber } = require('../../utils/phones');

const CONNECTED_STATUSES = new Set(['CONNECTED', 'OPEN']);

const sanitizeSettings = (settings) => {
  if (!settings) return settings;
  const { apiKey, instanceToken, ...safeSettings } = settings;
  return {
    ...safeSettings,
    hasApiKey: Boolean(apiKey),
    hasInstanceToken: Boolean(instanceToken),
  };
};

const formatMoney = (amount) => `${Number(amount || 0).toFixed(2)} MRU`;

const formatItems = (itemsJson, note) => {
  if (note) return note;

  if (Array.isArray(itemsJson)) {
    return itemsJson
      .map((item) => {
        if (typeof item === 'string') return item;
        const name = item.name || item.title || item.item || 'Item';
        const qty = item.quantity || item.qty;
        const price = item.price || item.amount;
        return [name, qty ? `x${qty}` : null, price ? formatMoney(price) : null].filter(Boolean).join(' ');
      })
      .filter(Boolean)
      .join('\n');
  }

  if (itemsJson && typeof itemsJson === 'object') {
    return JSON.stringify(itemsJson);
  }

  return '';
};

const buildTransactionMessage = ({ shop, customer, transaction, balance }) => {
  const amount = formatMoney(transaction.amount);
  const currentBalance = formatMoney(balance);
  const details = formatItems(transaction.itemsJson, transaction.note);
  const shopName = shop?.shopName || 'المحل';
  const customerName = customer?.name || 'الزبون';

  if (transaction.type === 'PAYMENT') {
    return [
      `مرحبا ${customerName}`,
      '',
      `تم تسجيل دفعة من ${shopName}.`,
      '',
      'المبلغ المدفوع:',
      amount,
      '',
      'الرصيد المتبقي:',
      currentBalance,
    ].join('\n');
  }

  return [
    `مرحبا ${customerName}`,
    '',
    `تم تسجيل دين جديد عليك من ${shopName}.`,
    '',
    'المبلغ:',
    amount,
    '',
    'ملاحظة:',
    details || 'دين جديد',
    '',
    'الرصيد الحالي:',
    currentBalance,
  ].join('\n');
};

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

    return sanitizeSettings(settings);
  }

  /**
   * Get WhatsApp settings for super admin.
   */
  async getAdminSettings(shopId) {
    const existingShop = await prisma.shop.findUnique({ where: { id: shopId } });
    if (!existingShop) {
      const error = new Error('Shop not found');
      error.statusCode = 404;
      throw error;
    }

    const settings = await this.getOrCreateRawSettings(shopId);
    return sanitizeSettings(settings);
  }

  /**
   * Update WhatsApp settings
   */
  async updateSettings(shopId, updateData) {
    const saved = await prisma.shopWhatsappSetting.upsert({
      where: { shopId },
      update: updateData,
      create: {
        shopId,
        provider: updateData.provider || 'EVOLUTION',
        apiUrl: updateData.apiUrl,
        apiKey: updateData.apiKey,
        instanceName: updateData.instanceName,
        senderPhone: updateData.senderPhone,
        instanceId: updateData.instanceId,
        instanceToken: updateData.instanceToken,
        connectionStatus: updateData.connectionStatus || 'DISCONNECTED',
        qrCode: updateData.qrCode,
        webhookUrl: updateData.webhookUrl,
      },
    });

    return sanitizeSettings(saved);
  }

  /**
   * Super admin updates the per-shop Evolution settings.
   */
  async updateAdminSettings(shopId, updateData) {
    const existingShop = await prisma.shop.findUnique({ where: { id: shopId } });
    if (!existingShop) {
      const error = new Error('Shop not found');
      error.statusCode = 404;
      throw error;
    }

    const data = { ...updateData };

    if (Object.prototype.hasOwnProperty.call(data, 'senderPhone')) {
      data.senderPhone = data.senderPhone ? normalizePhone(data.senderPhone) : null;
      if (data.senderPhone && !isValidMauritanianPhone(data.senderPhone)) {
        const error = new Error('Sender phone must be a valid Mauritanian 8-digit number');
        error.statusCode = 400;
        throw error;
      }
    }

    if (data.apiKey === '') {
      delete data.apiKey;
    }

    return this.updateSettings(shopId, data);
  }

  async getOrCreateRawSettings(shopId) {
    let settings = await prisma.shopWhatsappSetting.findUnique({
      where: { shopId },
    });

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

  async logMessage(data) {
    try {
      await prisma.whatsappMessageLog.create({ data });
    } catch (error) {
      console.error('Failed to write WhatsApp message log:', error.message);
    }
  }

  async sendEvolutionText(settings, recipient, text) {
    const apiUrl = settings.apiUrl?.replace(/\/+$/, '');
    const instanceName = settings.instanceName || settings.instanceId;
    const apiKey = settings.apiKey || settings.instanceToken;

    if (!apiUrl || !instanceName || !apiKey) {
      throw new Error('Evolution API settings are incomplete');
    }

    const response = await fetch(`${apiUrl}/message/sendText/${encodeURIComponent(instanceName)}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        apikey: apiKey,
      },
      body: JSON.stringify({
        number: recipient,
        text,
      }),
    });

    if (!response.ok) {
      const body = await response.text();
      throw new Error(`Evolution API failed with ${response.status}: ${body.slice(0, 300)}`);
    }
  }

  /**
   * Notify a customer after a saved debt/payment transaction.
   * This method never throws to the caller, so core accounting is not blocked by WhatsApp.
   */
  async notifyCustomerTransaction(shopId, customerId, transactionId) {
    const transaction = await prisma.transaction.findFirst({
      where: {
        id: transactionId,
        shopId,
        customerId,
      },
    });

    if (!transaction) return;

    const [shop, customer, settings] = await Promise.all([
      prisma.shop.findUnique({ where: { id: shopId } }),
      prisma.customer.findFirst({ where: { id: customerId, shopId, deletedAt: null } }),
      prisma.shopWhatsappSetting.findUnique({ where: { shopId } }),
    ]);

    const baseLog = {
      shopId,
      customerId,
      transactionId,
      recipient: customer?.phone || '',
      messageType: transaction.type,
    };

    if (!customer?.phone) {
      await this.logMessage({ ...baseLog, status: 'SKIPPED', errorMessage: 'Customer has no phone number' });
      return;
    }

    const recipient = toMauritanianWhatsappNumber(customer.phone);
    if (!recipient) {
      await this.logMessage({ ...baseLog, status: 'SKIPPED', errorMessage: 'Customer phone is not a valid Mauritanian number' });
      return;
    }

    if (!settings || !CONNECTED_STATUSES.has(String(settings.connectionStatus || '').toUpperCase())) {
      await this.logMessage({ ...baseLog, recipient, status: 'SKIPPED', errorMessage: 'Shop WhatsApp is not connected' });
      return;
    }

    const transactions = await prisma.transaction.findMany({
      where: { shopId, customerId },
      select: { amount: true, type: true },
    });
    const balance = calculateCustomerBalance(transactions);
    const text = buildTransactionMessage({ shop, customer, transaction, balance });

    try {
      await this.sendEvolutionText(settings, recipient, text);
      await this.logMessage({ ...baseLog, recipient, status: 'SENT' });
    } catch (error) {
      await this.logMessage({ ...baseLog, recipient, status: 'FAILED', errorMessage: error.message });
      console.error('WhatsApp notification failed:', error.message);
    }
  }
}

module.exports = new WhatsappService();
