import { query, queryOne, dbQueries } from '../../config/db';
import { safeTrim, calculateReadingTime, resolvePublishedAt } from '../../utils/helper';
import { createPreviewToken, isPreviewToken } from '../../utils/preview';
import { otherArticleLang } from '../../utils/articleTranslation';
import Articles from '../../types/dbTables/articles';

type InsertResult = { insertId?: number | bigint };

const insertedId = (result: InsertResult): number => Number(result.insertId);

// Makaleleri Listeleme
export const getArticles = async (): Promise<Articles[]> => {
  return await query<Articles[]>(dbQueries.articles.getAll);
};

export const findSibling = async (slug: string, language: string): Promise<Articles | null> => {
  return queryOne<Articles>(dbQueries.articles.getByLangSlug, [slug, otherArticleLang(language)]);
};

// Makale Detayı Getirme
export const getArticle = async (articleId: number): Promise<Articles | null> => {
  const article = await queryOne<Articles>(dbQueries.articles.getById, [articleId]);
  if (!article) return null;

  if (!isPreviewToken(article.preview_token)) {
    const token = createPreviewToken();
    await query(dbQueries.articles.setPreviewToken, [token, article.id]);
    article.preview_token = token;
  }

  return article;
};

// Yeni Makale Kaydetme
export const addArticle = async (
  title: string,
  slug: string,
  excerpt: string,
  content: string,
  coverImg: string | null,
  status: boolean,
  language: string,
  userId: number
): Promise<number> => {
  const readingTime = calculateReadingTime(content);
  const publishedAt = resolvePublishedAt(status, null);
  const previewToken = createPreviewToken();

  const result = await query<InsertResult>(dbQueries.articles.add, [
    safeTrim(title),
    safeTrim(slug),
    safeTrim(excerpt),
    safeTrim(content),
    coverImg,
    userId,
    status,
    readingTime,
    publishedAt,
    language || 'tr',
    previewToken
  ]);

  return insertedId(result);
};

export const copyToOtherLanguage = async (articleId: number, userId: number): Promise<number> => {
  const source = await getArticle(articleId);
  if (!source) {
    throw new Error('Makale bulunamadı.');
  }

  const existing = await findSibling(source.slug, source.language);
  if (existing) {
    return existing.id;
  }

  return addArticle(
    source.title,
    source.slug,
    source.excerpt || '',
    source.content,
    null,
    false,
    otherArticleLang(source.language),
    userId
  );
};

// Makale Güncelleme
export const editArticle = async (
  articleId: number,
  title: string,
  slug: string,
  excerpt: string,
  content: string,
  coverImg: string | null,
  status: boolean,
  language: string,
  userId: number,
  existingPublishedAt?: Date | string | null
): Promise<void> => {
  const publishedAt = resolvePublishedAt(status, existingPublishedAt);
  const readingTime = calculateReadingTime(content);

  await query(dbQueries.articles.update, [
    safeTrim(title),
    safeTrim(slug),
    safeTrim(excerpt),
    safeTrim(content),
    coverImg,
    status,
    userId,
    readingTime,
    publishedAt,
    language || 'tr',
    articleId
  ]);
};

// Makale Silme
export const deleteArticle = async (articleId: number): Promise<void> => {
  await query(dbQueries.articles.delete, [articleId]);
};

export default {
  getArticles,
  getArticle,
  findSibling,
  addArticle,
  copyToOtherLanguage,
  editArticle,
  deleteArticle
};
