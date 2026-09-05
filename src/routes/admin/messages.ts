import express, { Request, Response } from 'express';
import messagesController from '../../controllers/admin/messagesController';

const router = express.Router();

router.get('/', async (req: Request, res: Response) => {
    try {
        const messages = await messagesController.getMessages();

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

router.post('/read', async (req: Request, res: Response) => {
    try {
        const ids = await messagesController.markMessagesRead(req.body?.ids);
        if (ids.length === 0) {
            return res.status(400).json({ success: false, error: 'Mesaj seçilmedi.' });
        }

        return res.json({ success: true, ids });
    } catch (err: any) {
        console.error('Mesaj okundu işaretleme hatası:', err);
        return res.status(500).json({
            success: false,
            error: err?.message || 'Bir hata oluştu.'
        });
    }
});

router.post('/read/:id', async (req: Request, res: Response) => {
    try {
        const ids = await messagesController.markMessagesRead(req.params.id);
        if (ids.length === 0) {
            return res.status(400).json({ success: false, error: 'Geçersiz mesaj.' });
        }

        return res.json({ success: true, ids });
    } catch (err: any) {
        console.error('Mesaj okundu işaretleme hatası:', err);
        return res.status(500).json({
            success: false,
            error: err?.message || 'Bir hata oluştu.'
        });
    }
});

router.post('/delete/:id', async (req: Request, res: Response) => {
    try {
        const contactId = Number(req.params.id || '0');
        await messagesController.deleteMessage(contactId);

        return res.json({ success: true });
    } catch (err: any) {
        console.error('Mesaj silme hatası:', err);
        return res.status(500).json({
            success: false,
            error: err?.message || 'Bir hata oluştu.'
        });
    }
});

export default router;
