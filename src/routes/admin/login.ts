import express, { Request, Response } from 'express';
import { formLimiter } from '../../config/rate-limit';
import loginController from '../../controllers/admin/loginController';

const router = express.Router();

// Login Sayfası
router.get('/', (req: Request, res: Response) => {
  if (req.session.adminUser) {
    return res.redirect(req.adminEndpoint || '/admin');
  }
  return res.render('admin/login', { error: null });
});

// Login İşlemi
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

    if (!checkLogin.success || !checkLogin.user) {
      return res.render('admin/login', { error: checkLogin.error });
    }

    const adminUser = {
      id: checkLogin.user.id,
      username: checkLogin.user.username
    };
    const redirectUrl = req.session.returnTo || req.adminEndpoint || '/admin';

    return req.session.regenerate((regenErr) => {
      if (regenErr) {
        console.error('Oturum yenileme hatası:', regenErr);
        return res.render('admin/login', { error: 'Giriş yapılırken bir hata oluştu.' });
      }

      req.session.adminUser = adminUser;

      req.session.save((saveErr) => {
        if (saveErr) {
          console.error('Oturum kaydetme hatası:', saveErr);
          return res.render('admin/login', { error: 'Giriş yapılırken bir hata oluştu.' });
        }

        return res.redirect(redirectUrl);
      });
    });
  } catch (err) {
    console.error('Login İşlem Hatası:', err);
    return res.render('admin/login', { error: 'Giriş yapılırken bir hata oluştu.' });
  }
});

// Oturumu Kapatma
router.get('/destroy', (req: Request, res: Response) => {
  const adminEndpoint = req.adminEndpoint || '/admin';
  req.session.destroy((_err) => {
    res.redirect(`${adminEndpoint}/login`);
  });
});

export default router;