import { Request, Response, NextFunction } from 'express';
import { env } from '../config/env';

export const isAdmin = (req: Request, res: Response, next: NextFunction) => {
    const adminEndpoint = env.ADMIN_PANEL_ENDPOINT || '/admin';
    const session = req.session as any;

    if (session && session.adminUser) {
        return next();
    }

    const isAjax =
        (req as any).xhr ||
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
        if (session) {
            session.returnTo = req.originalUrl;
        }
    }

    return res.redirect(`${adminEndpoint}/login`);
};