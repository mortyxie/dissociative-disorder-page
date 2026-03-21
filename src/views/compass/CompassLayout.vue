<template>
  <div
    class="compass-app min-h-screen"
    :style="{ backgroundColor: bgPrimary, color: textPrimary }"
  >
    <aside
      class="compass-app-nav flex w-full flex-col gap-4 border-b p-4 sm:fixed sm:left-0 sm:top-0 sm:z-[1050] sm:h-screen sm:w-52 sm:border-b-0 sm:border-r"
      :style="navChromeStyle"
    >
      <div>
        <p class="font-boutique-primary text-xs tracking-wide text-white/60">
          Compass
        </p>
        <h1 class="font-boutique-primary mt-1 text-lg text-white">个人知识库</h1>
      </div>
      <nav class="flex flex-col gap-1" aria-label="Compass 二级导航">
        <RouterLink
          v-for="item in navItems"
          :key="item.to"
          :to="item.to"
          class="compass-app-nav-link rounded-md px-3 py-2 text-sm transition-colors"
          activeClass="compass-app-nav-link--active"
        >
          {{ item.label }}
        </RouterLink>
      </nav>
      <button
        type="button"
        class="mt-auto rounded-md border border-white/35 px-3 py-2 text-left text-xs text-white/90 transition hover:bg-white/10"
        @click="addDemoRecord"
      >
        + 演示添加一条记录
      </button>
      <p class="text-[10px] leading-relaxed text-white/45">
        星盘与时间线共用同一批记录；添加后星盘多一颗星，时间线多一个节点。
      </p>
    </aside>

    <main
      class="compass-app-main min-h-[calc(100vh-1px)] pt-4 sm:ml-52 sm:pt-6"
    >
      <RouterView />
    </main>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { RouterLink, RouterView } from 'vue-router'
import { getColor } from '@/config/theme.js'
import { useCompassRecords } from '@/composables/useCompassRecords.js'

const bgPrimary = getColor('background', 'primary')
const textPrimary = getColor('text', 'primary')

const navChromeStyle = computed(() => ({
  borderColor: 'rgba(255,255,255,0.22)',
  backgroundColor: 'rgba(0,0,0,0.12)',
}))

const navItems = [
  { to: '/compass/stars', label: '星盘' },
  { to: '/compass/timeline', label: '时间线' },
]

const { addDemoRecord } = useCompassRecords()
</script>

<style scoped>
.compass-app-nav-link {
  color: rgba(255, 255, 255, 0.78);
  border: 1px solid transparent;
}
.compass-app-nav-link:hover {
  color: #fff;
  background: rgba(255, 255, 255, 0.06);
}
.compass-app-nav-link--active {
  color: #fff;
  border-color: rgba(255, 255, 255, 0.35);
  background: rgba(255, 255, 255, 0.1);
  font-weight: 600;
}
</style>
