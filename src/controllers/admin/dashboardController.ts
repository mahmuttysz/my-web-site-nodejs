// src/controllers/admin/dashboardController.ts
import { query, queryOne, dbQueries, adminPanel } from '../../config/db';
import Contacts from '../../types/dbTables/contacts';
import { DashboardStatsResponse, DashboardData } from '../../types/response/dashboardStatsResponse';
import { pendingHitsMap } from '../../utils/articleHitStore';
import { sumPendingHits } from '../../utils/articleHits';

export const getData = async (): Promise<DashboardData> => {
  const [stats, recentMessages, pending] = await Promise.all([
    queryOne<DashboardStatsResponse>(adminPanel.dashboard),
    query<Contacts[]>(dbQueries.contacts.getLastFive),
    pendingHitsMap()
  ]);

  return {
    stats: {
      totalArticles: Number(stats?.totalArticles || 0),
      totalViews: Number(stats?.totalViews || 0) + sumPendingHits(pending),
      unreadMessages: Number(stats?.unreadMessages || 0)
    },
    recentMessages: recentMessages || []
  };
};

export default { getData };