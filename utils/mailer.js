const nodemailer = require('nodemailer');
const { env } = require('../config/env');
const locales = require('./locales');
const { escapeHtml } = require('./helper');

const transporter = nodemailer.createTransport({
    host: env.SMTP_HOST,
    port: parseInt(env.SMTP_PORT) || 587,
    secure: parseInt(env.SMTP_PORT) === 465,
    auth: {
        user: env.SMTP_USER,
        pass: env.SMTP_PASS
    }
});

async function sendVisitorMail(toEmail, fullName, lang = 'tr') {
    const safeFullName = escapeHtml(fullName);

    const mailOptions = {
        from: `"mahmuttuysuz.net" <${env.SMTP_USER}>`,
        to: toEmail,
        subject: locales[lang].visitorMail.subject,
        html: `
            <h3>${locales[lang].visitorMail.hello} ${safeFullName},</h3>
            <blockquote>${locales[lang].visitorMail.body}</blockquote>
        `
    };

    return ((await transporter.sendMail(mailOptions)));
}

async function sendNotificationMailToAdmin(fullName, email, subject, message, lang = 'tr') {
    const safeName = escapeHtml(fullName);
    const safeEmail = escapeHtml(email);
    const safeSubject = escapeHtml(subject || 'Konusuz');
    const safeMessage = escapeHtml(message).replace(/\n/g, '<br />');

    const mailOptions = {
        from: `"mahmuttuysuz.net" <${env.SMTP_USER}>`,
        to: env.ADMIN_EMAIL || env.SMTP_USER,
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
}

module.exports = { sendVisitorMail, sendNotificationMailToAdmin };