<template>
  <div class="font-sans m-0 min-h-screen w-full p-0">
    <AppRouteNav />
    <RouterView />
  </div>
</template>

<script setup>
import { RouterView } from 'vue-router'
import AppRouteNav from '@/components/ui/AppRouteNav.vue'
</script>
