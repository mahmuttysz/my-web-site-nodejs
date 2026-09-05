export const HEALTH_TIMEOUT_MS = 2000;

export type HealthCheckName = 'db' | 'redis';
export type HealthCheckStatus = 'ok' | 'error';

export interface HealthPayload {
    ok: boolean;
    checks: Record<HealthCheckName, HealthCheckStatus>;
}

export const healthPayload = (
    checks: Record<HealthCheckName, HealthCheckStatus>
): HealthPayload => ({
    ok: checks.db === 'ok' && checks.redis === 'ok',
    checks
});

export const withTimeout = async <T>(
    promise: Promise<T>,
    ms: number,
    label: string
): Promise<T> => {
    let timer: ReturnType<typeof setTimeout> | undefined;

    const timeout = new Promise<never>((_, reject) => {
        timer = setTimeout(() => {
            reject(new Error(`${label} timed out after ${ms}ms`));
        }, ms);
    });

    try {
        return await Promise.race([promise, timeout]);
    } finally {
        if (timer) clearTimeout(timer);
    }
};

export const probeHealth = async (deps: {
    pingDb: () => Promise<unknown>;
    pingRedis: () => Promise<unknown>;
    timeoutMs?: number;
}): Promise<HealthPayload> => {
    const timeoutMs = deps.timeoutMs ?? HEALTH_TIMEOUT_MS;

    const ping = async (
        name: HealthCheckName,
        fn: () => Promise<unknown>
    ): Promise<HealthCheckStatus> => {
        try {
            await withTimeout(fn(), timeoutMs, name);
            return 'ok';
        } catch {
            return 'error';
        }
    };

    const [db, redis] = await Promise.all([
        ping('db', deps.pingDb),
        ping('redis', deps.pingRedis)
    ]);

    return healthPayload({ db, redis });
};
