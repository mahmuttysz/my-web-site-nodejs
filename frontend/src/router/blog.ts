import type { RouteRecordRaw } from 'vue-router';
import BlogIndex from '../views/BlogIndex.vue';
import BlogDetail from '../views/BlogDetail.vue';

export const blogRoutes: RouteRecordRaw[] = [
    {
        path: '/blog',
        name: 'BlogIndex',
        component: BlogIndex
    },
    {
        path: '/blog/:slug',
        name: 'BlogDetail',
        component: BlogDetail
    }
];