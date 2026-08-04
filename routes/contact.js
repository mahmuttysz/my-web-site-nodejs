const express = require('express');
const router = express.Router();
const { pool, dbTables } = require('../config/db');
const validateTurnstile = require('../middleware/turnstile');
const { sendVisitorMail, sendNotificationMailToAdmin } = require('../utils/mailer');

router.post('/', validateTurnstile, async (req, res) => {
    const { fullName, email, subject, message } = req.body;

    if (!fullName || !email || !message) {
        return res.status(400).json({
            success: false,
            message: res.locals.t.form.emptyCells
        });
    }

    try {
        const clientIp = req.headers['cf-connecting-ip'] ||
            req.headers['x-forwarded-for']?.split(',')[0] ||
            req.ip;

        let sendMail = await Promise.allSettled([
            sendVisitorMail(email, fullName, res.locals.lang),
            sendNotificationMailToAdmin(fullName, email, subject, message, res.locals.lang)
        ]).catch(mailErr => console.error('Arka Plan Mail Gönderim Hatası:', mailErr));

        let mailStatus = sendMail.every(mail => mail.status === 'fulfilled');
        let mailLog = {
            visitorMail: sendMail[0],
            adminMail: sendMail[1]
        };
        await pool.query(dbTables.contacts.add, [fullName, email, subject, message, clientIp, JSON.stringify(mailLog), res.locals.lang]);
        return res.json({
            success: mailStatus,
            message: mailStatus ? res.locals.t.form.success : res.locals.t.form.error
        });

    } catch (err) {
        console.error('İletişim İşlem Hatası:', err);
        return res.status(500).json({ success: false, message: res.locals.t.form.error });
    }
});

module.exports = router;