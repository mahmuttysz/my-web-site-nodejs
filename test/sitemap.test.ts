import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { buildSiteMapXml } from '../src/utils/sitemapXml';

describe('sitemap xml', () => {
    it('emits hreflang pairs for static pages and translated slugs', () => {
        const xml = buildSiteMapXml(
            'https://mahmuttuysuz.net',
            [
                {
                    slug: 'hello',
                    language: 'tr',
                    created_at: '2026-01-01T00:00:00.000Z',
                    published_at: '2026-01-01T00:00:00.000Z'
                },
                {
                    slug: 'hello',
                    language: 'en',
                    created_at: '2026-01-02T00:00:00.000Z',
                    published_at: '2026-01-02T00:00:00.000Z'
                }
            ],
            '2026-09-05T00:00:00.000Z'
        );

        assert.match(xml, /xmlns:xhtml="http:\/\/www.w3.org\/1999\/xhtml"/);
        assert.match(xml, /<loc>https:\/\/mahmuttuysuz.net\/en<\/loc>/);
        assert.match(xml, /hreflang="en" href="https:\/\/mahmuttuysuz.net\/en\/blog\/hello"/);
        assert.match(xml, /hreflang="tr" href="https:\/\/mahmuttuysuz.net\/blog\/hello"/);
        assert.equal(xml.includes('?lang='), false);
    });

    it('keeps slug unique per language in schema migrations', () => {
        const init = fs.readFileSync(path.join('migrations', '001_init.sql'), 'utf8');
        const alter = fs.readFileSync(
            path.join('migrations', '002_article_slug_per_language.sql'),
            'utf8'
        );

        assert.match(init, /UNIQUE INDEX `uk_lang_slug`\(`language` ASC, `slug` ASC\)/);
        assert.match(alter, /uk_lang_slug/);
        assert.match(alter, /DROP INDEX IF EXISTS `uk_slug`/);
    });
});
