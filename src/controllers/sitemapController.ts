import { Request, Response } from "express";
import { pool, dbQueries } from "../config/db";
import { env } from "../config/env";

interface SitemapArticle {
    slug: string;
    created_at?: string | Date;
    updated_at?: string | Date;
}

export const getSitemap = async (req: Request, res: Response) => {
    try {
        const baseUrl = env.SITE_URL || "https://mahmuttuysuz.net";
        const articles = (await pool.query(
            dbQueries.articles.getSitemap,
        )) as SitemapArticle[];

        const staticPages = [
            { url: "/", changefreq: "daily", priority: "1.0" },
            { url: "/blog", changefreq: "daily", priority: "0.9" },
            { url: "/?lang=en", changefreq: "weekly", priority: "0.8" },
        ];

        let xml = `<?xml version="1.0" encoding="UTF-8"?>\n`;
        xml += `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n`;

        staticPages.forEach((page) => {
            xml += `  <url>\n`;
            xml += `    <loc>${baseUrl}${page.url}</loc>\n`;
            xml += `    <lastmod>${new Date().toISOString()}</lastmod>\n`;
            xml += `    <changefreq>${page.changefreq}</changefreq>\n`;
            xml += `    <priority>${page.priority}</priority>\n`;
            xml += `  </url>\n`;
        });

        if (articles && articles.length > 0) {
            articles.forEach((article) => {
                const lastModDate =
                    article.updated_at || article.created_at || new Date();

                xml += `  <url>\n`;
                xml += `    <loc>${baseUrl}/blog/${article.slug}</loc>\n`;
                xml += `    <lastmod>${new Date(lastModDate).toISOString()}</lastmod>\n`;
                xml += `    <changefreq>weekly</changefreq>\n`;
                xml += `    <priority>0.8</priority>\n`;
                xml += `  </url>\n`;
            });
        }

        xml += `</urlset>`;

        res.header("Content-Type", "application/xml");
        res.header("Cache-Control", "public, max-age=3600");
        return res.send(xml);
    } catch (err) {
        console.error("❌ Sitemap Oluşturma Hatası:", err);
        return res.status(500).send("Sitemap üretilirken bir hata oluştu.");
    }
};
