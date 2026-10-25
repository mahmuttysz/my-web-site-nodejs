import express, { Request, Response } from 'express';
import { formLimiter } from '../../config/rate-limit';
import loginController from '../../controllers/admin/loginController';
import { verifyCsrf } from '../../middlewares/csrf';
import { getClientIp, getUserAgent, logAudit } from '../../utils/auditLogger';

const router = express.Router();

// Login Sayfası
router.get('/', (req: Request, res: Response) => {
  if (req.session.adminUser) {
    return res.redirect(req.adminEndpoint || '/admin');
  }
  return res.render('admin/login', { error: null });
});

// Login İşlemi
router.post('/', formLimiter, verifyCsrf, async (req: Request, res: Response) => {
  const { username, password } = req.body;

  try {
    const clientIp = getClientIp(req);
    const userAgent = getUserAgent(req);

    const checkLogin = await loginController.login(username, password, clientIp);

    if (!checkLogin.success || !checkLogin.user) {
      void logAudit({
        username: typeof username === 'string' ? username : null,
        action: 'LOGIN_FAILED',
        description: `Hatalı giriş denemesi (${checkLogin.error || 'Geçersiz kimlik'})`,
        ip: clientIp,
        userAgent
      });
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

        void logAudit({
          userId: adminUser.id,
          username: adminUser.username,
          action: 'LOGIN_SUCCESS',
          description: 'Yönetici oturumu başarıyla açıldı',
          ip: clientIp,
          userAgent
        });

        return res.redirect(redirectUrl);
      });
    });
  } catch (err) {
    console.error('Login İşlem Hatası:', err);
    return res.render('admin/login', { error: 'Giriş yapılırken bir hata oluştu.' });
  }
});

// Oturumu Kapatma
router.post('/destroy', verifyCsrf, (req: Request, res: Response) => {
  const adminEndpoint = req.adminEndpoint || '/admin';
  const adminUser = req.session?.adminUser;

  if (adminUser) {
    void logAudit({
      userId: adminUser.id,
      username: adminUser.username,
      action: 'LOGOUT',
      description: 'Yönetici oturumu kapatıldı',
      ip: getClientIp(req),
      userAgent: getUserAgent(req)
    });
  }

  req.session.destroy((_err) => {
    res.redirect(`${adminEndpoint}/login`);
  });
});

export default router;