import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import { pool, dbQueries } from '../../config/db';

export const checkAuthStatus = (req: Request, res: Response) => {
    const session = req.session as any;

    if (session && session.adminUser) {
        return res.json({
            authenticated: true,
            user: session.adminUser
        });
    }

    return res.json({
        authenticated: false
    });
};

export const login = async (req: Request, res: Response) => {
    const { username, password } = req.body || {};

    try {
        if (!username || !password) {
            return res.status(400).json({
                success: false,
                message: 'Kullanıcı adı ve şifre zorunludur.'
            });
        }

        const clientIp =
            (req.headers['cf-connecting-ip'] as string) ||
            (req.headers['x-forwarded-for'] as string)?.split(',')[0] ||
            req.ip ||
            '';

        const users = await pool.query(dbQueries.adminUsers.getByUsername, [username]);

        if (!users || users.length === 0) {
            return res.status(401).json({
                success: false,
                message: 'Kullanıcı adı veya şifre hatalı.'
            });
        }

        const user = users[0];
        const match = await bcrypt.compare(password, user.password_hash);

        if (!match) {
            await pool.query(dbQueries.adminUsers.wrongTryUpdate, [new Date(), clientIp, user.id]);
            return res.status(401).json({
                success: false,
                message: 'Kullanıcı adı veya şifre hatalı.'
            });
        }

        const session = req.session as any;
        session.adminUser = {
            id: user.id,
            username: user.username
        };

        await pool.query(dbQueries.adminUsers.successLoginUpdate, [new Date(), clientIp, user.id]);

        const redirectUrl = session.returnTo || (req as any).adminEndpoint || '/admin';
        delete session.returnTo;

        return res.json({
            success: true,
            message: 'Giriş başarılı.',
            redirectTo: redirectUrl,
            user: {
                id: user.id,
                username: user.username
            }
        });
    } catch (err) {
        console.error('❌ Login Hatası:', err);
        return res.status(500).json({
            success: false,
            message: 'Veritabanı hatası oluştu.'
        });
    }
};

export const logout = (req: Request, res: Response) => {
    req.session.destroy((err) => {
        if (err) {
            console.error('❌ Session destroy hatası:', err);
            return res.status(500).json({
                success: false,
                message: 'Oturum kapatılırken bir sorun oluştu.'
            });
        }

        res.clearCookie('sid_admin');
        return res.json({
            success: true,
            message: 'Oturum başarıyla kapatıldı.'
        });
    });
};