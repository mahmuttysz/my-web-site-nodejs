import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
    hitSeenKey,
    parsePendingHits,
    shouldCountHit,
    sumPendingHits,
    utcDay
} from '../src/utils/articleHits';

const browser = {
    method: 'GET',
    ip: '203.0.113.10',
    headers: { 'user-agent': 'Mozilla/5.0 Chrome/120.0.0.0' }
};

describe('article hits', () => {
    it('counts a normal browser GET once per article/day/ip', () => {
        assert.equal(shouldCountHit(browser), true);
        assert.equal(shouldCountHit({ ...browser, method: 'HEAD' }), false);
        assert.equal(
            hitSeenKey(4, '2026-09-05', '203.0.113.10'),
            hitSeenKey(4, '2026-09-05', '203.0.113.10')
        );
        assert.notEqual(
            hitSeenKey(4, '2026-09-05', '203.0.113.10'),
            hitSeenKey(4, '2026-09-05', '203.0.113.11')
        );
    });

    it('ignores bots, prefetch, and empty user agents', () => {
        assert.equal(shouldCountHit({ ...browser, headers: { 'user-agent': '' } }), false);
        assert.equal(
            shouldCountHit({ ...browser, headers: { 'user-agent': 'Googlebot/2.1' } }),
            false
        );
        assert.equal(
            shouldCountHit({
                ...browser,
                headers: { 'user-agent': browser.headers['user-agent'], 'sec-purpose': 'prefetch' }
            }),
            false
        );
        assert.equal(
            shouldCountHit({
                ...browser,
                headers: { 'user-agent': browser.headers['user-agent'], purpose: 'prefetch' }
            }),
            false
        );
        assert.equal(
            shouldCountHit({
                ...browser,
                headers: { 'user-agent': browser.headers['user-agent'], 'x-moz': 'prefetch' }
            }),
            false
        );
    });

    it('parses pending redis hashes and flat lua arrays', () => {
        const fromHash = parsePendingHits({ '12': '3', '0': '9', nope: '2', '4': '-1' });
        assert.equal(fromHash.get(12), 3);
        assert.equal(fromHash.has(0), false);
        assert.equal(sumPendingHits(fromHash), 3);

        const fromLua = parsePendingHits(['7', '2', '8', '5']);
        assert.equal(fromLua.get(7), 2);
        assert.equal(fromLua.get(8), 5);
        assert.equal(utcDay(new Date('2026-09-05T12:00:00.000Z')), '2026-09-05');
    });
});
