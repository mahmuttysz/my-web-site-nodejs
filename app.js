const express = require('express');
const { env } = require('./config/env');
const cookieParser = require('cookie-parser');
const helmet = require('helmet');
const session = require('express-session');
const sessionOpt = require('./config/session');
const path = require('path');
const { getIndexPageData, formatDate, formatLongDate, formatLongDateTime } = require('./utils/helper');
const { defaultMid } = require('./middleware/default');

const languageRoutes = require('./routes/language');
const adminRoutes = require('./routes/admin');
const blogRoutes = require('./routes/blog');
const contactRoutes = require('./routes/contact');

const adminEndpoint = env.ADMIN_PANEL_ENDPOINT || '/admin';

const app = express();
app.use(
    helmet({
        crossOriginResourcePolicy: {
            policy: "cross-origin"
        },
        contentSecurityPolicy: {
            directives: {
                defaultSrc: ["'self'"],
                scriptSrc: ["'self'", "'unsafe-inline'", "https://challenges.cloudflare.com", "blob:"],
                scriptSrcAttr: ["'unsafe-inline'"],
                styleSrc: ["'self'", "'unsafe-inline'"],
                frameSrc: ["'self'", "https://challenges.cloudflare.com"],
                workerSrc: ["'self'", "blob:", "https://challenges.cloudflare.com"],
                childSrc: ["'self'", "blob:", "https://challenges.cloudflare.com"],
                connectSrc: ["'self'", "https://challenges.cloudflare.com"],
                imgSrc: ["'self'", "data:", "blob:", "https:"]
            }
        }
    })
);

app.locals.formatDate = formatDate;
app.locals.formatLongDate = formatLongDate;
app.locals.formatLongDateTime = formatLongDateTime;

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

app.use(session(sessionOpt));
app.set('trust proxy', 1);
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use(cookieParser());
app.use(defaultMid);

app.get('/', async (req, res) => {
    const currentLang = res.locals.lang;
    try {
        let pageData = await getIndexPageData(currentLang);
        pageData.turnstileSiteKey = env.TURNSTILE_SITE_KEY;
        res.render('index', pageData);

    } catch (err) {
        console.error('Veritabanı Okuma Hatası:', err);
        res.status(500).send('Sunucu hatası oluştu.');
    }
});

app.use(adminEndpoint, adminRoutes);
app.use('/lang', languageRoutes);
app.use('/blog', blogRoutes);
app.use('/contact', contactRoutes);

app.use(async (req, res) => {
    const lang = res.locals.lang || req.session?.lang || 'tr';
    let pageData = await getIndexPageData(lang);
    res.status(404).render('404', pageData);
});

if (env.APP_ENV === 'prod') {
    app.use(async (err, req, res, next) => {
        console.error('❌ Sunucu Hatası (500):', err.stack);

        const lang = res.locals.lang || req.session?.lang || 'tr';
        let pageData = await getIndexPageData(lang);

        res.status(500).render('500', pageData);
    });
}

process.on('unhandledRejection', (reason, promise) => {
    console.error('Yakalanmamış Söz (Promise) Hatası:', reason);
});

const PORT = env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Sunucu aktif: ${env.APP_URL || `http://localhost:${PORT}`}`);
});