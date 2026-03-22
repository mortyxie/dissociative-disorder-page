<template>
  <div
    class="compass-app relative flex min-h-0 flex-col overflow-hidden [height:100dvh] [min-height:100dvh]"
    :style="{ backgroundColor: bgPrimary, color: textPrimary }"
  >
    <!--
      三列网格：左右等宽，中间为子导航，避免右侧「登录」把「星盘|时间线」挤成视觉偏心；
      与原先单条 fixed 居中相比，数学中心与视口中心一致。
    -->
    <!-- 下移：落在星盘主画布（主题区）顶缘略上方，而不是贴全站顶栏 -->
    <header
      class="compass-top-chrome pointer-events-none fixed left-0 right-0 top-24 z-[1060] grid grid-cols-[1fr_auto_1fr] items-center gap-x-2 px-3 sm:top-28 sm:px-4"
    >
      <div class="min-w-0" aria-hidden="true" />
      <nav
        class="compass-subnav font-boutique-primary pointer-events-auto inline-flex max-w-[min(100%,calc(100vw-7.5rem))] flex-nowrap items-center justify-center rounded-md border border-white/20 bg-black/25 py-0.5 pl-0.5 pr-1 text-[10px] shadow backdrop-blur-sm sm:max-w-[min(100%,calc(100vw-9rem))] sm:pl-1 sm:pr-1.5 sm:text-[11px]"
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
      <div
        class="pointer-events-auto flex min-w-0 justify-end pr-4 sm:pr-6"
      >
        <CompassAuthPanel />
      </div>
    </header>

    <!-- 仅此区域滚动：滚动条在视口内，不占用 html 宽度，避免与星盘/时间线切换时 fixed 元素横向偏移 -->
    <main
      ref="compassMainEl"
      class="compass-app-main min-h-0 flex-1 overflow-x-hidden overflow-y-auto overscroll-y-contain pt-[7.75rem] sm:pt-[8.75rem] [scrollbar-gutter:stable]"
    >
      <RouterView />
    </main>

    <!--
      Teleport 到 body：避免父级 overflow-hidden / 层叠上下文导致 fixed 锚错边或裁切，
      并显式 left:auto + w-max，保证贴在视口右下角、宽度随文案不占满屏。
    -->
    <Teleport to="body">
      <div
        class="compass-corner-actions font-boutique-primary pointer-events-none fixed z-[1060] flex max-w-[calc(100vw-2rem)] flex-col-reverse items-end gap-2"
        style="
          left: auto;
          right: max(1.35rem, calc(env(safe-area-inset-right, 0px) + 14px));
          bottom: max(0.75rem, env(safe-area-inset-bottom, 0px));
        "
      >
        <button
          type="button"
          class="compass-add-record-btn pointer-events-auto box-border inline-flex h-7 w-max shrink-0 items-center justify-center gap-0.5 text-nowrap rounded-md border px-2.5 text-[10px] leading-none shadow backdrop-blur-sm sm:h-8 sm:px-3 sm:text-[11px]"
          :class="
            isLoggedIn
              ? 'border-white/30 bg-black/30 text-white/90 hover:bg-white/10'
              : 'cursor-not-allowed border-white/15 bg-black/20 text-white/40'
          "
          :disabled="!isLoggedIn"
          :title="
            isLoggedIn
              ? '打开文档编辑器，撰写 Markdown（含本地图片），关闭后生成新星'
              : '登录后可将记录写入你的本地存档；未登录时仅展示 5 条示例'
          "
          @click="isLoggedIn && openNewRecordEditor()"
        >
          <span class="font-medium opacity-90" aria-hidden="true">+</span>
          <span>添加记录</span>
        </button>
        <button
          v-if="isCompassStarsView"
          type="button"
          class="pointer-events-auto box-border inline-flex h-7 w-max shrink-0 items-center justify-center gap-0.5 text-nowrap rounded-md border px-2.5 text-[10px] leading-none shadow backdrop-blur-sm sm:h-8 sm:px-3 sm:text-[11px]"
          :class="
            showViewfinderHands
              ? 'border-white/28 bg-black/35 text-white/88 hover:bg-white/10'
              : 'border-white/18 bg-black/25 text-white/55 hover:bg-white/10 hover:text-white/80'
          "
          :aria-pressed="showViewfinderHands"
          :title="
            showViewfinderHands
              ? '隐藏星盘两侧的取景手势装饰（取景框线稿仍显示）'
              : '显示取景手势装饰'
          "
          @click="toggleViewfinderHands"
        >
          <span>{{ showViewfinderHands ? '隐藏手势' : '显示手势' }}</span>
        </button>
      </div>
    </Teleport>

    <CompassRecordEditorModal
      v-model="recordEditorOpen"
      :editing-record-id="recordEditorEditingId ?? undefined"
    />
  </div>
</template>

<script setup>
import { ref, watch, provide, computed } from 'vue'
import { RouterLink, RouterView, useRoute } from 'vue-router'
import { getColor } from '@/config/theme.js'
import { useCompassAuth } from '@/composables/useCompassAuth.js'
import CompassAuthPanel from '@/components/compass/CompassAuthPanel.vue'
import CompassRecordEditorModal from '@/components/compass/CompassRecordEditorModal.vue'

const bgPrimary = getColor('background', 'primary')
const textPrimary = getColor('text', 'primary')

const navItems = [
  { to: '/compass/stars', label: '星盘' },
  { to: '/compass/timeline', label: '时间线' },
]

const { isLoggedIn } = useCompassAuth()

/** 星盘取景器双手装饰（不含 ViewFinder 线稿） */
const showViewfinderHands = ref(true)
provide('compassShowViewfinderHands', showViewfinderHands)

function toggleViewfinderHands() {
  showViewfinderHands.value = !showViewfinderHands.value
}

const recordEditorOpen = ref(false)
/** 非空时为编辑已有记录；空为新建 */
const recordEditorEditingId = ref(null)

function openNewRecordEditor() {
  recordEditorEditingId.value = null
  recordEditorOpen.value = true
}

function openEditRecordEditor(id) {
  if (id == null) return
  recordEditorEditingId.value = id
  recordEditorOpen.value = true
}

provide('compassRecordEditor', {
  openNew: openNewRecordEditor,
  openEdit: openEditRecordEditor,
})

watch(recordEditorOpen, (open) => {
  if (!open) recordEditorEditingId.value = null
})

const route = useRoute()
const compassMainEl = ref(null)

/** 星盘页大手势会伸出舞台，需允许横向溢出以免被裁切 */
const isCompassStarsView = computed(
  () => route.path === '/compass/stars' || route.name === 'compass-stars',
)

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
