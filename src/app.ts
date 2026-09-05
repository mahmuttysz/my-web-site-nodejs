import express from 'express';
import cookieParser from 'cookie-parser';
import helmet from 'helmet';
import session from 'express-session';
import path from 'path';

import { env } from './config/env';
import { sessionOpt } from './config/session';
import { closePool } from './config/db';
import { closeRedis } from './config/redis';
import { formatDate, formatLongDate, formatLongDateTime } from './utils/helper';
import { hasNowWorking } from './utils/articleTranslation';
import { flushArticleHits, startHitFlusher } from './utils/articleHitStore';
import { assignNonce, defaultMid } from './middlewares/default';
import { attachLocale, redirectLangQuery, skipIfEnPrefix } from './middlewares/locale';
import { notFoundHandler } from './middlewares/notFoundHandler';
import { errorHandler } from './middlewares/errorHandler';

import healthRouter from './routes/health';
import languageRouter from './routes/language';
import adminRouter from './routes/admin';
import publicSiteRouter from './routes/site';

const app = express();

// 1. Ayarlar ve Şablon Motoru Yapılandırması
app.set('trust proxy', 1);
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, '../views'));

// 2. EJS Şablon Yardımcı Fonksiyonları
app.locals.formatDate = formatDate;
app.locals.formatLongDate = formatLongDate;
app.locals.formatLongDateTime = formatLongDateTime;
app.locals.hasNowWorking = hasNowWorking;

// 3. Parser (static'ten önce nonce + Helmet: /css /js /uploads da CSP/HSTS alsın)
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(assignNonce);
app.use(helmet({
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
}));
app.use(express.static(path.join(__dirname, '../public')));
app.use(cookieParser());

// Health is before session so a Redis outage still yields a 503 instead of hanging the probe.
app.use(healthRouter);

// 4. Session ve Özelleştirilmiş Context Middleware
app.use(session(sessionOpt));
app.use(redirectLangQuery);
app.use(defaultMid);

// 5. Rota Tanımlamaları
const adminEndpoint = env.ADMIN_PANEL_ENDPOINT || '/admin';

app.use(adminEndpoint, adminRouter);
app.use('/lang', languageRouter);
app.use('/en', attachLocale('en'), publicSiteRouter);
app.use(skipIfEnPrefix, attachLocale('tr'), publicSiteRouter);

// 6. Merkezi Hata Yakalama Middleware Katmanları
app.use(notFoundHandler);
app.use(errorHandler);

const PORT = env.PORT || 3000;
const server = app.listen(PORT, () => {
    console.log(`Sunucu aktif: ${env.APP_URL || `http://localhost:${PORT}`}`);
});

const stopHitFlusher = startHitFlusher();

let shuttingDown = false;

const shutdown = async (signal: string, exitCode = 0): Promise<void> => {
    if (shuttingDown) return;
    shuttingDown = true;

    console.log(`${signal} alındı, sunucu kapatılıyor...`);

    const forceTimer = setTimeout(() => {
        console.error('Kapanma zaman aşımı, süreç sonlandırılıyor.');
        process.exit(1);
    }, 10_000);
    forceTimer.unref();

    server.close(async (closeErr) => {
        if (closeErr) {
            console.error('HTTP sunucusu kapatılırken hata:', closeErr);
        }

        try {
            await flushArticleHits();
        } catch (err) {
            console.error('Hit flush kapanırken hata:', err);
        }

        stopHitFlusher();

        try {
            await closeRedis();
        } catch (err) {
            console.error('Redis kapatılırken hata:', err);
        }

        try {
            await closePool();
        } catch (err) {
            console.error('MariaDB kapatılırken hata:', err);
        }

        process.exit(closeErr ? 1 : exitCode);
    });
};

process.on('SIGINT', () => {
    void shutdown('SIGINT');
});

process.on('SIGTERM', () => {
    void shutdown('SIGTERM');
});

process.on('unhandledRejection', (reason: unknown) => {
    console.error('Yakalanmamış Söz (Promise) Hatası:', reason);
});

process.on('uncaughtException', (err: unknown) => {
    console.error('Yakalanmamış İstisna (Uncaught Exception):', err);
    void shutdown('uncaughtException', 1);
});