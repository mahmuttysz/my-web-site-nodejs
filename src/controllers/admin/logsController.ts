// src/controllers/admin/logsController.ts
import { query, dbQueries } from '../../config/db';
import AuditLogs from '../../types/dbTables/auditLogs';
import { cleanOldAuditLogs } from '../../utils/auditLogger';

export const getLogs = async (): Promise<AuditLogs[]> => {
    const logs = await query<AuditLogs[]>(dbQueries.auditLogs.getAll);
    return logs || [];
};

export const cleanLogs = async (days = 90): Promise<number> => {
    return await cleanOldAuditLogs(days);
};

export default {
    getLogs,
    cleanLogs
};
