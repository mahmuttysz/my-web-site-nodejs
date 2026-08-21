import { pool, dbQueries } from '../config/db';

export interface IndexPageData {
  aboutMe: Record<string, any>;
  experiences: any[];
  projects: any[];
  articles: any[];
  socialMedias: any[];
  turnstileSiteKey?: string;
}

export const getIndexPageData = async (lang: string = 'tr'): Promise<IndexPageData> => {
  try {
    const [aboutMe, experiences, projects, articles, socialMedias] = await Promise.all([
      pool.query(dbQueries.aboutMe.get, [lang]),
      pool.query(dbQueries.experiences.get, [lang]),
      pool.query(dbQueries.projects.get, [lang]),
      pool.query(dbQueries.articles.get, [lang]),
      pool.query(dbQueries.socialMedias.get)
    ]);

    return {
      aboutMe: (aboutMe && aboutMe[0]) || {},
      experiences: experiences || [],
      projects: projects || [],
      articles: articles || [],
      socialMedias: socialMedias || []
    };
  } catch (err) {
    console.error('❌ getIndexPageData Veri Çekme Hatası:', err);
    return {
      aboutMe: {},
      experiences: [],
      projects: [],
      articles: [],
      socialMedias: []
    };
  }
};

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

export const formatLongDateTime = (
  dateString?: string | Date | null,
  lang: string = 'tr'
): string => {
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

export const safeTrim = <T>(str: T): T | string => {
  if (typeof str !== 'string') return str;

  return str
    .replace(/[ \t]+$/gm, '')
    .replace(/^[\s\uFEFF\xA0\u200B]+|[\s\uFEFF\xA0\u200B]+$/g, '');
};