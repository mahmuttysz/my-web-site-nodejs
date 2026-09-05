import { Request, Response } from 'express';
import { query, dbQueries } from '../config/db';
import { env } from '../config/env';
import { buildSiteMapXml } from '../utils/sitemapXml';
import { SiteMapArticle } from '../types/response/siteMapResponse';

export const generateSiteMap = async (_req: Request, res: Response) => {
  try {
    const baseUrl = (env.SITE_URL || 'https://mahmuttuysuz.net').replace(/\/$/, '');
    const articles = await query<SiteMapArticle[]>(dbQueries.articles.getSitemap);
    const xml = buildSiteMapXml(baseUrl, articles || [], new Date().toISOString());

    res.header('Content-Type', 'application/xml; charset=utf-8');
    res.header('Cache-Control', 'public, max-age=3600');
    return res.send(xml);
  } catch (err) {
    console.error('❌ Sitemap Oluşturma Hatası:', err);
    return res.status(500).send('Sitemap üretilirken bir hata oluştu.');
  }
};

export default { generateSiteMap };
