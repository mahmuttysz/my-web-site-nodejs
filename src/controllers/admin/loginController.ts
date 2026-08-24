// src/routes/admin/login.ts
import bcrypt from 'bcrypt';
import { pool, dbQueries, queryOne } from '../../config/db';
import AdminUsers from '../../types/dbTables/adminUsers';
import LoginResponse from '../../types/response/loginResponse';

export const login = async (username: string, password: string, clientIp: string) => {
  try {
    const user = await queryOne<AdminUsers>(dbQueries.adminUsers.getByUsername, [username]);

    if (user === null) {
      return <LoginResponse>{
        success: false,
        error: 'Kullanıcı adı veya şifre hatalı.',
        user: <AdminUsers>{}
      };
    }
    const match = await bcrypt.compare(password, user.password_hash);

    if (!match) {
      await pool.query(dbQueries.adminUsers.wrongTryUpdate, [
        new Date(),
        clientIp,
        user.id
      ]);
      return <LoginResponse>{
        success: false,
        error: 'Kullanıcı adı veya şifre hatalı.',
        user: <AdminUsers>{}
      };
    }

    await pool.query(dbQueries.adminUsers.successLoginUpdate, [
      new Date(),
      clientIp,
      user.id
    ]);

    return <LoginResponse>{
      success: true,
      error: 'Giriş başarılı.',
      user
    };
  } catch (err) {
    console.error('Login Hatası:', err);
    return <LoginResponse>{
      success: false,
      error: 'Veritabanı hatası oluştu.',
      user: <AdminUsers>{}
    };
  }
};


export default { login };