import express, { NextFunction, Request, Response } from 'express';
import { env } from '../config/env';
import { getHomePage } from '../controllers/homeController';

const router = express.Router();

router.get('/', async (req: Request, res: Response, next: NextFunction) => {
    try {
        const lang = (req.session) ?
            req.session.lang?.toString()
            : 'tr';

        const homePageData = await getHomePage(lang);
        homePageData.turnstileSiteKey = env.TURNSTILE_SITE_KEY;

        return res.render('home/index', homePageData);
    } catch (err) {
        console.error('❌ Anasayfa yükleme hatası:', err);
        return next(err);
    }
});

export default router;