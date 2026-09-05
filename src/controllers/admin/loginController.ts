import bcrypt from 'bcrypt';
import { query, queryOne, dbQueries } from '../../config/db';
import AdminUsers from '../../types/dbTables/adminUsers';
import LoginResponse from '../../types/response/loginResponse';
import {
    LOCK_AFTER,
    isLocked,
    lockWindowExpired,
    wrongTryCount
} from '../../utils/loginLock';

const LOCK_MESSAGE = 'Çok fazla hatalı deneme. 15 dakika sonra tekrar deneyin.';
const AUTH_MESSAGE = 'Kullanıcı adı veya şifre hatalı.';

const fail = (error: string): LoginResponse => ({
  success: false,
  error,
  user: {} as AdminUsers
});

export const login = async (
  username: string,
  password: string,
  clientIp: string
): Promise<LoginResponse> => {
  try {
    if (!username || !password) {
      return fail('Kullanıcı adı ve şifre gereklidir.');
    }

    const user = await queryOne<AdminUsers>(dbQueries.adminUsers.getByUsername, [username]);

    if (!user) {
      return fail(AUTH_MESSAGE);
    }

    if (isLocked(user)) {
      return fail(LOCK_MESSAGE);
    }

    if (lockWindowExpired(user)) {
      await query(dbQueries.adminUsers.resetWrongTry, [user.id]);
      user.wrong_try = 0;
      user.last_wrong_try = null;
    }

    const match = await bcrypt.compare(password, user.password_hash);

    if (!match) {
      await query(dbQueries.adminUsers.wrongTryUpdate, [
        new Date(),
        clientIp,
        user.id
      ]);

      const nextTries = wrongTryCount(user) + 1;
      return fail(nextTries >= LOCK_AFTER ? LOCK_MESSAGE : AUTH_MESSAGE);
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
    return fail('Veritabanı hatası oluştu.');
  }
};

export default { login };
