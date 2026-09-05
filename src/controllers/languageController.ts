import { Request, Response } from 'express';
import { env } from '../config/env';
import { langCookieOptions } from '../middlewares/default';
import { isSiteLang, localizePath, switchLocalePath } from '../utils/i18n';

export const switchLanguage = (req: Request, res: Response) => {
    const { langCode: rawLangCode } = req.params;
    const langCode = Array.isArray(rawLangCode) ? rawLangCode[0] : rawLangCode;

    if (!isSiteLang(langCode)) {
        return res.status(400).json({
            success: false,
            lang: langCode || '',
            redirectTo: '/'
        });
    }

    res.cookie('lang', langCode, langCookieOptions);

    let redirectTo = localizePath(langCode, '/');
    let status = true;

    const referer = req.get('referer');
    if (referer) {
        try {
            const refererUrl = new URL(referer);
            const siteUrl = new URL(env.SITE_URL || 'http://localhost:3000');

            if (refererUrl.origin === siteUrl.origin) {
                refererUrl.searchParams.delete('lang');
                const search = refererUrl.searchParams.toString();
                redirectTo =
                    switchLocalePath(refererUrl.pathname, langCode) +
                    (search ? `?${search}` : '') +
                    refererUrl.hash;
                status = true;
            }
        } catch {
            redirectTo = localizePath(langCode, '/');
        }
    }

    return res.json({
        success: status,
        lang: langCode,
        redirectTo
    });
};
