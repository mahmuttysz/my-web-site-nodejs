const nodemailer = require('nodemailer');
require('dotenv').config();

const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT,
    secure: process.env.SMTP_PORT == 465, // 465 ise true, 587 ise false
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
    }
});
// Ziyaretçiye Onay Maili Gönderen Fonksiyon
async function sendConfirmationMail(toEmail, fullName) {
    const mailOptions = {
        from: `"mahmuttuysuz.net" <${process.env.SMTP_USER}>`,
        to: toEmail,
        subject: 'Mesajınız Alındı',
        html: `
            <h3>Merhaba ${fullName},</h3>
            <p>Web sitem üzerinden gönderdiğiniz iletişim mesajı tarafıma ulaşmıştır.</p>
            <p>En kısa sürede size dönüş yapacağım. İyi günler dilerim!</p>
        `
    };

    return await transporter.sendMail(mailOptions);
}

// Opsiyonel: Size (Site Sahibine) Bildirim Maili Gönderen Fonksiyon
async function sendNotificationMailToAdmin(fullName, email, subject, message) {
    // return true;
    const mailOptions = {
        from: `"mahmuttuysuz.net" <${process.env.SMTP_USER}>`,
        to: process.env.ADMIN_EMAIL || process.env.SMTP_USER, // Kendi adresiniz
        subject: `Yeni İletişim Mesajı: ${subject || 'Konusuz'}`,
        html: `
            <h3>Siteden Yeni Bir İletişim Formu Dolduruldu</h3>
            <p><strong>Gönderen:</strong> ${fullName} (${email})</p>
            <p><strong>Konu:</strong> ${subject}</p>
            <p><strong>Mesaj:</strong></p>
            <blockquote>${message}</blockquote>
        `
    };

    return await transporter.sendMail(mailOptions);
}

module.exports = { sendConfirmationMail, sendNotificationMailToAdmin };