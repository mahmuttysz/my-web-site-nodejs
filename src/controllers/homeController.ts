import { Request, Response } from 'express';
import { pool, dbQueries } from '../config/db';

export const getHomeData = async (req: Request, res: Response) => {
    const lang = (req.query.lang as string) || 'tr';

    try {
        const [aboutMeRows, projects, articles, experiences] = await Promise.all([
            pool.query(dbQueries.aboutMe.get, [lang]),
            pool.query(dbQueries.projects.get, [lang]),
            pool.query(dbQueries.articles.get, [lang]),
            pool.query(dbQueries.experiences.get, [lang])
        ]);

        // Etiketlerin JSON dönüşümü
        const formattedProjects = (projects || []).map((p: any) => ({
            ...p,
            tags: typeof p.tags === 'string' ? JSON.parse(p.tags || '[]') : p.tags || []
        }));

        return res.json({
            success: true,
            lang,
            turnstileSiteKey: process.env.TURNSTILE_SITE_KEY || '',
            data: {
                aboutMe: aboutMeRows?.[0] || null,
                projects: formattedProjects,
                articles: articles || [],
                experiences: experiences || []
            }
        });
    } catch (err) {
        console.error('❌ Anasayfa verileri getirilemedi:', err);
        return res.status(500).json({
            success: false,
            message: 'Sunucu hatası oluştu.'
        });
    }
};