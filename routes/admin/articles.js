const express = require('express');
const router = express.Router();
const slugify = require('slugify');
const { pool, dbQueries } = require('../../config/db');
const { safeTrim } = require('../../utils/helper');

const fs = require('fs/promises');
const path = require('path');

router.get('/', async (req, res) => {
    try {
        const articles = await pool.query(dbQueries.articles.getAll);
        return res.render('admin/articles/index', {
            title: 'Makaleler',
            user: req.session.adminUser,
            articles
        });
    } catch (err) {
        console.error('Makaleler çekilirken hata:', err);
        return res.status(500).send('Sunucu hatası');
    }
});

router.get('/new', (req, res) => {
    return res.render('admin/articles/editor', {
        title: 'Yeni Makale',
        user: req.session.adminUser,
        article: {}
    });
});

router.post('/create', (req, res, next) => {
    upload.single('cover_image')(req, res, (err) => {
        if (err) {
            console.error('Dosya yükleme hatası:', err.message);
            return res.status(400).render('admin/articles/editor', {
                error: err.message,
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
    const finalSlug = slugify(slug || title || '', { lower: true, strict: true, locale: language });
    const readingTime = calculateReadingTime(content);
    const publishedAt = articleStatus === 1 ? new Date() : null;

    try {
        if (!title || !content) {
            throw new Error('Başlık ve içerik alanları zorunludur.');
        }

        await pool.query(dbQueries.articles.add, [
            safeTrim(title),
            safeTrim(finalSlug),
            safeTrim(excerpt),
            safeTrim(content),
            cover_image,
            req.session.adminUser?.id,
            articleStatus,
            readingTime,
            publishedAt,
            language || 'tr'
        ]);

        return res.redirect(`${req.adminEndpoint}/articles`);

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
            title: 'Yeni Makale',
            error: errorMessage,
            user: req.session.adminUser,
            article: req.body
        });
    }
});

router.get('/edit/:id', async (req, res) => {
    try {
        const rows = await pool.query(dbQueries.articles.getById, [req.params.id]);
        if (!rows || rows.length === 0) {
            return res.redirect(`${req.adminEndpoint}/articles`);
        }

        return res.render('admin/articles/editor', {
            title: 'Makale Düzenle',
            user: req.session.adminUser,
            article: rows[0]
        });
    } catch (err) {
        console.error('Makale getirme hatası:', err);
        return res.redirect(`${req.adminEndpoint}/articles`);
    }
});

router.post('/edit/:id', (req, res, next) => {
    upload.single('cover_image')(req, res, (err) => {
        if (err) {
            return res.status(400).render('admin/articles/editor', {
                error: err.message,
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
    const publishedAt = articleStatus === 1 ? new Date() : null;
    const finalSlug = slugify(slug || title || '', { lower: true, strict: true, locale: 'tr' });
    const readingTime = calculateReadingTime(content);

    let cover_image = existing_cover_image || null;
    if (req.file) {
        cover_image = `/uploads/articles/${req.file.filename}`;
    }

    try {
        await pool.query(dbQueries.articles.update, [
            safeTrim(title),
            safeTrim(finalSlug),
            safeTrim(excerpt),
            safeTrim(content),
            cover_image,
            articleStatus,
            req.session.adminUser?.id,
            readingTime,
            publishedAt,
            language || 'tr',
            articleId
        ]);

        if (req.file && existing_cover_image) {
            const oldImagePath = path.join(__dirname, '../public', existing_cover_image);
            try { await fs.unlink(oldImagePath); } catch (e) { }
        }

        return res.redirect(`${req.adminEndpoint}/articles`);

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
            title: 'Makale Düzenle',
            error: errorMessage,
            user: req.session.adminUser,
            article: { ...req.body, id: articleId, cover_image: existing_cover_image }
        });
    }
});

router.post('/delete/:id', async (req, res) => {
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