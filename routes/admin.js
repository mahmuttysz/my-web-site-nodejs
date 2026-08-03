const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const slugify = require('slugify');
const { env } = require('../config/env');
const { pool, dbTables, adminPanel } = require('../config/db');
const upload = require('../config/upload');
const { rateLimiter } = require('../config/rateLimit');
const { isAdmin } = require('../middleware/auth');

const adminEndpoint = env.ADMIN_PANEL_ENDPOINT || '/admin';

// Helper: Tahmini okuma süresi hesaplama (Kelime sayısı / 200)
const calculateReadingTime = (content) => {
    const words = content.trim().split(/\s+/).length;
    return Math.ceil(words / 200) || 1;
};

router.get('/login', (req, res) => {
    if (req.session.adminUser) return res.redirect(adminEndpoint);
    res.render('admin/login', { adminEndpoint, error: null });
});

router.post('/login', rateLimiter(), async (req, res) => {
    const { username, password } = req.body;

    try {
        const clientIp = req.headers['cf-connecting-ip'] ||
            req.headers['x-forwarded-for']?.split(',')[0] ||
            req.ip;
        const user = await pool.query(dbTables.adminUsers.getByUsername, [username]);
        if (user.length === 0) {
            return res.render('admin/login', { adminEndpoint, error: 'Kullanıcı adı veya şifre hatalı.' });
        }
        else {
            const match = await bcrypt.compare(password, user[0].password_hash);

            if (!match) {
                await pool.query('UPDATE admin_users SET last_wrong_try = ?, wrong_try = wrong_try + 1, ip = ? WHERE id = ?', [new Date(), clientIp, user[0].id]);
                return res.render('admin/login', { adminEndpoint, error: 'Kullanıcı adı veya şifre hatalı.' });
            }
            else {
                req.session.adminUser = {
                    id: user[0].id,
                    username: user[0].username
                };
                await pool.query(dbTables.adminUsers.successLoginUpdate, [new Date(), clientIp, user[0].id]);
                res.redirect(adminEndpoint);
            }
        }

    } catch (err) {
        console.error('Login Hatası:', err);
        res.render('admin/login', { adminEndpoint, error: 'Veritabanı hatası oluştu.' });
    }
});

// GET: Logout
router.get('/logout', (req, res) => {
    req.session.destroy(() => {
        res.redirect(`${adminEndpoint}/login`);
    });
});

// =========================================================================
// 📊 DASHBOARD & MESAJLAR
// =========================================================================

// GET: Dashboard (Ana Panel)
router.get('/', isAdmin, async (req, res) => {
    try {
        const [[stats], recentMessages] = await Promise.all([
            pool.query(adminPanel.dashboard),
            pool.query(dbTables.contacts.getLastFive) // Son 5 mesajı al
        ]);

        res.render('admin/dashboard', {
            title: 'Dashboard',
            adminEndpoint,
            user: req.session.adminUser,
            stats: {
                totalArticles: Number(stats.totalArticles),
                totalViews: Number(stats.totalViews),
                unreadMessages: Number(stats.unreadMessages)
            },
            recentMessages
        });

    } catch (err) {
        console.error('Dashboard yükleme hatası:', err);
        res.status(500).send('Sunucu hatası');
    }
});

// GET: Gelen Mesajlar Kutusu
router.get('/messages', isAdmin, async (req, res) => {
    try {
        const messages = await pool.query(dbTables.contacts.getAll);
        await pool.query(dbTables.contacts.markedAsRead);

        res.render('admin/messages', {
            title: 'Gelen Mesajlar',
            adminEndpoint,
            user: req.session.adminUser,
            messages
        });
    } catch (err) {
        console.error(err);
        res.status(500).send('Sunucu hatası');
    }
});

// POST: Mesaj Silme
router.post('/messages/delete/:id', isAdmin, async (req, res) => {
    try {
        await pool.query(dbTables.contacts.delete, [req.params.id]);
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

// =========================================================================
// 📝 MAKALELER (BLOG) CRUD
// =========================================================================

// GET: Makale Listesi
router.get('/articles', isAdmin, async (req, res) => {
    try {
        const articles = await pool.query(dbTables.articles.getAll);
        res.render('admin/articles/index', {
            title: 'Makaleler',
            adminEndpoint,
            user: req.session.adminUser,
            articles
        });
    } catch (err) {
        console.error(err);
        res.status(500).send('Sunucu hatası');
    }
});

// GET: Yeni Makale Ekleme Formu
router.get('/articles/new', isAdmin, (req, res) => {
    res.render('admin/articles/editor', {
        title: 'Yeni Makale',
        adminEndpoint,
        user: req.session.adminUser,
        article: {}
    });
});

// POST: Yeni Makale Kaydetme
router.post('/articles/create', isAdmin, upload.single('cover_image'), async (req, res) => {
    const { title, slug, excerpt, content, status, language } = req.body;
    const cover_image = req.file ? `/uploads/articles/${req.file.filename}` : null;
    const finalSlug = slugify(slug || title, { lower: true, strict: true, locale: 'tr' });
    const readingTime = calculateReadingTime(content);
    const publishedAt = status === 1 ? new Date() : null;

    try {

        await pool.query(dbTables.articles.add,
            [title, finalSlug, excerpt, content, cover_image, req.session.adminUser.id, status, readingTime, publishedAt, language]
        );
        res.redirect(`${adminEndpoint}/articles`);
    } catch (err) {
        console.error('Makale ekleme hatası:', err);
        res.status(500).send('Makale kaydedilirken hata oluştu. Slug çakışması olabilir.');
    }
});

// GET: Makale Düzenleme Formu
router.get('/articles/edit/:id', isAdmin, async (req, res) => {
    try {
        const rows = await pool.query(dbTables.articles.getById, [req.params.id]);
        if (rows.length === 0) return res.redirect('/admin/articles');

        res.render('admin/articles/editor', {
            title: 'Makale Düzenle',
            adminEndpoint,
            user: req.session.adminUser,
            article: rows[0]
        });
    } catch (err) {
        console.error(err);
        res.status(500).send('Sunucu hatası');
    }
});

// POST: Makale Güncelleme
router.post('/articles/update/:id', isAdmin, upload.single('cover_image'), async (req, res) => {
    const { title, slug, excerpt, content, status, language } = req.body;
    const finalSlug = slugify(slug || title, { lower: true, strict: true, locale: 'tr' });
    const readingTime = calculateReadingTime(content);

    try {

        let query = `UPDATE articles SET title=?, slug=?, excerpt=?, content=?, status=?, updated_by=?, reading_time=?, language=?`;
        let params = [title, finalSlug, excerpt, content, status, req.session.adminUser.id, readingTime, language];

        if (req.file) {
            query += `, cover_image=?`;
            params.push(`/uploads/articles/${req.file.filename}`);
        }
        if (Number(status) === 1) {
            query += `, published_at=?`;
            params.push(new Date());
        }

        query += ` WHERE id=?`;
        params.push(req.params.id);

        await pool.query(query, params);
        res.redirect(`${adminEndpoint}/articles`);
    } catch (err) {
        console.error('Makale güncelleme hatası:', err);
        res.status(500).send('Güncelleme sırasında hata oluştu.');
    }
});

// POST: Makale Silme
router.post('/articles/delete/:id', isAdmin, async (req, res) => {
    try {
        await pool.query(dbTables.articles.delete, [req.params.id]);
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

module.exports = router;