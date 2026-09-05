import crypto from 'node:crypto';

export const HIT_PENDING_KEY = 'article:hits:pending';
export const HIT_SEEN_TTL_SEC = 36 * 60 * 60;
export const HIT_FLUSH_MS = 60_000;

const BOT_UA =
    /bot|crawler|spider|crawling|slurp|bingpreview|facebookexternalhit|facebot|whatsapp|telegram|preview|monitor|uptime|healthcheck|headless|wget|curl|python-requests|go-http-client/i;

export type HitHeaders = Record<string, string | string[] | undefined>;

export type HitRequest = {
    method?: string;
    ip?: string | null;
    headers?: HitHeaders;
};

const headerValue = (headers: HitHeaders | undefined, name: string): string => {
    if (!headers) return '';
    const value = headers[name] ?? headers[name.toLowerCase()];
    if (Array.isArray(value)) return String(value[0] || '');
    return typeof value === 'string' ? value : '';
};

export const utcDay = (now: Date = new Date()): string => now.toISOString().slice(0, 10);

export const hitSeenKey = (articleId: number, day: string, ip: string): string => {
    const hash = crypto.createHash('sha256').update(`${articleId}:${day}:${ip}`).digest('hex').slice(0, 16);
    return `article:hit:seen:${day}:${articleId}:${hash}`;
};

export const shouldCountHit = (req: HitRequest): boolean => {
    const method = String(req.method || 'GET').toUpperCase();
    if (method !== 'GET') return false;

    const ua = headerValue(req.headers, 'user-agent').trim();
    if (!ua || BOT_UA.test(ua)) return false;

    const purpose = `${headerValue(req.headers, 'sec-purpose')} ${headerValue(req.headers, 'purpose')}`.toLowerCase();
    if (purpose.includes('prefetch') || purpose.includes('prerender')) return false;

    if (headerValue(req.headers, 'x-moz').toLowerCase() === 'prefetch') return false;

    return true;
};

export const parsePendingHits = (raw: unknown): Map<number, number> => {
    const map = new Map<number, number>();
    const pairs: Array<[string, string]> = [];

    if (Array.isArray(raw)) {
        for (let i = 0; i + 1 < raw.length; i += 2) {
            pairs.push([String(raw[i]), String(raw[i + 1])]);
        }
    } else if (raw && typeof raw === 'object') {
        for (const [field, value] of Object.entries(raw as Record<string, unknown>)) {
            pairs.push([field, String(value)]);
        }
    }

    for (const [field, value] of pairs) {
        const id = Number(field);
        const count = Number(value);
        if (!Number.isInteger(id) || id <= 0 || !Number.isFinite(count) || count <= 0) continue;
        map.set(id, Math.floor(count));
    }

    return map;
};

export const sumPendingHits = (pending: Map<number, number>): number => {
    let total = 0;
    for (const count of pending.values()) total += count;
    return total;
};
