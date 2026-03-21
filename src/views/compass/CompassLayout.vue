<template>
  <div
    class="compass-app relative min-h-screen"
    :style="{ backgroundColor: bgPrimary, color: textPrimary }"
  >
    <!-- 全页居中、偏上的子导航（与全站顶栏同构：紧凑横排） -->
    <nav
      class="compass-subnav font-boutique-primary fixed left-1/2 top-12 z-[1060] inline-flex -translate-x-1/2 flex-nowrap items-center rounded-md border border-white/20 bg-black/25 px-0.5 py-0.5 text-[10px] shadow backdrop-blur-sm sm:top-14 sm:text-[11px]"
      aria-label="Compass 视图切换"
    >
      <template v-for="(item, index) in navItems" :key="item.to">
        <span
          v-if="index > 0"
          class="select-none px-0.5 text-white/35"
          aria-hidden="true"
          >|</span
        >
        <RouterLink
          :to="item.to"
          class="whitespace-nowrap rounded-sm px-2 py-0.5 text-white/75 transition-colors hover:bg-white/10 hover:text-white"
          activeClass="compass-subnav-link--active"
        >
          {{ item.label }}
        </RouterLink>
      </template>
    </nav>

    <main class="compass-app-main min-h-screen pt-[4.25rem]">
      <RouterView />
    </main>

    <button
      type="button"
      class="font-boutique-primary fixed bottom-4 right-4 z-[1060] rounded-md border border-white/30 bg-black/30 px-3 py-1.5 text-[10px] text-white/90 shadow backdrop-blur-sm hover:bg-white/10 sm:text-xs"
      @click="addDemoRecord"
    >
      + 演示添加记录
    </button>
  </div>
</template>

<script setup>
import { RouterLink, RouterView } from 'vue-router'
import { getColor } from '@/config/theme.js'
import { useCompassRecords } from '@/composables/useCompassRecords.js'

const bgPrimary = getColor('background', 'primary')
const textPrimary = getColor('text', 'primary')

const navItems = [
  { to: '/compass/stars', label: '星盘' },
  { to: '/compass/timeline', label: '时间线' },
]

const { addDemoRecord } = useCompassRecords()
</script>

<style scoped>
.compass-subnav-link--active {
  background: rgba(255, 255, 255, 0.12);
  font-weight: 600;
}
</style>
