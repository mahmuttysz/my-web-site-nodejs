// routes/blog.js
const express = require('express');
const router = express.Router();
const { marked } = require('marked');
const { pool, dbTables } = require('../config/db');

// GET: Tüm Yayınlanmış Makaleler Listesi (/blog)
router.get('/', async (req, res) => {
    try {
        const articles = await pool.query(
            `SELECT title, slug, excerpt, cover_image, reading_time, created_at 
            FROM articles 
            WHERE status = 1 
            ORDER BY created_at DESC`
        );

        res.render('blog/index', { articles });
    } catch (err) {
        console.error(err);
        res.status(500).send('Sayfa yüklenirken hata oluştu.');
    }
});

// GET: Tekil Makale Okuma Sayfası (/blog/:slug)
router.get('/:slug', async (req, res) => {
    try {
        const rows = await pool.query('SELECT * FROM articles WHERE slug = ? AND status = 1', [req.params.slug]);

        if (rows.length === 0) {
            return res.status(404).render('404'); // Bulunamadı sayfası
        }

        const article = rows[0];

        // Okunma sayısını 1 artır (Arka planda çalışır, kullanıcıyı bekletmez)
        pool.query('UPDATE articles SET hits = hits + 1 WHERE id = ?', [article.id]).catch(console.error);

        // Markdown içeriğini sunucu tarafında (SSR) HTML'e çevir
        article.contentHtml = marked.parse(article.content);

        res.render('blog/detail', { article });
    } catch (err) {
        console.error(err);
        res.status(500).send('Sunucu hatası.');
    }
});

module.exports = router;