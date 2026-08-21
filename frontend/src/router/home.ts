import type { RouteRecordRaw } from 'vue-router';
import Home from '../views/Home.vue';

export const homeRoutes: RouteRecordRaw[] = [
    {
        path: '/',
        name: 'Home',
        component: Home
    }
];