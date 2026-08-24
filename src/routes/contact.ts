import express, { Request, Response } from 'express';
import validateTurnstile from '../middlewares/turnstile';
import { formLimiter } from '../config/rate-limit';
import { isValidEmail, safeTrim } from '../utils/helper';
import contactController from '../controllers/contactController';

const router = express.Router();

router.post('/', formLimiter, validateTurnstile, async (req: Request, res: Response) => {
    const { fullName, email, subject, message } = req.body;
    const lang = res.locals.lang || 'tr';

    const cleanFullName = safeTrim(fullName);
    const cleanEmail = safeTrim(email);
    const cleanMessage = safeTrim(message);

    if (!cleanFullName || !cleanEmail || !cleanMessage) {
        return res.status(400).json({
            success: false,
            message: res.locals.t?.form?.emptyCells || 'Lütfen gerekli alanları doldurun.'
        });
    }

    if (!isValidEmail(cleanEmail)) {
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

        const contactSave = await contactController.saveContact(
            cleanFullName,
            cleanEmail,
            subject,
            cleanMessage,
            lang,
            clientIp
        );

        const statusCode = contactSave.success ? 200 : 500;
        return res.status(statusCode).json(contactSave);
    } catch (err) {
        console.error('❌ İletişim İşlem Hatası:', err);
        return res.status(500).json({
            success: false,
            message: res.locals.t?.form?.error || 'Sunucu hatası oluştu.'
        });
    }
});

export default router;