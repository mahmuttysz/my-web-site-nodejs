// src/middleware/turnstile.ts
import { Request, Response, NextFunction } from 'express';
import { env } from '../config/env';

interface TurnstileOutcome {
    success: boolean;
    'error-codes'?: string[];
    [key: string]: any;
}

export const verifyTurnstile = async (
    req: Request,
    res: Response,
    next: NextFunction
): Promise<any> => {
    const token = req.body?.['cf-turnstile-response'];
    const secretKey = env.TURNSTILE_SECRET_KEY || '';

    if (env.APP_ENV === 'dev' && !secretKey) {
        console.warn('⚠️ Turnstile: Dev ortamında TURNSTILE_SECRET_KEY bulunamadı, doğrulama atlandı.');
        return next();
    }

    if (!token) {
        const message =
            res.locals.t?.form?.verifyHuman || 'Lütfen insan olduğunuzu doğrulayın.';

        if (req.xhr || req.headers.accept?.includes('json')) {
            return res.status(400).json({ success: false, message });
        }
        return res.status(400).send(message);
    }

    try {
        const formData = new URLSearchParams();
        formData.append('secret', secretKey);
        formData.append('response', token);

        if (req.ip) {
            formData.append('remoteip', req.ip);
        }

        const response = await fetch(
            'https://challenges.cloudflare.com/turnstile/v0/siteverify',
            {
                method: 'POST',
                body: formData,
                signal: AbortSignal.timeout(5000)
            }
        );

        const outcome = (await response.json()) as TurnstileOutcome;

        if (!outcome.success) {
            console.warn('❌ Turnstile Doğrulama Başarısız:', outcome['error-codes'] || outcome);

            const message =
                res.locals.t?.form?.securityVerificationError ||
                'Güvenlik doğrulaması başarısız oldu.';

            if (req.xhr || req.headers.accept?.includes('json')) {
                return res.status(400).json({ success: false, message });
            }
            return res.status(400).send(message);
        }

        return next();
    } catch (err: any) {
        console.error('❌ Turnstile Middleware Hatası:', err?.message || err);

        const message =
            res.locals.t?.form?.serverVerificationError ||
            'Güvenlik doğrulaması sırasında sunucu hatası oluştu.';

        if (req.xhr || req.headers.accept?.includes('json')) {
            return res.status(500).json({ success: false, message });
        }
        return res.status(500).send(message);
    }
};

export default verifyTurnstile;