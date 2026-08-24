// src/controllers/admin/dashboardController.ts
import { query, queryOne, dbQueries, adminPanel } from '../../config/db';
import Contacts from '../../types/dbTables/contacts';
import { DashboardStatsResponse, DashboardData } from '../../types/response/dashboardStatsResponse';

export const getData = async (): Promise<DashboardData> => {
  const [stats, recentMessages] = await Promise.all([
    queryOne<DashboardStatsResponse>(adminPanel.dashboard),
    query<Contacts[]>(dbQueries.contacts.getLastFive)
  ]);

  return {
    stats: {
      totalArticles: Number(stats?.totalArticles || 0),
      totalViews: Number(stats?.totalViews || 0),
      unreadMessages: Number(stats?.unreadMessages || 0)
    },
    recentMessages: recentMessages || []
  };
};

export default { getData };