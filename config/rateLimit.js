const rateLimit = require('express-rate-limit');
const locales = require('../utils/locales');
const { env } = require('./env');

const minutes = parseInt(env.RATE_LIMIT_MINUTES) || 15;
const maxRequests = parseInt(env.RATE_LIMIT_MAX_REQUESTS) || 5;

module.exports = {
    rateLimiter: () => {
        return rateLimit({
            windowMs: minutes * 60 * 1000,
            max: maxRequests,
            handler: (req, res) => {
                return res.status(429).json({
                    success: false,
                    message: res.locals.t.form.tooManyRequests
                });
            }
        });
    }
};