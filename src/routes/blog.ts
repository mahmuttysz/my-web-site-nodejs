import express, { Request, Response, NextFunction } from 'express';
import blogController from '../controllers/blogController';
import { assignSeo } from '../utils/seo';
import { SiteLang, localizePath, otherLang } from '../utils/i18n';
import { isPreviewToken, isPublishedStatus } from '../utils/preview';

const router = express.Router();

router.get('/', async (_req: Request, res: Response, next: NextFunction) => {
    try {
        const lang = (res.locals.lang as SiteLang) || 'tr';
        const { articles, socialMedias } = await blogController.getArticles(lang);

        assignSeo(res, {
            type: 'blog',
            path: '/blog'
        });

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

router.get('/_preview/:token', async (req: Request, res: Response, next: NextFunction) => {
    try {
        const lang = (res.locals.lang as SiteLang) || 'tr';
        const token = String(req.params.token || '');

        if (!isPreviewToken(token)) {
            return next();
        }

        const preview = await blogController.getByPreviewToken(token);
        if (!preview?.article) {
            return next();
        }

        const articleLang: SiteLang = preview.article.language === 'en' ? 'en' : 'tr';

        if (isPublishedStatus(preview.article.status) && preview.article.slug) {
            return res.redirect(302, localizePath(articleLang, `/blog/${preview.article.slug}`));
        }

        if (lang !== articleLang) {
            return res.redirect(302, localizePath(articleLang, `/blog/_preview/${token}`));
        }

        res.locals.noindex = true;
        res.setHeader('X-Robots-Tag', 'noindex, nofollow, noarchive');

        return res.render('blog/detail', {
            title: preview.title,
            article: preview.article,
            socialMedias: preview.socialMedias,
            isPreview: true
        });
    } catch (err) {
        console.error('❌ Blog önizleme hatası:', err);
        return next(err);
    }
});

router.get('/:slug', async (req: Request, res: Response, next: NextFunction) => {
    try {
        const lang = (res.locals.lang as SiteLang) || 'tr';
        const slug = String(req.params.slug || '');
        const blogData = await blogController.getBySlug(slug, lang, req);

        if (!blogData) {
            const other = await blogController.findPublishedOtherLanguage(slug, lang);
            if (other) {
                return res.redirect(301, localizePath(other.language as SiteLang, `/blog/${other.slug}`));
            }
            return next();
        }

        const siblingLang = otherLang(lang);
        const sibling = await blogController.findPublishedOtherLanguage(slug, lang);
        const alternateLangs: SiteLang[] = sibling ? [lang, siblingLang] : [lang];

        assignSeo(res, {
            type: 'article',
            path: `/blog/${slug}`,
            article: blogData.article,
            alternateLangs
        });

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
