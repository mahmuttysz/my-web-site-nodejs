import express, { Request, Response, NextFunction } from 'express';
import slugify from 'slugify';
import upload, { unlinkArticleCover } from '../../config/upload';
import { env } from '../../config/env';
import articlesController from '../../controllers/admin/articlesController';
import { verifyCsrf } from '../../middlewares/csrf';
import { findSiblingInList, otherArticleLang } from '../../utils/articleTranslation';
import { pendingHitsMap } from '../../utils/articleHitStore';
import { renderMarkdown } from '../../utils/markdown';

const router = express.Router();

const renderEditor = (
  res: Response,
  req: Request,
  opts: {
    title: string;
    article: Record<string, unknown>;
    sibling?: { id: number; language: string; status: boolean | number } | null;
    error?: string;
    status?: number;
  }
) => {
  return res.status(opts.status || 200).render('admin/articles/editor', {
    title: opts.title,
    error: opts.error,
    user: req.session.adminUser,
    article: opts.article,
    sibling: opts.sibling ?? null,
    otherArticleLang: otherArticleLang(String(opts.article.language || 'tr'))
  });
};

// Makaleleri Listeleme
router.get('/', async (req: Request, res: Response) => {
  try {
    const articles = await articlesController.getArticles();
    const pending = await pendingHitsMap();
    const rows = articles.map((article) => {
      const sibling = findSiblingInList(articles, article);
      return {
        ...article,
        hits: Number(article.hits || 0) + (pending.get(article.id) || 0),
        siblingId: sibling?.id ?? null,
        siblingLang: sibling?.language ?? null
      };
    });
    return res.render('admin/articles/index', {
      title: 'Makaleler',
      user: req.session.adminUser,
      articles: rows
    });
  } catch (err) {
    console.error('Makaleler çekilirken hata:', err);
    return res.status(500).send('Sunucu hatası');
  }
});

// Yeni Makale Sayfası
router.get('/new', (req: Request, res: Response) => {
  return renderEditor(res, req, {
    title: 'Yeni Makale',
    article: {}
  });
});

router.post('/preview-markdown', verifyCsrf, async (req: Request, res: Response) => {
  const markdown = typeof req.body?.markdown === 'string' ? req.body.markdown : '';
  if (markdown.length > 200_000) {
    return res.status(413).json({ success: false, message: 'İçerik çok uzun.' });
  }

  try {
    const html = await renderMarkdown(markdown);
    return res.json({ success: true, html });
  } catch (err) {
    console.error('Markdown önizleme hatası:', err);
    return res.status(500).json({ success: false, message: 'Önizleme üretilemedi.' });
  }
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
          article: req.body,
          sibling: null,
          otherArticleLang: otherArticleLang(String(req.body?.language || 'tr'))
        });
      }
      next();
    });
  },
  verifyCsrf,
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
        await unlinkArticleCover(`/uploads/articles/${req.file.filename}`);
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
        article: req.body,
        sibling: null,
        otherArticleLang: otherArticleLang(String(req.body?.language || 'tr'))
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
      article,
      sibling: article.slug ? await articlesController.findSibling(article.slug, article.language) : null,
      otherArticleLang: otherArticleLang(article.language)
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
          article: { ...req.body, id: req.params.id },
          sibling: null,
          otherArticleLang: otherArticleLang(String(req.body?.language || 'tr'))
        });
      }
      next();
    });
  },
  verifyCsrf,
  async (req: Request, res: Response) => {
    const articleId = Number(req.params.id || '0');
    const { title, slug, excerpt, content, status, language } = req.body;
    const articleStatus = (parseInt(status, 10) || 0) === 1;
    const finalSlug = slugify(slug || title || '', { lower: true, strict: true, locale: language || 'tr' });
    const userId = Number(req.session.adminUser?.id || 0);
    const adminEndpoint = req.adminEndpoint || env.ADMIN_PANEL_ENDPOINT || '/admin';
    const uploadedCover = req.file ? `/uploads/articles/${req.file.filename}` : null;

    try {
      const current = await articlesController.getArticle(articleId);

      if (!current) {
        if (uploadedCover) await unlinkArticleCover(uploadedCover);
        return res.redirect(`${adminEndpoint}/articles`);
      }

      const cover_image = uploadedCover || current.cover_image || null;

      await articlesController.editArticle(
        articleId,
        title,
        finalSlug,
        excerpt,
        content,
        cover_image,
        articleStatus,
        language,
        userId,
        current.published_at
      );

      if (uploadedCover && current.cover_image && current.cover_image !== uploadedCover) {
        await unlinkArticleCover(current.cover_image);
      }

      return res.redirect(`${adminEndpoint}/articles`);
    } catch (err: any) {
      console.error('Makale güncelleme hatası:', err);

      if (uploadedCover) {
        await unlinkArticleCover(uploadedCover);
      }

      let errorMessage = 'Makale güncellenirken bir hata oluştu.';
      if (err.code === 'ER_DUP_ENTRY') {
        errorMessage = 'Bu slug veya başlık başka bir makale tarafından kullanılıyor!';
      }

      const current = await articlesController.getArticle(articleId).catch(() => null);

      return res.status(400).render('admin/articles/editor', {
        title: 'Makale Düzenle',
        error: errorMessage,
        user: req.session.adminUser,
        article: { ...req.body, id: articleId, cover_image: current?.cover_image || null },
        sibling: current?.slug ? await articlesController.findSibling(current.slug, current.language).catch(() => null) : null,
        otherArticleLang: otherArticleLang(String(req.body?.language || current?.language || 'tr'))
      });
    }
  }
);

router.post('/translate/:id', verifyCsrf, async (req: Request, res: Response) => {
  const adminEndpoint = req.adminEndpoint || env.ADMIN_PANEL_ENDPOINT || '/admin';
  const articleId = Number(req.params.id || '0');
  const userId = Number(req.session.adminUser?.id || 0);

  try {
    const siblingId = await articlesController.copyToOtherLanguage(articleId, userId);
    return res.redirect(`${adminEndpoint}/articles/edit/${siblingId}`);
  } catch (err: any) {
    console.error('Makale çeviri kopyası hatası:', err);
    return res.redirect(`${adminEndpoint}/articles`);
  }
});

// Makale Silme
router.post('/delete/:id', verifyCsrf, async (req: Request, res: Response) => {
  try {
    const articleId = Number(req.params.id || '0');

    const article = await articlesController.getArticle(articleId);
    if (article?.cover_image) {
      await unlinkArticleCover(article.cover_image);
    }

    await articlesController.deleteArticle(articleId);
    return res.json({ success: true });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err?.message || 'Bir hata oluştu.' });
  }
});

export default router;