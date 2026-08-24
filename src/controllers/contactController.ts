// src/routes/contact.ts
import express, { Request, Response } from 'express';
import { pool, dbQueries } from '../config/db';
import validateTurnstile from '../middlewares/turnstile';
import { formLimiter } from '../config/rate-limit';
import { sendVisitorMail, sendNotificationMailToAdmin } from '../utils/mailer';

const router = express.Router();

const isValidEmail = (email: string): boolean => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
};

router.post('/', formLimiter, validateTurnstile, async (req: Request, res: Response) => {
    const { fullName, email, subject, message } = req.body;
    const lang = res.locals.lang || 'tr';

    if (!fullName || !email || !message) {
        return res.status(400).json({
            success: false,
            message: res.locals.t?.form?.emptyCells || 'Lütfen gerekli alanları doldurun.'
        });
    }

    if (!isValidEmail(email)) {
        return res.status(400).json({
            success: false,
            message: res.locals.t?.form?.invalidEmail || 'Lütfen geçerli bir e-posta adresi giriniz.'
        });
    }

    try {
        const xForwardedFor = req.headers['x-forwarded-for'];
        const xForwardedIp = Array.isArray(xForwardedFor)
            ? xForwardedFor[0]
            : xForwardedFor?.split(',')[0];

        const clientIp =
            (req.headers['cf-connecting-ip'] as string) ||
            xForwardedIp ||
            req.ip ||
            '';

        const sendMailResults = await Promise.allSettled([
            sendVisitorMail(email, fullName, lang),
            sendNotificationMailToAdmin(fullName, email, subject, message, lang)
        ]);

        const visitorRes = sendMailResults[0];
        const adminRes = sendMailResults[1];

        const mailLog = {
            visitorMail:
                visitorRes.status === 'fulfilled'
                    ? { status: 'fulfilled', messageId: (visitorRes.value as any)?.messageId }
                    : {
                        status: 'rejected',
                        reason:
                            (visitorRes as PromiseRejectedResult).reason?.message ||
                            String((visitorRes as PromiseRejectedResult).reason)
                    },
            adminMail:
                adminRes.status === 'fulfilled'
                    ? { status: 'fulfilled', messageId: (adminRes.value as any)?.messageId }
                    : {
                        status: 'rejected',
                        reason:
                            (adminRes as PromiseRejectedResult).reason?.message ||
                            String((adminRes as PromiseRejectedResult).reason)
                    }
        };

        await pool.query(dbQueries.contacts.add, [
            fullName,
            email,
            subject || 'Konusuz',
            message,
            clientIp,
            JSON.stringify(mailLog),
            lang
        ]);

        return res.json({
            success: true,
            message: res.locals.t?.form?.success || 'Mesajınız başarıyla iletildi.'
        });
    } catch (err) {
        console.error('❌ İletişim İşlem Hatası:', err);
        return res.status(500).json({
            success: false,
            message: res.locals.t?.form?.error || 'Sunucu hatası oluştu.'
        });
    }
});

export default router;