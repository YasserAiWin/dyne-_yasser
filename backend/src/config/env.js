const dotenv = require('dotenv');
const { z } = require('zod');

// Load environment variables
dotenv.config();

const envSchema = z.object({
  PORT: z.coerce.number().default(5000),
  DATABASE_URL: z.string().url(),
  JWT_SECRET: z.string().min(8),
  JWT_EXPIRES_IN: z.string().default('7d'),
  FRONTEND_URL: z
    .string()
    .refine(
      (value) => value.split(',').every((origin) => z.string().url().safeParse(origin.trim()).success),
      'FRONTEND_URL must be a URL or comma-separated list of URLs'
    )
    .default('http://localhost:5173'),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error('❌ Invalid environment variables:', parsed.error.format());
  process.exit(1);
}

module.exports = parsed.data;
