// src/controllers/languageController.ts
import { Request, Response } from 'express';
import { env } from '../config/env';
import { langCookieOptions } from '../middlewares/default';

export const switchLanguage = (req: Request, res: Response) => {
  const { langCode: rawLangCode } = req.params;
  
  // string | string[] tipini kesin olarak string tipine indirgeme
  const langCode = Array.isArray(rawLangCode) ? rawLangCode[0] : rawLangCode;

  let status = false;

  if (langCode && ['tr', 'en'].includes(langCode)) {
    res.cookie('lang', langCode, langCookieOptions);
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
    lang: langCode || 'tr',
    redirectTo
  });
};