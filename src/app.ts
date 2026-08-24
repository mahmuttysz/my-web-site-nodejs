import express from 'express';
import cookieParser from 'cookie-parser';
import helmet from 'helmet';
import session from 'express-session';
import path from 'path';

import { env } from './config/env';
import { sessionOpt } from './config/session';
import { formatDate, formatLongDate, formatLongDateTime } from './utils/helper';
import { defaultMid } from './middlewares/default';
import { notFoundHandler } from './middlewares/notFoundHandler';
import { errorHandler } from './middlewares/errorHandler';

import homePageRouter from './routes/home';
import siteMapRouter from './routes/siteMap';
import languageRouter from './routes/language';
import adminRouter from './routes/admin';
import blogRouter from './routes/blog';
import contactRouter from './routes/contact';

const app = express();

// 1. Ayarlar ve Şablon Motoru Yapılandırması
app.set('trust proxy', 1);
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, '../views'));

// 2. EJS Şablon Yardımcı Fonksiyonları
app.locals.formatDate = formatDate;
app.locals.formatLongDate = formatLongDate;
app.locals.formatLongDateTime = formatLongDateTime;

// 3. Parser ve Statik Dosya Servisi (Session öncesi performans optimizasyonu)
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static(path.join(__dirname, '../public')));
app.use(cookieParser());

// 4. Session ve Özelleştirilmiş Context Middleware
app.use(session(sessionOpt));
app.use(defaultMid);

// 5. Güvenlik Başlıkları (Tek seferlik initialization)
const helmetMiddleware = helmet({
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            scriptSrc: [
                "'self'",
                "https://challenges.cloudflare.com",
                (_req: any, res: any) => `'nonce-${res.locals.nonce}'`
            ],
            styleSrc: ["'self'", "'unsafe-inline'"],
            frameSrc: ["'self'", "https://challenges.cloudflare.com"],
            connectSrc: ["'self'", "https://challenges.cloudflare.com"],
            childSrc: ["'self'", "blob:", "https://challenges.cloudflare.com"],
            workerSrc: ["'self'", "blob:", "https://challenges.cloudflare.com"],
            imgSrc: ["'self'", "data:", "blob:", "https:"]
        }
    }
});
app.use(helmetMiddleware);

// 6. Rota Tanımlamaları
const adminEndpoint = env.ADMIN_PANEL_ENDPOINT || '/admin';

app.use(siteMapRouter);
app.use(adminEndpoint, adminRouter);
app.use('/lang', languageRouter);
app.use('/blog', blogRouter);
app.use('/contact', contactRouter);
app.use('/', homePageRouter);

// 7. Merkezi Hata Yakalama Middleware Katmanları
app.use(notFoundHandler);
app.use(errorHandler);

// 8. Process Seviyesi Hata Dinleyicileri
process.on('unhandledRejection', (reason: any) => {
    console.error('Yakalanmamış Söz (Promise) Hatası:', reason);
});

process.on('uncaughtException', (err: any) => {
    console.error('Yakalanmamış İstisna (Uncaught Exception):', err);
});

const PORT = env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Sunucu aktif: ${env.APP_URL || `http://localhost:${PORT}`}`);
});