const { z } = require('zod');
const { normalizePhone, isValidMauritanianPhone } = require('../../utils/phones');

const createShopSchema = z.object({
  body: z.object({
    shopName: z.string().min(2, 'Shop name must be at least 2 characters'),
    ownerName: z.string().min(2, 'Owner name must be at least 2 characters'),
    phone: z.string()
      .transform((val) => normalizePhone(val))
      .refine((val) => isValidMauritanianPhone(val), {
        message: 'Invalid Mauritanian phone number. Must be +222 followed by exactly 8 digits.',
      }),
    password: z.string().min(6, 'Owner password must be at least 6 characters'),
    startDate: z.string().datetime({ message: 'Invalid ISO date' }).or(z.string().date()).default(() => new Date().toISOString()),
    expiryDate: z.string().datetime({ message: 'Invalid ISO date' }).or(z.string().date()).optional(),
    subscriptionDuration: z.enum(['1_month', '3_months', '6_months', '1_year']).optional(),
  }).refine((data) => data.expiryDate !== undefined || data.subscriptionDuration !== undefined, {
    message: 'Either expiryDate or subscriptionDuration must be provided',
  }),
});

const updateShopSchema = z.object({
  params: z.object({
    id: z.string().uuid('Invalid shop ID format'),
  }),
  body: z.object({
    shopName: z.string().min(2).optional(),
    ownerName: z.string().min(2).optional(),
    phone: z.string()
      .transform((val) => normalizePhone(val))
      .refine((val) => isValidMauritanianPhone(val))
      .optional(),
  }),
});

const extendSubscriptionSchema = z.object({
  params: z.object({
    id: z.string().uuid('Invalid shop ID format'),
  }),
  body: z.object({
    addDays: z.coerce.number().int().positive().optional(),
    addMonths: z.coerce.number().int().positive().optional(),
    addYears: z.coerce.number().int().positive().optional(),
    customExpiryDate: z.string().datetime({ message: 'Invalid ISO date' }).or(z.string().date()).optional(),
  }).refine((data) => {
    return data.addDays !== undefined || data.addMonths !== undefined || data.addYears !== undefined || data.customExpiryDate !== undefined;
  }, {
    message: 'At least one extension option (addDays, addMonths, addYears, or customExpiryDate) must be provided',
  }),
});

const getShopSchema = z.object({
  params: z.object({
    id: z.string().uuid('Invalid shop ID format'),
  }),
});

module.exports = {
  createShopSchema,
  updateShopSchema,
  extendSubscriptionSchema,
  getShopSchema,
};
