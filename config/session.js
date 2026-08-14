const { env } = require('./env');
const { RedisStore } = require('connect-redis');
const redisClient = require('./redis');

const sessionOpt = {
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
module.exports = sessionOpt;