// src/routes/admin/social-medias.ts
import express, { Request, Response } from 'express';
import { pool, dbQueries } from '../../config/db';
import { safeTrim } from '../../utils/helper';
import { env } from '../../config/env';

const router = express.Router();

// Sosyal Medya Hesaplarını Listeleme
router.get('/', async (req: Request, res: Response) => {
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
  const sMediaStatus = parseInt(status, 10) || 0;
  const turnCnv = parseInt(turn, 10) || 11;

  const adminEndpoint = req.adminEndpoint || env.ADMIN_PANEL_ENDPOINT || '/admin';

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

    return res.redirect(`${adminEndpoint}/social-medias`);
  } catch (err: any) {
    console.error('Sosyal medya ekleme hatası:', err);

    let errorMessage = 'Sosyal medya kaydedilirken bir hata oluştu.';
    if (err?.message) {
      errorMessage = err.message;
    }

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

  try {
    const rows = await pool.query<any[]>(dbQueries.socialMedias.getById, [req.params.id]);
    if (!rows || rows.length === 0) {
      return res.redirect(`${adminEndpoint}/social-medias`);
    }

    return res.render('admin/social-medias/editor', {
      title: 'Sosyal Medya Düzenle',
      user: req.session.adminUser,
      socialMedia: rows[0]
    });
  } catch (err) {
    console.error('Sosyal medya getirme hatası:', err);
    return res.redirect(`${adminEndpoint}/social-medias`);
  }
});

// Sosyal Medya Güncelleme
router.post('/edit/:id', async (req: Request, res: Response) => {
  const sMediaId = req.params.id;
  const { title, username, url, icon, turn, status } = req.body;
  const sMediaStatus = parseInt(status, 10) || 0;
  const turnCnv = parseInt(turn, 10) || 11;

  const adminEndpoint = req.adminEndpoint || env.ADMIN_PANEL_ENDPOINT || '/admin';

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

    return res.redirect(`${adminEndpoint}/social-medias`);
  } catch (err) {
    console.error('Sosyal medya güncelleme hatası:', err);
    const errorMessage = 'Sosyal medya güncellenirken bir hata oluştu.';

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
    const sMediaId = req.params.id;

    await pool.query(dbQueries.socialMedias.delete, [sMediaId]);
    return res.json({ success: true });
  } catch (err: any) {
    return res.status(500).json({
      success: false,
      error: err?.message || 'Bir hata oluştu.'
    });
  }
});

export default router;