// src/routes/admin/dashboard.ts
import { pool, dbQueries, adminPanel } from '../../config/db';
import DashboardStatsResponse from '../../types/response/dashboardStatsResponse';

export const getData = async () => {
    try {
        const [statsResult, recentMessages] = await Promise.all([
            pool.query(adminPanel.dashboard),
            pool.query(dbQueries.contacts.getLastFive)
        ]);

        const stats = (statsResult as DashboardStatsResponse[])?.[0];

        return {
            stats: {
                totalArticles: parseInt(String(stats?.totalArticles || 0), 10),
                totalViews: parseInt(String(stats?.totalViews || 0), 10),
                unreadMessages: parseInt(String(stats?.unreadMessages || 0), 10)
            },
            recentMessages: recentMessages || []
        };
    } catch (err) {
        console.error('Dashboard yükleme hatası:', err);
        return {};
    }
};

export default { getData };