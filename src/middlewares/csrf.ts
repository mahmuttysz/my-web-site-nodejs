import crypto from 'node:crypto';
import { Request, Response, NextFunction } from 'express';

export const createCsrfToken = (): string => crypto.randomBytes(32).toString('hex');

export const tokensMatch = (expected?: string | null, received?: string | null): boolean => {
    if (!expected || !received) return false;
    const a = Buffer.from(String(expected), 'utf8');
    const b = Buffer.from(String(received), 'utf8');
    if (a.length !== b.length) return false;
    return crypto.timingSafeEqual(a, b);
};

export const readCsrfToken = (req: Request): string | undefined => {
    const fromBody = typeof req.body?._csrf === 'string' ? req.body._csrf : undefined;
    const header = req.headers['x-csrf-token'] || req.headers['csrf-token'];
    const fromHeader = Array.isArray(header) ? header[0] : header;
    return fromBody || fromHeader || undefined;
};

const isJsonRequest = (req: Request): boolean =>
    Boolean(
        req.xhr ||
            req.headers.accept?.includes('json') ||
            req.headers['x-requested-with'] === 'XMLHttpRequest'
    );

export const issueCsrf = (req: Request, res: Response, next: NextFunction): void => {
    if (!req.session.csrfToken) {
        req.session.csrfToken = createCsrfToken();
    }
    res.locals.csrfToken = req.session.csrfToken;
    next();
};

export const verifyCsrf = (req: Request, res: Response, next: NextFunction): void => {
    if (req.method === 'GET' || req.method === 'HEAD' || req.method === 'OPTIONS') {
        return next();
    }

    if (tokensMatch(req.session.csrfToken, readCsrfToken(req))) {
        return next();
    }

    if (isJsonRequest(req)) {
        res.status(403).json({
            success: false,
            message: 'Güvenlik doğrulaması başarısız. Sayfayı yenileyip tekrar deneyin.'
        });
        return;
    }

    res.status(403).type('txt').send('Güvenlik doğrulaması başarısız. Sayfayı yenileyip tekrar deneyin.');
};
