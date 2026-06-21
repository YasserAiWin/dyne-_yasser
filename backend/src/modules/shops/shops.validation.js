const { z } = require('zod');
const { normalizePhone, isValidMauritanianPhone } = require('../../utils/phones');

const createShopSchema = z.object({
  body: z.object({
    shopName: z.string().min(2, 'اسم المتجر يجب أن يكون حرفين على الأقل'),
    ownerName: z.string().min(2, 'اسم المالك يجب أن يكون حرفين على الأقل'),
    phone: z.string()
      .transform((val) => normalizePhone(val))
      .refine((val) => isValidMauritanianPhone(val), {
        message: 'رقم هاتف موريتاني غير صالح. يجب أن يكون +222 متبوعاً بـ 8 أرقام.',
      }),
    pin: z.string()
      .regex(/^\d{4,8}$/, 'الرمز السري يجب أن يتكون من 4 إلى 8 أرقام فقط'),
    startDate: z.string().datetime({ message: 'تاريخ غير صالح' }).or(z.string().date()).default(() => new Date().toISOString()),
    expiryDate: z.string().datetime({ message: 'تاريخ غير صالح' }).or(z.string().date()).optional(),
    subscriptionDuration: z.enum(['1_month', '3_months', '6_months', '1_year']).optional(),
  }).refine((data) => data.expiryDate !== undefined || data.subscriptionDuration !== undefined, {
    message: 'يجب تحديد مدة الاشتراك أو تاريخ انتهائه',
  }),
});

const updateShopSchema = z.object({
  params: z.object({
    id: z.string().uuid('معرّف المتجر غير صالح'),
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
    id: z.string().uuid('معرّف المتجر غير صالح'),
  }),
  body: z.object({
    addDays: z.coerce.number().int().positive().optional(),
    addMonths: z.coerce.number().int().positive().optional(),
    addYears: z.coerce.number().int().positive().optional(),
    customExpiryDate: z.string().datetime({ message: 'تاريخ غير صالح' }).or(z.string().date()).optional(),
  }).refine((data) => {
    return data.addDays !== undefined || data.addMonths !== undefined || data.addYears !== undefined || data.customExpiryDate !== undefined;
  }, {
    message: 'يجب تحديد مدة التمديد أو تاريخ الانتهاء الجديد',
  }),
});

const getShopSchema = z.object({
  params: z.object({
    id: z.string().uuid('معرّف المتجر غير صالح'),
  }),
});

module.exports = {
  createShopSchema,
  updateShopSchema,
  extendSubscriptionSchema,
  getShopSchema,
};
