const express = require('express');
const router = express.Router();
const { pool, dbQueries } = require('../../config/db');
const { safeTrim } = require('../../utils/helper');

router.get('/', async (req, res) => {
    try {
        const aboutMe = await pool.query(dbQueries.aboutMe.getAll);

        return res.render('admin/about-me', {
            title: 'Hakkımda',
            user: req.session.adminUser,
            aboutMe
        });
    } catch (err) {
        console.error('Hakkımda sayfası hata:', err);
        return res.status(500).send('Sunucu hatası');
    }
});

router.post('/:lang', async (req, res) => {
    try {
        let lang = req.params.lang;
        const { title, meta_description, description } = req.body;
        await pool.query(dbQueries.aboutMe.update, [
            safeTrim(title),
            safeTrim(description),
            safeTrim(meta_description),
            req.session.adminUser?.id,
            lang
        ]);
        return res.redirect(`${req.adminEndpoint}/about-me`);
    } catch (err) {
        console.error('Hakkımda sayfası hata:', err);
        return res.status(500).send('Sunucu hatası');
    }
});

module.exports = router;