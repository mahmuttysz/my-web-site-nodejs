<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { apiFetch } from '../../api';
import { useSeo } from '../../composables/useSeo';
import AdminLayout from '../../layouts/AdminLayout.vue';
import { useAuth } from '../../composables/useAuth';

interface RecentMessage {
    id: number;
    name: string;
    email: string;
    message: string;
    created_at: string;
}

interface DashboardData {
    user: any,
    stats: {
        totalArticles: number;
        totalViews: number;
        unreadMessages: number;
    };
    recentMessages: RecentMessage[];
}

interface DashboardApiResponse {
    success: boolean;
    data: DashboardData;
}

const loading = ref(true);
const dashboardData = ref<DashboardData>({
    user: useAuth(),
    stats: { totalArticles: 0, totalViews: 0, unreadMessages: 0 },
    recentMessages: []
});

const fetchDashboardData = async () => {
    loading.value = true;
    try {
        const res = await apiFetch<DashboardApiResponse>('/admin/dashboard');
        if (res.success) {
            dashboardData.value = res.data;
        }
    } catch (err) {
        console.error('Dashboard verileri getirilemedi:', err);
    } finally {
        loading.value = false;
    }
};

onMounted(() => {
    useSeo({
        title: 'Dashboard',
        noindex: true 
    });
    fetchDashboardData();
});

const formatLongDateTime = (dateStr: string) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    return new Intl.DateTimeFormat('tr-TR', {
        day: 'numeric',
        month: 'short',
        hour: '2-digit',
        minute: '2-digit'
    }).format(date);
};
</script>

<template>
    <AdminLayout>
        <!-- Karşılama Başlığı -->
        <header class="mb-8">
            <h1 class="text-2xl font-bold text-white">
                Hoş geldin, {{ dashboardData.user?.username || 'Admin' }} 👋
            </h1>
            <p class="text-slate-400 text-sm mt-1">
                Sitenin genel durumuna buradan göz atabilirsin.
            </p>
        </header>

        <!-- İstatistik Kartları -->
        <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
            <div class="bg-slate-900 border border-slate-800 rounded-xl p-6">
                <span class="text-xs text-slate-400 uppercase tracking-wider font-semibold">Tüm Makaleler</span>
                <p class="text-3xl font-bold text-white mt-2">
                    {{ dashboardData.stats.totalArticles }}
                </p>
            </div>

            <div class="bg-slate-900 border border-slate-800 rounded-xl p-6">
                <span class="text-xs text-slate-400 uppercase tracking-wider font-semibold">Toplam Okunma</span>
                <p class="text-3xl font-bold text-blue-400 mt-2">
                    {{ dashboardData.stats.totalViews }}
                </p>
            </div>

            <div class="bg-slate-900 border border-slate-800 rounded-xl p-6">
                <span class="text-xs text-slate-400 uppercase tracking-wider font-semibold">Okunmamış
                    Mesajlar</span>
                <p class="text-3xl font-bold mt-2"
                    :class="dashboardData.stats.unreadMessages > 0 ? 'text-amber-400' : 'text-slate-500'">
                    {{ dashboardData.stats.unreadMessages }}
                </p>
            </div>
        </div>

        <!-- Son İletişim Mesajları -->
        <div class="bg-slate-900 border border-slate-800 rounded-xl p-6">
            <div class="flex items-center justify-between mb-6">
                <h2 class="text-lg font-bold text-white">Son İletişim Mesajları</h2>
                <router-link to="/admin/messages" class="text-xs text-blue-400 hover:text-blue-300 font-medium">
                    Tümünü Gör →
                </router-link>
            </div>

            <template v-if="dashboardData.recentMessages && dashboardData.recentMessages.length > 0">
                <div class="space-y-4">
                    <div v-for="msg in dashboardData.recentMessages" :key="msg.id"
                        class="p-4 bg-slate-950/60 border border-slate-800/80 rounded-lg flex items-start justify-between">
                        <div>
                            <div class="flex items-center gap-2 mb-1">
                                <span class="font-semibold text-white text-sm">{{ msg.name }}</span>
                                <span class="text-xs text-slate-500">&lt;{{ msg.email }}&gt;</span>
                            </div>
                            <p class="text-slate-300 text-sm line-clamp-2">{{ msg.message }}</p>
                        </div>
                        <span class="text-xs text-slate-500 whitespace-nowrap ml-4">
                            {{ formatLongDateTime(msg.created_at) }}
                        </span>
                    </div>
                </div>
            </template>

            <p v-else-if="!loading" class="text-slate-500 text-sm text-center py-6">
                Henüz hiç mesaj yok.
            </p>
        </div>
    </AdminLayout>
</template>