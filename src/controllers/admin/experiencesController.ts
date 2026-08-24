// src/routes/admin/experiences.ts
import express, { Request, Response } from 'express';
import { pool, dbQueries } from '../../config/db';
import { safeTrim } from '../../utils/helper';
import { env } from '../../config/env';

const router = express.Router();

// Deneyimleri Listeleme
router.get('/', async (req: Request, res: Response) => {
    try {
        const experiences = await pool.query(dbQueries.experiences.getAll);

        return res.render('admin/experiences/index', {
            title: 'Deneyimlerim',
            user: req.session.adminUser,
            experiences
        });
    } catch (err) {
        console.error('Deneyimler listelenirken hata:', err);
        return res.status(500).send('Sunucu hatası');
    }
});

// Yeni Deneyim Ekranı
router.get('/new', (req: Request, res: Response) => {
    return res.render('admin/experiences/editor', {
        title: 'Yeni Deneyim',
        user: req.session.adminUser,
        experience: { begin_date: new Date().toISOString().split('T')[0] }
    });
});

// Yeni Deneyim Kaydetme
router.post('/create', async (req: Request, res: Response) => {
    const { company_name, title, description, begin_date, isResume, end_date, language, status } = req.body;
    const experienceStatus = parseInt(status, 10) || 0;
    const endDate = isResume === 'true' ? null : end_date;

    const adminEndpoint = (req as any).adminEndpoint || env.ADMIN_PANEL_ENDPOINT || '/admin';

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

        return res.redirect(`${adminEndpoint}/experiences`);
    } catch (err: any) {
        console.error('Deneyim ekleme hatası:', err);

        let errorMessage = 'Deneyim kaydedilirken bir hata oluştu.';
        if (err.message) {
            errorMessage = err.message;
        }

        return res.status(400).render('admin/experiences/editor', {
            title: 'Yeni Deneyim',
            error: errorMessage,
            user: req.session.adminUser,
            experience: req.body
        });
    }
});

// Deneyim Düzenleme Ekranı
router.get('/edit/:id', async (req: Request, res: Response) => {
    const adminEndpoint = (req as any).adminEndpoint || env.ADMIN_PANEL_ENDPOINT || '/admin';

    try {
        const rows = await pool.query(dbQueries.experiences.getById, [req.params.id]);
        if (!rows || rows.length === 0) {
            return res.redirect(`${adminEndpoint}/experiences`);
        }

        return res.render('admin/experiences/editor', {
            title: 'Deneyim Düzenle',
            user: req.session.adminUser,
            experience: rows[0]
        });
    } catch (err) {
        console.error('Deneyim getirme hatası:', err);
        return res.redirect(`${adminEndpoint}/experiences`);
    }
});

// Deneyim Güncelleme
router.post('/edit/:id', async (req: Request, res: Response) => {
    const experienceId = req.params.id;
    const { company_name, title, description, begin_date, isResume, end_date, language, status } = req.body;
    const experienceStatus = parseInt(status, 10) || 0;
    const endDate = isResume === 'true' ? null : end_date;

    const adminEndpoint = (req as any).adminEndpoint || env.ADMIN_PANEL_ENDPOINT || '/admin';

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

        return res.redirect(`${adminEndpoint}/experiences`);
    } catch (err) {
        console.error('Deneyim güncelleme hatası:', err);
        const errorMessage = 'Deneyim güncellenirken bir hata oluştu.';

        return res.status(400).render('admin/experiences/editor', {
            title: 'Deneyim Düzenle',
            error: errorMessage,
            user: req.session.adminUser,
            experience: { ...req.body, id: experienceId }
        });
    }
});

// Deneyim Silme
router.post('/delete/:id', async (req: Request, res: Response) => {
    try {
        const experienceId = req.params.id;

        await pool.query(dbQueries.experiences.delete, [experienceId]);
        return res.json({ success: true });
    } catch (err: any) {
        return res.status(500).json({ success: false, error: err.message });
    }
});

export default router;