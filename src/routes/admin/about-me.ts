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
    const { title, meta_description, description, now_text } = req.body;
    const userId = req.session.adminUser?.id;

    if (!userId) {
      return res.status(401).send('Oturum süresi dolmuş.');
    }

    await aboutMeController.save(
      lang.toString(),
      title,
      description,
      now_text || '',
      meta_description,
      Number(userId)
    );

    const adminEndpoint = req.adminEndpoint || env.ADMIN_PANEL_ENDPOINT || '/admin';
    return res.redirect(`${adminEndpoint}/about-me`);
  } catch (err) {
    console.error('Hakkımda güncelleme hatası:', err);
    return res.status(500).send('Sunucu hatası');
  }
});

export default router;