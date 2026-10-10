import path from 'node:path';
import { fileURLToPath } from 'node:url';
import dotenv from 'dotenv';
import { z } from 'zod';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Load server/.env (works both in dev and test)
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const boolFromString = z
  .union([z.boolean(), z.string()])
  .transform((val) => (typeof val === 'boolean' ? val : val.toLowerCase() === 'true'));

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.coerce.number().int().positive().default(5050),
  API_PREFIX: z.string().default('/api/v1'),
  MONGODB_URI: z.string().min(1, 'MONGODB_URI is required'),
  JWT_SECRET: z.string().min(16, 'JWT_SECRET must be at least 16 characters'),
  JWT_EXPIRES_IN: z.string().default('7d'),
  COOKIE_SECRET: z.string().min(8).default('dev-cookie-secret-change-me'),
  COOKIE_NAME: z.string().default('civicconnect_token'),
  CSRF_COOKIE_NAME: z.string().default('civicconnect_csrf'),
  COOKIE_SECURE: boolFromString.default(false),
  COOKIE_SAME_SITE: z.enum(['lax', 'strict', 'none']).default('lax'),
  CLIENT_ORIGIN: z.string().default('http://localhost:5173'),
  UPLOAD_DIR: z.string().default('uploads'),
  MAX_UPLOAD_MB: z.coerce.number().positive().default(5),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  const issues = parsed.error.issues.map((i) => `  - ${i.path.join('.')}: ${i.message}`).join('\n');
  // eslint-disable-next-line no-console
  console.error(`\n[config] Invalid environment configuration:\n${issues}\n`);
  if (process.env.NODE_ENV !== 'test') process.exit(1);
}

const raw = parsed.success ? parsed.data : envSchema.parse({
  ...process.env,
  MONGODB_URI: process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/civicconnect_test',
  JWT_SECRET: process.env.JWT_SECRET || 'test-secret-key-that-is-long-enough',
});

export const env = {
  ...raw,
  isProduction: raw.NODE_ENV === 'production',
  isTest: raw.NODE_ENV === 'test',
  clientOrigins: raw.CLIENT_ORIGIN.split(',').map((s) => s.trim()).filter(Boolean),
  maxUploadBytes: raw.MAX_UPLOAD_MB * 1024 * 1024,
  uploadPath: path.resolve(__dirname, '../../', raw.UPLOAD_DIR),
};

export default env;
