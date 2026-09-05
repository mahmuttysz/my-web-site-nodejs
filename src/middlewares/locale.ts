import { Request, Response, NextFunction } from 'express';
import { env } from '../config/env';
import locales from '../utils/locales';
import {
    SiteLang,
    isSiteLang,
    localePrefix,
    localizePath,
    otherLang,
    stripLocalePrefix
} from '../utils/i18n';
import { langCookieOptions } from './default';

export const attachLocale = (lang: SiteLang) => {
    return (req: Request, res: Response, next: NextFunction): void => {
        const publicPath = req.path && req.path !== '' ? req.path : '/';

        res.locals.lang = lang;
        res.locals.otherLang = otherLang(lang);
        res.locals.localePrefix = localePrefix(lang);
        res.locals.publicPath = publicPath;
        res.locals.lp = (path: string) => localizePath(lang, path);
        res.locals.langHref = (target: SiteLang) => localizePath(target, publicPath);
        res.locals.t = locales[lang] || locales.tr;

        res.cookie('lang', lang, langCookieOptions);
        res.setHeader('Content-Language', lang);

        next();
    };
};

export const skipIfEnPrefix = (req: Request, _res: Response, next: NextFunction): void => {
    if (req.path === '/en' || req.path.startsWith('/en/')) {
        next('router');
        return;
    }
    next();
};

export const redirectLangQuery = (req: Request, res: Response, next: NextFunction): void => {
    if (req.method !== 'GET' && req.method !== 'HEAD') {
        return next();
    }

    const queryLang = typeof req.query.lang === 'string' ? req.query.lang : undefined;
    if (!queryLang || !isSiteLang(queryLang)) {
        return next();
    }

    const adminEndpoint = env.ADMIN_PANEL_ENDPOINT || '/admin';
    if (req.path.startsWith(adminEndpoint) || req.path.startsWith('/lang')) {
        return next();
    }

    const lastSegment = req.path.split('/').pop() || '';
    if (lastSegment.includes('.')) {
        return next();
    }

    const { path: stripped } = stripLocalePrefix(req.path);
    const destPath = localizePath(queryLang, stripped);

    const params = new URLSearchParams();
    for (const [key, value] of Object.entries(req.query)) {
        if (key === 'lang') continue;
        if (typeof value === 'string') {
            params.append(key, value);
        } else if (Array.isArray(value)) {
            for (const item of value) {
                if (typeof item === 'string') params.append(key, item);
            }
        }
    }

    const qs = params.toString();
    const dest = qs ? `${destPath}?${qs}` : destPath;

    if (dest === req.originalUrl) {
        return next();
    }

    return res.redirect(301, dest);
};
