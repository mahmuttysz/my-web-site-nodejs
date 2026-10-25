import express, { Request, Response } from 'express';
import validateTurnstile from '../middlewares/turnstile';
import { formLimiter } from '../config/rate-limit';
import { isValidEmail, safeTrim } from '../utils/helper';
import contactController from '../controllers/contactController';
import { getClientIp, getUserAgent, logAudit } from '../utils/auditLogger';

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
        const clientIp = getClientIp(req);
        const userAgent = getUserAgent(req);

        const contactSave = await contactController.saveContact(
            cleanFullName,
            cleanEmail,
            subject,
            cleanMessage,
            lang,
            clientIp
        );

        if (contactSave.success) {
            void logAudit({
                username: cleanFullName,
                action: 'CONTACT_FORM_SUBMIT',
                description: `İletişim formu dolduruldu: ${cleanFullName} (${cleanEmail})`,
                ip: clientIp,
                userAgent,
                details: {
                    fullName: cleanFullName,
                    email: cleanEmail,
                    subject: safeTrim(subject) || (lang === 'tr' ? 'Konusuz' : 'No Subject'),
                    language: lang
                }
            });
        }

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