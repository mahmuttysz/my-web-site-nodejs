const dotenv = require('dotenv');
const dotenvExpand = require('dotenv-expand');

const envConfig = dotenv.config();
dotenvExpand.expand(envConfig);

const env = {
    APP_ENV: process.env.APP_ENV || 'dev',
    PORT: parseInt(process.env.PORT, 10) || 3000,
    APP_URL: process.env.APP_URL || 'http://localhost:3000',
    SESSION_SECRET: process.env.SESSION_SECRET || 'very_secret_key_must_be_change',
    ADMIN_PANEL_ENDPOINT: process.env.ADMIN_PANEL_ENDPOINT || '/admin',
    TURNSTILE_SITE_KEY: process.env.TURNSTILE_SITE_KEY || '',
    REDIS_URL: process.env.REDIS_URL || 'redis://127.0.0.1:6379',

    ...process.env
};

Object.freeze(env);

module.exports = { env };