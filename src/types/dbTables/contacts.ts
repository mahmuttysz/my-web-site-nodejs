interface Contacts {
    id: number,
    subject: string,
    full_name: string,
    email: string,
    message: string,
    ip?: string | null,
    mail_log?: string | null,
    language: string,
    is_read: boolean,
    created_at: Date
}

export default Contacts;