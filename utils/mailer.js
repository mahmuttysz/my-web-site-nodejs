const nodemailer = require('nodemailer');
const { env } = require('../config/env');
const locales = require('./locales');
const { escapeHtml } = require('./helper');

const port = parseInt(env.SMTP_PORT, 10) || 587;

const transporter = nodemailer.createTransport({
    host: env.SMTP_HOST,
    port: port,
    secure: port === 465,
    requireTLS: true,
    auth: {
        user: env.SMTP_USER,
        pass: env.SMTP_PASS
    },
    tls: {
        rejectUnauthorized: true
    }
});

transporter.verify((error, success) => {
    if (error) {
        console.error('❌ [SMTP Error] Sunucu bağlantı/kimlik doğrulama hatası:', error.message);
    } else {
        console.log('✅ [SMTP Success] Mail sunucusuna başarıyla bağlandı ve doğrulandı.');
    }
});

const sendVisitorMail = async (toEmail, fullName, lang = 'tr') => {
    const safeFullName = escapeHtml(fullName);

    const mailOptions = {
        from: `"${env.SMTP_FROM_NAME}" <${env.SMTP_FROM_EMAIL}>`,
        to: toEmail,
        subject: locales[lang].visitorMail.subject,
        html: `
            <h3>${locales[lang].visitorMail.hello} ${safeFullName},</h3>
            <blockquote>${locales[lang].visitorMail.body}</blockquote>
        `
    };

    return transporter.sendMail(mailOptions);
};

const sendNotificationMailToAdmin = async (fullName, email, subject, message, lang = 'tr') => {
    const safeName = escapeHtml(fullName);
    const safeEmail = escapeHtml(email);
    const safeSubject = escapeHtml(subject || 'Konusuz');
    const safeMessage = escapeHtml(message).replace(/\n/g, '<br />');

    const mailOptions = {
        from: `"mahmuttuysuz.net" <${env.SMTP_USER}>`,
        to: env.ADMIN_EMAIL || env.SMTP_USER,
        replyTo: email,
        subject: `${locales[lang].adminMail.subject}: ${safeSubject}`,
        html: `
            <h3>${locales[lang].adminMail.newMessage}</h3>
            <p><strong>${locales[lang].adminMail.sender}:</strong> ${safeName} (${safeEmail})</p>
            <p><strong>${locales[lang].adminMail.subjectLabel}:</strong> ${safeSubject}</p>
            <p><strong>${locales[lang].adminMail.messageLabel}:</strong></p>
            <blockquote>${safeMessage}</blockquote>
        `
    };

    return transporter.sendMail(mailOptions);
};

module.exports = {
    sendVisitorMail,
    sendNotificationMailToAdmin
};