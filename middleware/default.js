const { env } = require('../config/env');
const locales = require('../utils/locales');
const crypto = require('node:crypto');

module.exports = {
    defaultMid: (req, res, next) => {
        const siteUrl = env.SITE_URL || `http://localhost:${env.PORT || 3000}`;
        res.locals.siteUrl = siteUrl;

        let lang = req.query.lang || req.cookies?.lang || req.session?.lang || 'tr';

        if (!['tr', 'en'].includes(lang)) {
            lang = 'tr';
        }

        if (req.query.lang) {
            res.cookie('lang', lang, {
                maxAge: 30 * 24 * 60 * 60 * 1000,
                path: '/',
                sameSite: 'lax'
            });
        }

        if (req.session) {
            req.session.lang = lang;
        }

        res.setHeader('Content-Language', lang);

        const adminEndpoint = env.ADMIN_PANEL_ENDPOINT || '/admin';

        if (req.originalUrl.startsWith(adminEndpoint)) {
            res.setHeader('X-Robots-Tag', 'noindex, nofollow');
        } else {
            res.setHeader('X-Robots-Tag', 'index, follow');
        }

        res.locals.lang = lang;
        res.locals.t = locales[lang] || locales['tr'];
        res.locals.nonce = crypto.randomBytes(16).toString('base64');

        next();
    }
};