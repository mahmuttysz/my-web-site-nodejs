import express, { Request, Response, NextFunction } from 'express';
import session from 'express-session';
import cookieParser from 'cookie-parser';
import helmet from 'helmet';
import path from 'path';

import { env } from './config/env';
import { getIndexPageData, formatDate, formatLongDate, formatLongDateTime } from './utils/helper';
import { defaultMid } from './middleware/default';
import cors from 'cors';
import homeRouter from './routes/home';
import sitemapRouter from './routes/sitemap';
import languageRouter from './routes/language';
import adminRouter from './routes/admin';
import blogRouter from './routes/blog';
import contactRouter from './routes/contact';
import sessionOpt from './config/session';

const adminEndpoint = env.ADMIN_PANEL_ENDPOINT || '/admin';

const app = express();

app.locals.formatDate = formatDate;
app.locals.formatLongDate = formatLongDate;
app.locals.formatLongDateTime = formatLongDateTime;
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
//app.use(express.static(path.join(__dirname, 'public')));
app.use(cookieParser());
app.use(cors({ origin: 'http://localhost:3001', credentials: true }));

// 2. Express Session Middleware (Route'lardan ÖNCE olmalı!)
app.use(session(sessionOpt));
app.set('trust proxy', 1);
app.use(defaultMid);

app.use((req: Request, res: Response, next: NextFunction) => {
    helmet({
        contentSecurityPolicy: {
            directives: {
                defaultSrc: ["'self'"],
                scriptSrc: [
                    "'self'",
                    "https://challenges.cloudflare.com",
                    (_req: Request, res: Response) => `'nonce-${res.locals.nonce}'`
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

app.use('/api/home', homeRouter);
app.use('/api/sitemap.xml', sitemapRouter);
app.use(`/api${adminEndpoint}`, adminRouter);
app.use('/api/lang', languageRouter);
app.use('/api/blog', blogRouter);
app.use('/api/contact', contactRouter);
app.use((req, res) => {
    res.status(404).json({
        success: false,
        message: 'Endpoint bulunamadı.'
    });
});

if (env.APP_ENV === 'prod') {
    app.use(async (err: any, req: Request, res: Response, next: NextFunction) => {
        console.error('❌ Sunucu Hatası (500):', err.stack);
        try {
            // const lang = res.locals.lang || (req.session as any)?.lang || 'tr';
            // const pageData = await getIndexPageData(lang);
            return res.status(500).json({
                success: false,
                message: 'Sunucu hatası oluştu.'
            });
        } catch (fallbackErr) {
            return res.status(500).json({
                success: false,
                message: 'Sunucu hatası oluştu.'
            });
        }
    });
}

process.on('unhandledRejection', (reason: unknown) => {
    console.error('Yakalanmamış Söz (Promise) Hatası:', reason);
});

process.on('uncaughtException', (err: Error) => {
    console.error('Yakalanmamış İstisna (Uncaught Exception):', err);
});

const PORT = env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Sunucu aktif: ${env.APP_URL || `http://localhost:${PORT}`}`);
});