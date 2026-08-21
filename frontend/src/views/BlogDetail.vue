<script setup lang="ts">
import { ref, onMounted, watch } from 'vue';
import { useRoute } from 'vue-router';
import { apiFetch } from '../api';
import { useSeo } from '../composables/useSeo';
import AppFooter from '../components/AppFooter.vue';

interface ArticleDetail {
  id: number;
  title: string;
  slug: string;
  excerpt?: string;
  content?: string;
  contentHtml?: string;
  cover_image?: string;
  reading_time?: number;
  created_at: string;
}

interface ArticleApiResponse {
  success: boolean;
  lang: 'tr' | 'en';
  data: {
    article: ArticleDetail;
  };
}

const route = useRoute();
const lang = ref<'tr' | 'en'>('tr');
const article = ref<ArticleDetail | null>(null);
const loading = ref(true);

const fetchArticleDetail = async () => {
  loading.value = true;
  try {
    const slug = route.params.slug;
    const res = await apiFetch<ArticleApiResponse>(`/blog/${slug}?lang=${lang.value}`);
    if (res.success && res.data.article) {
      article.value = res.data.article;

      // Dinamik SEO Bilgilerini Güncelle
      useSeo({
        title: article.value.title,
        description: article.value.excerpt || article.value.title,
        image: article.value.cover_image,
        type: 'article'
      });
    }
  } catch (err) {
    console.error('Makale detayları yüklenemedi:', err);
  } finally {
    loading.value = false;
  }
};

watch(lang, () => {
  fetchArticleDetail();
});

onMounted(() => {
  fetchArticleDetail();
});

// Tarih Formatlayıcı
const formatLongDate = (dateStr?: string) => {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  return new Intl.DateTimeFormat(lang.value === 'tr' ? 'tr-TR' : 'en-US', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  }).format(date);
};
</script>

<template>
  <div class="min-h-screen flex flex-col bg-site-bg text-site-text font-sans antialiased">
    <!-- Sticky Header Navbar -->
    <header class="border-b border-site-border bg-site-bg/80 backdrop-blur-md sticky top-0 z-50 shrink-0">
      <div class="max-w-4xl mx-auto px-4 sm:px-6 py-3.5 flex items-center justify-between">
        <router-link to="/" class="flex items-center gap-2.5 group">
          <div class="w-7 h-7 rounded-lg bg-site-card border border-site-border flex items-center justify-center p-1 group-hover:border-site-accent transition-colors">
            <img src="/favicon-32x32.png" alt="Logo" class="w-full h-full object-contain" />
          </div>
          <span class="font-bold text-site-text tracking-tight text-base sm:text-lg group-hover:text-site-accent transition-colors">
            Mahmut Tüysüz
          </span>
        </router-link>

        <router-link
          to="/blog"
          class="text-site-muted hover:text-site-accent transition-colors font-medium text-sm inline-flex items-center gap-1 group"
        >
          <span class="transition-transform group-hover:-translate-x-1">←</span>
          <span>{{ lang === 'tr' ? 'Tüm Yazılar' : 'All Articles' }}</span>
        </router-link>
      </div>
    </header>

    <!-- Ana İçerik -->
    <main class="flex-1 w-full max-w-3xl mx-auto px-4 sm:px-6 pt-8 sm:pt-10 pb-16 space-y-8">
      <template v-if="article">
        <!-- Başlık & Üst Bilgiler -->
        <header class="space-y-3 border-b border-site-border pb-6">
          <div class="flex items-center gap-2 text-xs sm:text-sm text-slate-400 font-medium">
            <time :datetime="article.created_at">
              {{ formatLongDate(article.created_at) }}
            </time>
            <span>•</span>
            <span>
              {{ article.reading_time || 1 }} {{ lang === 'tr' ? 'dk okuma' : 'min read' }}
            </span>
          </div>

          <h1 class="text-3xl sm:text-4xl font-extrabold text-site-text tracking-tight leading-tight sm:leading-snug">
            {{ article.title }}
          </h1>

          <p v-if="article.excerpt" class="text-site-muted text-base sm:text-lg leading-relaxed pt-1">
            {{ article.excerpt }}
          </p>
        </header>

        <!-- Kapak Görseli -->
        <div v-if="article.cover_image" class="w-full bg-site-card/40 border border-site-border rounded-2xl p-2 sm:p-4 flex items-center justify-center overflow-hidden shadow-xl">
          <img
            :src="article.cover_image"
            :alt="article.title"
            class="max-h-[420px] w-auto h-auto object-contain rounded-xl shadow-md"
          />
        </div>

        <!-- HTML Makale İçeriği -->
        <article
          v-html="article.contentHtml || article.content"
          class="prose prose-invert max-w-none text-slate-300 leading-relaxed text-base sm:text-lg space-y-6 [&_h2]:text-2xl [&_h2]:font-bold [&_h2]:text-site-text [&_h2]:pt-4 [&_h3]:text-xl [&_h3]:font-semibold [&_h3]:text-site-text [&_p]:text-slate-300 [&_a]:text-site-accent [&_a]:underline [&_ul]:list-disc [&_ul]:pl-5 [&_ol]:list-decimal [&_ol]:pl-5 [&_code]:bg-slate-900 [&_code]:px-1.5 [&_code]:py-0.5 [&_code]:rounded [&_pre]:bg-slate-900 [&_pre]:p-4 [&_pre]:rounded-xl [&_blockquote]:border-l-4 [&_blockquote]:border-site-accent [&_blockquote]:pl-4 [&_blockquote]:italic text-justify"
        ></article>

        <!-- Alt Bloga Dön Butonu -->
        <div class="pt-8 border-t border-site-border">
          <router-link
            to="/blog"
            class="inline-flex items-center gap-2 px-4 py-2 bg-site-card border border-site-border text-site-text text-sm font-semibold rounded-lg transition-all duration-200 hover:border-site-accent hover:text-site-accent group"
          >
            <span class="transition-transform duration-200 group-hover:-translate-x-1">←</span>
            <span>{{ lang === 'tr' ? 'Bloga Dön' : 'Back to Blog' }}</span>
          </router-link>
        </div>
      </template>

      <!-- Yükleniyor / Bulunamadı Durumu -->
      <div v-else-if="!loading" class="text-center py-16">
        <p class="text-site-muted text-base">
          {{ lang === 'tr' ? 'Aradığınız blog yazısı bulunamadı.' : 'The requested article was not found.' }}
        </p>
      </div>
    </main>

    <!-- Footer -->
    <AppFooter :lang="lang" />
  </div>
</template>