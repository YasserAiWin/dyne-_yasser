const { z } = require('zod');

const updateWhatsappSettingsSchema = z.object({
  body: z.object({
    provider: z.string().optional(),
    instanceId: z.string().optional().nullable(),
    instanceToken: z.string().optional().nullable(),
    connectionStatus: z.string().optional(),
    qrCode: z.string().optional().nullable(),
    webhookUrl: z.string().url('Invalid webhook URL').or(z.string().length(0)).optional().nullable(),
  }),
});

module.exports = {
  updateWhatsappSettingsSchema,
};
