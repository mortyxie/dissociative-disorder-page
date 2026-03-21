<template>
  <nav
    class="app-route-nav app-route-nav--compact fixed left-3 top-3 z-[1100] inline-flex flex-nowrap items-center backdrop-blur-sm sm:left-4 sm:top-4"
    aria-label="站内页面切换"
  >
    <template v-for="(item, index) in siteNavItems" :key="item.id">
      <span
        v-if="index > 0"
        class="app-route-divider app-route-divider--compact select-none"
        aria-hidden="true"
        >|</span
      >
      <RouterLink
        :to="item.to"
        class="app-route-link app-route-link--compact whitespace-nowrap rounded-sm"
        :class="{ 'app-route-link--active': item.isActive(route.path) }"
      >
        {{ item.label }}
      </RouterLink>
    </template>
  </nav>
</template>

<script setup>
import { RouterLink, useRoute } from 'vue-router'
import { siteNavItems } from '@/config/siteNav.js'

const route = useRoute()
</script>
