<script setup lang="ts">
import { ref, reactive, onMounted, watch, nextTick } from 'vue';
import { apiFetch } from '../api';
import AppFooter from '../components/AppFooter.vue';

interface Project {
    id: number;
    title: string;
    description: string;
    link_url?: string;
    link_text?: string;
    tags: string[] | string;
}

interface Article {
    id: number;
    title: string;
    slug: string;
    excerpt?: string;
    content?: string;
    cover_image?: string;
    created_at: string;
}

interface Experience {
    id: number;
    title: string;
    company_name: string;
    description: string;
    begin_date: string;
    end_date?: string;
}

interface SocialMedia {
    id: number;
    title: string;
    url: string;
    icon?: string;
}

interface HomeApiResponse {
    success: boolean;
    lang: 'tr' | 'en';
    turnstileSiteKey: string;
    data: {
        aboutMe?: { title: string; description: string };
        projects: Project[];
        articles: Article[];
        experiences: Experience[];
        socialMedias?: SocialMedia[];
    };
}

const lang = ref<'tr' | 'en'>('tr');
const loading = ref(true);
const turnstileSiteKey = ref('');

const pageData = ref<HomeApiResponse['data']>({
    projects: [],
    articles: [],
    experiences: [],
    socialMedias: []
});

// Anasayfa verilerini API'den çekme
const fetchHomeData = async () => {
    loading.value = true;
    try {
        const res = await apiFetch<HomeApiResponse>(`/home?lang=${lang.value}`);
        if (res.success) {
            pageData.value = res.data;
            turnstileSiteKey.value = res.turnstileSiteKey;
            renderTurnstile();
        }
    } catch (err) {
        console.error('Anasayfa verileri çekilemedi:', err);
    } finally {
        loading.value = false;
    }
};

watch(lang, () => {
    fetchHomeData();
});

// Etiket (Tag) İşleyici
const parseTags = (tags: string[] | string): string[] => {
    if (Array.isArray(tags)) return tags;
    if (typeof tags === 'string' && tags.trim() !== '') {
        try {
            return JSON.parse(tags);
        } catch {
            return tags.split(',').map((t) => t.trim());
        }
    }
    return [];
};

// Tarih Formatlayıcılar
const formatDate = (dateStr?: string) => {
    if (!dateStr) return lang.value === 'tr' ? 'Devam Ediyor' : 'Present';
    const date = new Date(dateStr);
    return new Intl.DateTimeFormat(lang.value === 'tr' ? 'tr-TR' : 'en-US', {
        month: 'short',
        year: 'numeric'
    }).format(date);
};

const formatLongDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return new Intl.DateTimeFormat(lang.value === 'tr' ? 'tr-TR' : 'en-US', {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
    }).format(date);
};

// Cloudflare Turnstile Entegrasyonu
const turnstileToken = ref('');
const renderTurnstile = () => {
    nextTick(() => {
        const container = document.getElementById('turnstile-container');
        if (container && (window as any).turnstile && turnstileSiteKey.value) {
            container.innerHTML = '';
            (window as any).turnstile.render('#turnstile-container', {
                sitekey: turnstileSiteKey.value,
                theme: 'dark',
                callback: (token: string) => {
                    turnstileToken.value = token;
                },
                'expired-callback': () => {
                    turnstileToken.value = '';
                }
            });
        }
    });
};

onMounted(() => {
    fetchHomeData();

    // Cloudflare Turnstile script yükleme
    if (!document.getElementById('turnstile-script')) {
        const script = document.createElement('script');
        script.id = 'turnstile-script';
        script.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js';
        script.async = true;
        script.defer = true;
        script.onload = () => renderTurnstile();
        document.head.appendChild(script);
    }
});

// İletişim Formu Yönetimi
const form = reactive({ fullName: '', email: '', subject: '', message: '' });
const formStatus = reactive({ message: '', type: '' });
const isSubmitting = ref(false);

const submitContactForm = async () => {
    if (turnstileSiteKey.value && !turnstileToken.value) {
        formStatus.message = lang.value === 'tr' ? 'Lütfen güvenlik doğrulamasını tamamlayın.' : 'Please complete the security check.';
        formStatus.type = 'error';
        return;
    }

    isSubmitting.value = true;
    formStatus.message = '';

    try {
        const res = await apiFetch<{ success: boolean; message: string }>('/contact', {
            method: 'POST',
            body: JSON.stringify({
                ...form,
                'cf-turnstile-response': turnstileToken.value
            })
        });

        if (res.success) {
            formStatus.message = lang.value === 'tr' ? 'Mesajınız başarıyla iletildi.' : 'Your message has been sent successfully.';
            formStatus.type = 'success';
            form.fullName = '';
            form.email = '';
            form.subject = '';
            form.message = '';
        }
    } catch (err: any) {
        formStatus.message = err.message || (lang.value === 'tr' ? 'Bir hata oluştu.' : 'An error occurred.');
        formStatus.type = 'error';
    } finally {
        isSubmitting.value = false;
    }
};
</script>

<template>
    <div class="min-h-screen flex flex-col bg-site-bg text-site-text font-sans antialiased">
        <!-- Header Navbar -->
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
                    <router-link to="/" class="text-site-accent font-semibold">
                        {{ lang === 'tr' ? 'Anasayfa' : 'Home' }}
                    </router-link>
                    <router-link to="/blog" class="text-site-muted hover:text-site-text transition-colors font-medium">
                        Blog
                    </router-link>
                </nav>
            </div>
        </header>

        <!-- Hero Bölümü -->
        <div class="hero-parallax-bg relative h-[60vh] flex items-center justify-center text-center px-4">
            <div class="max-w-xl">
                <div class="flex items-center justify-center gap-2 mb-6">
                    <button type="button" @click="lang = 'tr'" :class="[
                        'cursor-pointer text-xs font-bold px-2.5 py-1 rounded-md transition-all',
                        lang === 'tr'
                            ? 'border border-site-accent bg-site-accent/10 text-site-accent'
                            : 'text-site-muted hover:text-site-text'
                    ]">
                        TR
                    </button>
                    <span class="text-site-border">|</span>
                    <button type="button" @click="lang = 'en'" :class="[
                        'cursor-pointer text-xs font-bold px-2.5 py-1 rounded-md transition-all',
                        lang === 'en'
                            ? 'border border-site-accent bg-site-accent/10 text-site-accent'
                            : 'text-site-muted hover:text-site-text'
                    ]">
                        EN
                    </button>
                </div>
                <h1 class="text-4xl md:text-5xl font-extrabold tracking-tight mb-2 text-site-text">Mahmut Tüysüz</h1>
                <div class="text-site-accent text-lg font-semibold tracking-wider uppercase">
                    Senior Software & DevOps Specialist
                </div>
            </div>
        </div>

        <!-- Ana İçerik Konteyneri -->
        <div class="max-w-4xl mx-auto px-4 sm:px-6 py-12 sm:py-16 space-y-16 sm:space-y-20 flex-1 w-full">
            <!-- Hakkımda -->
            <section id="about">
                <h2
                    class="text-xl sm:text-2xl font-bold tracking-tight mb-6 pb-2 border-b border-site-border flex items-center gap-2 text-site-text before:content-['//'] before:text-site-accent">
                    {{ pageData.aboutMe?.title || (lang === 'tr' ? 'Hakkımda' : 'About Me') }}
                </h2>
                <p class="text-site-muted text-base leading-relaxed whitespace-pre-line">
                    {{ pageData.aboutMe?.description }}
                </p>
                <div class="flex justify-end mt-6">
                    <a href="#contact"
                        class="inline-flex items-center gap-2 px-5 py-2.5 bg-white/5 border border-white/15 text-slate-200 rounded-md text-sm font-medium transition-all duration-200 hover:bg-white/10 hover:border-site-accent hover:text-site-accent hover:-translate-y-0.5 group">
                        <span>{{ lang === 'tr' ? 'İletişime Geç' : 'Get in Touch' }}</span>
                        <span
                            class="text-xs transition-transform duration-200 group-hover:translate-y-0.5">&darr;</span>
                    </a>
                </div>
            </section>

            <!-- Projeler -->
            <section id="projects">
                <h2
                    class="text-xl sm:text-2xl font-bold tracking-tight mb-6 pb-2 border-b border-site-border flex items-center gap-2 text-site-text before:content-['//'] before:text-site-accent">
                    {{ lang === 'tr' ? 'Projeler' : 'Projects' }}
                </h2>
                <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <template v-if="pageData.projects && pageData.projects.length > 0">
                        <div v-for="project in pageData.projects" :key="project.id"
                            class="bg-site-card border border-site-border p-6 rounded-xl flex flex-col justify-between transition-all duration-200 hover:border-site-accent hover:-translate-y-0.5">
                            <div class="mb-6">
                                <div class="flex items-center justify-between gap-2 mb-3">
                                    <h3 class="text-lg font-bold text-site-text">{{ project.title }}</h3>
                                    <a v-if="project.link_url" :href="project.link_url" target="_blank"
                                        rel="noopener noreferrer"
                                        class="text-site-accent text-sm font-medium hover:underline shrink-0">
                                        {{ project.link_text || (lang === 'tr' ? 'İncele' : 'View') }} ↗
                                    </a>
                                </div>
                                <p class="text-site-muted text-sm leading-relaxed">{{ project.description }}</p>
                            </div>

                            <div v-if="parseTags(project.tags).length > 0" class="flex flex-wrap gap-2">
                                <span v-for="(tag, idx) in parseTags(project.tags)" :key="idx"
                                    class="bg-site-accent/10 text-site-accent text-xs px-2.5 py-1 rounded font-medium">
                                    {{ tag }}
                                </span>
                            </div>
                        </div>
                    </template>
                    <p v-else class="text-site-muted text-sm col-span-full">
                        {{ lang === 'tr' ? 'Henüz proje eklenmedi.' : 'No projects added yet.' }}
                    </p>
                </div>
            </section>

            <!-- Blog -->
            <section id="blog">
                <div class="flex items-center justify-between mb-6 pb-2 border-b border-site-border">
                    <h2
                        class="text-xl sm:text-2xl font-bold tracking-tight text-site-text flex items-center gap-2 before:content-['//'] before:text-site-accent">
                        Blog
                    </h2>
                    <router-link v-if="pageData.articles && pageData.articles.length > 0" to="/blog"
                        class="text-site-muted hover:text-site-accent text-sm font-medium inline-flex items-center gap-1 transition-colors group">
                        {{ lang === 'tr' ? 'Tümünü Gör' : 'View All' }}
                        <span class="transition-transform duration-200 group-hover:translate-x-1">→</span>
                    </router-link>
                </div>

                <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <template v-if="pageData.articles && pageData.articles.length > 0">
                        <div v-for="article in pageData.articles" :key="article.id"
                            class="bg-site-card border border-site-border p-5 rounded-xl flex flex-col justify-between transition-all duration-200 hover:border-site-accent hover:-translate-y-0.5 group">
                            <div>
                                <router-link v-if="article.cover_image" :to="`/blog/${article.slug}`"
                                    class="block w-full aspect-video overflow-hidden rounded-lg mb-4 bg-slate-900">
                                    <img :src="article.cover_image" :alt="article.title"
                                        class="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                                        loading="lazy" />
                                </router-link>
                                <div class="text-xs text-slate-500 font-medium mb-1.5">
                                    {{ formatLongDate(article.created_at) }}
                                </div>
                                <h3
                                    class="text-lg font-bold leading-snug mb-2 text-slate-100 group-hover:text-site-accent transition-colors">
                                    <router-link :to="`/blog/${article.slug}`">{{ article.title }}</router-link>
                                </h3>
                                <p class="text-slate-400 text-sm leading-relaxed mb-4 line-clamp-3">
                                    {{ article.excerpt || article.content?.substring(0, 120) + '...' }}
                                </p>
                            </div>
                            <div class="pt-2 border-t border-site-border/50">
                                <router-link :to="`/blog/${article.slug}`"
                                    class="text-site-accent text-sm font-semibold inline-flex items-center gap-1 hover:underline">
                                    {{ lang === 'tr' ? 'Devamını Oku' : 'Read More' }} ↗
                                </router-link>
                            </div>
                        </div>
                    </template>
                    <p v-else class="text-site-muted text-sm col-span-full">
                        {{ lang === 'tr' ? 'Henüz yazı eklenmedi.' : 'No articles added yet.' }}
                    </p>
                </div>
            </section>

            <!-- Deneyimler -->
            <section id="experiences">
                <h2
                    class="text-xl sm:text-2xl font-bold tracking-tight mb-6 pb-2 border-b border-site-border flex items-center gap-2 text-site-text before:content-['//'] before:text-site-accent">
                    {{ lang === 'tr' ? 'Deneyimler' : 'Experiences' }}
                </h2>

                <div class="relative border-l-2 border-site-border pl-6 sm:pl-7 ml-2 space-y-8 sm:space-y-10">
                    <template v-if="pageData.experiences && pageData.experiences.length > 0">
                        <div v-for="experience in pageData.experiences" :key="experience.id"
                            class="relative timeline-dot">
                            <div class="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1 mb-1">
                                <h3 class="text-lg font-bold text-site-text">{{ experience.title }}</h3>
                                <span class="text-site-muted text-xs sm:text-sm">
                                    {{ formatDate(experience.begin_date) }} — {{ formatDate(experience.end_date) }}
                                </span>
                            </div>
                            <div class="text-site-accent font-medium text-sm mb-2">{{ experience.company_name }}</div>
                            <p class="text-site-muted text-sm leading-relaxed whitespace-pre-line">{{
                                experience.description }}</p>
                        </div>
                    </template>
                    <p v-else class="text-site-muted text-sm">
                        {{ lang === 'tr' ? 'Henüz deneyim eklenmedi.' : 'No experiences added yet.' }}
                    </p>
                </div>
            </section>

            <!-- İletişim Formu -->
            <section id="contact">
                <h2
                    class="text-xl sm:text-2xl font-bold tracking-tight mb-6 pb-2 border-b border-site-border flex items-center gap-2 text-site-text before:content-['//'] before:text-site-accent">
                    {{ lang === 'tr' ? 'İletişim' : 'Contact' }}
                </h2>

                <div v-if="formStatus.message" :class="[
                    'mb-4 p-4 rounded-md text-sm font-medium',
                    formStatus.type === 'success' ? 'bg-green-500/10 text-green-400 border border-green-500/20' : 'bg-red-500/10 text-red-400 border border-red-500/20'
                ]">
                    {{ formStatus.message }}
                </div>

                <form @submit.prevent="submitContactForm"
                    class="bg-site-card border border-site-border p-6 sm:p-8 rounded-xl space-y-5">
                    <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div class="flex flex-col gap-1.5">
                            <label class="text-xs font-semibold text-site-muted uppercase tracking-wider">
                                {{ lang === 'tr' ? 'Ad Soyad' : 'Full Name' }}
                            </label>
                            <input v-model="form.fullName" type="text" required
                                class="bg-site-bg border border-site-border text-site-text p-3 rounded-md focus:outline-none focus:border-site-accent text-sm" />
                        </div>
                        <div class="flex flex-col gap-1.5">
                            <label class="text-xs font-semibold text-site-muted uppercase tracking-wider">
                                {{ lang === 'tr' ? 'E-Posta' : 'Email' }}
                            </label>
                            <input v-model="form.email" type="email" required
                                class="bg-site-bg border border-site-border text-site-text p-3 rounded-md focus:outline-none focus:border-site-accent text-sm" />
                        </div>
                    </div>

                    <div class="flex flex-col gap-1.5">
                        <label class="text-xs font-semibold text-site-muted uppercase tracking-wider">
                            {{ lang === 'tr' ? 'Konu' : 'Subject' }}
                        </label>
                        <input v-model="form.subject" type="text"
                            class="bg-site-bg border border-site-border text-site-text p-3 rounded-md focus:outline-none focus:border-site-accent text-sm" />
                    </div>

                    <div class="flex flex-col gap-1.5">
                        <label class="text-xs font-semibold text-site-muted uppercase tracking-wider">
                            {{ lang === 'tr' ? 'Mesaj' : 'Message' }}
                        </label>
                        <textarea v-model="form.message" rows="5" required
                            class="bg-site-bg border border-site-border text-site-text p-3 rounded-md focus:outline-none focus:border-site-accent text-sm resize-none"></textarea>
                    </div>

                    <!-- Turnstile Kutusu -->
                    <div class="turnstile-box flex justify-start overflow-x-auto">
                        <div id="turnstile-container"></div>
                    </div>

                    <button type="submit" :disabled="isSubmitting"
                        class="w-full bg-site-accent text-site-bg font-bold py-3.5 px-6 rounded-md uppercase tracking-wider text-sm hover:opacity-90 transition-opacity disabled:opacity-50 cursor-pointer">
                        {{ isSubmitting ? (lang === 'tr' ? 'Gönderiliyor...' : 'Sending...') : (lang === 'tr' ? 'Gönder'
                            : 'Send')
                        }}
                    </button>
                </form>
            </section>
        </div>


        <app-footer :lang="lang" :social-medias="pageData.socialMedias" />
    </div>
</template>