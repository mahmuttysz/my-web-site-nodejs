import { query, queryOne, dbQueries } from '../../config/db';
import SocialMedias from '../../types/dbTables/socialMedias';
import { safeTrim } from '../../utils/helper';

// Sosyal Medya Hesaplarını Listeleme
export const getSocialMedias = async (): Promise<SocialMedias[]> => {
  const socialMedias = await query<SocialMedias[]>(dbQueries.socialMedias.getAll);
  return socialMedias || [];
};

// Sosyal Medya Detayı Getirme
export const getSocialMedia = async (socialMediaId: number): Promise<SocialMedias | null> => {
  return await queryOne<SocialMedias>(dbQueries.socialMedias.getById, [socialMediaId]);
};

// Yeni Sosyal Medya Kaydetme
export const addSocialMedia = async (
  title: string,
  username: string,
  url: string,
  icon: string,
  turn: number,
  status: boolean,
  userId: number
): Promise<void> => {
  await query(dbQueries.socialMedias.add, [
    safeTrim(title),
    safeTrim(username),
    safeTrim(url),
    safeTrim(icon),
    turn,
    userId,
    status
  ]);
};

// Sosyal Medya Güncelleme
export const editSocialMedia = async (
  sMediaId: number,
  title: string,
  username: string,
  url: string,
  icon: string,
  turn: number,
  status: boolean,
  userId: number
): Promise<void> => {
  await query(dbQueries.socialMedias.update, [
    safeTrim(title),
    safeTrim(username),
    safeTrim(url),
    safeTrim(icon),
    turn,
    userId,
    status,
    sMediaId
  ]);
};

// Sosyal Medya Silme
export const deleteSocialMedia = async (sMediaId: number): Promise<void> => {
  await query(dbQueries.socialMedias.delete, [sMediaId]);
};

export default {
  getSocialMedias,
  addSocialMedia,
  getSocialMedia,
  editSocialMedia,
  deleteSocialMedia
};