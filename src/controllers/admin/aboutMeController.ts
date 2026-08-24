// src/routes/admin/about-me.ts
import { pool, dbQueries } from '../../config/db';
import { safeTrim } from '../../utils/helper';
import AboutMe from '../../types/dbTables/aboutMe';

export const getAboutMe = async () => {
    try {
        return await pool.query<AboutMe[]>(dbQueries.aboutMe.getAll);
    } catch (err) {
        console.error('Hakkımda sayfası hata:', err);
        return [];
    }
};

export const save = async (lang: string, title: string, description: string, metaDescription: string, userId: number) => {
    try {
        await pool.query(dbQueries.aboutMe.update, [
            safeTrim(title),
            safeTrim(description),
            safeTrim(metaDescription),
            userId,
            lang
        ]);

        return true;
    } catch (err) {
        console.error('Hakkımda sayfası hata:', err);
        return false;
    }
};

export default { getAboutMe, save };