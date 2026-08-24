import { query, queryOne, dbQueries } from '../../config/db';
import Experiences from '../../types/dbTables/experiences';
import { safeTrim } from '../../utils/helper';

// Deneyimleri Listeleme
export const getExperiences = async (): Promise<Experiences[]> => {
    return await query<Experiences[]>(dbQueries.experiences.getAll);
};

// Deneyim Detayı Getirme
export const getExperience = async (experienceId: number): Promise<Experiences | null> => {
    return await queryOne<Experiences>(dbQueries.experiences.getById, [experienceId]);
};

// Yeni Deneyim Kaydetme
export const addExperience = async (
    companyName: string,
    title: string,
    description: string,
    beginDate: string | Date,
    endDate: string | Date | null,
    language: string,
    status: boolean,
    userId: number
): Promise<void> => {
    await query(dbQueries.experiences.add, [
        safeTrim(companyName),
        safeTrim(title),
        safeTrim(description),
        beginDate,
        endDate,
        language || 'tr',
        userId,
        status
    ]);
};

// Deneyim Güncelleme
export const editExperience = async (
    experienceId: number,
    companyName: string,
    title: string,
    description: string,
    beginDate: string | Date,
    endDate: string | Date | null,
    language: string,
    status: boolean,
    userId: number
): Promise<void> => {
    await query(dbQueries.experiences.update, [
        safeTrim(companyName),
        safeTrim(title),
        safeTrim(description),
        beginDate,
        endDate,
        language || 'tr',
        userId,
        status,
        experienceId
    ]);
};

// Deneyim Silme
export const deleteExperience = async (experienceId: number): Promise<void> => {
    await query(dbQueries.experiences.delete, [experienceId]);
};

export default {
    getExperiences,
    getExperience,
    addExperience,
    editExperience,
    deleteExperience
};