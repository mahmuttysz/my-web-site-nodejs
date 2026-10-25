// src/routes/admin/logs.ts
import express, { Request, Response } from 'express';
import { env } from '../../config/env';
import logsController from '../../controllers/admin/logsController';
import { logAdminAction } from '../../utils/auditLogger';

const router = express.Router();

router.get('/', async (req: Request, res: Response) => {
    try {
        const logs = await logsController.getLogs();

        return res.render('admin/logs', {
            title: 'İşlem & Güvenlik Logları',
            user: req.session.adminUser,
            logs
        });
    } catch (err) {
        console.error('Audit logları listelenirken hata:', err);
        return res.status(500).send('Sunucu hatası');
    }
});

router.post('/clean', async (req: Request, res: Response) => {
    const adminEndpoint = req.adminEndpoint || env.ADMIN_PANEL_ENDPOINT || '/admin';
    const days = parseInt(req.body?.days, 10) || 60;

    try {
        const deletedCount = await logsController.cleanLogs(days);

        logAdminAction(req, 'LOGS_CLEANED', `${days} günden eski ${deletedCount} adet log temizlendi.`, {
            retentionDays: days,
            deletedCount
        });

        return res.redirect(`${adminEndpoint}/logs`);
    } catch (err) {
        console.error('Audit log temizleme hatası:', err);
        return res.redirect(`${adminEndpoint}/logs`);
    }
});

export default router;
