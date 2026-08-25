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
            articles,
            socialMedias
        });
    } catch (err) {
        console.error('❌ Blog liste yükleme hatası:', err);
        return next(err);
    }
});

// Blog Detayı
router.get('/:slug', async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { slug } = req.params;

        const blogData = await blogController.getBySlug(slug.toString());

        // Makale bulunamadıysa isteği 404 middleware'ine devret
        if (!blogData) {
            return next();
        }

        return res.render('blog/detail', {
            title: blogData.title,
            article: blogData.article,
            socialMedias: blogData.socialMedias
        });
    } catch (err) {
        console.error('❌ Blog detay yükleme hatası:', err);
        return next(err);
    }
});

export default router;