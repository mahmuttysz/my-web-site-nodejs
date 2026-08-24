import express, { Request, Response } from 'express';
import messagesController from '../../controllers/admin/messagesController';

const router = express.Router();

// Gelen Mesajlar Ekranı
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

// Mesaj Silme İşlemi
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