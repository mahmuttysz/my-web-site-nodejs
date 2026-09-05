import { query, dbQueries } from '../config/db';
import locales from '../utils/locales';
import { safeTrim } from '../utils/helper';
import { sendVisitorMail, sendNotificationMailToAdmin } from '../utils/mailer';

export interface ContactResponse {
    success: boolean;
    message: string;
}

type MailOutcome =
    | { status: 'pending' }
    | { status: 'fulfilled'; messageId?: string }
    | { status: 'rejected'; reason: string };

const mailOutcome = (result: PromiseSettledResult<{ messageId?: string }>): MailOutcome => {
    if (result.status === 'fulfilled') {
        return { status: 'fulfilled', messageId: result.value?.messageId };
    }

    return {
        status: 'rejected',
        reason: result.reason?.message || String(result.reason)
    };
};

const insertIdOf = (result: unknown): number => {
    const insertId = (result as { insertId?: number | bigint } | null)?.insertId;
    if (typeof insertId === 'bigint') return Number(insertId);
    return Number(insertId || 0);
};

export const saveContact = async (
    fullName: string,
    email: string,
    subject: string,
    message: string,
    lang: string,
    clientIp: string
): Promise<ContactResponse> => {
    const activeLang = lang === 'tr' ? 'tr' : 'en';
    const locale = locales[activeLang] || locales.tr;

    const cleanFullName = safeTrim(fullName);
    const cleanEmail = safeTrim(email);
    const cleanSubject = safeTrim(subject) || (activeLang === 'tr' ? 'Konusuz' : 'No Subject');
    const cleanMessage = safeTrim(message);

    try {
        const pendingLog = {
            visitorMail: { status: 'pending' } satisfies MailOutcome,
            adminMail: { status: 'pending' } satisfies MailOutcome
        };

        const insertResult = await query(dbQueries.contacts.add, [
            cleanFullName,
            cleanEmail,
            cleanSubject,
            cleanMessage,
            clientIp,
            JSON.stringify(pendingLog),
            activeLang
        ]);

        const contactId = insertIdOf(insertResult);

        const sendMailResults = await Promise.allSettled([
            sendVisitorMail(cleanEmail, cleanFullName, activeLang),
            sendNotificationMailToAdmin(cleanFullName, cleanEmail, cleanSubject, cleanMessage, activeLang)
        ]);

        const [visitorRes, adminRes] = sendMailResults;
        const mailLog = {
            visitorMail: mailOutcome(visitorRes),
            adminMail: mailOutcome(adminRes)
        };

        if (adminRes.status === 'rejected') {
            console.error('Admin bildirim maili gönderilemedi:', adminRes.reason?.message || adminRes.reason);
        }

        if (contactId > 0) {
            try {
                await query(dbQueries.contacts.updateMailLog, [JSON.stringify(mailLog), contactId]);
            } catch (logErr) {
                console.error('mail_log güncellenirken hata:', logErr);
            }
        } else {
            console.error('İletişim kaydı yazıldı ama insertId alınamadı; mail_log güncellenemedi.');
        }

        return {
            success: true,
            message: locale.form?.success || 'Mesajınız başarıyla iletildi.'
        };
    } catch (err) {
        console.error('❌ İletişim İşlem Hatası:', err);
        return {
            success: false,
            message: locale.form?.error || 'Sunucu hatası oluştu.'
        };
    }
};

export default {
    saveContact
};
