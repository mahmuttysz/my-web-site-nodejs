import { query, queryOne, dbQueries } from '../../config/db';
import { safeTrim, calculateReadingTime, resolvePublishedAt } from '../../utils/helper';
import { createPreviewToken, isPreviewToken } from '../../utils/preview';
import Articles from '../../types/dbTables/articles';

// Makaleleri Listeleme
export const getArticles = async (): Promise<Articles[]> => {
  return await query<Articles[]>(dbQueries.articles.getAll);
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
): Promise<void> => {
  const readingTime = calculateReadingTime(content);
  const publishedAt = resolvePublishedAt(status, null);
  const previewToken = createPreviewToken();

  await query(dbQueries.articles.add, [
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
  addArticle,
  editArticle,
  deleteArticle
};