const { z } = require('zod');
const { normalizePhone, isValidMauritanianPhone } = require('../../utils/phones');

// Shop owner login: phone number + numeric PIN (4-8 digits)
const shopOwnerLoginSchema = z.object({
  phone: z.string()
    .transform((val) => normalizePhone(val))
    .refine((val) => isValidMauritanianPhone(val), {
      message: 'رقم هاتف موريتاني غير صالح. يجب أن يكون +222 متبوعاً بـ 8 أرقام.',
    }),
  pin: z.string()
    .regex(/^\d{4,8}$/, 'الرمز السري يجب أن يتكون من 4 إلى 8 أرقام فقط'),
});

// Admin login: email + password
const adminLoginSchema = z.object({
  email: z.string().email('بريد إلكتروني غير صالح'),
  password: z.string().min(6, 'كلمة المرور يجب أن تكون 6 أحرف على الأقل'),
});

// Unified login schema: accepts either format
const loginSchema = z.object({
  body: z.union([shopOwnerLoginSchema, adminLoginSchema], {
    errorMap: () => ({ message: 'بيانات الدخول غير صحيحة. أدخل هاتف + رمز، أو بريد إلكتروني + كلمة مرور.' }),
  }),
});

module.exports = {
  loginSchema,
};
