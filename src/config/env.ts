// src/config/env.ts
import dotenv from 'dotenv';
import { expand } from 'dotenv-expand';

const envConfig = dotenv.config();
expand(envConfig);

interface EnvConfig {
  APP_ENV: string;
  PORT: number;
  APP_URL: string;
  SITE_URL: string;
  SESSION_SECRET: string;
  ADMIN_PANEL_ENDPOINT: string;
  TURNSTILE_SITE_KEY: string;
  REDIS_URL: string;
  [key: string]: any;
}

const WEAK_SESSION_SECRETS = new Set([
  'very_secret_key_must_be_change',
  'very_secret_code'
]);

const resolveSessionSecret = (appEnv: string): string => {
  const secret = (process.env.SESSION_SECRET || '').trim();

  if (!secret || WEAK_SESSION_SECRETS.has(secret)) {
    throw new Error(
      'SESSION_SECRET tanımlı, boş olmayan ve tahmin edilebilir olmayan bir değer olmalıdır.'
    );
  }

  if (appEnv === 'prod' && secret.length < 32) {
    throw new Error('Üretim ortamında SESSION_SECRET en az 32 karakter olmalıdır.');
  }

  return secret;
};

const APP_ENV = process.env.APP_ENV || 'dev';

export const env: Readonly<EnvConfig> = Object.freeze({
  ...process.env,
  APP_ENV,
  PORT: parseInt(process.env.PORT || '3000', 10),
  APP_URL: process.env.APP_URL || 'http://localhost:3000',
  SITE_URL: process.env.SITE_URL || 'https://mahmuttuysuz.net',
  SESSION_SECRET: resolveSessionSecret(APP_ENV),
  ADMIN_PANEL_ENDPOINT: process.env.ADMIN_PANEL_ENDPOINT || '/admin',
  TURNSTILE_SITE_KEY: process.env.TURNSTILE_SITE_KEY || '',
  REDIS_URL: process.env.REDIS_URL || 'redis://127.0.0.1:6379'
});
