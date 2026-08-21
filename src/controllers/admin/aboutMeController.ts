import { Request, Response } from 'express';
import { pool, dbQueries } from '../../config/db';
import { safeTrim } from '../../utils/helper';

export const getAboutMe = async (req: Request, res: Response) => {
    try {
        const aboutMe = await pool.query(dbQueries.aboutMe.getAll);

        return res.json({
            success: true,
            data: aboutMe || []
        });
    } catch (err) {
        console.error('❌ Hakkımda bilgisi getirme hatası:', err);
        return res.status(500).json({
            success: false,
            message: 'Sunucu hatası oluştu.'
        });
    }
};

export const updateAboutMe = async (req: Request, res: Response) => {
    try {
        const { lang } = req.params;
        const { title, meta_description, description } = req.body || {};
        const session = req.session as any;

        await pool.query(dbQueries.aboutMe.update, [
            safeTrim(title),
            safeTrim(description),
            safeTrim(meta_description),
            session?.adminUser?.id || null,
            lang
        ]);

        return res.json({
            success: true,
            message: 'Hakkımda bilgisi başarıyla güncellendi.'
        });
    } catch (err) {
        console.error('❌ Hakkımda güncelleme hatası:', err);
        return res.status(500).json({
            success: false,
            message: 'Sunucu hatası oluştu.'
        });
    }
};