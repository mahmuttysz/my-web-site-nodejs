// src/utils/helper.ts

export const formatDate = (dateString?: string | Date | null, lang: string = 'tr'): string => {
    if (!dateString) return lang === 'tr' ? 'Devam Ediyor' : 'Ongoing';
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return '';

    const locale = lang === 'tr' ? 'tr-TR' : 'en-US';
    const formatted = date.toLocaleDateString(locale, { month: 'long', year: 'numeric' });
    return formatted.charAt(0).toUpperCase() + formatted.slice(1);
};

export const formatLongDate = (dateString?: string | Date | null, lang: string = 'tr'): string => {
    if (!dateString) return '';
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return '';

    const locale = lang === 'tr' ? 'tr-TR' : 'en-US';
    const formatted = date.toLocaleDateString(locale, { year: 'numeric', month: 'long', day: 'numeric' });
    return formatted.charAt(0).toUpperCase() + formatted.slice(1);
};

export const formatLongDateTime = (dateString?: string | Date | null, lang: string = 'tr'): string => {
    if (!dateString) return '';
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return '';

    const locale = lang === 'tr' ? 'tr-TR' : 'en-US';
    const formatted = date.toLocaleDateString(locale, {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
    return formatted.charAt(0).toUpperCase() + formatted.slice(1);
};

export const escapeHtml = (text?: string | null): string => {
    if (!text) return '';
    return String(text)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
};

export const calculateReadingTime = (content?: string | null): number => {
    if (!content || typeof content !== 'string') return 1;

    const plainText = content.replace(/<[^>]*>?/gm, '').trim();
    if (!plainText) return 1;

    const words = plainText.split(/\s+/).length;
    return Math.ceil(words / 200) || 1;
};

export const safeTrim = <T>(str: T): T => {
    if (typeof str !== 'string') return str;

    return str
        .replace(/[ \t]+$/gm, '')
        .replace(/^[\s\uFEFF\xA0\u200B]+|[\s\uFEFF\xA0\u200B]+$/g, '') as unknown as T;
};

export const isValidEmail = (email: string): boolean => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
};

export const escapeXml = (str: string): string => {
    return str
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&apos;');
};

/** Keep the first publish time; only stamp now when a draft goes live. */
export const resolvePublishedAt = (
    isPublished: boolean,
    existing?: Date | string | null
): Date | null => {
    const existingDate = (() => {
        if (!existing) return null;
        const ts = new Date(existing);
        return Number.isNaN(ts.getTime()) ? null : ts;
    })();

    if (!isPublished) {
        return existingDate;
    }

    return existingDate ?? new Date();
};

export default {
    formatDate,
    formatLongDate,
    formatLongDateTime,
    escapeHtml,
    calculateReadingTime,
    safeTrim,
    isValidEmail,
    escapeXml,
    resolvePublishedAt
};