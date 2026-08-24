import bcrypt from 'bcrypt';
import { query, queryOne, dbQueries } from '../../config/db';
import AdminUsers from '../../types/dbTables/adminUsers';
import LoginResponse from '../../types/response/loginResponse';

export const login = async (
  username: string,
  password: string,
  clientIp: string
): Promise<LoginResponse> => {
  try {
    if (!username || !password) {
      return {
        success: false,
        error: 'Kullanıcı adı ve şifre gereklidir.',
        user: {} as AdminUsers
      };
    }

    const user = await queryOne<AdminUsers>(dbQueries.adminUsers.getByUsername, [username]);

    if (!user) {
      return {
        success: false,
        error: 'Kullanıcı adı veya şifre hatalı.',
        user: {} as AdminUsers
      };
    }

    const match = await bcrypt.compare(password, user.password_hash);

    if (!match) {
      await query(dbQueries.adminUsers.wrongTryUpdate, [
        new Date(),
        clientIp,
        user.id
      ]);

      return {
        success: false,
        error: 'Kullanıcı adı veya şifre hatalı.',
        user: {} as AdminUsers
      };
    }

    await query(dbQueries.adminUsers.successLoginUpdate, [
      new Date(),
      clientIp,
      user.id
    ]);

    return {
      success: true,
      error: '',
      user
    };
  } catch (err) {
    console.error('Login Hatası:', err);
    return {
      success: false,
      error: 'Veritabanı hatası oluştu.',
      user: {} as AdminUsers
    };
  }
};

export default { login };