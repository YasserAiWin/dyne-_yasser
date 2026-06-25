const { z } = require('zod');

const updateWhatsappSettingsSchema = z.object({
  params: z.object({
    id: z.string().uuid('Invalid shop ID format'),
  }),
  body: z.object({
    provider: z.string().optional(),
    apiUrl: z.string().url('Invalid Evolution API URL').optional().nullable(),
    apiKey: z.string().optional().nullable(),
    instanceName: z.string().optional().nullable(),
    senderPhone: z.string().optional().nullable(),
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
