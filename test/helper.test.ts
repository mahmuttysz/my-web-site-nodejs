import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { escapeXml, isValidEmail, resolvePublishedAt } from '../src/utils/helper';

describe('resolvePublishedAt', () => {
    it('stamps now only on the first publish', () => {
        const first = resolvePublishedAt(true, null);
        assert.ok(first instanceof Date);

        const existing = new Date('2024-01-15T10:00:00.000Z');
        const kept = resolvePublishedAt(true, existing);
        assert.equal(kept?.toISOString(), existing.toISOString());
    });

    it('keeps the original date when unpublishing', () => {
        const existing = new Date('2024-01-15T10:00:00.000Z');
        assert.equal(resolvePublishedAt(false, existing)?.toISOString(), existing.toISOString());
        assert.equal(resolvePublishedAt(false, null), null);
    });
});

describe('helpers', () => {
    it('escapes XML entities', () => {
        assert.equal(escapeXml(`<a href="x">&'y'`), '&lt;a href=&quot;x&quot;&gt;&amp;&apos;y&apos;');
    });

    it('validates email shape', () => {
        assert.equal(isValidEmail('a@b.co'), true);
        assert.equal(isValidEmail('not-an-email'), false);
    });
});
