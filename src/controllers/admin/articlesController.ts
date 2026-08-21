import { Request, Response } from 'express';
import slugify from 'slugify';
import fs from 'fs/promises';
import path from 'path';
import { pool, dbQueries } from '../../config/db';
import { safeTrim, calculateReadingTime } from '../../utils/helper';

export const getAllArticles = async (req: Request, res: Response) => {
    try {
        const articles = await pool.query(dbQueries.articles.getAll);

        return res.json({
            success: true,
            data: articles || []
        });
    } catch (err) {
        console.error('❌ Makaleler çekilirken hata:', err);
        return res.status(500).json({
            success: false,
            message: 'Sunucu hatası oluştu.'
        });
    }
};

export const getArticleById = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const rows = await pool.query(dbQueries.articles.getById, [id]);

        if (!rows || rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Makale bulunamadı.'
            });
        }

        return res.json({
            success: true,
            data: rows[0]
        });
    } catch (err) {
        console.error('❌ Makale getirme hatası:', err);
        return res.status(500).json({
            success: false,
            message: 'Sunucu hatası oluştu.'
        });
    }
};

export const createArticle = async (req: Request, res: Response) => {
    const { title, slug, excerpt, content, status, language } = req.body || {};
    const articleStatus = parseInt(status, 10) || 0;
    const cover_image = req.file ? `/uploads/articles/${req.file.filename}` : null;
    const finalSlug = slugify(slug || title || '', { lower: true, strict: true, locale: language || 'tr' });
    const readingTime = calculateReadingTime(content);
    const publishedAt = articleStatus === 1 ? new Date() : null;
    const session = req.session as any;

    try {
        if (!title || !content) {
            if (req.file) {
                try { await fs.unlink(req.file.path); } catch { }
            }
            return res.status(400).json({
                success: false,
                message: 'Başlık ve içerik alanları zorunludur.'
            });
        }

        await pool.query(dbQueries.articles.add, [
            safeTrim(title),
            safeTrim(finalSlug),
            safeTrim(excerpt),
            safeTrim(content),
            cover_image,
            session?.adminUser?.id || null,
            articleStatus,
            readingTime,
            publishedAt,
            language || 'tr'
        ]);

        return res.status(201).json({
            success: true,
            message: 'Makale başarıyla oluşturuldu.'
        });
    } catch (err: any) {
        console.error('❌ Makale ekleme hatası:', err);

        if (req.file) {
            try { await fs.unlink(req.file.path); } catch { }
        }

        let errorMessage = 'Makale kaydedilirken bir hata oluştu.';
        if (err.code === 'ER_DUP_ENTRY') {
            errorMessage = 'Bu başlık veya slug ile zaten kayıtlı bir makale var!';
        } else if (err.message) {
            errorMessage = err.message;
        }

        return res.status(400).json({
            success: false,
            message: errorMessage
        });
    }
};

export const updateArticle = async (req: Request, res: Response) => {
    const articleId = req.params.id;
    const { title, slug, excerpt, content, status, language, existing_cover_image } = req.body || {};

    const articleStatus = parseInt(status, 10) || 0;
    const publishedAt = articleStatus === 1 ? new Date() : null;
    const finalSlug = slugify(slug || title || '', { lower: true, strict: true, locale: language || 'tr' });
    const readingTime = calculateReadingTime(content);
    const session = req.session as any;

    let cover_image = existing_cover_image || null;
    if (req.file) {
        cover_image = `/uploads/articles/${req.file.filename}`;
    }

    try {
        await pool.query(dbQueries.articles.update, [
            safeTrim(title),
            safeTrim(finalSlug),
            safeTrim(excerpt),
            safeTrim(content),
            cover_image,
            articleStatus,
            session?.adminUser?.id || null,
            readingTime,
            publishedAt,
            language || 'tr',
            articleId
        ]);

        if (req.file && existing_cover_image) {
            const oldImagePath = path.join(process.cwd(), 'public', existing_cover_image);
            try { await fs.unlink(oldImagePath); } catch { }
        }

        return res.json({
            success: true,
            message: 'Makale başarıyla güncellendi.'
        });
    } catch (err: any) {
        console.error('❌ Makale güncelleme hatası:', err);

        if (req.file) {
            try { await fs.unlink(req.file.path); } catch { }
        }

        let errorMessage = 'Makale güncellenirken bir hata oluştu.';
        if (err.code === 'ER_DUP_ENTRY') {
            errorMessage = 'Bu slug veya başlık başka bir makale tarafından kullanılıyor!';
        }

        return res.status(400).json({
            success: false,
            message: errorMessage
        });
    }
};

export const deleteArticle = async (req: Request, res: Response) => {
    try {
        const articleId = req.params.id;

        const rows = await pool.query(dbQueries.articles.getById, [articleId]);
        if (rows && rows.length > 0 && rows[0].cover_image) {
            const imagePath = path.join(process.cwd(), 'public', rows[0].cover_image);
            try { await fs.unlink(imagePath); } catch { }
        }

        await pool.query(dbQueries.articles.delete, [articleId]);

        return res.json({
            success: true,
            message: 'Makale başarıyla silindi.'
        });
    } catch (err: any) {
        console.error('❌ Makale silme hatası:', err);
        return res.status(500).json({
            success: false,
            message: err.message || 'Sunucu hatası oluştu.'
        });
    }
};