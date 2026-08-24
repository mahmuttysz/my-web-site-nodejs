// src/routes/admin/articles.ts
import { pool, dbQueries, queryOne } from '../../config/db';
import { safeTrim, calculateReadingTime } from '../../utils/helper';
import Articles from '../../types/dbTables/articles';

// Makaleleri Listeleme
export const getArticles = async () => {
  try {
    return await pool.query<Articles[]>(dbQueries.articles.getAll);
  } catch (err) {
    console.error('Makaleler çekilirken hata:', err);
  }
};


// Yeni Makale Kaydetme
export const saveArticle = async (title: string, slug: string, excerpt: string, content: string, coverImg: string | null, status: boolean, language: string, userId: number) => {
  const readingTime = calculateReadingTime ? calculateReadingTime(content) : 3;
  const publishedAt = status ? new Date() : null;

  try {
    await pool.query(dbQueries.articles.add, [
      safeTrim(title),
      safeTrim(slug),
      safeTrim(excerpt),
      safeTrim(content),
      coverImg,
      userId,
      status,
      readingTime,
      publishedAt,
      language || 'tr'
    ]);
    return true;

  } catch (err: any) {
    console.error('Makale ekleme hatası:', err);
    return false;
  }
};

// Makale Düzenleme Sayfası
export const getArticle = async (articleId: number) => {
  try {
    return await queryOne<Articles>(dbQueries.articles.getById, [articleId]);
  } catch (err) {
    console.error('Makale getirme hatası:', err);
    return <Articles>{};
  }
};

// Makale Güncelleme
export const editArticle = async (articleId: number, title: string, slug: string, excerpt: string, content: string, coverImg: string | null, status: boolean, language: string, userId: number) => {
  const publishedAt = status ? new Date() : null;
  const readingTime = calculateReadingTime ? calculateReadingTime(content) : 3;
  try {
    await pool.query(dbQueries.articles.update, [
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

    return true;
  } catch (err: any) {
    console.error('Makale güncelleme hatası:', err);

    return false;
  }
};

// Makale Silme
export const deleteArticle = async (articleId: number) => {
  try {
    await pool.query(dbQueries.articles.delete, [articleId]);

    return true;
  } catch (err: any) {
    return false;
  }
};

export default {
  getArticles,
  saveArticle,
  getArticle,
  editArticle,
  deleteArticle
};