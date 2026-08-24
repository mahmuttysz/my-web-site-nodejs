import { query, dbQueries } from '../config/db';
import locales from '../utils/locales';
import { safeTrim } from '../utils/helper';
import { sendVisitorMail, sendNotificationMailToAdmin } from '../utils/mailer';

export interface ContactResponse {
    success: boolean;
    message: string;
}

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
        // Mail gönderimlerinin birbirini engellememesi için paralel yürütme
        const sendMailResults = await Promise.allSettled([
            sendVisitorMail(cleanEmail, cleanFullName, activeLang),
            sendNotificationMailToAdmin(cleanFullName, cleanEmail, cleanSubject, cleanMessage, activeLang)
        ]);

        const [visitorRes, adminRes] = sendMailResults;

        // Type narrowing sayesinde casting kalabalığı olmadan log nesnesi oluşturma
        const mailLog = {
            visitorMail:
                visitorRes.status === 'fulfilled'
                    ? { status: 'fulfilled', messageId: (visitorRes.value as any)?.messageId }
                    : {
                        status: 'rejected',
                        reason: visitorRes.reason?.message || String(visitorRes.reason)
                    },
            adminMail:
                adminRes.status === 'fulfilled'
                    ? { status: 'fulfilled', messageId: (adminRes.value as any)?.messageId }
                    : {
                        status: 'rejected',
                        reason: adminRes.reason?.message || String(adminRes.reason)
                    }
        };

        await query(dbQueries.contacts.add, [
            cleanFullName,
            cleanEmail,
            cleanSubject,
            cleanMessage,
            clientIp,
            JSON.stringify(mailLog),
            activeLang
        ]);

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