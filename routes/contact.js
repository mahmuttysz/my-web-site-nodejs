const express = require('express');
const router = express.Router();

const { pool, dbQueries } = require('../config/db');
const validateTurnstile = require('../middleware/turnstile');
const { formLimiter } = require('../config/rateLimit');
const { sendVisitorMail, sendNotificationMailToAdmin } = require('../utils/mailer');

const isValidEmail = (email) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
};

router.post('/', formLimiter, validateTurnstile, async (req, res) => {
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
        const clientIp = req.headers['cf-connecting-ip'] ||
            req.headers['x-forwarded-for']?.split(',')[0] ||
            req.ip;

        const sendMailResults = await Promise.allSettled([
            sendVisitorMail(email, fullName, lang),
            sendNotificationMailToAdmin(fullName, email, subject, message, lang)
        ]);

        const mailLog = {
            visitorMail: sendMailResults[0].status === 'fulfilled'
                ? { status: 'fulfilled', messageId: sendMailResults[0].value?.messageId }
                : { status: 'rejected', reason: sendMailResults[0].reason?.message || String(sendMailResults[0].reason) },
            adminMail: sendMailResults[1].status === 'fulfilled'
                ? { status: 'fulfilled', messageId: sendMailResults[1].value?.messageId }
                : { status: 'rejected', reason: sendMailResults[1].reason?.message || String(sendMailResults[1].reason) }
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

module.exports = router;