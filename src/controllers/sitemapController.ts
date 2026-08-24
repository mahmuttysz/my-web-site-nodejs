import { Request, Response } from 'express';
import { query, dbQueries } from '../config/db';
import { env } from '../config/env';
import { escapeXml } from '../utils/helper';
import { SiteMapArticle, StaticPage } from '../types/response/siteMapResponse';

export const generateSiteMap = async (req: Request, res: Response) => {
  try {
    const baseUrl = env.SITE_URL || 'https://mahmuttuysuz.net';
    const articles = await query<SiteMapArticle[]>(dbQueries.articles.getSitemap);

    const staticPages: StaticPage[] = [
      { url: '/', changefreq: 'daily', priority: '1.0' },
      { url: '/blog', changefreq: 'daily', priority: '0.9' },
      { url: '/?lang=en', changefreq: 'weekly', priority: '0.8' }
    ];

    const nowIso = new Date().toISOString();

    const staticXml = staticPages
      .map(
        (page) => `  <url>
            <loc>${escapeXml(`${baseUrl}${page.url}`)}</loc>
            <lastmod>${nowIso}</lastmod>
            <changefreq>${page.changefreq}</changefreq>
            <priority>${page.priority}</priority>
        </url>`
      )
      .join('\n');

    const articlesXml = (articles || [])
      .map((article) => {
        const lastModDate = article.updated_at || article.created_at || new Date();
        const dateStr = new Date(lastModDate).toISOString();

        return `  <url>
            <loc>${escapeXml(`${baseUrl}/blog/${article.slug}`)}</loc>
            <lastmod>${dateStr}</lastmod>
            <changefreq>weekly</changefreq>
            <priority>0.8</priority>
        </url>`;
      })
      .join('\n');

    const xml = `<?xml version="1.0" encoding="UTF-8"?>
        <urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
        ${staticXml}
        ${articlesXml}
        </urlset>`.trim();

    res.header('Content-Type', 'application/xml');
    res.header('Cache-Control', 'public, max-age=3600');
    return res.send(xml);
  } catch (err) {
    console.error('❌ Sitemap Oluşturma Hatası:', err);
    return res.status(500).send('Sitemap üretilirken bir hata oluştu.');
  }
};

export default { generateSiteMap };