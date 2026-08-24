// src/routes/language.ts
import express, { Request, Response } from 'express';
import { env } from '../config/env';

const router = express.Router();

router.get('/:langCode', (req: Request, res: Response) => {
    const { langCode } = req.params;
    let status = false;

    if (['tr', 'en'].includes(langCode.toString())) {
        res.cookie('lang', langCode, {
            maxAge: 30 * 24 * 60 * 60 * 1000,
            path: '/',
            sameSite: 'lax'
        });

        if (req.session) {
            req.session.lang = langCode.toString();
        }
    }

    const referer = req.get('referer');
    let redirectTo = '/';

    if (referer) {
        try {
            const refererUrl = new URL(referer);
            const siteUrl = new URL(env.SITE_URL || 'http://localhost:3000');

            if (refererUrl.origin === siteUrl.origin) {
                redirectTo = referer;
                status = true;
            }
        } catch {
            redirectTo = '/';
            status = false;
        }
    }

    return res.json({
        success: status,
        lang: langCode,
        redirectTo
    });
});

export default router;