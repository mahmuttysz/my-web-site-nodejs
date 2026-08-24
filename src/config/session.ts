// src/config/session.ts
import { SessionOptions } from 'express-session';
import { RedisStore } from 'connect-redis';
import { env } from './env';
import redisClient from './redis';

export const sessionOpt: SessionOptions = {
    store: new RedisStore({
        client: redisClient,
        prefix: 'sess:admin:'
    }),
    secret: env.SESSION_SECRET || 'very_secret_key_must_be_change',
    resave: false,
    saveUninitialized: false,
    name: 'sid_admin',
    cookie: {
        secure: env.APP_ENV === 'prod',
        httpOnly: true,
        maxAge: 1000 * 60 * 60 * 8,
        sameSite: 'lax'
    }
};

export default sessionOpt;