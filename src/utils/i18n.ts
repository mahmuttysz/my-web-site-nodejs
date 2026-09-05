export const SITE_LANGS = ['tr', 'en'] as const;

export type SiteLang = (typeof SITE_LANGS)[number];

export const DEFAULT_LANG: SiteLang = 'tr';

export const isSiteLang = (value: unknown): value is SiteLang =>
    typeof value === 'string' && SITE_LANGS.includes(value as SiteLang);

export const otherLang = (lang: SiteLang): SiteLang => (lang === 'en' ? 'tr' : 'en');

export const localePrefix = (lang: SiteLang): string => (lang === DEFAULT_LANG ? '' : `/${lang}`);

export const stripLocalePrefix = (pathname: string): { lang: SiteLang; path: string } => {
    const clean = pathname.startsWith('/') ? pathname : `/${pathname}`;

    if (clean === '/en' || clean.startsWith('/en/')) {
        const rest = clean.slice(3) || '/';
        return { lang: 'en', path: rest.startsWith('/') ? rest : `/${rest}` };
    }

    return { lang: DEFAULT_LANG, path: clean || '/' };
};

export const localizePath = (lang: SiteLang, path: string): string => {
    const normalized = path.startsWith('/') ? path : `/${path}`;
    const stripped = stripLocalePrefix(normalized).path;
    const prefix = localePrefix(lang);

    if (stripped === '/') {
        return prefix || '/';
    }

    return `${prefix}${stripped}`;
};

export const switchLocalePath = (pathname: string, nextLang: SiteLang): string => {
    return localizePath(nextLang, stripLocalePrefix(pathname).path);
};
