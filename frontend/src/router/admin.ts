import type { RouteRecordRaw } from 'vue-router';
import AdminLogin from '../views/admin/Login.vue';
import Dashboard from '../views/admin/Dashboard.vue';
import Messages from '../views/admin/Messages.vue';


export const adminRoutes: RouteRecordRaw[] = [
    {
        path: '/admin/login',
        name: 'AdminLogin',
        component: AdminLogin,
        meta: { requiresGuest: true }
    },
    {
        path: '/admin/dashboard',
        name: 'AdminDashboard',
        component: Dashboard,
        meta: { requiresAuth: true }
    },
    {
        path: '/admin/messages',
        name: 'AdminMessages',
        component: Messages,
        meta: { requiresAuth: true }
    }
];