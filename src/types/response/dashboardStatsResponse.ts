export interface DashboardStatsResponse {
    totalArticles?: number | string;
    totalViews?: number | string;
    unreadMessages?: number | string;
}

export interface DashboardData {
    stats: {
        totalArticles: number;
        totalViews: number;
        unreadMessages: number;
    };
    recentMessages: any[];
}