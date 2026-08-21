import { createRouter, createWebHistory } from 'vue-router';
import { homeRoutes } from './home';
import { blogRoutes } from './blog';
import { adminRoutes } from './admin';
import { useAuth } from '../composables/useAuth';

export const router = createRouter({
  history: createWebHistory(),
  routes: [
    ...homeRoutes,
    ...blogRoutes,
    ...adminRoutes
  ]
});

// Navigation Guard (Giriş Kontrolü)
router.beforeEach(async (to, _from, next) => {
  const { checkAuth } = useAuth();

  // Admin rotası veya Login rotası ise auth durumunu sorgula
  if (to.meta.requiresAuth || to.meta.requiresGuest) {
    const isAuth = await checkAuth();

    if (to.meta.requiresAuth && !isAuth) {
      // Yetkisiz erişim -> Login'e yönlendir
      return next({ name: 'AdminLogin' });
    }

    if (to.meta.requiresGuest && isAuth) {
      // Zaten giriş yapmış -> Dashboard'a yönlendir
      return next({ name: 'AdminDashboard' });
    }
  }

  next();
});