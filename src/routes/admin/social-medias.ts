import express, { Request, Response } from 'express';
import { env } from '../../config/env';
import socialMediasController from '../../controllers/admin/socialMediasController';

const router = express.Router();

// Sosyal Medya Hesaplarını Listeleme
router.get('/', async (req: Request, res: Response) => {
  try {
    const socialMedias = await socialMediasController.getSocialMedias();

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

// Yeni Sosyal Medya Ekranı
router.get('/new', (req: Request, res: Response) => {
  return res.render('admin/social-medias/editor', {
    title: 'Yeni Sosyal Medya',
    user: req.session.adminUser,
    socialMedia: {}
  });
});

// Yeni Sosyal Medya Kaydetme
router.post('/create', async (req: Request, res: Response) => {
  const { title, username, url, icon, turn, status } = req.body;
  const sMediaStatus = (parseInt(status, 10) || 0) === 1;
  const turnCnv = parseInt(turn, 10) || 11;
  const userId = Number(req.session.adminUser?.id || 0);
  const adminEndpoint = req.adminEndpoint || env.ADMIN_PANEL_ENDPOINT || '/admin';

  try {
    if (!title) {
      throw new Error('Başlık alanı zorunludur.');
    }

    await socialMediasController.addSocialMedia(
      title,
      username,
      url,
      icon,
      turnCnv,
      sMediaStatus,
      userId
    );

    return res.redirect(`${adminEndpoint}/social-medias`);
  } catch (err: any) {
    console.error('Sosyal medya ekleme hatası:', err);

    const errorMessage = err?.message || 'Sosyal medya kaydedilirken bir hata oluştu.';

    return res.status(400).render('admin/social-medias/editor', {
      title: 'Yeni Sosyal Medya',
      error: errorMessage,
      user: req.session.adminUser,
      socialMedia: req.body
    });
  }
});

// Sosyal Medya Düzenleme Ekranı
router.get('/edit/:id', async (req: Request, res: Response) => {
  const adminEndpoint = req.adminEndpoint || env.ADMIN_PANEL_ENDPOINT || '/admin';
  const sMediaId = Number(req.params.id || 0);

  try {
    const socialMedia = await socialMediasController.getSocialMedia(sMediaId);

    if (!socialMedia) {
      return res.redirect(`${adminEndpoint}/social-medias`);
    }

    return res.render('admin/social-medias/editor', {
      title: 'Sosyal Medya Düzenle',
      user: req.session.adminUser,
      socialMedia
    });
  } catch (err) {
    console.error('Sosyal medya getirme hatası:', err);
    return res.redirect(`${adminEndpoint}/social-medias`);
  }
});

// Sosyal Medya Güncelleme
router.post('/edit/:id', async (req: Request, res: Response) => {
  const sMediaId = Number(req.params.id || 0);
  const { title, username, url, icon, turn, status } = req.body;
  const sMediaStatus = (parseInt(status, 10) || 0) === 1;
  const turnCnv = parseInt(turn, 10) || 11;
  const userId = Number(req.session.adminUser?.id || 0);
  const adminEndpoint = req.adminEndpoint || env.ADMIN_PANEL_ENDPOINT || '/admin';

  try {
    if (!title) {
      throw new Error('Başlık alanı zorunludur.');
    }

    await socialMediasController.editSocialMedia(
      sMediaId,
      title,
      username,
      url,
      icon,
      turnCnv,
      sMediaStatus,
      userId
    );

    return res.redirect(`${adminEndpoint}/social-medias`);
  } catch (err: any) {
    console.error('Sosyal medya güncelleme hatası:', err);
    const errorMessage = err?.message || 'Sosyal medya güncellenirken bir hata oluştu.';

    return res.status(400).render('admin/social-medias/editor', {
      title: 'Sosyal Medya Düzenle',
      error: errorMessage,
      user: req.session.adminUser,
      socialMedia: { ...req.body, id: sMediaId }
    });
  }
});

// Sosyal Medya Silme
router.post('/delete/:id', async (req: Request, res: Response) => {
  try {
    const sMediaId = Number(req.params.id || 0);
    await socialMediasController.deleteSocialMedia(sMediaId);

    return res.json({ success: true });
  } catch (err: any) {
    return res.status(500).json({
      success: false,
      error: err?.message || 'Bir hata oluştu.'
    });
  }
});

export default router;