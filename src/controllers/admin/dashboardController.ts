import { Request, Response } from 'express';
import { pool, dbQueries, adminPanel } from '../../config/db';

export const getDashboard = async (req: Request, res: Response) => {
    try {
        const [statsResult, recentMessages] = await Promise.all([
            pool.query(adminPanel.dashboard),
            pool.query(dbQueries.contacts.getLastFive)
        ]);

        const stats = statsResult?.[0] || {};

        return res.json({
            success: true,
            data: {
                stats: {
                    totalArticles: parseInt(stats.totalArticles || '0', 10),
                    totalViews: parseInt(stats.totalViews || '0', 10),
                    unreadMessages: parseInt(stats.unreadMessages || '0', 10)
                },
                recentMessages: recentMessages || []
            }
        });
    } catch (err) {
        console.error('❌ Dashboard yükleme hatası:', err);
        return res.status(500).json({
            success: false,
            message: 'Sunucu hatası oluştu.'
        });
    }
};