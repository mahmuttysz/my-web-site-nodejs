const { env } = require('../config/env');
const locales = require('../utils/locales');

module.exports = {
    defaultMid: (req, res, next) => {
        res.locals.siteUrl = env.SITE_URL || `http://localhost:${env.PORT || 3000}`;
        let lang = req.query.lang || req.cookies.lang || 'tr';

        if (!['tr', 'en'].includes(lang)) {
            lang = 'tr';
        }
        res.setHeader('Content-Language', lang);

        res.setHeader('X-Robots-Tag', 'index, follow');

        if (req.query.lang) {
            res.cookie('lang', lang, { maxAge: 30 * 24 * 60 * 60 * 1000 });
        }

        res.locals.lang = lang;
        res.locals.t = locales[lang];

        next();
    }
};