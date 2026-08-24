// src/routes/admin/login.ts
import express, { Request, Response } from 'express';
import { formLimiter } from '../../config/rate-limit';
import loginController from '../../controllers/admin/loginController';

const router = express.Router();

router.get('/', (req: Request, res: Response) => {
  if (req.session.adminUser) {
    return res.redirect(req.adminEndpoint || '/admin');
  }
  return res.render('admin/login', { error: null });
});

router.post('/', formLimiter, async (req: Request, res: Response) => {
  const { username, password } = req.body;

  try {
    const xForwardedFor = req.headers['x-forwarded-for'];
    const xForwardedIp = Array.isArray(xForwardedFor)
      ? xForwardedFor[0]
      : xForwardedFor?.split(',')[0];

    const clientIp =
      (req.headers['cf-connecting-ip'] as string) ||
      xForwardedIp ||
      req.ip ||
      '';
    const checkLogin = await loginController.login(username, password, clientIp);

    if (checkLogin.success) {
      req.session.adminUser = {
        id: checkLogin.user.id,
        username: checkLogin.user.username
      };
    } else {
      return res.render('admin/login', checkLogin)
    }

    const redirectUrl = req.session.returnTo || req.adminEndpoint || '/admin';
    delete req.session.returnTo;

    return res.redirect(redirectUrl);
  } catch (err) {
    console.error('Login Hatası:', err);
    return res.render('admin/login', { error: 'Veritabanı hatası oluştu.' });
  }
});

router.get('/destroy', (req: Request, res: Response) => {
  const adminEndpoint = req.adminEndpoint || '/admin';
  req.session.destroy((_err) => {
    res.redirect(`${adminEndpoint}/login`);
  });
});

export default router;