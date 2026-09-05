import { Request, Response } from 'express';
import { query, dbQueries } from '../config/db';
import { env } from '../config/env';
import { buildSiteMapXml } from '../utils/sitemapXml';
import { SiteMapArticle } from '../types/response/siteMapResponse';

export const generateSiteMap = async (_req: Request, res: Response) => {
  try {
    const baseUrl = (env.SITE_URL || 'https://mahmuttuysuz.net').replace(/\/$/, '');
    const rows = await query<SiteMapArticle[]>(dbQueries.articles.getSitemap);
    const articles = Array.isArray(rows) ? rows : [];
    const xml = buildSiteMapXml(baseUrl, articles, new Date().toISOString());

    res.removeHeader('Content-Security-Policy');
    res.removeHeader('Content-Security-Policy-Report-Only');
    res.status(200);
    res.setHeader('Content-Type', 'application/xml; charset=utf-8');
    res.setHeader('Cache-Control', 'public, max-age=3600');
    res.setHeader('X-Content-Type-Options', 'nosniff');
    return res.end(xml);
  } catch (err) {
    console.error('❌ Sitemap Oluşturma Hatası:', err);
    return res.status(500).send('Sitemap üretilirken bir hata oluştu.');
  }
};

export default { generateSiteMap };
