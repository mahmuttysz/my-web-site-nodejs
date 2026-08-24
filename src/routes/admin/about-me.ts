// src/routes/admin/about-me.ts
import express, { Request, Response } from 'express';
import { env } from '../../config/env';
import aboutMeController from '../../controllers/admin/aboutMeController';

const router = express.Router();

router.get('/', async (req: Request, res: Response) => {
    try {
        const aboutMe = await aboutMeController.getAboutMe();

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

router.post('/:lang', async (req: Request, res: Response) => {
    try {
        const { lang } = req.params;
        const { title, meta_description, description } = req.body;

        await aboutMeController.save(lang.toString(), title, description, meta_description, parseInt(req.session.adminUser?.id));

        const adminEndpoint = (req as any).adminEndpoint || env.ADMIN_PANEL_ENDPOINT || '/admin';
        return res.redirect(`${adminEndpoint}/about-me`);
    } catch (err) {
        console.error('Hakkımda sayfası hata:', err);
        return res.status(500).send('Sunucu hatası');
    }
});

export default router;