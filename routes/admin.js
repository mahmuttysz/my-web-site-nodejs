const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const slugify = require('slugify');
const fs = require('fs/promises');
const path = require('path');

const { env } = require('../config/env');
const { pool, dbQueries, adminPanel } = require('../config/db');
const upload = require('../config/upload');
const { formLimiter } = require('../config/rateLimit');
const { isAdmin } = require('../middleware/auth');
const { calculateReadingTime } = require('../utils/helper');

const adminEndpoint = env.ADMIN_PANEL_ENDPOINT || '/admin';

router.get('/login', (req, res) => {
    if (req.session.adminUser) return res.redirect(adminEndpoint);
    return res.render('admin/login', { adminEndpoint, error: null });
});

router.post('/login', formLimiter, async (req, res) => {
    const { username, password } = req.body;

    try {
        const clientIp = req.headers['cf-connecting-ip'] ||
            req.headers['x-forwarded-for']?.split(',')[0] ||
            req.ip;

        const user = await pool.query(dbQueries.adminUsers.getByUsername, [username]);

        if (!user || user.length === 0) {
            return res.render('admin/login', { adminEndpoint, error: 'Kullanıcı adı veya şifre hatalı.' });
        }

        const match = await bcrypt.compare(password, user[0].password_hash);

        if (!match) {
            await pool.query(dbQueries.adminUsers.wrongTryUpdate, [new Date(), clientIp, user[0].id]);
            return res.render('admin/login', { adminEndpoint, error: 'Kullanıcı adı veya şifre hatalı.' });
        }

        req.session.adminUser = {
            id: user[0].id,
            username: user[0].username
        };

        await pool.query(dbQueries.adminUsers.successLoginUpdate, [new Date(), clientIp, user[0].id]);

        const redirectUrl = req.session.returnTo || adminEndpoint;
        delete req.session.returnTo;

        return res.redirect(redirectUrl);

    } catch (err) {
        console.error('Login Hatası:', err);
        return res.render('admin/login', { adminEndpoint, error: 'Veritabanı hatası oluştu.' });
    }
});

router.get('/logout', (req, res) => {
    req.session.destroy(() => {
        res.redirect(`${adminEndpoint}/login`);
    });
});

router.get('/', isAdmin, async (req, res) => {
    try {
        const [[stats], recentMessages] = await Promise.all([
            pool.query(adminPanel.dashboard),
            pool.query(dbQueries.contacts.getLastFive)
        ]);

        return res.render('admin/dashboard', {
            title: 'Dashboard',
            adminEndpoint,
            user: req.session.adminUser,
            stats: {
                totalArticles: Number(stats?.totalArticles || 0),
                totalViews: Number(stats?.totalViews || 0),
                unreadMessages: Number(stats?.unreadMessages || 0)
            },
            recentMessages: recentMessages || []
        });

    } catch (err) {
        console.error('Dashboard yükleme hatası:', err);
        return res.status(500).send('Sunucu hatası');
    }
});

router.get('/messages', isAdmin, async (req, res) => {
    try {
        const messages = await pool.query(dbQueries.contacts.getAll);
        await pool.query(dbQueries.contacts.markedAsRead);

        return res.render('admin/messages', {
            title: 'Gelen Mesajlar',
            adminEndpoint,
            user: req.session.adminUser,
            messages
        });
    } catch (err) {
        console.error('Mesajlar listelenirken hata:', err);
        return res.status(500).send('Sunucu hatası');
    }
});

router.post('/messages/delete/:id', isAdmin, async (req, res) => {
    try {
        await pool.query(dbQueries.contacts.delete, [req.params.id]);
        return res.json({ success: true });
    } catch (err) {
        return res.status(500).json({ success: false, error: err.message });
    }
});

router.get('/articles', isAdmin, async (req, res) => {
    try {
        const articles = await pool.query(dbQueries.articles.getAll);
        return res.render('admin/articles/index', {
            title: 'Makaleler',
            adminEndpoint,
            user: req.session.adminUser,
            articles
        });
    } catch (err) {
        console.error('Makaleler çekilirken hata:', err);
        return res.status(500).send('Sunucu hatası');
    }
});

router.get('/articles/new', isAdmin, (req, res) => {
    return res.render('admin/articles/editor', {
        title: 'Yeni Makale',
        adminEndpoint,
        user: req.session.adminUser,
        article: {}
    });
});

router.post('/articles/create', isAdmin, (req, res, next) => {
    upload.single('cover_image')(req, res, (err) => {
        if (err) {
            console.error('Dosya yükleme hatası:', err.message);
            return res.status(400).render('admin/articles/editor', {
                error: err.message,
                adminEndpoint,
                user: req.session.adminUser,
                article: req.body
            });
        }
        next();
    });
}, async (req, res) => {
    const { title, slug, excerpt, content, status, language } = req.body;
    const articleStatus = parseInt(status, 10) || 0;
    const cover_image = req.file ? `/uploads/articles/${req.file.filename}` : null;
    const finalSlug = slugify(slug || title || '', { lower: true, strict: true, locale: 'tr' });
    const readingTime = calculateReadingTime(content);
    const publishedAt = articleStatus === 1 ? new Date() : null;

    try {
        if (!title || !content) {
            throw new Error('Başlık ve içerik alanları zorunludur.');
        }

        await pool.query(dbQueries.articles.add, [
            title,
            finalSlug,
            excerpt,
            content,
            cover_image,
            req.session.adminUser?.id,
            articleStatus,
            readingTime,
            publishedAt,
            language || 'tr'
        ]);

        return res.redirect(`${adminEndpoint}/articles`);

    } catch (err) {
        console.error('Makale ekleme hatası:', err);

        if (req.file) {
            try { await fs.unlink(req.file.path); } catch (e) { }
        }

        let errorMessage = 'Makale kaydedilirken bir hata oluştu.';
        if (err.code === 'ER_DUP_ENTRY') {
            errorMessage = 'Bu başlık veya slug ile zaten kayıtlı bir makale var!';
        } else if (err.message) {
            errorMessage = err.message;
        }

        return res.status(400).render('admin/articles/editor', {
            error: errorMessage,
            adminEndpoint,
            user: req.session.adminUser,
            article: req.body
        });
    }
});

router.get('/articles/edit/:id', isAdmin, async (req, res) => {
    try {
        const rows = await pool.query(dbQueries.articles.getById, [req.params.id]);
        if (!rows || rows.length === 0) {
            return res.redirect(`${adminEndpoint}/articles`);
        }

        return res.render('admin/articles/editor', {
            title: 'Makale Düzenle',
            adminEndpoint,
            user: req.session.adminUser,
            article: rows[0]
        });
    } catch (err) {
        console.error('Makale getirme hatası:', err);
        return res.redirect(`${adminEndpoint}/articles`);
    }
});

router.post('/articles/edit/:id', isAdmin, (req, res, next) => {
    upload.single('cover_image')(req, res, (err) => {
        if (err) {
            return res.status(400).render('admin/articles/editor', {
                error: err.message,
                adminEndpoint,
                user: req.session.adminUser,
                article: { ...req.body, id: req.params.id }
            });
        }
        next();
    });
}, async (req, res) => {
    const articleId = req.params.id;
    const { title, slug, excerpt, content, status, language, existing_cover_image } = req.body;

    const articleStatus = parseInt(status, 10) || 0;
    const finalSlug = slugify(slug || title || '', { lower: true, strict: true, locale: 'tr' });
    const readingTime = calculateReadingTime(content);

    let cover_image = existing_cover_image || null;
    if (req.file) {
        cover_image = `/uploads/articles/${req.file.filename}`;
    }

    try {
        await pool.query(dbQueries.articles.update, [
            title,
            finalSlug,
            excerpt,
            content,
            cover_image,
            articleStatus,
            req.session.adminUser?.id,
            readingTime,
            language || 'tr',
            articleId
        ]);

        if (req.file && existing_cover_image) {
            const oldImagePath = path.join(__dirname, '../public', existing_cover_image);
            try { await fs.unlink(oldImagePath); } catch (e) { }
        }

        return res.redirect(`${adminEndpoint}/articles`);

    } catch (err) {
        console.error('Makale güncelleme hatası:', err);

        if (req.file) {
            try { await fs.unlink(req.file.path); } catch (e) { }
        }

        let errorMessage = 'Makale güncellenirken bir hata oluştu.';
        if (err.code === 'ER_DUP_ENTRY') {
            errorMessage = 'Bu slug veya başlık başka bir makale tarafından kullanılıyor!';
        }

        return res.status(400).render('admin/articles/editor', {
            error: errorMessage,
            adminEndpoint,
            user: req.session.adminUser,
            article: { ...req.body, id: articleId, cover_image: existing_cover_image }
        });
    }
});

router.post('/articles/delete/:id', isAdmin, async (req, res) => {
    try {
        const articleId = req.params.id;

        const rows = await pool.query(dbQueries.articles.getById, [articleId]);
        if (rows && rows.length > 0 && rows[0].cover_image) {
            const imagePath = path.join(__dirname, '../public', rows[0].cover_image);
            try { await fs.unlink(imagePath); } catch (e) { }
        }

        await pool.query(dbQueries.articles.delete, [articleId]);
        return res.json({ success: true });
    } catch (err) {
        return res.status(500).json({ success: false, error: err.message });
    }
});

module.exports = router;