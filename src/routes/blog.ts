// src/routes/blog.ts
import express, { Request, Response, NextFunction } from 'express';
import blogController from '../controllers/blogController';

const router = express.Router();

// Blog Listesi
router.get('/', async (req: Request, res: Response, next: NextFunction) => {
    try {
        const lang = res.locals.lang || 'tr';

        const { articles, socialMedias } = await blogController.getArticles(lang);

        return res.render('blog/index', {
            title: res.locals.t?.nav?.blog || 'Blog',
            articles: articles || [],
            socialMedias: socialMedias
        });
    } catch (err) {
        console.error('❌ Blog liste yükleme hatası:', err);
        return next(err);
    }
});

// Blog Detayı
router.get('/:slug', async (req: Request, res: Response, next: NextFunction) => {
    try {
        const lang = res.locals.lang || 'tr';
        const { slug } = req.params;

        const getData = await blogController.getBySlug(slug, lang);

        return res.render('blog/detail', {
            title: getData.article?.title,
            article: getData.article,
            socialMedias: getData.socialMedias
        });
    } catch (err) {
        console.error('❌ Blog detay yükleme hatası:', err);
        return next(err);
    }
});

export default router;