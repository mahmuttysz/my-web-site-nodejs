<script setup lang="ts">
import { ref, onMounted, watch } from 'vue';
import { apiFetch } from '../api.ts';
import { useSeo } from '../composables/useSeo.ts';
import AppFooter from '../components/AppFooter.vue';

interface Article {
    id: number;
    title: string;
    slug: string;
    excerpt?: string;
    content?: string;
    cover_image?: string;
    reading_time?: number;
    created_at: string;
}

interface BlogApiResponse {
    success: boolean;
    lang: 'tr' | 'en';
    data: {
        articles: Article[];
    };
}

const lang = ref<'tr' | 'en'>('tr');
const articles = ref<Article[]>([]);
const loading = ref(true);

const fetchArticles = async () => {
    loading.value = true;
    try {
        const res = await apiFetch<BlogApiResponse>(`/blog?lang=${lang.value}`);
        if (res.success) {
            articles.value = res.data.articles || [];
        }
    } catch (err) {
        console.error('Blog yazıları yüklenemedi:', err);
    } finally {
        loading.value = false;
    }
};

watch(lang, () => {
    fetchArticles();
});

onMounted(() => {
    useSeo({
        title: 'Blog',
        description: lang.value === 'tr' ? 'Yazılar, rehberler ve teknik notlar.' : 'Articles, guides and technical notes.'
    });
    fetchArticles();
});

// Tarih Formatlama
const formatLongDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return new Intl.DateTimeFormat(lang.value === 'tr' ? 'tr-TR' : 'en-US', {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
    }).format(date);
};

// Özet Metin Çıkarma
const getExcerpt = (article: Article) => {
    if (article.excerpt && article.excerpt.trim() !== '') return article.excerpt;
    if (article.content) {
        return article.content.replace(/<[^>]*>?/gm, '').substring(0, 120) + '...';
    }
    return '';
};
</script>

<template>
    <div class="min-h-screen flex flex-col bg-site-bg text-site-text font-sans antialiased">
        <!-- Sticky Header Navbar -->
        <header class="border-b border-site-border bg-site-bg/80 backdrop-blur-md sticky top-0 z-50 shrink-0">
            <div class="max-w-4xl mx-auto px-4 sm:px-6 py-3.5 flex items-center justify-between">
                <router-link to="/" class="flex items-center gap-2.5 group">
                    <div
                        class="w-7 h-7 rounded-lg bg-site-card border border-site-border flex items-center justify-center p-1 group-hover:border-site-accent transition-colors">
                        <img src="/favicon-32x32.png" alt="Logo" class="w-full h-full object-contain" />
                    </div>
                    <span
                        class="font-bold text-site-text tracking-tight text-base sm:text-lg group-hover:text-site-accent transition-colors">
                        Mahmut Tüysüz
                    </span>
                </router-link>

                <nav class="flex items-center space-x-6 text-sm">
                    <router-link to="/" class="text-site-muted hover:text-site-text transition-colors font-medium">
                        {{ lang === 'tr' ? 'Anasayfa' : 'Home' }}
                    </router-link>
                    <router-link to="/blog" class="text-site-accent font-semibold">
                        Blog
                    </router-link>
                </nav>
            </div>
        </header>

        <!-- Ana İçerik -->
        <main class="flex-1 w-full max-w-4xl mx-auto px-4 sm:px-6 pt-8 sm:pt-10 pb-12 space-y-8">
            <!-- Sayfa Başlığı -->
            <div class="border-b border-site-border pb-6">
                <h1
                    class="text-3xl sm:text-4xl font-extrabold text-site-text tracking-tight flex items-center gap-2.5 before:content-['//'] before:text-site-accent">
                    Blog
                </h1>
                <p class="text-site-muted mt-2 text-sm sm:text-base leading-relaxed">
                    {{ lang === 'tr' ? 'Yazılar, rehberler ve teknik notlar.' : 'Articles, guides, and technical notes.'
                    }}
                </p>
            </div>

            <!-- Makale Listesi -->
            <div v-if="articles.length > 0" class="grid grid-cols-1 md:grid-cols-2 gap-6">
                <article v-for="article in articles" :key="article.id"
                    class="bg-site-card border border-site-border rounded-xl overflow-hidden transition-all duration-200 hover:border-site-accent hover:-translate-y-0.5 flex flex-col justify-between group">
                    <div>
                        <!-- Kapak Görseli -->
                        <router-link v-if="article.cover_image" :to="`/blog/${article.slug}`"
                            class="block aspect-video overflow-hidden bg-slate-900 border-b border-site-border/50">
                            <img :src="article.cover_image" :alt="article.title"
                                class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                loading="lazy" />
                        </router-link>

                        <!-- Kart İçeriği -->
                        <div class="p-5 sm:p-6 space-y-3">
                            <div class="flex items-center gap-2 text-xs text-slate-400 font-medium">
                                <time :datetime="article.created_at">
                                    {{ formatLongDate(article.created_at) }}
                                </time>
                                <span>•</span>
                                <span>
                                    {{ article.reading_time || 1 }} {{ lang === 'tr' ? 'dk okuma' : 'min read' }}
                                </span>
                            </div>

                            <h2
                                class="text-lg sm:text-xl font-bold text-site-text group-hover:text-site-accent transition-colors line-clamp-2 leading-snug">
                                <router-link :to="`/blog/${article.slug}`">
                                    {{ article.title }}
                                </router-link>
                            </h2>

                            <p v-if="getExcerpt(article)" class="text-site-muted text-sm line-clamp-3 leading-relaxed">
                                {{ getExcerpt(article) }}
                            </p>
                        </div>
                    </div>

                    <!-- Okuma Bağlantısı -->
                    <div
                        class="px-5 sm:px-6 pb-5 pt-3 border-t border-site-border/50 flex items-center justify-between mt-auto">
                        <router-link :to="`/blog/${article.slug}`"
                            class="text-xs sm:text-sm font-semibold text-site-accent hover:underline inline-flex items-center gap-1">
                            {{ lang === 'tr' ? 'Devamını Oku' : 'Read More' }} ↗
                        </router-link>
                    </div>
                </article>
            </div>

            <!-- Boş Durum (Makale Yoksa) -->
            <div v-else-if="!loading"
                class="bg-site-card border border-site-border rounded-xl p-12 sm:p-16 text-center">
                <p class="text-site-muted text-sm sm:text-base">
                    {{ lang === 'tr' ? 'Henüz yazı eklenmedi.' : 'No articles added yet.' }}
                </p>
            </div>
        </main>

        <!-- Footer -->
        <AppFooter :lang="lang" />
    </div>
</template>