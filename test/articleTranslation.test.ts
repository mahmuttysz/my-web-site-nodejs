import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
    articleLang,
    findSiblingInList,
    hasNowWorking,
    otherArticleLang
} from '../src/utils/articleTranslation';

describe('article translation', () => {
    it('maps unknown languages to tr and flips the other locale', () => {
        assert.equal(articleLang('en'), 'en');
        assert.equal(articleLang('tr'), 'tr');
        assert.equal(articleLang('de'), 'tr');
        assert.equal(otherArticleLang('tr'), 'en');
        assert.equal(otherArticleLang('en'), 'tr');
    });

    it('pairs articles that share a slug across languages', () => {
        const articles = [
            { id: 1, slug: 'versus-backend', language: 'tr' },
            { id: 2, slug: 'versus-backend', language: 'en' },
            { id: 3, slug: 'other', language: 'tr' }
        ];

        assert.deepEqual(findSiblingInList(articles, articles[0]), articles[1]);
        assert.deepEqual(findSiblingInList(articles, articles[1]), articles[0]);
        assert.equal(findSiblingInList(articles, articles[2]), null);
    });
});

describe('now working', () => {
    it('hides the homepage block when the blurb is empty', () => {
        assert.equal(hasNowWorking(null), false);
        assert.equal(hasNowWorking(''), false);
        assert.equal(hasNowWorking('   '), false);
        assert.equal(hasNowWorking('Socket.IO versus backend'), true);
    });
});
