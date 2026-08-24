import AdminUsers from '../dbTables/adminUsers';

interface LoginResponse {
    success: boolean,
    error: string,
    user: AdminUsers
}

export default LoginResponse;