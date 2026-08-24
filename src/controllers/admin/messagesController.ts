// src/routes/admin/messages.ts
import express, { Request, Response } from 'express';
import { pool, dbQueries } from '../../config/db';

const router = express.Router();

router.get('/', async (req: Request, res: Response) => {
    try {
        const messages = await pool.query(dbQueries.contacts.getAll);
        await pool.query(dbQueries.contacts.markedAsRead);

        return res.render('admin/messages', {
            title: 'Gelen Mesajlar',
            user: req.session.adminUser,
            messages
        });
    } catch (err) {
        console.error('Mesajlar listelenirken hata:', err);
        return res.status(500).send('Sunucu hatası');
    }
});

router.post('/delete/:id', async (req: Request, res: Response) => {
    try {
        await pool.query(dbQueries.contacts.delete, [req.params.id]);
        return res.json({ success: true });
    } catch (err: any) {
        return res.status(500).json({
            success: false,
            error: err?.message || 'Bir hata oluştu.'
        });
    }
});

export default router;