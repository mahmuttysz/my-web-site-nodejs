interface AuditLogs {
    id: number;
    user_id?: number | null;
    username?: string | null;
    action: string;
    description: string;
    ip: string;
    user_agent?: string | null;
    details?: string | null;
    created_at: Date | string;
}

export default AuditLogs;
