import { query, queryOne, dbQueries } from '../../config/db';
import { safeTrim } from '../../utils/helper';
import Projects from '../../types/dbTables/projects';

// Projeleri Listeleme
export const getProjects = async (): Promise<Projects[]> => {
    const projects = await query<Projects[]>(dbQueries.projects.getAll);

    projects?.forEach((f: any) => {
        try {
            f.tags = JSON.parse(f.tags || '[]');
        } catch {
            f.tags = [];
        }
    });

    return projects || [];
};

// Proje Detayı Getirme
export const getProject = async (projectId: number): Promise<Projects | null> => {
    const project = await queryOne<Projects>(dbQueries.projects.getById, [projectId]);
    if (!project) return null;

    let tagsTxt = '';
    try {
        const tagParse = JSON.parse(project.tags || '[]');
        if (Array.isArray(tagParse)) {
            tagsTxt = tagParse.join(', ');
        }
    } catch {
        tagsTxt = '';
    }

    project.tagsTxt = tagsTxt;
    return project;
};

// Yeni Proje Kaydetme
export const addProject = async (
    title: string,
    linkText: string,
    linkUrl: string,
    description: string,
    tags: string,
    turn: number,
    status: boolean,
    language: string,
    userId: number
): Promise<void> => {
    let tagEdit = '[]';
    if (typeof tags === 'string' && tags.trim().length > 0) {
        const tagSplit = tags.split(',').map((t) => t.trim()).filter(Boolean);
        tagEdit = JSON.stringify(tagSplit);
    }

    await query(dbQueries.projects.add, [
        safeTrim(title),
        safeTrim(linkText),
        safeTrim(linkUrl),
        safeTrim(description),
        tagEdit,
        turn,
        language || 'tr',
        userId,
        status
    ]);
};

// Proje Güncelleme
export const editProject = async (
    projectId: number,
    title: string,
    linkText: string,
    linkUrl: string,
    description: string,
    tags: string,
    turn: number,
    status: boolean,
    language: string,
    userId: number
): Promise<void> => {
    let tagEdit = '[]';
    if (typeof tags === 'string' && tags.trim().length > 0) {
        const tagSplit = tags.split(',').map((t) => t.trim()).filter(Boolean);
        tagEdit = JSON.stringify(tagSplit);
    }

    await query(dbQueries.projects.update, [
        safeTrim(title),
        safeTrim(linkText),
        safeTrim(linkUrl),
        safeTrim(description),
        tagEdit,
        turn,
        language || 'tr',
        userId,
        status,
        projectId
    ]);
};

// Proje Silme
export const deleteProject = async (projectId: number): Promise<void> => {
    await query(dbQueries.projects.delete, [projectId]);
};

export default {
    getProjects,
    addProject,
    getProject,
    editProject,
    deleteProject
};