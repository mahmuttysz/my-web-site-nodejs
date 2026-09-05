import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { healthPayload, probeHealth, withTimeout } from '../src/utils/health';

describe('health', () => {
    it('is ok only when both checks pass', () => {
        assert.equal(healthPayload({ db: 'ok', redis: 'ok' }).ok, true);
        assert.equal(healthPayload({ db: 'ok', redis: 'error' }).ok, false);
        assert.equal(healthPayload({ db: 'error', redis: 'ok' }).ok, false);
    });

    it('times out hanging probes', async () => {
        await assert.rejects(
            () => withTimeout(new Promise(() => undefined), 20, 'db'),
            /db timed out/
        );
        assert.equal(await withTimeout(Promise.resolve(7), 50, 'db'), 7);
    });

    it('marks a failed dependency as error without throwing', async () => {
        const payload = await probeHealth({
            pingDb: async () => undefined,
            pingRedis: async () => {
                throw new Error('down');
            },
            timeoutMs: 50
        });

        assert.deepEqual(payload, {
            ok: false,
            checks: { db: 'ok', redis: 'error' }
        });
    });
});
