const rateLimit = require('express-rate-limit');
const { RedisStore } = require('rate-limit-redis');
const redisClient = require('./redis');
const { env } = require('./env');

/**
 * Esnek Rate Limiter Oluşturucu
 * @param {Object} options 
 * @param {number} options.minutes - Kaç dakika geçerli olacağı
 * @param {number} options.max - İzin verilen maksimum istek sayısı
 * @param {string} options.prefix - Redis üzerindeki anahtar öneki
 */

const createRateLimiter = ({ minutes = 15, max = 100, prefix = 'rl:genel:' } = {}) => {
    return rateLimit({
        windowMs: minutes * 60 * 1000,
        max: max,
        standardHeaders: true,
        legacyHeaders: false,

        store: new RedisStore({
            sendCommand: (...args) => redisClient.sendCommand(args),
            prefix: prefix
        }),

        handler: (req, res) => {
            const message = res.locals.t?.form?.tooManyRequests || 'Çok fazla istek gönderdiniz, lütfen daha sonra tekrar deneyin.';

            if (req.xhr || req.headers.accept?.includes('json')) {
                return res.status(429).json({
                    success: false,
                    message: message
                });
            }

            return res.status(429).send(message);
        }
    });
};


const generalLimiter = createRateLimiter({
    minutes: parseInt(env.RATE_LIMIT_MINUTES, 10) || 15,
    max: parseInt(env.RATE_LIMIT_MAX_REQUESTS, 10) || 100,
    prefix: 'rl:general:'
});

const formLimiter = createRateLimiter({
    minutes: 15,
    max: 5,
    prefix: 'rl:form:'
});

module.exports = {
    createRateLimiter,
    generalLimiter,
    formLimiter
};