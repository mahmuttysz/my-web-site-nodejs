// src/middleware/default.ts
import { Request, Response, NextFunction } from 'express';
import crypto from 'node:crypto';
import { env } from '../config/env';
import locales from '../utils/locales';

// SessionData arayüzüne lang alanını ekliyoruz
declare module 'express-session' {
    interface SessionData {
        lang?: string;
    }
}

export const defaultMid = (req: Request, res: Response, next: NextFunction): void => {
    const siteUrl = env.SITE_URL || `http://localhost:${env.PORT || 3000}`;
    res.locals.siteUrl = siteUrl;

    // req.query.lang tipi string, array veya undefined gelebileceği için kontrol eklenmiştir
    const queryLang = typeof req.query.lang === 'string' ? req.query.lang : undefined;
    let lang: string = queryLang || req.cookies?.lang || req.session?.lang || 'tr';

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
    res.locals.t = (locales as Record<string, any>)[lang] || (locales as Record<string, any>)['tr'];
    res.locals.nonce = crypto.randomBytes(16).toString('base64');

    next();
};

export default {
    defaultMid
};