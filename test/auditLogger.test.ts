import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { Request } from 'express';
import { getClientIp, getUserAgent, sanitizeDetails } from '../src/utils/auditLogger';

describe('auditLogger utility', () => {
    it('extracts IP from cf-connecting-ip header first', () => {
        const req = {
            headers: {
                'cf-connecting-ip': '203.0.113.195',
                'x-forwarded-for': '198.51.100.1'
            },
            ip: '127.0.0.1'
        } as unknown as Request;

        assert.equal(getClientIp(req), '203.0.113.195');
    });

    it('extracts first IP from x-forwarded-for when cf-connecting-ip is absent', () => {
        const req = {
            headers: {
                'x-forwarded-for': '198.51.100.1, 192.0.2.1'
            },
            ip: '127.0.0.1'
        } as unknown as Request;

        assert.equal(getClientIp(req), '198.51.100.1');
    });

    it('falls back to req.ip when proxy headers are absent', () => {
        const req = {
            headers: {},
            ip: '127.0.0.1'
        } as unknown as Request;

        assert.equal(getClientIp(req), '127.0.0.1');
    });

    it('extracts and truncates user-agent header to 255 chars', () => {
        const shortReq = {
            headers: { 'user-agent': 'Mozilla/5.0 TestBrowser' }
        } as unknown as Request;
        assert.equal(getUserAgent(shortReq), 'Mozilla/5.0 TestBrowser');

        const longReq = {
            headers: { 'user-agent': 'A'.repeat(300) }
        } as unknown as Request;
        assert.equal(getUserAgent(longReq)?.length, 255);

        const emptyReq = {
            headers: {}
        } as unknown as Request;
        assert.equal(getUserAgent(emptyReq), null);
    });

    it('serializes details into JSON string or null', () => {
        assert.equal(sanitizeDetails(null), null);
        assert.equal(sanitizeDetails(undefined), null);
        assert.equal(sanitizeDetails({ action: 'test', id: 5 }), '{"action":"test","id":5}');
    });
});
