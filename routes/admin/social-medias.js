const express = require('express');
const router = express.Router();
const { pool, dbQueries } = require('../../config/db');
const { safeTrim } = require('../../utils/helper');

router.get('/', async (req, res) => {
    try {
        const socialMedias = await pool.query(dbQueries.socialMedias.getAll);

        return res.render('admin/social-medias/index', {
            title: 'Sosyal Medyalar',
            user: req.session.adminUser,
            socialMedias
        });
    } catch (err) {
        console.error('Sosyal medyalar listelenirken hata:', err);
        return res.status(500).send('Sunucu hatası');
    }
});

router.get('/new', (req, res) => {
    return res.render('admin/social-medias/editor', {
        title: 'Yeni Sosyal Medya',
        user: req.session.adminUser,
        socialMedia: {}
    });
});

router.post('/create', async (req, res) => {
    const { title, username, url, icon, turn, status } = req.body;
    const sMediaStatus = parseInt(status, 10) || 0;
    const turnCnv = parseInt(turn, 10) || 11;

    try {
        if (!title) {
            throw new Error('Başlık alanı zorunludur.');
        }

        await pool.query(dbQueries.socialMedias.add, [
            safeTrim(title),
            safeTrim(username),
            safeTrim(url),
            safeTrim(icon),
            turnCnv,
            req.session.adminUser?.id,
            sMediaStatus
        ]);

        return res.redirect(`${req.adminEndpoint}/social-medias`);

    } catch (err) {
        console.error('Sosyal medya ekleme hatası:', err);

        let errorMessage = 'Sosyal medya kaydedilirken bir hata oluştu.';
        if (err.message) {
            errorMessage = err.message;
        }

        return res.status(400).render('admin/social-medias/editor', {
            title: 'Yeni Sosyal Medya',
            error: errorMessage,
            user: req.session.adminUser,
            project: req.body
        });
    }
});

router.get('/edit/:id', async (req, res) => {
    try {
        const rows = await pool.query(dbQueries.socialMedias.getById, [req.params.id]);
        if (!rows || rows.length === 0) {
            return res.redirect(`${req.adminEndpoint}/social-medias`);
        }
        return res.render('admin/social-medias/editor', {
            title: 'Sosyal Medya Düzenle',
            user: req.session.adminUser,
            socialMedia: rows[0]
        });
    } catch (err) {
        console.error('Proje getirme hatası:', err);
        return res.redirect(`${req.adminEndpoint}/social-medias`);
    }
});

router.post('/edit/:id', async (req, res) => {
    const sMediaId = req.params.id;
    const { title, username, url, icon, turn, status } = req.body;
    const sMediaStatus = parseInt(status, 10) || 0;
    const turnCnv = parseInt(turn, 10) || 11;

    try {
        await pool.query(dbQueries.socialMedias.update, [
            safeTrim(title),
            safeTrim(username),
            safeTrim(url),
            safeTrim(icon),
            turnCnv,
            req.session.adminUser?.id,
            sMediaStatus,
            sMediaId
        ]);

        return res.redirect(`${req.adminEndpoint}/social-medias`);

    } catch (err) {
        console.error('Sosyal medya güncelleme hatası:', err);
        let errorMessage = 'Sosyal medya güncellenirken bir hata oluştu.';

        return res.status(400).render('admin/social-medias/editor', {
            title: 'Sosyal Medya Düzenle',
            error: errorMessage,
            user: req.session.adminUser,
            socialMedia: { ...req.body, id: sMediaId }
        });
    }
});

router.post('/delete/:id', async (req, res) => {
    try {
        const sMediaId = req.params.id;

        await pool.query(dbQueries.socialMedias.delete, [sMediaId]);
        return res.json({ success: true });
    } catch (err) {
        return res.status(500).json({ success: false, error: err.message });
    }
});

module.exports = router;