import { Response } from 'express';
import Articles from '../types/dbTables/articles';
import locales from './locales';
import { DEFAULT_LANG, SiteLang, localizePath, otherLang } from './i18n';

export interface SeoHreflang {
    hreflang: string;
    href: string;
}

export interface SeoLocals {
    canonical: string;
    hreflangs: SeoHreflang[];
    jsonLd: Record<string, unknown>;
    rssHref: string;
    ogLocale: string;
    ogLocaleAlternate: string;
}

const PERSON_NAME = 'Mahmut Tüysüz';

export const absoluteUrl = (siteUrl: string, pathOrUrl: string): string => {
    if (!pathOrUrl) return siteUrl.replace(/\/$/, '');
    if (/^https?:\/\//i.test(pathOrUrl)) return pathOrUrl;
    const path = pathOrUrl.startsWith('/') ? pathOrUrl : `/${pathOrUrl}`;
    return `${siteUrl.replace(/\/$/, '')}${path}`;
};

export const toIsoDate = (value?: Date | string | null): string | undefined => {
    if (!value) return undefined;
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return undefined;
    return date.toISOString();
};

export const articlePublishDate = (article: {
    published_at?: Date | string | null;
    created_at?: Date | string | null;
}): Date | string | null => article.published_at || article.created_at || null;

const ogLocaleOf = (lang: SiteLang): string => (lang === 'en' ? 'en_US' : 'tr_TR');

const htmlLangOf = (lang: SiteLang): string => (lang === 'en' ? 'en-US' : 'tr-TR');

const pageUrl = (siteUrl: string, lang: SiteLang, path: string): string =>
    absoluteUrl(siteUrl, localizePath(lang, path));

const buildHreflangs = (
    siteUrl: string,
    path: string,
    langs: SiteLang[]
): SeoHreflang[] => {
    const unique = [...new Set(langs)];
    const links: SeoHreflang[] = unique.map((lang) => ({
        hreflang: lang,
        href: pageUrl(siteUrl, lang, path)
    }));

    const defaultLang = unique.includes(DEFAULT_LANG) ? DEFAULT_LANG : unique[0];
    if (defaultLang) {
        links.push({
            hreflang: 'x-default',
            href: pageUrl(siteUrl, defaultLang, path)
        });
    }

    return links;
};

const personJsonLd = (siteUrl: string, lang: SiteLang) => {
    const t = locales[lang] || locales.tr;
    return {
        '@type': 'Person',
        name: PERSON_NAME,
        url: siteUrl.replace(/\/$/, ''),
        jobTitle: t.hero.badge
    };
};

export const assignSeo = (
    res: Response,
    opts: {
        type: 'home' | 'blog' | 'article';
        path: string;
        article?: Articles | null;
        alternateLangs?: SiteLang[];
    }
): void => {
    const lang = (res.locals.lang as SiteLang) || DEFAULT_LANG;
    const siteUrl = String(res.locals.siteUrl || '').replace(/\/$/, '');
    const path = opts.path;
    const langs = opts.alternateLangs?.length ? opts.alternateLangs : (['tr', 'en'] as SiteLang[]);
    const canonical = pageUrl(siteUrl, lang, path);
    const rssHref = absoluteUrl(siteUrl, localizePath(lang, '/rss.xml'));

    const jsonLdGraph: Record<string, unknown>[] = [
        {
            '@type': 'WebSite',
            name: PERSON_NAME,
            url: siteUrl,
            inLanguage: htmlLangOf(lang),
            publisher: personJsonLd(siteUrl, lang)
        }
    ];

    if (opts.type === 'home') {
        jsonLdGraph.push(personJsonLd(siteUrl, lang));
    }

    if (opts.type === 'article' && opts.article) {
        const image = opts.article.cover_image
            ? absoluteUrl(siteUrl, opts.article.cover_image)
            : absoluteUrl(siteUrl, '/images/banner.jpg');
        const published = toIsoDate(articlePublishDate(opts.article));
        const modified = toIsoDate(opts.article.updated_at) || published;

        jsonLdGraph.push({
            '@type': 'Article',
            headline: opts.article.title,
            description: opts.article.excerpt || undefined,
            image,
            datePublished: published,
            dateModified: modified,
            inLanguage: htmlLangOf((opts.article.language as SiteLang) || lang),
            author: personJsonLd(siteUrl, lang),
            publisher: personJsonLd(siteUrl, lang),
            mainEntityOfPage: canonical,
            url: canonical
        });
    }

    const seo: SeoLocals = {
        canonical,
        hreflangs: buildHreflangs(siteUrl, path, langs),
        jsonLd: {
            '@context': 'https://schema.org',
            '@graph': jsonLdGraph
        },
        rssHref,
        ogLocale: ogLocaleOf(lang),
        ogLocaleAlternate: ogLocaleOf(otherLang(lang))
    };

    res.locals.seo = seo;
};
