import { Request, Response, NextFunction } from 'express';
import { env } from '../config/env';

export const errorHandler = (err: any, req: Request, res: Response, _next: NextFunction) => {
    console.error('❌ Global Sunucu Hatası:', err);

    const statusCode = err.status || err.statusCode || 500;
    const message = env.APP_ENV === 'dev' ? err?.message || err : 'Sunucu hatası oluştu.';

    if (req.accepts('html')) {
        return res.status(statusCode).render('errors/500', {
            title: '500 - Sunucu Hatası',
            error: message
        });
    }

    return res.status(statusCode).json({
        success: false,
        error: message
    });
};