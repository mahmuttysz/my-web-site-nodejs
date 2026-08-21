import { Request, Response, NextFunction } from 'express';
import crypto from 'node:crypto';
import { env } from '../config/env';
import locales from '../utils/locales';

export const defaultMid = (req: Request, res: Response, next: NextFunction) => {
    const siteUrl = env.SITE_URL || `http://localhost:${env.PORT || 3000}`;
    res.locals.siteUrl = siteUrl;

    const queryLang = typeof req.query.lang === 'string' ? req.query.lang : undefined;
    const session = req.session as any;

    let lang: string = queryLang || req.cookies?.lang || session?.lang || 'tr';

    if (!['tr', 'en'].includes(lang)) {
        lang = 'tr';
    }

    if (queryLang) {
        res.cookie('lang', lang, {
            maxAge: 30 * 24 * 60 * 60 * 1000,
            path: '/',
            sameSite: 'lax'
        });
    }

    if (session) {
        session.lang = lang;
    }

    res.setHeader('Content-Language', lang);

    const adminEndpoint = env.ADMIN_PANEL_ENDPOINT || '/admin';

    if (req.originalUrl.startsWith(adminEndpoint)) {
        res.setHeader('X-Robots-Tag', 'noindex, nofollow');
    } else {
        res.setHeader('X-Robots-Tag', 'index, follow');
    }

    res.locals.lang = lang;
    res.locals.t = (locales as any)[lang] || (locales as any)['tr'];
    res.locals.nonce = crypto.randomBytes(16).toString('base64');

    next();
};