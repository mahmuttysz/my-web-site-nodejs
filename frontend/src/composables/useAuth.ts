import { ref } from 'vue';
import { apiFetch } from '../api';

interface AdminUser {
    id: number;
    username: string;
}

const user = ref<AdminUser | null>(null);
const isAuthenticated = ref<boolean>(false);
const isChecking = ref<boolean>(true);

export function useAuth() {
    // Session Durumunu Kontrol Et
    const checkAuth = async (): Promise<boolean> => {
        isChecking.value = true;
        try {
            const res = await apiFetch<{ authenticated: boolean; user?: AdminUser }>('/admin/login');
            isAuthenticated.value = res.authenticated;
            user.value = res.user || null;
            return res.authenticated;
        } catch (err) {
            isAuthenticated.value = false;
            user.value = null;
            return false;
        } finally {
            isChecking.value = false;
        }
    };

    // Oturumu Kapat
    const logout = async () => {
        try {
            await apiFetch('/admin/login/destroy', { method: 'POST' });
        } catch (err) {
            console.error('Çıkış hatası:', err);
        } finally {
            isAuthenticated.value = false;
            user.value = null;
        }
    };

    return {
        user,
        isAuthenticated,
        isChecking,
        checkAuth,
        logout
    };
}