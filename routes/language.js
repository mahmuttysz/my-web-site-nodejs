const express = require('express');
const router = express.Router();
const { env } = require('../config/env');

router.get('/:langCode', (req, res) => {
    const langCode = req.params.langCode;

    if (['tr', 'en'].includes(langCode)) {
        res.cookie('lang', langCode, {
            maxAge: 30 * 24 * 60 * 60 * 1000,
            path: '/',
            sameSite: 'lax'
        });

        if (req.session) {
            req.session.lang = langCode;
        }
    }

    const referer = req.get('referer');
    let redirectTo = '/';

    if (referer) {
        try {
            const refererUrl = new URL(referer);
            const siteUrl = new URL(env.APP_URL || 'http://localhost:3000');

            if (refererUrl.origin === siteUrl.origin) {
                redirectTo = referer;
            }
        } catch (err) {
            redirectTo = '/';
        }
    }

    return res.redirect(redirectTo);
});

module.exports = router;