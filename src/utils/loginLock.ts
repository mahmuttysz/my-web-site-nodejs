export const LOCK_AFTER = 5;
export const LOCK_WINDOW_MS = 15 * 60 * 1000;

export type LoginLockState = {
    wrong_try?: number | string | null;
    last_wrong_try?: Date | string | null;
};

export const wrongTryCount = (user: LoginLockState): number => Number(user.wrong_try || 0);

export const lastWrongTryAt = (user: LoginLockState): number | null => {
    if (!user.last_wrong_try) return null;
    const ts = new Date(user.last_wrong_try).getTime();
    return Number.isNaN(ts) ? null : ts;
};

export const isLocked = (user: LoginLockState, now = Date.now()): boolean => {
    if (wrongTryCount(user) < LOCK_AFTER) return false;
    const lastTry = lastWrongTryAt(user);
    if (lastTry === null) return false;
    return now - lastTry < LOCK_WINDOW_MS;
};

export const lockWindowExpired = (user: LoginLockState, now = Date.now()): boolean => {
    if (wrongTryCount(user) < LOCK_AFTER) return false;
    const lastTry = lastWrongTryAt(user);
    if (lastTry === null) return true;
    return now - lastTry >= LOCK_WINDOW_MS;
};
