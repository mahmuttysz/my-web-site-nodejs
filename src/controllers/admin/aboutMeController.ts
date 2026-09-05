import { query, dbQueries } from '../../config/db';
import { safeTrim } from '../../utils/helper';
import AboutMe from '../../types/dbTables/aboutMe';

export const getAboutMe = async (): Promise<AboutMe[]> => {
  return await query<AboutMe[]>(dbQueries.aboutMe.getAll);
};

export const save = async (
  lang: string,
  title: string,
  description: string,
  nowText: string,
  metaDescription: string,
  userId: number
): Promise<void> => {
  const now = safeTrim(nowText);
  await query(dbQueries.aboutMe.update, [
    safeTrim(title),
    safeTrim(description),
    now || null,
    safeTrim(metaDescription),
    userId,
    lang
  ]);
};

export default { getAboutMe, save };