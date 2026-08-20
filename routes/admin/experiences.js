const express = require('express');
const router = express.Router();
const { pool, dbQueries } = require('../../config/db');
const { safeTrim } = require('../../utils/helper');


router.get('/', async (req, res) => {
    try {
        const experiences = await pool.query(dbQueries.experiences.getAll);

        return res.render('admin/experiences/index', {
            title: 'Projelerim',
            user: req.session.adminUser,
            experiences
        });
    } catch (err) {
        console.error('Deneyimler listelenirken hata:', err);
        return res.status(500).send('Sunucu hatası');
    }
});

router.get('/new', (req, res) => {
    return res.render('admin/experiences/editor', {
        title: 'Yeni Deneyim',
        user: req.session.adminUser,
        experience: { begin_date: new Date().toISOString().split('T')[0] }
    });
});

router.post('/create', async (req, res) => {
    const { company_name, title, description, begin_date, isResume, end_date, language, status } = req.body;
    const experienceStatus = parseInt(status, 10) || 0;
    const endDate = isResume === 'true' ? null : end_date;

    try {
        if (!title) {
            throw new Error('Başlık alanı zorunludur.');
        }

        await pool.query(dbQueries.experiences.add, [
            safeTrim(company_name),
            safeTrim(title),
            safeTrim(description),
            begin_date,
            endDate,
            language || 'tr',
            req.session.adminUser?.id,
            experienceStatus
        ]);

        return res.redirect(`${req.adminEndpoint}/experiences`);

    } catch (err) {
        console.error('Deneyim ekleme hatası:', err);

        let errorMessage = 'Deneyim kaydedilirken bir hata oluştu.';
        if (err.message) {
            errorMessage = err.message;
        }

        return res.status(400).render('admin/experiences/editor', {
            title: 'Yeni Deneyim',
            error: errorMessage,
            user: req.session.adminUser,
            project: req.body
        });
    }
});

router.get('/edit/:id', async (req, res) => {
    try {
        const rows = await pool.query(dbQueries.experiences.getById, [req.params.id]);
        if (!rows || rows.length === 0) {
            return res.redirect(`${req.adminEndpoint}/experiences`);
        }

        return res.render('admin/experiences/editor', {
            title: 'Deneyim Düzenle',
            user: req.session.adminUser,
            experience: rows[0]
        });
    } catch (err) {
        console.error('Proje getirme hatası:', err);
        return res.redirect(`${req.adminEndpoint}/projects`);
    }
});

router.post('/edit/:id', async (req, res) => {
    const experienceId = req.params.id;
    const { company_name, title, description, begin_date, isResume, end_date, language, status } = req.body;
    const experienceStatus = parseInt(status, 10) || 0;
    const endDate = isResume === 'true' ? null : end_date;

    try {
        await pool.query(dbQueries.experiences.update, [
            safeTrim(company_name),
            safeTrim(title),
            safeTrim(description),
            begin_date,
            endDate,
            language || 'tr',
            req.session.adminUser?.id,
            experienceStatus,
            experienceId
        ]);

        return res.redirect(`${req.adminEndpoint}/experiences`);

    } catch (err) {
        console.error('Deneyim güncelleme hatası:', err);
        let errorMessage = 'Deneyim güncellenirken bir hata oluştu.';

        return res.status(400).render('admin/experiences/editor', {
            title: 'Deneyim Düzenle',
            error: errorMessage,
            user: req.session.adminUser,
            experience: { ...req.body, id: experienceId }
        });
    }
});

router.post('/delete/:id', async (req, res) => {
    try {
        const experienceId = req.params.id;

        await pool.query(dbQueries.experiences.delete, [experienceId]);
        return res.json({ success: true });
    } catch (err) {
        return res.status(500).json({ success: false, error: err.message });
    }
});

module.exports = router;