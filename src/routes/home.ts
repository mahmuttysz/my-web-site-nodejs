import express, { NextFunction, Request, Response } from 'express';
import { env } from '../config/env';
import { getHomePage } from '../controllers/homeController';
import { assignSeo } from '../utils/seo';

const router = express.Router();

router.get('/', async (_req: Request, res: Response, next: NextFunction) => {
    try {
        const lang = (res.locals.lang as string) || 'tr';

        const homePageData = await getHomePage(lang);
        homePageData.turnstileSiteKey = env.TURNSTILE_SITE_KEY;

        assignSeo(res, { type: 'home', path: '/' });

        return res.render('home/index', homePageData);
    } catch (err) {
        console.error('❌ Anasayfa yükleme hatası:', err);
        return next(err);
    }
});

export default router;