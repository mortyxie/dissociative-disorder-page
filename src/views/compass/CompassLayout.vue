<template>
  <div
    class="compass-app relative flex min-h-0 flex-col overflow-hidden [height:100dvh] [min-height:100dvh]"
    :style="{ backgroundColor: bgPrimary, color: textPrimary }"
  >
    <!-- 全页居中、偏上的子导航（与全站顶栏同构：紧凑横排） -->
    <nav
      class="compass-subnav font-boutique-primary fixed left-1/2 top-12 z-[1060] inline-flex max-w-[calc(100vw-1rem)] -translate-x-1/2 flex-nowrap items-center rounded-md border border-white/20 bg-black/25 py-0.5 pl-0.5 pr-1 text-[10px] shadow backdrop-blur-sm sm:top-14 sm:pl-1 sm:pr-1.5 sm:text-[11px]"
      aria-label="Compass 视图切换"
    >
      <template v-for="(item, index) in navItems" :key="item.to">
        <RouterLink
          :to="item.to"
          class="compass-subnav-link shrink-0 whitespace-nowrap rounded-sm px-2 py-0.5 font-medium text-white/75 transition-colors hover:bg-white/10 hover:text-white"
          activeClass="compass-subnav-link--active"
        >
          {{ item.label }}
        </RouterLink>
        <span
          v-if="index < navItems.length - 1"
          class="compass-subnav-divider shrink-0 select-none px-0.5 text-white/35 sm:px-1"
          aria-hidden="true"
          >|</span
        >
      </template>
    </nav>

    <!-- 仅此区域滚动：滚动条在视口内，不占用 html 宽度，避免与星盘/时间线切换时 fixed 元素横向偏移 -->
    <main
      ref="compassMainEl"
      class="compass-app-main min-h-0 flex-1 overflow-x-hidden overflow-y-auto overscroll-y-contain pt-[4.25rem]"
    >
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
import { ref, watch } from 'vue'
import { RouterLink, RouterView, useRoute } from 'vue-router'
import { getColor } from '@/config/theme.js'
import { useCompassRecords } from '@/composables/useCompassRecords.js'

const bgPrimary = getColor('background', 'primary')
const textPrimary = getColor('text', 'primary')

const navItems = [
  { to: '/compass/stars', label: '星盘' },
  { to: '/compass/timeline', label: '时间线' },
]

const { addDemoRecord } = useCompassRecords()

const route = useRoute()
const compassMainEl = ref(null)

watch(
  () => route.fullPath,
  () => {
    compassMainEl.value?.scrollTo?.(0, 0)
  },
)
</script>

<style scoped>
.compass-subnav-divider {
  line-height: 1;
  align-self: center;
  /* 点阵字体里「|」常略偏下，与汉字垂直中线对齐 */
  transform: translateY(-0.08em);
}

.compass-subnav-link--active {
  background: rgba(255, 255, 255, 0.12);
  color: rgba(255, 255, 255, 0.95);
}
</style>
