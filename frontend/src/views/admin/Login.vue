<script setup lang="ts">
import { reactive, ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { apiFetch } from '../../api';
import { useSeo } from '../../composables/useSeo';

const router = useRouter();
const errorMessage = ref('');
const isSubmitting = ref(false);

const form = reactive({
    username: '',
    password: ''
});

onMounted(() => {
    useSeo({
        title: 'Admin Girişi',
        description: 'Yönetim Paneli Giriş Sayfası'
    });
});

const handleLogin = async () => {
    isSubmitting.value = true;
    errorMessage.value = '';

    try {
        const res = await apiFetch<{ success: boolean; message?: string }>('/admin/login', {
            method: 'POST',
            body: JSON.stringify(form)
        });

        if (res.success) {
            router.push('/admin/dashboard');
        } else {
            errorMessage.value = res.message || 'Kullanıcı adı veya şifre hatalı.';
        }
    } catch (err: any) {
        errorMessage.value = err.message || 'Giriş yapılırken bir hata oluştu.';
    } finally {
        isSubmitting.value = false;
    }
};
</script>

<template>
    <div class="min-h-screen flex items-center justify-center p-4 bg-slate-950 text-slate-100 w-full">
        <div class="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl p-8 shadow-2xl">
            <!-- Başlık ve Logo -->
            <div class="text-center mb-8">
                <div class="w-8 h-8 rounded-lg flex items-center justify-center mx-auto mb-2">
                    <img src="/favicon-32x32.png" alt="Logo" class="w-5 h-5" />
                </div>
                <h1 class="text-2xl font-bold text-white">Yönetim Paneli</h1>
                <p class="text-slate-400 text-sm mt-1">Devam etmek için giriş yapın</p>
            </div>

            <!-- Hata Mesajı -->
            <div v-if="errorMessage"
                class="bg-red-500/10 border border-red-500/20 text-red-400 text-sm p-3 rounded-lg mb-6 text-center">
                {{ errorMessage }}
            </div>

            <!-- Giriş Formu -->
            <form @submit.prevent="handleLogin" class="space-y-5">
                <div>
                    <label class="block text-xs font-medium text-slate-400 mb-2 uppercase tracking-wider">
                        Kullanıcı Adı
                    </label>
                    <input v-model="form.username" type="text" required autofocus autocomplete="off"
                        class="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-3 text-white placeholder-slate-600 focus:outline-none focus:border-blue-500 transition-colors text-sm" />
                </div>

                <div>
                    <label class="block text-xs font-medium text-slate-400 mb-2 uppercase tracking-wider">
                        Şifre
                    </label>
                    <input v-model="form.password" type="password" required
                        class="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-3 text-white placeholder-slate-600 focus:outline-none focus:border-blue-500 transition-colors text-sm" />
                </div>

                <button type="submit" :disabled="isSubmitting"
                    class="w-full bg-blue-600 hover:bg-blue-500 text-white font-medium py-3 rounded-lg transition-colors text-sm shadow-lg shadow-blue-600/20 disabled:opacity-50 cursor-pointer">
                    {{ isSubmitting ? 'Giriş Yapılıyor...' : 'Giriş Yap' }}
                </button>
            </form>

            <!-- Ana Sayfaya Dönüş -->
            <div class="mt-8 text-center">
                <router-link to="/" class="text-xs text-slate-500 hover:text-slate-400 transition-colors">
                    ← Ana Sayfaya Dön
                </router-link>
            </div>
        </div>
    </div>
</template>