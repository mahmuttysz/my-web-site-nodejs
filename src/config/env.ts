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

export const env: Readonly<EnvConfig> = Object.freeze({
  APP_ENV: process.env.APP_ENV || 'dev',
  PORT: parseInt(process.env.PORT || '3000', 10),
  APP_URL: process.env.APP_URL || 'http://localhost:3000',
  SITE_URL: process.env.SITE_URL || 'https://mahmuttuysuz.net',
  SESSION_SECRET: process.env.SESSION_SECRET || 'very_secret_key_must_be_change',
  ADMIN_PANEL_ENDPOINT: process.env.ADMIN_PANEL_ENDPOINT || '/admin',
  TURNSTILE_SITE_KEY: process.env.TURNSTILE_SITE_KEY || '',
  REDIS_URL: process.env.REDIS_URL || 'redis://127.0.0.1:6379',

  ...process.env
});