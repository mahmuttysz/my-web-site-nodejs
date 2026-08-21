import { Request, Response } from 'express';
import { pool, dbQueries } from '../config/db';
import { sendVisitorMail, sendNotificationMailToAdmin } from '../utils/mailer';

const isValidEmail = (email: string): boolean => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
};

export const submitContactForm = async (req: Request, res: Response) => {
    const { fullName, email, subject, message } = req.body || {};
    const lang = (res.locals.lang || 'tr') as string;

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
        const clientIp =
            (req.headers['cf-connecting-ip'] as string) ||
            (req.headers['x-forwarded-for'] as string)?.split(',')[0] ||
            req.ip ||
            '';

        const sendMailResults = await Promise.allSettled([
            sendVisitorMail(email, fullName, lang),
            sendNotificationMailToAdmin(fullName, email, subject, message, lang)
        ]);

        const visitorMailResult = sendMailResults[0];
        const adminMailResult = sendMailResults[1];

        const mailLog = {
            visitorMail:
                visitorMailResult.status === 'fulfilled'
                    ? { status: 'fulfilled', messageId: visitorMailResult.value?.messageId }
                    : {
                        status: 'rejected',
                        reason:
                            visitorMailResult.reason?.message || String(visitorMailResult.reason)
                    },
            adminMail:
                adminMailResult.status === 'fulfilled'
                    ? { status: 'fulfilled', messageId: adminMailResult.value?.messageId }
                    : {
                        status: 'rejected',
                        reason:
                            adminMailResult.reason?.message || String(adminMailResult.reason)
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
};