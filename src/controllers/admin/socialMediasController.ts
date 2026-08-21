import { Request, Response } from 'express';
import { pool, dbQueries } from '../../config/db';
import { safeTrim } from '../../utils/helper';

export const getAllSocialMedias = async (req: Request, res: Response) => {
    try {
        const socialMedias = await pool.query(dbQueries.socialMedias.getAll);

        return res.json({
            success: true,
            data: socialMedias || []
        });
    } catch (err) {
        console.error('❌ Sosyal medyalar listelenirken hata:', err);
        return res.status(500).json({
            success: false,
            message: 'Sunucu hatası oluştu.'
        });
    }
};

export const getSocialMediaById = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const rows = await pool.query(dbQueries.socialMedias.getById, [id]);

        if (!rows || rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Sosyal medya kaydı bulunamadı.'
            });
        }

        return res.json({
            success: true,
            data: rows[0]
        });
    } catch (err) {
        console.error('❌ Sosyal medya getirme hatası:', err);
        return res.status(500).json({
            success: false,
            message: 'Sunucu hatası oluştu.'
        });
    }
};

export const createSocialMedia = async (req: Request, res: Response) => {
    const { title, username, url, icon, turn, status } = req.body || {};
    const sMediaStatus = parseInt(status, 10) || 0;
    const turnCnv = parseInt(turn, 10) || 11;
    const session = req.session as any;

    try {
        if (!title) {
            return res.status(400).json({
                success: false,
                message: 'Başlık alanı zorunludur.'
            });
        }

        await pool.query(dbQueries.socialMedias.add, [
            safeTrim(title),
            safeTrim(username),
            safeTrim(url),
            safeTrim(icon),
            turnCnv,
            session?.adminUser?.id || null,
            sMediaStatus
        ]);

        return res.status(201).json({
            success: true,
            message: 'Sosyal medya hesabı başarıyla eklendi.'
        });
    } catch (err: any) {
        console.error('❌ Sosyal medya ekleme hatası:', err);
        return res.status(400).json({
            success: false,
            message: err.message || 'Sosyal medya kaydedilirken bir hata oluştu.'
        });
    }
};

export const updateSocialMedia = async (req: Request, res: Response) => {
    const sMediaId = req.params.id;
    const { title, username, url, icon, turn, status } = req.body || {};
    const sMediaStatus = parseInt(status, 10) || 0;
    const turnCnv = parseInt(turn, 10) || 11;
    const session = req.session as any;

    try {
        await pool.query(dbQueries.socialMedias.update, [
            safeTrim(title),
            safeTrim(username),
            safeTrim(url),
            safeTrim(icon),
            turnCnv,
            session?.adminUser?.id || null,
            sMediaStatus,
            sMediaId
        ]);

        return res.json({
            success: true,
            message: 'Sosyal medya hesabı başarıyla güncellendi.'
        });
    } catch (err: any) {
        console.error('❌ Sosyal medya güncelleme hatası:', err);
        return res.status(400).json({
            success: false,
            message: err.message || 'Sosyal medya güncellenirken bir hata oluştu.'
        });
    }
};

export const deleteSocialMedia = async (req: Request, res: Response) => {
    try {
        const sMediaId = req.params.id;

        await pool.query(dbQueries.socialMedias.delete, [sMediaId]);

        return res.json({
            success: true,
            message: 'Sosyal medya hesabı başarıyla silindi.'
        });
    } catch (err: any) {
        console.error('❌ Sosyal medya silme hatası:', err);
        return res.status(500).json({
            success: false,
            message: err.message || 'Sunucu hatası oluştu.'
        });
    }
};