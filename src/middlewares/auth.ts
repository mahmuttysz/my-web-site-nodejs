// src/middleware/auth.ts
import { Request, Response, NextFunction } from 'express';
import { env } from '../config/env';

// express-session modülüne özel oturum alanlarının (adminUser, returnTo) tiplerini ekliyoruz
declare module 'express-session' {
    interface SessionData {
        adminUser?: any;
        returnTo?: string;
        csrfToken?: string;
    }
}

export const isAdmin = (req: Request, res: Response, next: NextFunction) => {
    const adminEndpoint = env.ADMIN_PANEL_ENDPOINT || '/admin';

    if (req.session && req.session.adminUser) {
        return next();
    }

    const isAjax =
        req.xhr ||
        req.headers.accept?.includes('json') ||
        req.headers['x-requested-with'] === 'XMLHttpRequest';

    if (isAjax) {
        return res.status(401).json({
            success: false,
            message: 'Oturum süreniz doldu. Lütfen yeniden giriş yapın.'
        });
    }

    if (
        req.originalUrl &&
        !req.originalUrl.includes('/login') &&
        !req.originalUrl.includes('/logout')
    ) {
        req.session.returnTo = req.originalUrl;
    }

    return res.redirect(`${adminEndpoint}/login`);
};

export default {
    isAdmin
};