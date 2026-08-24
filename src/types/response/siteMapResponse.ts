export interface SiteMapArticle {
    slug: string;
    created_at?: string | Date;
    updated_at?: string | Date;
}

export interface StaticPage {
    url: string;
    changefreq: 'always' | 'hourly' | 'daily' | 'weekly' | 'monthly' | 'yearly' | 'never';
    priority: string;
}