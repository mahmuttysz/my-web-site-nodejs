const express = require('express');
const dotenv = require('dotenv');
const dotenvExpand = require('dotenv-expand');
const cookieParser = require('cookie-parser');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const session = require('express-session');
const { RedisStore } = require('connect-redis');
const redisClient = require('./config/redis');
const path = require('path');
const { pool, dbTables } = require('./config/db');
const { sendVisitorMail, sendNotificationMailToAdmin } = require('./utils/mailer');
const { formatDate, formatLongDate, formatLongDateTime } = require('./utils/helper');
const locales = require('./utils/locales');

const adminRoutes = require('./routes/admin');
const blogRoutes = require('./routes/blog');

dotenvExpand.expand(dotenv.config());
const app = express();

app.locals.formatDate = formatDate;
app.locals.formatLongDate = formatLongDate;
app.locals.formatLongDateTime = formatLongDateTime;

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

app.use(helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" }
}));

app.use(session({
    store: new RedisStore({ client: redisClient }),
    secret: process.env.SESSION_SECRET || 'very_secret_key_must_be_change',
    resave: false,
    saveUninitialized: false,
    name: 'sid_admin',
    cookie: {
        secure: process.env.APP_ENV === 'prod',
        httpOnly: true,
        maxAge: 1000 * 60 * 60 * 8,
        sameSite: 'lax'
    }
}));
app.set('trust proxy', 1);
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use(cookieParser());
app.use((req, res, next) => {
    res.locals.siteUrl = process.env.SITE_URL || `http://localhost:${process.env.PORT || 3000}`;
    let lang = req.query.lang || req.cookies.lang || 'tr';

    if (!['tr', 'en'].includes(lang)) {
        lang = 'tr';
    }
    res.setHeader('Content-Language', lang);

    res.setHeader('X-Robots-Tag', 'index, follow');

    if (req.query.lang) {
        res.cookie('lang', lang, { maxAge: 30 * 24 * 60 * 60 * 1000 });
    }

    res.locals.lang = lang;
    res.locals.t = locales[lang];

    next();
});

app.get('/lang/:langCode', (req, res) => {
    const langCode = req.params.langCode;
    if (['tr', 'en'].includes(langCode)) {
        res.cookie('lang', langCode, { maxAge: 30 * 24 * 60 * 60 * 1000 });
    }

    res.redirect(req.get('referer') || '/');
});

app.use('/blog', blogRoutes);
app.use('/admin', adminRoutes);

app.get('/', async (req, res) => {
    const currentLang = res.locals.lang;
    try {
        const aboutMe = await pool.query(dbTables.aboutMe.get, [currentLang]);
        const experiences = await pool.query(dbTables.experiences.get, [currentLang]);
        const projects = await pool.query(dbTables.projects.get, [currentLang]);
        const socialMedias = await pool.query(dbTables.socialMedias.get);

        res.render('index', {
            aboutMe: aboutMe[0] || {},
            experiences: experiences || [],
            projects: projects || [],
            socialMedias: socialMedias || []
        });

    } catch (err) {
        console.error('Veritabanı Okuma Hatası:', err);
        res.status(500).send('Sunucu hatası oluştu.');
    }
});

const contactLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 5,
    handler: (req, res) => {
        return res.status(429).json({
            success: false,
            message: res.locals.t.form.tooManyRequests
        });
    }
});

app.post('/contact', contactLimiter, async (req, res) => {
    const { fullName, email, subject, message, websiteUrl, formLoadedAt } = req.body;

    if (websiteUrl) {
        console.log('🐝 Honeypot bir bot yakaladı!');
        return res.json({ success: true, message: 'Mesajınız başarıyla iletildi.' });
    }

    const fillTimeInSeconds = (Date.now() - parseInt(formLoadedAt || 0)) / 1000;
    if (fillTimeInSeconds < 2) {
        console.log('⏱️ Zaman Tuzağı bir bot yakaladı!');
        return res.json({ success: true, message: 'Mesajınız başarıyla iletildi.' });
    }
    if (!fullName || !email || !message) {
        return res.status(400).json({ success: false, message: res.locals.t.form.emptyCells });
    }

    try {
        const clientIp = req.headers['cf-connecting-ip'] ||
            req.headers['x-forwarded-for']?.split(',')[0] ||
            req.ip;

        let sendMail = await Promise.allSettled([
            sendVisitorMail(email, fullName, res.locals.lang),
            sendNotificationMailToAdmin(fullName, email, subject, message, res.locals.lang)
        ]).catch(mailErr => console.error('Arka Plan Mail Gönderim Hatası:', mailErr));

        let mailStatus = sendMail.every(mail => mail.status === 'fulfilled');
        let mailLog = {
            visitorMail: sendMail[0],
            adminMail: sendMail[1]
        };
        await pool.query(dbTables.contacts.add, [fullName, email, subject, message, clientIp, JSON.stringify(mailLog), res.locals.lang]);
        return res.json({
            success: mailStatus,
            message: mailStatus ? res.locals.t.form.success : res.locals.t.form.error
        });

    } catch (err) {
        console.error('İletişim İşlem Hatası:', err);
        return res.status(500).json({ success: false, message: res.locals.t.form.error });
    }
});

process.on('unhandledRejection', (reason, promise) => {
    console.error('Yakalanmamış Söz (Promise) Hatası:', reason);
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Sunucu aktif: ${process.env.APP_URL || `http://localhost:${PORT}`}`);
});