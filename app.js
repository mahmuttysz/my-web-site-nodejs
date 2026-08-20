const express = require('express');
const { env } = require('./config/env');
const cookieParser = require('cookie-parser');
const helmet = require('helmet');
const session = require('express-session');
const sessionOpt = require('./config/session');
const path = require('path');
const crypto = require('node:crypto');
const { getIndexPageData, formatDate, formatLongDate, formatLongDateTime } = require('./utils/helper');
const { defaultMid } = require('./middleware/default');

const sitemapRouter = require('./routes/sitemap');
const languageRouter = require('./routes/language');
const adminRouter = require('./routes/admin');
const blogRouter = require('./routes/blog');
const contactRouter = require('./routes/contact');

const adminEndpoint = env.ADMIN_PANEL_ENDPOINT || '/admin';

const app = express();

app.locals.formatDate = formatDate;
app.locals.formatLongDate = formatLongDate;
app.locals.formatLongDateTime = formatLongDateTime;

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));
app.use(cookieParser());

app.set('trust proxy', 1);
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use(session(sessionOpt));
app.use(defaultMid);
app.use((req, res, next) => {
    res.locals.nonce = crypto.randomBytes(16).toString('base64');
    next();
});

app.use((req, res, next) => {
    helmet({
        contentSecurityPolicy: {
            directives: {
                defaultSrc: ["'self'"],
                scriptSrc: [
                    "'self'",
                    "https://challenges.cloudflare.com",
                    (req, res) => `'nonce-${res.locals.nonce}'`
                ],
                styleSrc: ["'self'", "'unsafe-inline'"],
                frameSrc: ["'self'", "https://challenges.cloudflare.com"],
                connectSrc: ["'self'", "https://challenges.cloudflare.com"],
                childSrc: ["'self'", "blob:", "https://challenges.cloudflare.com"],
                workerSrc: ["'self'", "blob:", "https://challenges.cloudflare.com"],
                styleSrc: ["'self'", "'unsafe-inline'"],
                imgSrc: ["'self'", "data:", "blob:", "https:"]
            }
        }
    })(req, res, next);
});

app.get('/', async (req, res) => {
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

app.use(async (req, res, next) => {
    try {
        const lang = res.locals.lang || req.session?.lang || 'tr';
        let pageData = await getIndexPageData(lang);
        return res.status(404).render('404', pageData);
    } catch (err) {
        next(err);
    }
});

if (env.APP_ENV === 'prod') {
    app.use(async (err, req, res, next) => {
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

process.on('unhandledRejection', (reason, promise) => {
    console.error('Yakalanmamış Söz (Promise) Hatası:', reason);
});

process.on('uncaughtException', (err) => {
    console.error('Yakalanmamış İstisna (Uncaught Exception):', err);
});

const PORT = env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Sunucu aktif: ${env.APP_URL || `http://localhost:${PORT}`}`);
});