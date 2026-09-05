export interface SiteMapArticle {
    slug: string;
    language?: string;
    created_at?: string | Date;
    updated_at?: string | Date;
    published_at?: string | Date | null;
}

export interface StaticPage {
    url: string;
    changefreq: 'always' | 'hourly' | 'daily' | 'weekly' | 'monthly' | 'yearly' | 'never';
    priority: string;
}