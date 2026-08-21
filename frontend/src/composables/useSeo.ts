export interface SeoOptions {
  title?: string;
  description?: string;
  image?: string;
  type?: 'website' | 'article';
  noindex?: boolean;
}

export function useSeo(options: SeoOptions = {}) {
  const pageTitle = options.title ? `${options.title} | Admin Panel` : 'Admin Panel | Mahmut Tüysüz';

  document.title = pageTitle;

  const setMeta = (attr: string, value: string, content: string) => {
    let el = document.querySelector(`meta[${attr}="${value}"]`);
    if (!el) {
      el = document.createElement('meta');
      el.setAttribute(attr, value);
      document.head.appendChild(el);
    }
    el.setAttribute('content', content);
  };

  // Admin sayfaları için arama motoru engelleme
  if (options.noindex) {
    setMeta('name', 'robots', 'noindex, nofollow, noarchive');
  } else {
    setMeta('name', 'robots', 'index, follow');
  }

  if (options.description) {
    setMeta('name', 'description', options.description);
  }
}