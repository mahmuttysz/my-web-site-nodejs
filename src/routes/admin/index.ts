// src/routes/admin/index.ts
import express, { Request, Response, NextFunction } from 'express';
import { env } from '../../config/env';
import { isAdmin } from '../../middlewares/auth';

import loginRouter from './login';
import dashboardRouter from './dashboard';
import aboutMeRouter from './about-me';
import articlesRouter from './articles';
import experiencesRouter from './experiences';
import messagesRouter from './messages';
import projectsRouter from './projects';
import socialMediasRouter from './social-medias';

// Express Request nesnesine adminEndpoint özelliğini ekleyerek tip güvenliği sağlıyoruz
declare global {
    namespace Express {
        interface Request {
            adminEndpoint?: string;
        }
    }
}

const router = express.Router();
const adminEndpoint = env.ADMIN_PANEL_ENDPOINT || '/admin';

router.use((req: Request, res: Response, next: NextFunction) => {
    res.locals.adminEndpoint = adminEndpoint;
    req.adminEndpoint = adminEndpoint;
    next();
});

router.use('/login', loginRouter);

router.use(isAdmin);

router.use('/about-me', aboutMeRouter);
router.use('/articles', articlesRouter);
router.use('/experiences', experiencesRouter);
router.use('/messages', messagesRouter);
router.use('/projects', projectsRouter);
router.use('/social-medias', socialMediasRouter);
router.use('/', dashboardRouter);

export default router;