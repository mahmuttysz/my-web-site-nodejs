import { otherLang, type SiteLang } from './i18n';

export type TranslationRef = {
    id: number;
    slug: string;
    language: string;
};

export const articleLang = (value: unknown): SiteLang => (value === 'en' ? 'en' : 'tr');

export const otherArticleLang = (language: string): SiteLang => otherLang(articleLang(language));

export const findSiblingInList = <T extends TranslationRef>(articles: T[], article: T): T | null =>
    articles.find((row) => row.slug === article.slug && row.language !== article.language) ?? null;

export const hasNowWorking = (text?: string | null): boolean =>
    typeof text === 'string' && text.trim().length > 0;
