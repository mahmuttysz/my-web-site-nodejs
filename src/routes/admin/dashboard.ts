// src/routes/admin/dashboard.ts
import express, { Request, Response } from 'express';
import dashboardController from '../../controllers/admin/dashboardController';

const router = express.Router();

router.get('/', async (req: Request, res: Response) => {
    try {
        const data = await dashboardController.getData();

        return res.render('admin/dashboard', {
            title: 'Dashboard',
            user: req.session.adminUser,
            stats: data.stats,
            recentMessages: data.recentMessages || []
        });
    } catch (err) {
        console.error('Dashboard yükleme hatası:', err);
        return res.status(500).send('Sunucu hatası');
    }
});

export default router;