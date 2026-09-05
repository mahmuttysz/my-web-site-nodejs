import { dbQueries, query, queryOne } from '../config/db';
import { renderMarkdown } from '../utils/markdown';
import { recordArticleHit } from '../utils/articleHitStore';
import Articles from '../types/dbTables/articles';
import SocialMedias from '../types/dbTables/socialMedias';
import { BlogIndexResponse, BlogSlugResponse } from '../types/response/blogResponse';
import { Request } from 'express';

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

export const findPublishedOtherLanguage = async (
    slug: string,
    language: string
): Promise<{ slug: string; language: string } | null> => {
    return queryOne<{ slug: string; language: string }>(dbQueries.articles.getPublishedOtherLang, [
        slug,
        language
    ]);
};

export const getBySlug = async (
    slug: string,
    language: string,
    req?: Request
): Promise<BlogSlugResponse | null> => {
    const article = await queryOne<Articles>(dbQueries.articles.getBySlug, [slug, language]);

    if (!article) {
        return null;
    }

    if (req) {
        void recordArticleHit(article.id, req);
    }

    article.contentHtml = await renderMarkdown(article.content);

    const socialMedias = await query<SocialMedias[]>(dbQueries.socialMedias.get);

    return {
        title: article.title,
        article,
        socialMedias: socialMedias || []
    };
};

export const getByPreviewToken = async (token: string): Promise<BlogSlugResponse | null> => {
    const article = await queryOne<Articles>(dbQueries.articles.getByPreviewToken, [token]);

    if (!article) {
        return null;
    }

    article.contentHtml = await renderMarkdown(article.content);

    const socialMedias = await query<SocialMedias[]>(dbQueries.socialMedias.get);

    return {
        title: article.title,
        article,
        socialMedias: socialMedias || []
    };
};

export default {
    getArticles,
    getBySlug,
    getByPreviewToken,
    findPublishedOtherLanguage
};
