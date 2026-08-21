import { Request, Response } from 'express';
import { pool, dbQueries } from '../../config/db';
import { safeTrim } from '../../utils/helper';

export const getAllExperiences = async (req: Request, res: Response) => {
    try {
        const experiences = await pool.query(dbQueries.experiences.getAll);

        return res.json({
            success: true,
            data: experiences || []
        });
    } catch (err) {
        console.error('❌ Deneyimler listelenirken hata:', err);
        return res.status(500).json({
            success: false,
            message: 'Sunucu hatası oluştu.'
        });
    }
};

export const getExperienceById = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const rows = await pool.query(dbQueries.experiences.getById, [id]);

        if (!rows || rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Deneyim bulunamadı.'
            });
        }

        return res.json({
            success: true,
            data: rows[0]
        });
    } catch (err) {
        console.error('❌ Deneyim getirme hatası:', err);
        return res.status(500).json({
            success: false,
            message: 'Sunucu hatası oluştu.'
        });
    }
};

export const createExperience = async (req: Request, res: Response) => {
    const { company_name, title, description, begin_date, isResume, end_date, language, status } = req.body || {};
    const experienceStatus = parseInt(status, 10) || 0;

    // Devam eden iş (isResume) kontrolü
    const isCurrentJob = isResume === 'true' || isResume === true;
    const endDate = isCurrentJob ? null : (end_date || null);
    const session = req.session as any;

    try {
        if (!title) {
            return res.status(400).json({
                success: false,
                message: 'Başlık alanı zorunludur.'
            });
        }

        await pool.query(dbQueries.experiences.add, [
            safeTrim(company_name),
            safeTrim(title),
            safeTrim(description),
            begin_date || null,
            endDate,
            language || 'tr',
            session?.adminUser?.id || null,
            experienceStatus
        ]);

        return res.status(201).json({
            success: true,
            message: 'Deneyim başarıyla eklendi.'
        });
    } catch (err: any) {
        console.error('❌ Deneyim ekleme hatası:', err);
        return res.status(400).json({
            success: false,
            message: err.message || 'Deneyim kaydedilirken bir hata oluştu.'
        });
    }
};

export const updateExperience = async (req: Request, res: Response) => {
    const experienceId = req.params.id;
    const { company_name, title, description, begin_date, isResume, end_date, language, status } = req.body || {};
    const experienceStatus = parseInt(status, 10) || 0;

    const isCurrentJob = isResume === 'true' || isResume === true;
    const endDate = isCurrentJob ? null : (end_date || null);
    const session = req.session as any;

    try {
        await pool.query(dbQueries.experiences.update, [
            safeTrim(company_name),
            safeTrim(title),
            safeTrim(description),
            begin_date || null,
            endDate,
            language || 'tr',
            session?.adminUser?.id || null,
            experienceStatus,
            experienceId
        ]);

        return res.json({
            success: true,
            message: 'Deneyim başarıyla güncellendi.'
        });
    } catch (err: any) {
        console.error('❌ Deneyim güncelleme hatası:', err);
        return res.status(400).json({
            success: false,
            message: err.message || 'Deneyim güncellenirken bir hata oluştu.'
        });
    }
};

export const deleteExperience = async (req: Request, res: Response) => {
    try {
        const experienceId = req.params.id;

        await pool.query(dbQueries.experiences.delete, [experienceId]);

        return res.json({
            success: true,
            message: 'Deneyim başarıyla silindi.'
        });
    } catch (err: any) {
        console.error('❌ Deneyim silme hatası:', err);
        return res.status(500).json({
            success: false,
            message: err.message || 'Sunucu hatası oluştu.'
        });
    }
};