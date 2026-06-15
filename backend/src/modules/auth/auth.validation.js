const { z } = require('zod');
const { normalizePhone, isValidMauritanianPhone } = require('../../utils/phones');

const loginSchema = z.object({
  body: z.object({
    phone: z.string()
      .transform((val) => normalizePhone(val))
      .refine((val) => isValidMauritanianPhone(val), {
        message: 'Invalid Mauritanian phone number. Must be +222 followed by exactly 8 digits.',
      }),
    password: z.string().min(1, 'Password is required'),
  }),
});

module.exports = {
  loginSchema,
};
