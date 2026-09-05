// src/middleware/default.ts
import { Request, Response, NextFunction } from 'express';
import crypto from 'node:crypto';
import { env } from '../config/env';
import locales from '../utils/locales';
import { DEFAULT_LANG, SiteLang, isSiteLang, localePrefix, localizePath } from '../utils/i18n';

const LANG_COOKIE_MAX_AGE = 30 * 24 * 60 * 60 * 1000;

export const langCookieOptions = {
    maxAge: LANG_COOKIE_MAX_AGE,
    path: '/',
    httpOnly: true,
    secure: env.APP_ENV === 'prod',
    sameSite: 'lax' as const
};

export const assignNonce = (_req: Request, res: Response, next: NextFunction): void => {
    res.locals.nonce = crypto.randomBytes(16).toString('base64');
    next();
};

export const defaultMid = (req: Request, res: Response, next: NextFunction): void => {
    const siteUrl = env.SITE_URL || `http://localhost:${env.PORT || 3000}`;
    res.locals.siteUrl = siteUrl.replace(/\/$/, '');

    let lang: SiteLang = DEFAULT_LANG;
    if (isSiteLang(req.cookies?.lang)) {
        lang = req.cookies.lang;
    }

    res.setHeader('Content-Language', lang);

    const adminEndpoint = env.ADMIN_PANEL_ENDPOINT || '/admin';

    const isPreviewPath = /\/blog\/_preview(?:\/|$)/.test(req.originalUrl.split('?')[0] || '');
    const noindex = req.originalUrl.startsWith(adminEndpoint) || isPreviewPath;
    res.locals.noindex = noindex;

    if (noindex) {
        res.setHeader('X-Robots-Tag', 'noindex, nofollow');
    } else {
        res.setHeader('X-Robots-Tag', 'index, follow');
    }

    res.locals.lang = lang;
    res.locals.otherLang = lang === 'en' ? 'tr' : 'en';
    res.locals.localePrefix = localePrefix(lang);
    res.locals.publicPath = '/';
    res.locals.lp = (path: string) => localizePath(lang, path);
    res.locals.langHref = (target: SiteLang) => localizePath(target, '/');
    res.locals.t = locales[lang] || locales.tr;
    if (typeof res.locals.nonce !== 'string') {
        res.locals.nonce = crypto.randomBytes(16).toString('base64');
    }

    next();
};

export default {
    defaultMid
};
