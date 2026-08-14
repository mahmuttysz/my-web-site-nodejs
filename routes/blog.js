const express = require('express');
const router = express.Router();
const { marked } = require('marked');
const { pool, dbQueries } = require('../config/db');
const { getIndexPageData } = require('../utils/helper');

router.get('/', async (req, res, next) => {
    try {
        const lang = res.locals.lang || 'tr';

        const [articles, socialMedias] = await Promise.all([
            pool.query(dbQueries.articles.get, [lang]),
            pool.query(dbQueries.socialMedias.get)
        ]);

        return res.render('blog/index', {
            title: res.locals.t?.nav?.blog || 'Blog',
            articles: articles || [],
            socialMedias: socialMedias || []
        });
    } catch (err) {
        console.error('❌ Blog liste yükleme hatası:', err);
        next(err);
    }
});

router.get('/:slug', async (req, res, next) => {
    try {
        const lang = res.locals.lang || 'tr';
        const { slug } = req.params;

        const rows = await pool.query(dbQueries.articles.getBySlug, [slug, lang]);

        if (!rows || rows.length === 0) {
            const pageData = await getIndexPageData(lang);
            return res.status(404).render('404', pageData);
        }

        const article = rows[0];

        pool.query(dbQueries.articles.updateHits, [article.id]).catch((err) => {
            console.error('Hit güncellenirken hata:', err.message);
        });

        article.contentHtml = marked.parse(article.content || '');
        let socialMedias = await pool.query(dbQueries.socialMedias.get);
        return res.render('blog/detail', {
            title: article.title,
            article,
            socialMedias: socialMedias || []
        });

    } catch (err) {
        console.error('❌ Blog detay yükleme hatası:', err);
        next(err);
    }
});

module.exports = router;