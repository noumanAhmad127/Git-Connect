import { z } from 'zod';
import dotenv from 'dotenv';

dotenv.config();

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.coerce.number().int().positive().default(4000),
  HOST: z.string().default('localhost'),

  MONGODB_URI: z.string().url('MongoDB URI must be a valid URL'),

  BETTER_AUTH_SECRET: z.string().min(32, 'Better Auth secret must be at least 32 characters'),
  BETTER_AUTH_URL: z.string().url('Better Auth URL must be a valid URL'),

  JWT_SECRET: z.string().min(32, 'JWT secret must be at least 32 characters'),
  JWT_REFRESH_SECRET: z.string().min(32, 'JWT refresh secret must be at least 32 characters'),

  RESEND_API_KEY: z.string().startsWith('re_', 'Resend API key must start with re_'),

  UPLOAD_DIR: z.string().default('server/public/uploads'),
  MAX_FILE_SIZE: z.coerce
    .number()
    .int()
    .positive()
    .default(5 * 1024 * 1024),

  CLIENT_URL: z.string().url('Client URL must be a valid URL').default('http://localhost:5173'),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error('❌ Invalid environment variables:', parsed.error.flatten().fieldErrors);
  process.exit(1);
}

export const env = parsed.data;
