import express, { Request, Response } from 'express';
import { env } from '../../config/env';
import projectsController from '../../controllers/admin/projectsController';

const router = express.Router();

// Projeleri Listeleme
router.get('/', async (req: Request, res: Response) => {
    try {
        const projects = await projectsController.getProjects();

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
    const userId = Number(req.session.adminUser?.id || 0);
    const projectStatus = (parseInt(status, 10) || 0) === 1;
    const turnCnv = parseInt(turn, 10) || 11;
    const adminEndpoint = req.adminEndpoint || env.ADMIN_PANEL_ENDPOINT || '/admin';

    try {
        if (!title) {
            throw new Error('Başlık alanı zorunludur.');
        }

        await projectsController.addProject(
            title,
            link_text,
            link_url,
            description,
            tags,
            turnCnv,
            projectStatus,
            language,
            userId
        );

        return res.redirect(`${adminEndpoint}/projects`);
    } catch (err: any) {
        console.error('Proje ekleme hatası:', err);

        const errorMessage = err?.message || 'Proje kaydedilirken bir hata oluştu.';

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
    const projectId = Number(req.params?.id || 0);

    try {
        const project = await projectsController.getProject(projectId);

        if (!project) {
            return res.redirect(`${adminEndpoint}/projects`);
        }

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
    const userId = Number(req.session.adminUser?.id || 0);
    const projectId = Number(req.params?.id || 0);
    const { title, link_text, link_url, description, tags, turn, status, language } = req.body;
    const adminEndpoint = req.adminEndpoint || env.ADMIN_PANEL_ENDPOINT || '/admin';
    const projectStatus = (parseInt(status, 10) || 0) === 1;
    const turnCnv = parseInt(turn, 10) || 11;

    try {
        if (!title) {
            throw new Error('Başlık alanı zorunludur.');
        }

        await projectsController.editProject(
            projectId,
            title,
            link_text,
            link_url,
            description,
            tags,
            turnCnv,
            projectStatus,
            language,
            userId
        );

        return res.redirect(`${adminEndpoint}/projects`);
    } catch (err: any) {
        console.error('Proje güncelleme hatası:', err);
        const errorMessage = err?.message || 'Proje güncellenirken bir hata oluştu.';

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
        const projectId = Number(req.params?.id || 0);
        await projectsController.deleteProject(projectId);

        return res.json({ success: true });
    } catch (err: any) {
        return res.status(500).json({
            success: false,
            error: err?.message || 'Bir hata oluştu.'
        });
    }
});

export default router;