import express, { Request, Response, NextFunction } from 'express';
import cookieParser from 'cookie-parser';
import helmet from 'helmet';
import session from 'express-session';
import path from 'path';

import { env } from './config/env';
import { sessionOpt } from './config/session';
import { getIndexPageData, formatDate, formatLongDate, formatLongDateTime } from './utils/helper';
import { defaultMid } from './middlewares/default';

import sitemapRouter from './routes/sitemap';
import languageRouter from './routes/language';
import adminRouter from './routes/admin';
import blogRouter from './routes/blog';
import contactRouter from './routes/contact';

const adminEndpoint = env.ADMIN_PANEL_ENDPOINT || '/admin';

const app = express();

app.locals.formatDate = formatDate;
app.locals.formatLongDate = formatLongDate;
app.locals.formatLongDateTime = formatLongDateTime;

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static(path.join(__dirname, '../public')));
app.use(cookieParser());

app.set('trust proxy', 1);
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, '../views'));

app.use(session(sessionOpt));
app.use(defaultMid);

app.use((req: Request, res: Response, next: NextFunction) => {
    helmet({
        contentSecurityPolicy: {
            directives: {
                defaultSrc: ["'self'"],
                scriptSrc: [
                    "'self'",
                    "https://challenges.cloudflare.com",
                    (req: any, res: any) => `'nonce-${res.locals.nonce}'`
                ],
                styleSrc: ["'self'", "'unsafe-inline'"],
                frameSrc: ["'self'", "https://challenges.cloudflare.com"],
                connectSrc: ["'self'", "https://challenges.cloudflare.com"],
                childSrc: ["'self'", "blob:", "https://challenges.cloudflare.com"],
                workerSrc: ["'self'", "blob:", "https://challenges.cloudflare.com"],
                imgSrc: ["'self'", "data:", "blob:", "https:"]
            }
        }
    })(req, res, next);
});

app.get('/', async (req: Request, res: Response) => {
    const currentLang = res.locals.lang;
    try {
        let pageData = await getIndexPageData(currentLang);
        pageData.turnstileSiteKey = env.TURNSTILE_SITE_KEY;
        return res.render('index', pageData);

    } catch (err) {
        console.error('Veritabanı Okuma Hatası:', err);
        return res.status(500).send('Sunucu hatası oluştu.');
    }
});
app.use('/', sitemapRouter);
app.use(adminEndpoint, adminRouter);
app.use('/lang', languageRouter);
app.use('/blog', blogRouter);
app.use('/contact', contactRouter);

app.use(async (req: Request, res: Response, next: NextFunction) => {
    try {
        const lang = res.locals.lang || req.session?.lang || 'tr';
        let pageData = await getIndexPageData(lang);
        return res.status(404).render('404', pageData);
    } catch (err) {
        next(err);
    }
});

if (env.APP_ENV === 'prod') {
    app.use(async (err: Error, req: Request, res: Response, next: NextFunction) => {
        console.error('❌ Sunucu Hatası (500):', err.stack);
        try {
            const lang = res.locals.lang || req.session?.lang || 'tr';
            let pageData = await getIndexPageData(lang);
            return res.status(500).render('500', pageData);
        } catch (fallbackErr) {
            return res.status(500).send('Sunucu hatası oluştu.');
        }
    });
}

process.on('unhandledRejection', (reason: any, promise: any) => {
    console.error('Yakalanmamış Söz (Promise) Hatası:', reason);
});

process.on('uncaughtException', (err: any) => {
    console.error('Yakalanmamış İstisna (Uncaught Exception):', err);
});

const PORT = env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Sunucu aktif: ${env.APP_URL || `http://localhost:${PORT}`}`);
});