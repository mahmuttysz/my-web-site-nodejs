import { marked } from 'marked';
import { dbQueries, query, queryOne } from '../config/db';
import Articles from '../types/dbTables/articles';
import SocialMedias from '../types/dbTables/socialMedias';
import { BlogIndexResponse, BlogSlugResponse } from '../types/response/blogResponse';

// Blog Listesi
export const getArticles = async (language: string): Promise<BlogIndexResponse> => {
    const [articles, socialMedias] = await Promise.all([
        query<Articles[]>(dbQueries.articles.get, [language]),
        query<SocialMedias[]>(dbQueries.socialMedias.get)
    ]);

    return {
        articles: articles || [],
        socialMedias: socialMedias || []
    };
};

// Blog Detayı
export const getBySlug = async (slug: string): Promise<BlogSlugResponse | null> => {
    const article = await queryOne<Articles>(dbQueries.articles.getBySlug, [slug]);

    if (!article) {
        return null;
    }

    // Arka planda okuma sayısını (hit) artırma (Gerçek non-blocking işlem)
    query(dbQueries.articles.updateHits, [article.id]).catch((err: any) => {
        console.error('Hit güncellenirken hata:', err?.message || err);
    });

    // Markdown içeriğini HTML'e dönüştürme
    article.contentHtml = await marked.parse(article.content || '');

    const socialMedias = await query<SocialMedias[]>(dbQueries.socialMedias.get);

    return {
        title: article.title,
        article,
        socialMedias: socialMedias || []
    };
};

export default {
    getArticles,
    getBySlug
};