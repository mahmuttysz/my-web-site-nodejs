import redisClient from '../config/redis';
import { dbQueries, query } from '../config/db';
import {
    HIT_FLUSH_MS,
    HIT_PENDING_KEY,
    HIT_SEEN_TTL_SEC,
    HitRequest,
    hitSeenKey,
    parsePendingHits,
    shouldCountHit,
    utcDay
} from './articleHits';

const DRAIN_PENDING = `
local raw = redis.call('HGETALL', KEYS[1])
redis.call('DEL', KEYS[1])
return raw
`;

const clientIp = (req: HitRequest): string => String(req.ip || '').trim() || '0.0.0.0';

export const pendingHitsMap = async (): Promise<Map<number, number>> => {
    try {
        if (!redisClient.isOpen) return new Map();
        const raw = await redisClient.hGetAll(HIT_PENDING_KEY);
        return parsePendingHits(raw);
    } catch (err: any) {
        console.error('Bekleyen hitler okunamadı:', err?.message || err);
        return new Map();
    }
};

export const recordArticleHit = async (articleId: number, req: HitRequest): Promise<void> => {
    if (!Number.isInteger(articleId) || articleId <= 0 || !shouldCountHit(req)) return;
    if (!redisClient.isOpen) return;

    const seenKey = hitSeenKey(articleId, utcDay(), clientIp(req));

    try {
        const created = await redisClient.set(seenKey, '1', { NX: true, EX: HIT_SEEN_TTL_SEC });
        if (created !== 'OK') return;
        await redisClient.hIncrBy(HIT_PENDING_KEY, String(articleId), 1);
    } catch (err: any) {
        console.error('Hit kaydı başarısız:', err?.message || err);
    }
};

export const flushArticleHits = async (): Promise<void> => {
    if (!redisClient.isOpen) return;

    let raw: unknown;
    try {
        raw = await redisClient.eval(DRAIN_PENDING, {
            keys: [HIT_PENDING_KEY],
            arguments: []
        });
    } catch (err: any) {
        console.error('Hit flush Redis hatası:', err?.message || err);
        return;
    }

    const pending = parsePendingHits(raw);
    for (const [id, count] of pending) {
        try {
            await query(dbQueries.articles.addHits, [count, id]);
        } catch (err: any) {
            console.error(`Hit flush DB hatası (article ${id}):`, err?.message || err);
        }
    }
};

export const startHitFlusher = (ms: number = HIT_FLUSH_MS): (() => void) => {
    const timer = setInterval(() => {
        void flushArticleHits();
    }, ms);
    timer.unref();
    return () => clearInterval(timer);
};
