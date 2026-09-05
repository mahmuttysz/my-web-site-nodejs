import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { renderMarkdown } from '../src/utils/markdown';

describe('renderMarkdown', () => {
    it('keeps safe markup and strips script tags', async () => {
        const html = await renderMarkdown('Hello **world**\n\n<script>alert(1)</script>');
        assert.match(html, /<strong>world<\/strong>/);
        assert.equal(html.includes('<script'), false);
        assert.equal(html.includes('alert(1)'), false);
    });

    it('drops javascript and protocol-relative URLs', async () => {
        const js = await renderMarkdown('[x](javascript:alert(1))');
        assert.equal(js.includes('javascript:'), false);

        const protoRel = await renderMarkdown('![](//evil.example/x.png)');
        assert.equal(protoRel.includes('//evil.example'), false);
    });

    it('adds noopener on links', async () => {
        const html = await renderMarkdown('[site](https://example.com)');
        assert.match(html, /rel="noopener noreferrer"/);
        assert.match(html, /href="https:\/\/example.com"/);
    });
});
