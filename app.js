const express = require('express');
const cookieParser = require('cookie-parser');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const path = require('path');
const { pool, sqlCommand } = require('./utils/db');
const { sendConfirmationMail, sendNotificationMailToAdmin } = require('./utils/mailer');
const { formatDate } = require('./utils/helper');
const locales = require('./utils/locales');

require('dotenv').config();

const app = express();

app.locals.formatDate = formatDate;
// Middleware Ayarları
app.use(express.urlencoded({ extended: true })); // Form verilerini okumak için
app.use(express.json()); // AJAX / JSON istekleri için
app.use(express.static(path.join(__dirname, 'public'))); // CSS, JS, Resimler için
app.use(helmet());

app.set('trust proxy', 1);
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));


app.use(cookieParser());

// DİL MIDDLEWARE'İ (Tüm rotalardan önce tanımlanmalı)
app.use((req, res, next) => {
    // 1. Dil Tercihi Belirleme Sırası:
    // a) URL Query Parametresi (?lang=en)
    // b) Tarayıcıdaki Cookie (req.cookies.lang)
    // c) Varsayılan Dil ('tr')
    let lang = req.query.lang || req.cookies.lang || 'tr';

    // Geçerli bir dil değilse 'tr' yap
    if (!['tr', 'en'].includes(lang)) {
        lang = 'tr';
    }

    // HTTP Header: Sunulan içeriğin dilini Google'a bildirir
    res.setHeader('Content-Language', lang);

    // HTTP Header: Arama motorlarına sayfayı indeksleme izni verir
    res.setHeader('X-Robots-Tag', 'index, follow');

    // Eğer URL üzerinden dil değiştirildiyse çerezi güncelle
    if (req.query.lang) {
        res.cookie('lang', lang, { maxAge: 30 * 24 * 60 * 60 * 1000 }); // 30 gün geçerli
    }

    // Tüm EJS dosyalarından erişilebilecek değişkenler:
    res.locals.lang = lang;                       // Aktif dil kodu ('tr' veya 'en')
    res.locals.t = locales[lang];                // Statik metin sözlüğü

    next();
});

// Dil Değiştirme Rotası (Butona tıklandığında)
app.get('/lang/:langCode', (req, res) => {
    const langCode = req.params.langCode;
    if (['tr', 'en'].includes(langCode)) {
        res.cookie('lang', langCode, { maxAge: 30 * 24 * 60 * 60 * 1000 });
    }
    // Kullanıcıyı geldiği sayfaya (veya ana sayfaya) geri yönlendir
    res.redirect(req.get('referer') || '/');
});

// ANA SAYFA (GET)
app.get('/', async (req, res) => {
    let conn;
    const activeLang = res.locals.lang;
    try {
        conn = await pool.getConnection();

        const aboutMe = await conn.query(sqlCommand.select.aboutMe, [activeLang]).catch(() => []);
        const experiences = await conn.query(sqlCommand.select.experiences, [activeLang]).catch(() => []);

        res.render('index', {
            aboutMe: aboutMe[0] || {},
            experiences: experiences
        });

    } catch (err) {
        console.error('Veritabanı Okuma Hatası:', err);
        res.status(500).send('Sunucu hatası oluştu.');
    } finally {
        if (conn) conn.release();
    }
});


const contactLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 dakika
    max: 5, // IP başına max 5 mesaj
    message: { success: false, message: 'Çok fazla istek gönderdiniz. Lütfen 15 dakika sonra tekrar deneyin.' }
});
// İLETİŞİM FORMU (POST)
app.post('/contact', contactLimiter, async (req, res) => {
    const { fullName, email, subject, message } = req.body;

    // Basit Validasyon
    if (!fullName || !email || !message) {
        return res.status(400).json({ success: false, message: 'Lütfen gerekli alanları doldurun.' });
    }

    let conn;
    try {
        conn = await pool.getConnection();
        const clientIp = req.headers['cf-connecting-ip'] ||
            req.headers['x-forwarded-for']?.split(',')[0] ||
            req.ip;
        // 1. Veritabanına Kaydet
        await conn.query(sqlCommand.insert.contact, [fullName, email, subject, message, clientIp, 'tr']);

        // 2. İletişime Geçen Kişiye E-Posta Gönder
        await sendConfirmationMail(email, fullName);

        // 3. Kendinize Bildirim Maili Gönder (Opsiyonel)
        await sendNotificationMailToAdmin(fullName, email, subject, message);

        return res.json({ success: true, message: 'Mesajınız başarıyla iletildi.' });

    } catch (err) {
        console.error('İletişim İşlem Hatası:', err);
        return res.status(500).json({ success: false, message: 'Mesaj gönderilirken bir hata oluştu.' });
    } finally {
        if (conn) conn.release();
    }
});

process.on('unhandledRejection', (reason, promise) => {
    console.error('Yakalanmamış Söz (Promise) Hatası:', reason);
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Sunucu aktif: http://localhost:${PORT}`);
});