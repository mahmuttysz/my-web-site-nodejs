// src/routes/blog.ts
import { marked } from 'marked';
import { pool, dbQueries, queryOne } from '../config/db';
import { getIndexPageData } from '../utils/helper';
import Articles from '../types/dbTables/articles';
import SocialMedias from '../types/dbTables/socialMedias';
import { BlogIndexResponse, BlogSlugResponse } from '../types/response/blogResponse';


// Blog Listesi
export const getArticles = async (language: string): Promise<BlogIndexResponse> => {
    try {
        const [articles, socialMedias] = await Promise.all([
            pool.query<Articles[]>(dbQueries.articles.get, [language]),
            pool.query<SocialMedias[]>(dbQueries.socialMedias.get)
        ]);

        return {
            articles,
            socialMedias
        };
    } catch (err) {
        console.error('❌ Blog liste yükleme hatası:', err);
        return {
            articles: [],
            socialMedias: []
        };
    }
};

// Blog Detayı
export const getBySlug = async (slug: string | string[], language: string): Promise<BlogSlugResponse> => {
    try {
        const article = await queryOne<Articles>(dbQueries.articles.getBySlug, [slug, language]);

        if (article === null) {
            const pageData = await getIndexPageData(language);
            return {
                title: 'Hata',
                article: <Articles>{},
                socialMedias: [],
                pageData
            };
        }

        // Arka planda hit sayısını artırma (non-blocking)
        await pool.query(dbQueries.articles.updateHits, [article.id])
            .catch((err: any) => {
                console.error('Hit güncellenirken hata:', err?.message || err);
            });

        // marked.parse Promise dönme ihtimaline karşı await kullanımı eklenmiştir
        article.contentHtml = await marked.parse(article.content || '');

        const socialMedias = await pool.query<SocialMedias[]>(dbQueries.socialMedias.get);

        return {
            title: article.title,
            article,
            socialMedias: socialMedias || []
        };
    } catch (err) {
        console.error('❌ Blog detay yükleme hatası:', err);
        return {
            title: 'Hata',
            article: <Articles>{},
            socialMedias: []
        };
    }
};

export default {
    getArticles,
    getBySlug
};