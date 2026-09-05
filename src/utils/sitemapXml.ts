import { escapeXml } from './helper';
import { DEFAULT_LANG, SiteLang, localizePath } from './i18n';
import { absoluteUrl, articlePublishDate, toIsoDate } from './seo';
import { SiteMapArticle, StaticPage } from '../types/response/siteMapResponse';

const xhtmlLinks = (siteUrl: string, path: string, langs: SiteLang[]): string => {
    const unique = [...new Set(langs)];
    const links = unique.map(
        (lang) =>
            `    <xhtml:link rel="alternate" hreflang="${lang}" href="${escapeXml(absoluteUrl(siteUrl, localizePath(lang, path)))}"/>`
    );

    const defaultLang = unique.includes(DEFAULT_LANG) ? DEFAULT_LANG : unique[0];
    if (defaultLang) {
        links.push(
            `    <xhtml:link rel="alternate" hreflang="x-default" href="${escapeXml(absoluteUrl(siteUrl, localizePath(defaultLang, path)))}"/>`
        );
    }

    return links.join('\n');
};

export const sitemapUrlEntry = (
    siteUrl: string,
    path: string,
    lang: SiteLang,
    lastmod: string,
    changefreq: string,
    priority: string,
    langs: SiteLang[]
): string => {
    const loc = absoluteUrl(siteUrl, localizePath(lang, path));
    return `  <url>
    <loc>${escapeXml(loc)}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>${changefreq}</changefreq>
    <priority>${priority}</priority>
${xhtmlLinks(siteUrl, path, langs)}
  </url>`;
};

export const buildSiteMapXml = (
    siteUrl: string,
    articles: SiteMapArticle[],
    nowIso: string
): string => {
    const staticPages: StaticPage[] = [
        { url: '/', changefreq: 'daily', priority: '1.0' },
        { url: '/blog', changefreq: 'daily', priority: '0.9' }
    ];
    const staticLangs: SiteLang[] = ['tr', 'en'];

    const staticXml = staticPages
        .flatMap((page) =>
            staticLangs.map((lang) =>
                sitemapUrlEntry(siteUrl, page.url, lang, nowIso, page.changefreq, page.priority, staticLangs)
            )
        )
        .join('\n');

    const articlesBySlug = new Map<string, SiteMapArticle[]>();
    for (const article of articles || []) {
        const slug = article.slug;
        if (!slug) continue;
        const list = articlesBySlug.get(slug) || [];
        list.push(article);
        articlesBySlug.set(slug, list);
    }

    const articlesXml = [...articlesBySlug.values()]
        .flatMap((versions) => {
            const langs = versions
                .map((item) => item.language)
                .filter((item): item is SiteLang => item === 'tr' || item === 'en');
            const uniqueLangs = [...new Set(langs)];

            return versions.map((article) => {
                const lang: SiteLang = article.language === 'en' ? 'en' : 'tr';
                const lastMod =
                    toIsoDate(article.updated_at || articlePublishDate(article) || article.created_at) ||
                    nowIso;
                return sitemapUrlEntry(
                    siteUrl,
                    `/blog/${article.slug}`,
                    lang,
                    lastMod,
                    'weekly',
                    '0.8',
                    uniqueLangs.length ? uniqueLangs : [lang]
                );
            });
        })
        .join('\n');

    return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:xhtml="http://www.w3.org/1999/xhtml">
${staticXml}
${articlesXml}
</urlset>`;
};
