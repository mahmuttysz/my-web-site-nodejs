// src/routes/admin/projects.ts
import express, { Request, Response } from 'express';
import { pool, dbQueries } from '../../config/db';
import { safeTrim } from '../../utils/helper';
import { env } from '../../config/env';

const router = express.Router();

// Projeleri Listeleme
router.get('/', async (req: Request, res: Response) => {
    try {
        const projects = await pool.query<any[]>(dbQueries.projects.getAll);

        projects?.forEach((f: any) => {
            try {
                f.tags = JSON.parse(f.tags || '[]');
            } catch {
                f.tags = [];
            }
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

// Yeni Proje Ekranı
router.get('/new', (req: Request, res: Response) => {
    return res.render('admin/projects/editor', {
        title: 'Yeni Proje',
        user: req.session.adminUser,
        project: {}
    });
});

// Yeni Proje Kaydetme
router.post('/create', async (req: Request, res: Response) => {
    const { title, link_text, link_url, description, tags, turn, language, status } = req.body;
    const projectStatus = parseInt(status, 10) || 0;
    const turnCnv = parseInt(turn, 10) || 11;

    const adminEndpoint = req.adminEndpoint || env.ADMIN_PANEL_ENDPOINT || '/admin';

    try {
        if (!title) {
            throw new Error('Başlık alanı zorunludur.');
        }

        // Etiketlerin JSON formatına dönüştürülmesi
        let tagEdit = '[]';
        if (typeof tags === 'string' && tags.trim().length > 0) {
            const tagSplit = tags.split(',').map((t) => t.trim()).filter(Boolean);
            tagEdit = JSON.stringify(tagSplit);
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

        return res.redirect(`${adminEndpoint}/projects`);
    } catch (err: any) {
        console.error('Proje ekleme hatası:', err);

        let errorMessage = 'Proje kaydedilirken bir hata oluştu.';
        if (err?.message) {
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

// Proje Düzenleme Ekranı
router.get('/edit/:id', async (req: Request, res: Response) => {
    const adminEndpoint = req.adminEndpoint || env.ADMIN_PANEL_ENDPOINT || '/admin';

    try {
        const rows = await pool.query<any[]>(dbQueries.projects.getById, [req.params.id]);
        if (!rows || rows.length === 0) {
            return res.redirect(`${adminEndpoint}/projects`);
        }

        const project = rows[0];
        let tagsTxt = '';

        try {
            const tagParse = JSON.parse(project.tags || '[]');
            if (Array.isArray(tagParse)) {
                tagsTxt = tagParse.join(', ');
            }
        } catch {
            tagsTxt = '';
        }

        project.tagsTxt = tagsTxt;

        return res.render('admin/projects/editor', {
            title: 'Proje Düzenle',
            user: req.session.adminUser,
            project
        });
    } catch (err) {
        console.error('Proje getirme hatası:', err);
        return res.redirect(`${adminEndpoint}/projects`);
    }
});

// Proje Güncelleme
router.post('/edit/:id', async (req: Request, res: Response) => {
    const projectId = req.params.id;
    const { title, link_text, link_url, description, tags, turn, status, language } = req.body;
    const projectStatus = parseInt(status, 10) || 0;
    const turnCnv = parseInt(turn, 10) || 11;

    const adminEndpoint = req.adminEndpoint || env.ADMIN_PANEL_ENDPOINT || '/admin';

    let tagEdit = '[]';
    if (typeof tags === 'string' && tags.trim().length > 0) {
        const tagSplit = tags.split(',').map((t) => t.trim()).filter(Boolean);
        tagEdit = JSON.stringify(tagSplit);
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

        return res.redirect(`${adminEndpoint}/projects`);
    } catch (err) {
        console.error('Proje güncelleme hatası:', err);
        const errorMessage = 'Proje güncellenirken bir hata oluştu.';

        return res.status(400).render('admin/projects/editor', {
            title: 'Proje Düzenle',
            error: errorMessage,
            user: req.session.adminUser,
            project: { ...req.body, id: projectId }
        });
    }
});

// Proje Silme
router.post('/delete/:id', async (req: Request, res: Response) => {
    try {
        const projectId = req.params.id;

        await pool.query(dbQueries.projects.delete, [projectId]);
        return res.json({ success: true });
    } catch (err: any) {
        return res.status(500).json({
            success: false,
            error: err?.message || 'Bir hata oluştu.'
        });
    }
});

export default router;