import express, { Request, Response, NextFunction } from 'express';
import slugify from 'slugify';
import fs from 'fs/promises';
import path from 'path';
import upload from '../../config/upload';
import { env } from '../../config/env';
import articlesController from '../../controllers/admin/articlesController';

const router = express.Router();

// Makaleleri Listeleme
router.get('/', async (req: Request, res: Response) => {
  try {
    const articles = await articlesController.getArticles();
    return res.render('admin/articles/index', {
      title: 'Makaleler',
      user: req.session.adminUser,
      articles
    });
  } catch (err) {
    console.error('Makaleler çekilirken hata:', err);
    return res.status(500).send('Sunucu hatası');
  }
});

// Yeni Makale Sayfası
router.get('/new', (req: Request, res: Response) => {
  return res.render('admin/articles/editor', {
    title: 'Yeni Makale',
    user: req.session.adminUser,
    article: {}
  });
});

// Yeni Makale Kaydetme
router.post(
  '/create',
  (req: Request, res: Response, next: NextFunction) => {
    upload.single('cover_image')(req, res, (err: any) => {
      if (err) {
        console.error('Dosya yükleme hatası:', err.message);
        return res.status(400).render('admin/articles/editor', {
          title: 'Yeni Makale',
          error: err.message,
          user: req.session.adminUser,
          article: req.body
        });
      }
      next();
    });
  },
  async (req: Request, res: Response) => {
    const { title, slug, excerpt, content, status, language } = req.body;
    const articleStatus = (parseInt(status, 10) || 0) === 1;
    const cover_image = req.file ? `/uploads/articles/${req.file.filename}` : null;
    const finalSlug = slugify(slug || title || '', { lower: true, strict: true, locale: language || 'tr' });
    const userId = Number(req.session.adminUser?.id || 0);

    const adminEndpoint = req.adminEndpoint || env.ADMIN_PANEL_ENDPOINT || '/admin';

    try {
      if (!title || !content) {
        throw new Error('Başlık ve içerik alanları zorunludur.');
      }

      await articlesController.addArticle(
        title,
        finalSlug,
        excerpt,
        content,
        cover_image,
        articleStatus,
        language,
        userId
      );

      return res.redirect(`${adminEndpoint}/articles`);
    } catch (err: any) {
      console.error('Makale ekleme hatası:', err);

      // Veritabanı hatasında yüklenen resmi temizleme
      if (req.file) {
        try {
          await fs.unlink(req.file.path);
        } catch {
          /* dosya silinirken oluşan hatayı yut */
        }
      }

      let errorMessage = 'Makale kaydedilirken bir hata oluştu.';
      if (err.code === 'ER_DUP_ENTRY') {
        errorMessage = 'Bu başlık veya slug ile zaten kayıtlı bir makale var!';
      } else if (err.message) {
        errorMessage = err.message;
      }

      return res.status(400).render('admin/articles/editor', {
        title: 'Yeni Makale',
        error: errorMessage,
        user: req.session.adminUser,
        article: req.body
      });
    }
  }
);

// Makale Düzenleme Sayfası
router.get('/edit/:id', async (req: Request, res: Response) => {
  const adminEndpoint = req.adminEndpoint || env.ADMIN_PANEL_ENDPOINT || '/admin';
  try {
    const articleId = Number(req.params.id || '0');
    const article = await articlesController.getArticle(articleId);

    if (!article) {
      return res.redirect(`${adminEndpoint}/articles`);
    }

    return res.render('admin/articles/editor', {
      title: 'Makale Düzenle',
      user: req.session.adminUser,
      article
    });
  } catch (err) {
    console.error('Makale getirme hatası:', err);
    return res.redirect(`${adminEndpoint}/articles`);
  }
});

// Makale Güncelleme
router.post(
  '/edit/:id',
  (req: Request, res: Response, next: NextFunction) => {
    upload.single('cover_image')(req, res, (err: any) => {
      if (err) {
        return res.status(400).render('admin/articles/editor', {
          title: 'Makale Düzenle',
          error: err.message,
          user: req.session.adminUser,
          article: { ...req.body, id: req.params.id }
        });
      }
      next();
    });
  },
  async (req: Request, res: Response) => {
    const articleId = Number(req.params.id || '0');
    const { title, slug, excerpt, content, status, language, existing_cover_image } = req.body;
    const articleStatus = (parseInt(status, 10) || 0) === 1;
    const finalSlug = slugify(slug || title || '', { lower: true, strict: true, locale: language || 'tr' });
    const userId = Number(req.session.adminUser?.id || 0);

    let cover_image = existing_cover_image || null;
    if (req.file) {
      cover_image = `/uploads/articles/${req.file.filename}`;
    }

    const adminEndpoint = req.adminEndpoint || env.ADMIN_PANEL_ENDPOINT || '/admin';

    try {
      await articlesController.editArticle(
        articleId,
        title,
        finalSlug,
        excerpt,
        content,
        cover_image,
        articleStatus,
        language,
        userId
      );

      // Yeni görsel yüklendiyse eski görseli diskten silme
      if (req.file && existing_cover_image) {
        const oldImagePath = path.join(process.cwd(), 'public', existing_cover_image);
        try {
          await fs.unlink(oldImagePath);
        } catch {
          /* eski resim bulunamazsa akışı bozma */
        }
      }

      return res.redirect(`${adminEndpoint}/articles`);
    } catch (err: any) {
      console.error('Makale güncelleme hatası:', err);

      // Güncelleme başarısız olduysa yeni yüklenen geçici dosyayı temizleme
      if (req.file) {
        try {
          await fs.unlink(req.file.path);
        } catch {
          /* yüklenen yeni resim silinemezse akışı bozma */
        }
      }

      let errorMessage = 'Makale güncellenirken bir hata oluştu.';
      if (err.code === 'ER_DUP_ENTRY') {
        errorMessage = 'Bu slug veya başlık başka bir makale tarafından kullanılıyor!';
      }

      return res.status(400).render('admin/articles/editor', {
        title: 'Makale Düzenle',
        error: errorMessage,
        user: req.session.adminUser,
        article: { ...req.body, id: articleId, cover_image: existing_cover_image }
      });
    }
  }
);

// Makale Silme
router.post('/delete/:id', async (req: Request, res: Response) => {
  try {
    const articleId = Number(req.params.id || '0');

    const article = await articlesController.getArticle(articleId);
    if (article && article.cover_image) {
      const imagePath = path.join(process.cwd(), 'public', article.cover_image);
      try {
        await fs.unlink(imagePath);
      } catch {
        /* görsel bulunamazsa silme işlemini durdurma */
      }
    }

    await articlesController.deleteArticle(articleId);
    return res.json({ success: true });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err?.message || 'Bir hata oluştu.' });
  }
});

export default router;