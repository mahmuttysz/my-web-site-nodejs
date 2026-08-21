import nodemailer from "nodemailer";
import { env } from "../config/env";
import locales from "./locales";
import { escapeHtml } from "./helper";

const port = parseInt(env.SMTP_PORT, 10) || 587;
const isSecurePort = port === 465;

const transporter = nodemailer.createTransport({
  host: env.SMTP_HOST,
  port: port,
  secure: isSecurePort,
  requireTLS: !isSecurePort,
  auth: {
    user: env.SMTP_USER,
    pass: env.SMTP_PASS,
  },
  tls: {
    rejectUnauthorized: true,
    servername: env.SMTP_SERVER_NAME || env.SMTP_HOST,
  },
});

transporter.verify((error) => {
  if (error) {
    console.error(
      "❌ [SMTP Error] Sunucu bağlantı/kimlik doğrulama hatası:",
      error.message,
    );
  } else {
    console.log(
      "✅ [SMTP Success] Mail sunucusuna başarıyla bağlandı ve doğrulandı.",
    );
  }
});

export const sendVisitorMail = async (
  toEmail: string,
  fullName: string,
  lang: string = "tr",
) => {
  const locale = locales[lang] || locales["tr"];
  const safeFullName = escapeHtml(fullName);

  const mailOptions = {
    from: `"${env.SMTP_FROM_NAME || "İletişim"}" <${env.SMTP_FROM_EMAIL || env.SMTP_USER}>`,
    to: toEmail,
    subject: locale.visitorMail.subject,
    html: `
            <h3>${locale.visitorMail.hello} ${safeFullName},</h3>
            <blockquote>${locale.visitorMail.body}</blockquote>
        `,
  };

  return transporter.sendMail(mailOptions);
};

export const sendNotificationMailToAdmin = async (
  fullName: string,
  email: string,
  subject: string,
  message: string,
  lang: string = "tr",
) => {
  const locale = locales[lang] || locales["tr"];

  const safeName = escapeHtml(fullName);
  const safeEmail = escapeHtml(email);
  const safeSubject = escapeHtml(subject || "Konusuz");
  const safeMessage = escapeHtml(message || "").replace(/\n/g, "<br />");

  const mailOptions = {
    from: `"${env.SMTP_FROM_NAME || "Web Sitesi"}" <${env.SMTP_USER}>`,
    to: env.ADMIN_EMAIL || env.SMTP_USER,
    replyTo: email,
    subject: `${locale.adminMail.subject}: ${safeSubject}`,
    html: `
            <h3>${locale.adminMail.newMessage}</h3>
            <p><strong>${locale.adminMail.sender}:</strong> ${safeName} (${safeEmail})</p>
            <p><strong>${locale.adminMail.subjectLabel}:</strong> ${safeSubject}</p>
            <p><strong>${locale.adminMail.messageLabel}:</strong></p>
            <blockquote>${safeMessage}</blockquote>
        `,
  };

  return transporter.sendMail(mailOptions);
};
