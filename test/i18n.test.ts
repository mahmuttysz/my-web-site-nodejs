import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
    isSiteLang,
    localizePath,
    otherLang,
    stripLocalePrefix,
    switchLocalePath
} from '../src/utils/i18n';

describe('i18n', () => {
    it('rejects unknown language codes', () => {
        assert.equal(isSiteLang('tr'), true);
        assert.equal(isSiteLang('en'), true);
        assert.equal(isSiteLang('de'), false);
        assert.equal(isSiteLang('EN'), false);
    });

    it('prefixes English paths and leaves Turkish unprefixed', () => {
        assert.equal(localizePath('tr', '/'), '/');
        assert.equal(localizePath('en', '/'), '/en');
        assert.equal(localizePath('tr', '/blog/hello'), '/blog/hello');
        assert.equal(localizePath('en', '/blog/hello'), '/en/blog/hello');
        assert.equal(localizePath('en', '/en/blog/hello'), '/en/blog/hello');
    });

    it('strips the /en prefix and switches locales on a path', () => {
        assert.deepEqual(stripLocalePrefix('/en/blog'), { lang: 'en', path: '/blog' });
        assert.deepEqual(stripLocalePrefix('/blog'), { lang: 'tr', path: '/blog' });
        assert.equal(switchLocalePath('/blog/x', 'en'), '/en/blog/x');
        assert.equal(switchLocalePath('/en/blog/x', 'tr'), '/blog/x');
        assert.equal(otherLang('tr'), 'en');
    });
});
