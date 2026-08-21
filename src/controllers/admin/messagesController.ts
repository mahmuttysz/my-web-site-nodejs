import { Request, Response } from 'express';
import { pool, dbQueries } from '../../config/db';

export const getAllMessages = async (req: Request, res: Response) => {
    try {
        const messages = await pool.query(dbQueries.contacts.getAll);

        // Listeleme gerçekleştiğinde mesajları okundu olarak işaretle
        await pool.query(dbQueries.contacts.markedAsRead);

        return res.json({
            success: true,
            data: messages || []
        });
    } catch (err) {
        console.error('❌ Mesajlar listelenirken hata:', err);
        return res.status(500).json({
            success: false,
            message: 'Sunucu hatası oluştu.'
        });
    }
};

export const deleteMessage = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        await pool.query(dbQueries.contacts.delete, [id]);

        return res.json({
            success: true,
            message: 'Mesaj başarıyla silindi.'
        });
    } catch (err: any) {
        console.error('❌ Mesaj silinirken hata:', err);
        return res.status(500).json({
            success: false,
            message: err.message || 'Sunucu hatası oluştu.'
        });
    }
};