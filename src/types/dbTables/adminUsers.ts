interface AdminUsers {
    id: number,
    name: string,
    surname: string
    username: string,
    password_hash: string,
    type: number,
    wrong_try: number,
    last_wrong_try?: Date | null,
    last_success_login?: Date | null,
    ip?: string | null
    status: boolean,
    created_at?: Date,
    updated_at?: Date | null
}

export default AdminUsers;