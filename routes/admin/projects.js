const express = require('express');
const router = express.Router();
const { pool, dbQueries } = require('../../config/db');
const { safeTrim } = require('../../utils/helper');

router.get('/', async (req, res) => {
    try {
        let projects = await pool.query(dbQueries.projects.getAll);

        projects?.forEach((f, i) => {
            let tags = JSON.parse(f.tags);

            f.tags = tags;
        });

        return res.render('admin/projects/index', {
            title: 'Projelerim',
            user: req.session.adminUser,
            projects
        });
    } catch (err) {
        console.error('Projeler listelenirken hata:', err);
        return res.status(500).send('Sunucu hatası');
    }
});

router.get('/new', (req, res) => {
    return res.render('admin/projects/editor', {
        title: 'Yeni Proje',
        user: req.session.adminUser,
        project: {}
    });
});

router.post('/create', async (req, res) => {
    const { title, link_text, link_url, description, tags, turn, language, status } = req.body;
    const projectStatus = parseInt(status, 10) || 0;
    const turnCnv = parseInt(turn, 10) || 11;

    try {
        if (!title) {
            throw new Error('Başlık alanı zorunludur.');
        }
        let tagEdit = "[";
        let tagSplit = tags.trim().split(',');
        if (tagSplit && tagSplit.length > 1) {
            tagSplit.forEach((tag, i) => {
                if (tagSplit.length - 1 !== i)
                    tagEdit += "\"" + tag.trim() + "\", ";
                else
                    tagEdit += "\"" + tag.trim() + "\"";
            });
            tagEdit += "]";
        } else {
            tagEdit = "[]";
        }

        await pool.query(dbQueries.projects.add, [
            safeTrim(title),
            safeTrim(link_text),
            safeTrim(link_url),
            safeTrim(description),
            tagEdit,
            turnCnv,
            language || 'tr',
            req.session.adminUser?.id,
            projectStatus
        ]);

        return res.redirect(`${req.adminEndpoint}/projects`);

    } catch (err) {
        console.error('Proje ekleme hatası:', err);

        let errorMessage = 'Proje kaydedilirken bir hata oluştu.';
        if (err.message) {
            errorMessage = err.message;
        }

        return res.status(400).render('admin/projects/editor', {
            title: 'Yeni Proje',
            error: errorMessage,
            user: req.session.adminUser,
            project: req.body
        });
    }
});

router.get('/edit/:id', async (req, res) => {
    try {
        const rows = await pool.query(dbQueries.projects.getById, [req.params.id]);
        if (!rows || rows.length === 0) {
            return res.redirect(`${req.adminEndpoint}/projects`);
        }
        let project = rows[0];
        let tagsTxt = "";
        let tagParse = JSON.parse(project.tags || "[]");
        tagParse.forEach((tag, i) => {
            if (tagParse.length - 1 !== i)
                tagsTxt += tag + ", ";
            else
                tagsTxt += tag;
        });
        project.tagsTxt = tagsTxt;
        return res.render('admin/projects/editor', {
            title: 'Proje Düzenle',
            user: req.session.adminUser,
            project
        });
    } catch (err) {
        console.error('Proje getirme hatası:', err);
        return res.redirect(`${req.adminEndpoint}/projects`);
    }
});

router.post('/edit/:id', async (req, res) => {
    const projectId = req.params.id;
    const { title, link_text, link_url, description, tags, turn, status, language } = req.body;
    const projectStatus = parseInt(status, 10) || 0;
    const turnCnv = parseInt(turn, 10) || 11;

    let tagEdit = "[";
    let tagSplit = tags.trim().split(',');
    if (tagSplit && tagSplit.length > 1) {
        tagSplit.forEach((tag, i) => {
            if (tagSplit.length - 1 !== i)
                tagEdit += "\"" + tag.trim() + "\", ";
            else
                tagEdit += "\"" + tag.trim() + "\"";
        });
        tagEdit += "]";
    } else {
        tagEdit = "[]";
    }

    try {
        await pool.query(dbQueries.projects.update, [
            safeTrim(title),
            safeTrim(link_text),
            safeTrim(link_url),
            safeTrim(description),
            tagEdit,
            turnCnv,
            language || 'tr',
            req.session.adminUser?.id,
            projectStatus,
            projectId
        ]);

        return res.redirect(`${req.adminEndpoint}/projects`);

    } catch (err) {
        console.error('Proje güncelleme hatası:', err);
        let errorMessage = 'Proje güncellenirken bir hata oluştu.';

        return res.status(400).render('admin/projects/editor', {
            title: 'Proje Düzenle',
            error: errorMessage,
            user: req.session.adminUser,
            project: { ...req.body, id: projectId }
        });
    }
});

router.post('/delete/:id', async (req, res) => {
    try {
        const projectId = req.params.id;

        await pool.query(dbQueries.projects.delete, [projectId]);
        return res.json({ success: true });
    } catch (err) {
        return res.status(500).json({ success: false, error: err.message });
    }
});

module.exports = router;