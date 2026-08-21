<script setup lang="ts">
import AdminSidebar from '../components/admin/AdminSidebar.vue';
</script>

<template>
  <div class="min-h-screen bg-slate-950 text-slate-100 font-sans flex antialiased selection:bg-blue-500/20 selection:text-blue-400">
    <!-- Sol Yan Menü -->
    <AdminSidebar />

    <!-- Ana Sayfa İçeriği -->
    <main class="flex-1 p-8 overflow-y-auto">
      <slot />
    </main>
  </div>
</template>