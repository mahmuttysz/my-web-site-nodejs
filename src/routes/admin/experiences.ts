import express, { Request, Response } from 'express';
import { env } from '../../config/env';
import experiencesController from '../../controllers/admin/experiencesController';

const router = express.Router();

// Deneyimleri Listeleme
router.get('/', async (req: Request, res: Response) => {
    try {
        const experiences = await experiencesController.getExperiences();

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
    const experienceStatus = (parseInt(status, 10) || 0) === 1;

    // HTML Form checkbox durumları ('on', 'true', true) kontrolü
    const isCurrentlyWorking = isResume === 'true' || isResume === 'on' || isResume === true;
    const endDate = isCurrentlyWorking ? null : (end_date || null);

    const adminEndpoint = req.adminEndpoint || env.ADMIN_PANEL_ENDPOINT || '/admin';
    const userId = Number(req.session.adminUser?.id || 0);

    try {
        if (!title || !company_name || !begin_date) {
            throw new Error('Firma adı, başlık ve başlangıç tarihi alanları zorunludur.');
        }

        await experiencesController.addExperience(
            company_name,
            title,
            description,
            begin_date,
            endDate,
            language,
            experienceStatus,
            userId
        );

        return res.redirect(`${adminEndpoint}/experiences`);
    } catch (err: any) {
        console.error('Deneyim ekleme hatası:', err);

        const errorMessage = err?.message || 'Deneyim kaydedilirken bir hata oluştu.';

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
    const adminEndpoint = req.adminEndpoint || env.ADMIN_PANEL_ENDPOINT || '/admin';

    try {
        const experienceId = Number(req.params?.id || '0');
        const experience = await experiencesController.getExperience(experienceId);

        if (!experience) {
            return res.redirect(`${adminEndpoint}/experiences`);
        }

        return res.render('admin/experiences/editor', {
            title: 'Deneyim Düzenle',
            user: req.session.adminUser,
            experience
        });
    } catch (err) {
        console.error('Deneyim getirme hatası:', err);
        return res.redirect(`${adminEndpoint}/experiences`);
    }
});

// Deneyim Güncelleme
router.post('/edit/:id', async (req: Request, res: Response) => {
    const experienceId = Number(req.params?.id || '0');
    const { company_name, title, description, begin_date, isResume, end_date, language, status } = req.body;
    const experienceStatus = (parseInt(status, 10) || 0) === 1;

    const isCurrentlyWorking = isResume === 'true' || isResume === 'on' || isResume === true;
    const endDate = isCurrentlyWorking ? null : (end_date || null);

    const adminEndpoint = req.adminEndpoint || env.ADMIN_PANEL_ENDPOINT || '/admin';
    const userId = Number(req.session.adminUser?.id || 0);

    try {
        if (!title || !company_name || !begin_date) {
            throw new Error('Firma adı, başlık ve başlangıç tarihi alanları zorunludur.');
        }

        await experiencesController.editExperience(
            experienceId,
            company_name,
            title,
            description,
            begin_date,
            endDate,
            language,
            experienceStatus,
            userId
        );

        return res.redirect(`${adminEndpoint}/experiences`);
    } catch (err: any) {
        console.error('Deneyim güncelleme hatası:', err);
        const errorMessage = err?.message || 'Deneyim güncellenirken bir hata oluştu.';

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
        const experienceId = Number(req.params?.id || '0');
        await experiencesController.deleteExperience(experienceId);

        return res.json({ success: true });
    } catch (err: any) {
        return res.status(500).json({
            success: false,
            error: err?.message || 'Deneyim silinirken bir hata oluştu.'
        });
    }
});

export default router;