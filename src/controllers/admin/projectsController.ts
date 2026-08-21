import { Request, Response } from 'express';
import { pool, dbQueries } from '../../config/db';
import { safeTrim } from '../../utils/helper';

// Virgülle ayrılmış etiket metnini güvenli biçimde JSON dizesine dönüştürür
const parseTagsToJSON = (tagsInput?: string): string => {
    if (!tagsInput || typeof tagsInput !== 'string') return '[]';
    const tagsArray = tagsInput
        .split(',')
        .map((tag) => tag.trim())
        .filter((tag) => tag.length > 0);
    return JSON.stringify(tagsArray);
};

export const getAllProjects = async (req: Request, res: Response) => {
    try {
        const projects = await pool.query(dbQueries.projects.getAll);

        const formattedProjects = (projects || []).map((project: any) => {
            let parsedTags = [];
            try {
                parsedTags = typeof project.tags === 'string' ? JSON.parse(project.tags) : project.tags;
            } catch {
                parsedTags = [];
            }
            return {
                ...project,
                tags: parsedTags
            };
        });

        return res.json({
            success: true,
            data: formattedProjects
        });
    } catch (err) {
        console.error('❌ Projeler listelenirken hata:', err);
        return res.status(500).json({
            success: false,
            message: 'Sunucu hatası oluştu.'
        });
    }
};

export const getProjectById = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const rows = await pool.query(dbQueries.projects.getById, [id]);

        if (!rows || rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Proje bulunamadı.'
            });
        }

        const project = rows[0];
        let parsedTags = [];
        try {
            parsedTags = JSON.parse(project.tags || '[]');
        } catch {
            parsedTags = [];
        }

        return res.json({
            success: true,
            data: {
                ...project,
                tags: parsedTags,
                tagsTxt: parsedTags.join(', ')
            }
        });
    } catch (err) {
        console.error('❌ Proje getirme hatası:', err);
        return res.status(500).json({
            success: false,
            message: 'Sunucu hatası oluştu.'
        });
    }
};

export const createProject = async (req: Request, res: Response) => {
    const { title, link_text, link_url, description, tags, turn, language, status } = req.body || {};
    const projectStatus = parseInt(status, 10) || 0;
    const turnCnv = parseInt(turn, 10) || 11;
    const session = req.session as any;

    try {
        if (!title) {
            return res.status(400).json({
                success: false,
                message: 'Başlık alanı zorunludur.'
            });
        }

        const tagsJson = parseTagsToJSON(tags);

        await pool.query(dbQueries.projects.add, [
            safeTrim(title),
            safeTrim(link_text),
            safeTrim(link_url),
            safeTrim(description),
            tagsJson,
            turnCnv,
            language || 'tr',
            session?.adminUser?.id || null,
            projectStatus
        ]);

        return res.status(201).json({
            success: true,
            message: 'Proje başarıyla eklendi.'
        });
    } catch (err: any) {
        console.error('❌ Proje ekleme hatası:', err);
        return res.status(400).json({
            success: false,
            message: err.message || 'Proje kaydedilirken bir hata oluştu.'
        });
    }
};

export const updateProject = async (req: Request, res: Response) => {
    const projectId = req.params.id;
    const { title, link_text, link_url, description, tags, turn, status, language } = req.body || {};
    const projectStatus = parseInt(status, 10) || 0;
    const turnCnv = parseInt(turn, 10) || 11;
    const session = req.session as any;

    try {
        const tagsJson = parseTagsToJSON(tags);

        await pool.query(dbQueries.projects.update, [
            safeTrim(title),
            safeTrim(link_text),
            safeTrim(link_url),
            safeTrim(description),
            tagsJson,
            turnCnv,
            language || 'tr',
            session?.adminUser?.id || null,
            projectStatus,
            projectId
        ]);

        return res.json({
            success: true,
            message: 'Proje başarıyla güncellendi.'
        });
    } catch (err: any) {
        console.error('❌ Proje güncelleme hatası:', err);
        return res.status(400).json({
            success: false,
            message: err.message || 'Proje güncellenirken bir hata oluştu.'
        });
    }
};

export const deleteProject = async (req: Request, res: Response) => {
    try {
        const projectId = req.params.id;

        await pool.query(dbQueries.projects.delete, [projectId]);

        return res.json({
            success: true,
            message: 'Proje başarıyla silindi.'
        });
    } catch (err: any) {
        console.error('❌ Proje silme hatası:', err);
        return res.status(500).json({
            success: false,
            message: err.message || 'Sunucu hatası oluştu.'
        });
    }
};