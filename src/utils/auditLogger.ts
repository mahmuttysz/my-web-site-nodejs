// src/utils/auditLogger.ts
import { Request } from 'express';

export interface AuditLogEntry {
    userId?: number | null;
    username?: string | null;
    action: string;
    description: string;
    ip: string;
    userAgent?: string | null;
    details?: Record<string, unknown> | null;
}

export const getClientIp = (req: Request): string => {
    const xForwardedFor = req.headers['x-forwarded-for'];
    const xForwardedIp = Array.isArray(xForwardedFor)
        ? xForwardedFor[0]
        : xForwardedFor?.split(',')[0];

    const ip =
        (req.headers['cf-connecting-ip'] as string) ||
        xForwardedIp ||
        req.ip ||
        '';

    return ip.trim();
};

export const getUserAgent = (req: Request): string | null => {
    const raw = req.headers['user-agent'];
    if (!raw) return null;
    return String(raw).substring(0, 255);
};

export const sanitizeDetails = (details?: Record<string, unknown> | null): string | null => {
    if (!details) return null;
    try {
        return JSON.stringify(details);
    } catch {
        return null;
    }
};

/**
 * Audit logunu asenkron ve güvenli şekilde veritabanına yazar.
 * DB modülünü çalışma anında yükler; testlerde gereksiz env yüklenmesini engeller.
 */
export const logAudit = async (entry: AuditLogEntry): Promise<void> => {
    try {
        const db = await import('../config/db.js');
        const detailsJson = sanitizeDetails(entry.details);
        await db.query(db.dbQueries.auditLogs.add, [
            entry.userId ?? null,
            entry.username ?? null,
            entry.action,
            entry.description.substring(0, 255),
            (entry.ip || '').substring(0, 45),
            entry.userAgent ? entry.userAgent.substring(0, 255) : null,
            detailsJson
        ]);
    } catch (err: any) {
        console.error('Audit log kayıt hatası:', err?.message || err);
    }
};

/**
 * Express Request bağlamında tek satırda log yazmak için pratik yardımcı.
 */
export const logAdminAction = (
    req: Request,
    action: string,
    description: string,
    details?: Record<string, unknown> | null
): void => {
    const user = req.session?.adminUser;
    const ip = getClientIp(req);
    const userAgent = getUserAgent(req);

    void logAudit({
        userId: user?.id ?? null,
        username: user?.username ?? null,
        action,
        description,
        ip,
        userAgent,
        details
    });
};

/**
 * Belirli bir günden eski logları temizler (Varsayılan: 90 gün).
 */
export const cleanOldAuditLogs = async (days = 90): Promise<number> => {
    try {
        const db = await import('../config/db.js');
        const safeDays = Math.max(1, Math.floor(days));
        const res = (await db.query(db.dbQueries.auditLogs.cleanOld, [safeDays])) as
            | { affectedRows?: number }
            | undefined;
        return res?.affectedRows ?? 0;
    } catch (err: any) {
        console.error('Eski audit logları temizleme hatası:', err?.message || err);
        return 0;
    }
};

export default {
    getClientIp,
    getUserAgent,
    sanitizeDetails,
    logAudit,
    logAdminAction,
    cleanOldAuditLogs
};
