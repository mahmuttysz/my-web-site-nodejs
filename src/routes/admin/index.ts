import { Router, Request, Response, NextFunction } from 'express';
import { env } from '../../config/env';
import { isAdmin } from '../../middleware/auth';

import loginRouter from './login';
import dashboardRouter from './dashboard';
import aboutMeRouter from './about-me';
import articlesRouter from './articles';
import experiencesRouter from './experiences';
import messagesRouter from './messages';
import projectsRouter from './projects';
import socialMediasRouter from './social-medias';

const router = Router();
const adminEndpoint = env.ADMIN_PANEL_ENDPOINT || '/admin';

router.use((req: Request, res: Response, next: NextFunction) => {
    res.locals.adminEndpoint = adminEndpoint;
    (req as any).adminEndpoint = adminEndpoint;
    next();
});

// Açık Rotalar (Yetkilendirme Öncesi)
router.use('/login', loginRouter);

// Yetkilendirme Katmanı (Session Check)
router.use(isAdmin);

// Korumalı Admin Rotaları
router.use('/about-me', aboutMeRouter);
router.use('/articles', articlesRouter);
router.use('/experiences', experiencesRouter);
router.use('/messages', messagesRouter);
router.use('/projects', projectsRouter);
router.use('/social-medias', socialMediasRouter);
router.use('/dashboard', dashboardRouter);

export default router;