import { Request, Response } from 'express';
import { query, dbQueries } from '../config/db';
import { env } from '../config/env';
import { escapeXml } from '../utils/helper';
import { SiteLang, localizePath } from '../utils/i18n';
import locales from '../utils/locales';
import { absoluteUrl, articlePublishDate } from '../utils/seo';

interface RssArticle {
    title: string;
    slug: string;
    excerpt?: string | null;
    content: string;
    language: string;
    published_at?: Date | string | null;
    created_at?: Date | string | null;
    updated_at?: Date | string | null;
}

const plainText = (value?: string | null): string => {
    if (!value) return '';
    return value.replace(/<[^>]*>?/gm, '').replace(/\s+/g, ' ').trim();
};

export const generateRss = async (_req: Request, res: Response) => {
    try {
        const lang = ((res.locals.lang as SiteLang) || 'tr') as SiteLang;
        const siteUrl = (env.SITE_URL || 'https://mahmuttuysuz.net').replace(/\/$/, '');
        const locale = locales[lang] || locales.tr;
        const feedPath = localizePath(lang, '/rss.xml');
        const blogPath = localizePath(lang, '/blog');
        const feedUrl = absoluteUrl(siteUrl, feedPath);
        const blogUrl = absoluteUrl(siteUrl, blogPath);
        const articles = await query<RssArticle[]>(dbQueries.articles.getRss, [lang]);

        const items = (articles || [])
            .map((article) => {
                const link = absoluteUrl(siteUrl, localizePath(lang, `/blog/${article.slug}`));
                const pubDate = new Date(articlePublishDate(article) || Date.now()).toUTCString();
                const description = escapeXml(
                    article.excerpt?.trim() || plainText(article.content).slice(0, 280)
                );

                return `    <item>
      <title>${escapeXml(article.title)}</title>
      <link>${escapeXml(link)}</link>
      <guid isPermaLink="true">${escapeXml(link)}</guid>
      <pubDate>${pubDate}</pubDate>
      <description>${description}</description>
    </item>`;
            })
            .join('\n');

        const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${escapeXml(`Mahmut Tüysüz — ${locale.nav.blog}`)}</title>
    <link>${escapeXml(blogUrl)}</link>
    <description>${escapeXml(locale.nav.blogDescription)}</description>
    <language>${lang}</language>
    <atom:link href="${escapeXml(feedUrl)}" rel="self" type="application/rss+xml"/>
${items}
  </channel>
</rss>`;

        res.header('Content-Type', 'application/rss+xml; charset=utf-8');
        res.header('Cache-Control', 'public, max-age=3600');
        return res.send(xml);
    } catch (err) {
        console.error('❌ RSS oluşturma hatası:', err);
        return res.status(500).send('RSS üretilirken bir hata oluştu.');
    }
};

export default { generateRss };
