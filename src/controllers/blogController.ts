import { Request, Response, NextFunction } from 'express';
import { marked } from 'marked';
import { pool, dbQueries } from '../config/db';

export const getArticles = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const lang = (res.locals.lang || 'tr') as string;

        const [articles, socialMedias] = await Promise.all([
            pool.query(dbQueries.articles.get, [lang]),
            pool.query(dbQueries.socialMedias.get)
        ]);

        return res.json({
            success: true,
            data: {
                articles: articles || [],
                socialMedias: socialMedias || []
            }
        });
    } catch (err) {
        console.error('❌ Blog liste yükleme hatası:', err);
        return next(err);
    }
};

export const getArticleBySlug = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const lang = (res.locals.lang || 'tr') as string;
        const { slug } = req.params;

        const rows = await pool.query(dbQueries.articles.getBySlug, [slug, lang]);

        if (!rows || rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: res.locals.t?.alert?.pageNotFound || 'Makale bulunamadı.'
            });
        }

        const article = rows[0];

        // Okunma sayısını arka planda güncelle
        pool.query(dbQueries.articles.updateHits, [article.id]).catch((err: Error) => {
            console.error('Hit güncellenirken hata:', err.message);
        });

        // Markdown içeriğini HTML formatına çevir
        const contentHtml = await marked.parse(article.content || '');
        const socialMedias = await pool.query(dbQueries.socialMedias.get);

        return res.json({
            success: true,
            data: {
                article: {
                    ...article,
                    contentHtml
                },
                socialMedias: socialMedias || []
            }
        });
    } catch (err) {
        console.error('❌ Blog detay yükleme hatası:', err);
        return next(err);
    }
};