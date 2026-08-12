const express = require('express');
const router = express.Router();
const { marked } = require('marked');
const { pool, dbTables } = require('../config/db');
const locales = require('../utils/locales');

router.get('/', async (req, res) => {
    try {
        const articles = await pool.query(dbTables.articles.get, [res.locals.lang, 1]);
        const socialMedias = await pool.query(dbTables.socialMedias.get);
        return res.render('blog/index', {
            title: locales[res.locals.lang].nav.blog,
            articles,
            socialMedias
        });
    } catch (err) {
        console.error(err);
        res.status(500).send('Sayfa yüklenirken hata oluştu.');
    }
});

router.get('/:slug', async (req, res) => {
    try {
        const rows = await pool.query(dbTables.articles.getBySlug, [req.params.slug, res.locals.lang, 1]);

        if (rows.length === 0) {
            return res.status(404).render('404', {
                aboutMe: {},
                socialMedias: []
            });
        }

        const article = rows[0];

        pool.query(dbTables.articles.updateHits, [article.id])
            .catch(console.error);

        article.contentHtml = marked.parse(article.content);

        return res.render('blog/detail', { article });
    } catch (err) {
        console.error(err);
        return res.status(500).render('500', {
            aboutMe: {},
            socialMedias: []
        });
    }
});

module.exports = router;