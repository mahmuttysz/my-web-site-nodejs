<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { apiFetch } from '../../api';
import { useSeo } from '../../composables/useSeo';
import AdminLayout from '../../layouts/AdminLayout.vue';

interface Message {
    id: number;
    full_name: string;
    email: string;
    subject?: string;
    message: string;
    ip?: string,
    language: string;
    is_read: number;
    created_at: string;
}

interface MessagesApiResponse {
    success: boolean;
    data:Message[];
}

const messages = ref<Message[]>([]);
const loading = ref(true);
const deletingId = ref<number | null>(null);

const fetchMessages = async () => {
    loading.value = true;
    try {
        const res = await apiFetch<MessagesApiResponse>('/admin/messages');
        if (res.success) {
            messages.value = res.data || [];
        } 
    } catch (err) {
        console.error('Mesajlar yüklenemedi:', err);
    } finally {
        loading.value = false;
    }
};

const deleteMessage = async (id: number) => {
    if (!confirm('Bu mesajı silmek istediğinize emin misiniz?')) return;

    deletingId.value = id;
    try {
        const res = await apiFetch<{ success: boolean }>(`/admin/messages/delete/${id}`, {
            method: 'DELETE'
        });

        if (res.success) {
            messages.value = messages.value.filter((m) => m.id !== id);
        }
    } catch (err) {
        console.error('Mesaj silinemedi:', err);
        alert('Mesaj silinirken bir hata oluştu.');
    } finally {
        deletingId.value = null;
    }
};

onMounted(() => {
    useSeo({
        title: 'Gelen Mesajlar',
        noindex: true
    });
    fetchMessages();
  
});

const formatLongDateTime = (dateStr: string) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    return new Intl.DateTimeFormat('tr-TR', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    }).format(date);
};
</script>

<template>
    <AdminLayout>
        <header class="mb-8">
            <h1 class="text-2xl font-bold text-white">Gelen İletişim Mesajları</h1>
            <p class="text-slate-400 text-sm mt-1">Siteden gönderilen tüm mesajlar aşağıda listelenmektedir.</p>
        </header>

        <div class="space-y-4 max-w-4xl">
            <template v-if="messages.length > 0">
                <div v-for="msg in messages" :key="msg.id"
                    class="bg-slate-900 border border-slate-800 rounded-xl p-6 transition-all">
                    <div class="flex items-start justify-between border-b border-slate-800/80 pb-4 mb-4">
                        <div>
                            <h3 class="font-bold text-white text-base">
                                {{ msg.full_name }}
                            </h3>
                            <a :href="`mailto:${msg.email}`" class="text-xs text-blue-400 hover:underline">
                                {{ msg.email }}
                            </a>
                        </div>

                        <div class="flex items-center gap-4">
                            <span class="text-xs text-slate-500">
                                {{ formatLongDateTime(msg.created_at) }}
                            </span>
                            <button type="button" @click="deleteMessage(msg.id)" :disabled="deletingId === msg.id"
                                class="text-xs text-red-400 hover:text-red-300 font-medium transition-colors disabled:opacity-50 cursor-pointer">
                                {{ deletingId === msg.id ? 'Siliniyor...' : 'Sil' }}
                            </button>
                        </div>
                    </div>

                    <p v-if="msg.subject" class="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                        Konu: {{ msg.subject }}
                    </p>

                    <p class="text-slate-300 text-sm leading-relaxed whitespace-pre-line">
                        {{ msg.message }}
                    </p>
                </div>
            </template>

            <div v-else-if="!loading"
                class="bg-slate-900 border border-slate-800 rounded-xl p-12 text-center text-slate-500">
                Gelen kutunuzda henüz bir mesaj bulunmuyor.
            </div>
        </div>
    </AdminLayout>
</template>