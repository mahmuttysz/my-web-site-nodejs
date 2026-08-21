<script setup lang="ts">
import { computed } from 'vue';

interface SocialMedia {
    id?: number;
    title: string;
    username?: string;
    url: string;
    icon?: string;
}

interface Props {
    lang?: 'tr' | 'en';
    socialMedias?: SocialMedia[];
}

const props = withDefaults(defineProps<Props>(), {
    lang: 'tr',
    socialMedias: () => []
});

const currentYear = computed(() => new Date().getFullYear());
</script>

<template>
    <footer
        class="mt-auto shrink-0 border-t border-site-border bg-site-card/30 backdrop-blur-sm text-site-muted pt-10 sm:pt-12">
        <div class="max-w-4xl mx-auto px-4 sm:px-6 pb-8 sm:pb-10 grid grid-cols-1 md:grid-cols-3 gap-8">
            <!-- Sol Kısım: Başlık & Açıklama -->
            <div class="md:col-span-2 space-y-2.5">
                <h3 class="text-lg font-bold text-site-text tracking-tight">Mahmut Tüysüz</h3>
                <p class="text-xs sm:text-sm leading-relaxed max-w-md text-site-muted">
                    {{ props.lang === 'tr' ? 'Senior Software Development & DevOps Specialist' : 'Senior Software Development & DevOps Specialist' }}
                </p>
            </div>

            <!-- Sağ Kısım: İletişim / Sosyal Medya -->
            <div class="space-y-3">
                <h4 class="text-xs font-semibold text-site-text uppercase tracking-wider">
                    {{ props.lang === 'tr' ? 'İletişim' : 'Contact' }}
                </h4>
                <div class="flex flex-col gap-2">
                    <template v-if="props.socialMedias && props.socialMedias.length > 0">
                        <a v-for="(social, index) in props.socialMedias" :key="social.id || index" :href="social.url"
                            target="_blank" rel="noopener noreferrer"
                            :aria-label="social.title || social.username || 'Social Link'"
                            class="inline-flex items-center gap-2 text-xs sm:text-sm text-site-muted hover:text-site-accent transition-colors duration-200 group [&_svg]:w-4 [&_svg]:h-4 [&_svg]:fill-current [&_svg]:transition-transform group-hover:[&_svg]:scale-110">
                            <span v-if="social.icon" v-html="social.icon" class="inline-flex items-center"></span>
                            <span>{{ social.title }}</span>
                        </a>
                    </template>
                </div>
            </div>
        </div>

        <!-- Alt Telif Çubuğu -->
        <div class="border-t border-site-border/50 bg-slate-950/80 py-6 text-xs text-slate-500">
            <div
                class="max-w-4xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row justify-between items-center gap-2.5 text-center sm:text-left">
                <p class="text-slate-500 font-normal tracking-wide">
                    &copy; {{ currentYear }} Mahmut Tüysüz. {{ props.lang === 'tr' ? 'Tüm hakları saklıdır.' : 'All rights reserved.' }}
                </p>
                <p class="text-slate-500/80 font-normal">
                    TypeScript &bull; Express &bull; Vue 3 &bull; Vite &bull; Tailwind CSS
                </p>
            </div>
        </div>
    </footer>
</template>