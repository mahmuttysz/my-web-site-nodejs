import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { LOCK_AFTER, LOCK_WINDOW_MS, isLocked, lockWindowExpired } from '../src/utils/loginLock';

const user = (overrides: { wrong_try?: number; last_wrong_try?: Date | null }) => ({
    wrong_try: 0,
    last_wrong_try: null as Date | null,
    ...overrides
});

describe('login lock', () => {
    it('does not lock before the threshold', () => {
        const now = Date.now();
        assert.equal(isLocked(user({ wrong_try: LOCK_AFTER - 1, last_wrong_try: new Date(now) }), now), false);
    });

    it('locks for 15 minutes after enough failures', () => {
        const now = Date.parse('2026-09-05T00:00:00.000Z');
        const lockedUser = user({
            wrong_try: LOCK_AFTER,
            last_wrong_try: new Date(now - 60_000)
        });

        assert.equal(isLocked(lockedUser, now), true);
        assert.equal(lockWindowExpired(lockedUser, now), false);
        assert.equal(isLocked(lockedUser, now + LOCK_WINDOW_MS), false);
        assert.equal(lockWindowExpired(lockedUser, now + LOCK_WINDOW_MS), true);
    });
});
