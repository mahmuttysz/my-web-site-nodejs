// routes/admin.js
const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const slugify = require('slugify');
const rateLimit = require('express-rate-limit');
const { pool, dbTables } = require('../config/db');
const upload = require('../config/upload');
const { isAdmin } = require('../middleware/auth');

// Brute-force koruması: 15 dakikada maks 5 hatalı giriş denemesi
const loginLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 5,
    message: 'Çok fazla hatalı giriş yapıldı. Lütfen 15 dakika sonra tekrar deneyin.'
});

// Helper: Tahmini okuma süresi hesaplama (Kelime sayısı / 200)
const calculateReadingTime = (content) => {
    const words = content.trim().split(/\s+/).length;
    return Math.ceil(words / 200) || 1;
};

router.get('/login', (req, res) => {
    if (req.session.adminUser) return res.redirect('/admin');
    res.render('admin/login', { error: null });
});

router.post('/login', loginLimiter, async (req, res) => {
    const { username, password } = req.body;

    try {
        const user = await pool.query('SELECT * FROM admin_users WHERE username = ? LIMIT 1', [username]);
        if (user.length === 0) {
            return res.render('admin/login', { error: 'Kullanıcı adı veya şifre hatalı.' });
        }

        const match = await bcrypt.compare(password, user[0].password_hash);

        if (!match) {
            return res.render('admin/login', { error: 'Kullanıcı adı veya şifre hatalı.' });
        }

        req.session.adminUser = { id: user[0].id, username: user[0].username };
        res.redirect('/admin');
    } catch (err) {
        console.error('Login Hatası:', err);
        res.render('admin/login', { error: 'Veritabanı hatası oluştu.' });
    }
});

// GET: Logout
router.get('/logout', (req, res) => {
    req.session.destroy(() => {
        res.redirect('/admin/login');
    });
});

// =========================================================================
// 📊 DASHBOARD & MESAJLAR
// =========================================================================

// GET: Dashboard (Ana Panel)
router.get('/', isAdmin, async (req, res) => {
    try {
        const statsQuery = `
      SELECT 
        (SELECT COUNT(*) FROM articles) AS totalArticles,
        (SELECT COALESCE(SUM(hits), 0) FROM articles) AS totalViews,
        (SELECT COUNT(*) FROM contacts WHERE is_read = 0) AS unreadMessages
    `;
        const [[stats], recentMessages] = await Promise.all([
            pool.query(statsQuery),
            pool.query('SELECT * FROM contacts ORDER BY created_at DESC LIMIT 5')
        ]);

        res.render('admin/dashboard', {
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
        const messages = await pool.query('SELECT * FROM contacts ORDER BY created_at DESC');
        await pool.query('UPDATE contacts SET is_read = 1 WHERE is_read = 0');

        res.render('admin/messages', {
            user: req.session.adminUser,
            messages
        });
    } catch (err) {
        console.error(err);
        res.status(500).send('Sunucu hatası');
    } finally {
        if (conn) pool.release();
    }
});

// POST: Mesaj Silme
router.post('/messages/delete/:id', isAdmin, async (req, res) => {
    try {
        await pool.query('DELETE FROM contacts WHERE id = ?', [req.params.id]);
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
        const articles = await pool.query('SELECT * FROM articles ORDER BY created_at DESC');
        res.render('admin/articles/index', {
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
        user: req.session.adminUser,
        article: {}
    });
});

// POST: Yeni Makale Kaydetme
router.post('/articles/create', isAdmin, upload.single('cover_image'), async (req, res) => {
    const { title, slug, excerpt, content, status } = req.body;
    const cover_image = req.file ? `/uploads/articles/${req.file.filename}` : null;
    const finalSlug = slugify(slug || title, { lower: true, strict: true, locale: 'tr' });
    const readingTime = calculateReadingTime(content);
    const publishedAt = status === 1 ? new Date() : null;

    try {

        await pool.query(
            `INSERT INTO articles (title, slug, excerpt, content, cover_image, created_by, status, reading_time, published_at) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [title, finalSlug, excerpt, content, cover_image, req.session.adminUser.id, status, readingTime, publishedAt]
        );
        res.redirect('/admin/articles');
    } catch (err) {
        console.error('Makale ekleme hatası:', err);
        res.status(500).send('Makale kaydedilirken hata oluştu. Slug çakışması olabilir.');
    }
});

// GET: Makale Düzenleme Formu
router.get('/articles/edit/:id', isAdmin, async (req, res) => {
    try {
        const rows = await pool.query('SELECT * FROM articles WHERE id = ?', [req.params.id]);
        if (rows.length === 0) return res.redirect('/admin/articles');

        res.render('admin/articles/editor', {
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
    const { title, slug, excerpt, content, status } = req.body;
    const finalSlug = slugify(slug || title, { lower: true, strict: true, locale: 'tr' });
    const readingTime = calculateReadingTime(content);

    try {

        let query = `UPDATE articles SET title=?, slug=?, excerpt=?, content=?, status=?, updated_by=?, reading_time=?`;
        let params = [title, finalSlug, excerpt, content, status, req.session.adminUser.id, readingTime];

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
        res.redirect('/admin/articles');
    } catch (err) {
        console.error('Makale güncelleme hatası:', err);
        res.status(500).send('Güncelleme sırasında hata oluştu.');
    }
});

// POST: Makale Silme
router.post('/articles/delete/:id', isAdmin, async (req, res) => {
    try {
        await pool.query('DELETE FROM articles WHERE id = ?', [req.params.id]);
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

module.exports = router;