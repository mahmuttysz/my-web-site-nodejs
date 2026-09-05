import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { createCsrfToken, tokensMatch } from '../src/middlewares/csrf';
import { createPreviewToken, isPreviewToken, isPublishedStatus } from '../src/utils/preview';

describe('csrf', () => {
    it('accepts only the matching token', () => {
        const token = createCsrfToken();
        assert.equal(token.length, 64);
        assert.equal(tokensMatch(token, token), true);
        assert.equal(tokensMatch(token, createCsrfToken()), false);
        assert.equal(tokensMatch(token, undefined), false);
        assert.equal(tokensMatch('abc', 'abcd'), false);
    });
});

describe('preview token', () => {
    it('is 64 lowercase hex chars', () => {
        const token = createPreviewToken();
        assert.equal(isPreviewToken(token), true);
        assert.equal(isPreviewToken('nope'), false);
        assert.equal(isPreviewToken(token.toUpperCase()), false);
    });

    it('treats 1/true as published', () => {
        assert.equal(isPublishedStatus(1), true);
        assert.equal(isPublishedStatus(true), true);
        assert.equal(isPublishedStatus(0), false);
        assert.equal(isPublishedStatus(false), false);
    });
});
