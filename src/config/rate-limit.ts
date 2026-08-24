// src/config/rate-limit.ts
import rateLimit, { RateLimitRequestHandler } from 'express-rate-limit';
import { RedisStore } from 'rate-limit-redis';
import { Request, Response } from 'express';
import redisClient from './redis';
import { env } from './env';

interface RateLimiterOptions {
    minutes?: number;
    max?: number;
    prefix?: string;
}

export const createRateLimiter = ({
    minutes = 15,
    max = 100,
    prefix = 'rl:genel:'
}: RateLimiterOptions = {}): RateLimitRequestHandler => {
    return rateLimit({
        windowMs: minutes * 60 * 1000,
        max: max,
        standardHeaders: true,
        legacyHeaders: false,

        store: new RedisStore({
            sendCommand: (...args: string[]) => redisClient.sendCommand(args),
            prefix: prefix
        }),

        handler: (req: Request, res: Response) => {
            const message =
                res.locals.t?.form?.tooManyRequests ||
                'Çok fazla istek gönderdiniz, lütfen daha sonra tekrar deneyin.';

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

export const generalLimiter = createRateLimiter({
    minutes: parseInt(env.RATE_LIMIT_MINUTES || '15', 10),
    max: parseInt(env.RATE_LIMIT_MAX_REQUESTS || '100', 10),
    prefix: 'rl:general:'
});

export const formLimiter = createRateLimiter({
    minutes: 15,
    max: 5,
    prefix: 'rl:form:'
});