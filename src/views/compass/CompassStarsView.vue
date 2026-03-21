<template>
  <div class="compass-stars px-4 pb-16 sm:px-6">
    <header class="mb-6 max-w-3xl">
      <h2 class="font-boutique-primary text-xl text-white">知识星盘</h2>
      <p class="mt-2 text-sm text-white/65">
        示意：北斗七星、南斗六星、晨昏二星为「星座槽位」，记录按时间从旧到新依次点亮；多出的记录散作背景星辰，样式对齐 homi
        页星星闪烁。
      </p>
    </header>

    <div
      class="compass-starfield relative mx-auto overflow-hidden rounded-lg border border-white/20"
      :style="{ backgroundColor: bgDeep }"
    >
      <!-- 氛围星（同 homi：随机小点闪烁） -->
      <div class="pointer-events-none absolute inset-0" aria-hidden="true">
        <div
          v-for="s in ambientStars"
          :key="'a-' + s.id"
          class="compass-twinkle-star absolute rounded-full bg-white"
          :style="ambientStarStyle(s)"
        />
      </div>

      <!-- 星座连线 -->
      <svg
        class="pointer-events-none absolute inset-0 h-full w-full"
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
      >
        <g
          v-for="(seg, i) in lineSegments"
          :key="'ln-' + i"
          stroke="rgba(255,255,255,0.35)"
          stroke-width="0.12"
          stroke-linecap="round"
        >
          <line :x1="seg.x1" :y1="seg.y1" :x2="seg.x2" :y2="seg.y2" />
        </g>
      </svg>

      <!-- 知识星（可悬浮看标题） -->
      <button
        v-for="pl in placedStars"
        :key="pl.record.id"
        type="button"
        class="compass-knowledge-star absolute z-[2] -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/40 bg-white/90 outline-none ring-white/30 focus-visible:ring-2"
        :class="pl.sizeClass"
        :style="knowledgeStarPosition(pl)"
        :title="pl.record.title"
        :aria-label="pl.record.title"
        @click="selected = pl.record"
      >
        <span class="sr-only">{{ pl.record.title }}</span>
      </button>

      <div
        v-if="selected"
        class="absolute bottom-3 left-3 right-3 z-[3] rounded-md border border-white/25 bg-black/35 p-3 text-left text-sm text-white backdrop-blur-sm sm:left-auto sm:right-4 sm:w-80"
      >
        <div class="flex items-start justify-between gap-2">
          <div>
            <p class="font-boutique-primary text-base">{{ selected.title }}</p>
            <p class="mt-1 text-xs text-white/65">{{ selected.summary }}</p>
            <p class="mt-2 text-[10px] text-white/45">
              {{ formatDate(selected.createdAt) }}
            </p>
          </div>
          <button
            type="button"
            class="shrink-0 text-white/50 hover:text-white"
            aria-label="关闭"
            @click="selected = null"
          >
            ×
          </button>
        </div>
      </div>
    </div>

    <p class="mt-4 text-center text-xs text-white/45">
      当前 {{ records.length }} 条记录 · 槽位星座共 15 颗「主星」，其余为散星
    </p>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { getColor } from '@/config/theme.js'
import { useCompassRecords } from '@/composables/useCompassRecords.js'

const bgDeep = getColor('background', 'secondary')
const { records, sortedOldestFirst } = useCompassRecords()

const selected = ref(null)

/** 北斗七星（相对星野 0–100） */
const BIG_DIPPER = [
  [18, 58],
  [28, 44],
  [40, 38],
  [52, 42],
  [64, 48],
  [58, 68],
  [44, 74],
]
/** 南斗六星 */
const SOUTH_DIPPER = [
  [78, 28],
  [84, 36],
  [87, 48],
  [84, 58],
  [78, 66],
  [72, 56],
]
/** 晨昏二星（假想双亮星） */
const TWILIGHT_PAIR = [
  [26, 22],
  [34, 26],
]

const SLOT_GROUPS = [
  { name: 'big', points: BIG_DIPPER, edges: dipperEdges(BIG_DIPPER.length) },
  {
    name: 'south',
    points: SOUTH_DIPPER,
    edges: chainEdges(SOUTH_DIPPER.length),
  },
  { name: 'twilight', points: TWILIGHT_PAIR, edges: [[0, 1]] },
]

function dipperEdges(n) {
  if (n < 7) return chainEdges(n)
  return [
    [0, 1],
    [1, 2],
    [2, 3],
    [3, 4],
    [4, 5],
    [5, 6],
  ]
}

function chainEdges(n) {
  const e = []
  for (let i = 0; i < n - 1; i++) e.push([i, i + 1])
  return e
}

const ambientStars = ref([])

function generateAmbient(count) {
  const out = []
  for (let i = 0; i < count; i++) {
    out.push({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 2.2 + 0.8,
      delay: Math.random() * 4,
      duration: Math.random() * 2 + 2,
    })
  }
  ambientStars.value = out
}

function ambientStarStyle(s) {
  return {
    left: `${s.x}%`,
    top: `${s.y}%`,
    width: `${s.size}px`,
    height: `${s.size}px`,
    opacity: 0.75,
    animationDelay: `${s.delay}s`,
    animationDuration: `${s.duration}s`,
    animationName: 'compass-twinkle',
    animationIterationCount: 'infinite',
    animationTimingFunction: 'ease-in-out',
  }
}

const placedStars = computed(() => {
  const list = sortedOldestFirst.value
  const result = []
  let idx = 0

  for (const group of SLOT_GROUPS) {
    for (let s = 0; s < group.points.length && idx < list.length; s++, idx++) {
      const [x, y] = group.points[s]
      result.push({
        record: list[idx],
        x,
        y,
        group: group.name,
        sizeClass:
          group.name === 'twilight' ? 'h-3 w-3' : 'h-2.5 w-2.5 sm:h-3 sm:w-3',
      })
    }
  }

  while (idx < list.length) {
    const rec = list[idx]
    const hash = simpleHash(rec.id + idx)
    const x = 12 + (hash % 76)
    const y = 10 + ((hash >> 3) % 80)
    result.push({
      record: rec,
      x,
      y,
      group: 'scatter',
      sizeClass: 'h-2 w-2 sm:h-2.5 sm:w-2.5',
    })
    idx += 1
  }

  return result
})

const lineSegments = computed(() => {
  const list = sortedOldestFirst.value
  const segs = []
  let idx = 0

  for (const group of SLOT_GROUPS) {
    const nPlaced = Math.min(group.points.length, Math.max(0, list.length - idx))
    for (const [a, b] of group.edges) {
      if (a < nPlaced && b < nPlaced) {
        const [x1, y1] = group.points[a]
        const [x2, y2] = group.points[b]
        segs.push({ x1, y1, x2, y2 })
      }
    }
    idx += nPlaced
  }

  return segs
})

function knowledgeStarPosition(pl) {
  return {
    left: `${pl.x}%`,
    top: `${pl.y}%`,
  }
}

function simpleHash(str) {
  let h = 0
  for (let i = 0; i < str.length; i++) h = (h << 5) - h + str.charCodeAt(i)
  return Math.abs(h)
}

function formatDate(iso) {
  try {
    return new Date(iso).toLocaleString('zh-CN', {
      dateStyle: 'medium',
      timeStyle: 'short',
    })
  } catch {
    return iso
  }
}

onMounted(() => {
  generateAmbient(96)
})
</script>

<style>
@keyframes compass-twinkle {
  0%,
  100% {
    opacity: 0.28;
    transform: scale(1);
  }
  50% {
    opacity: 1;
    transform: scale(1.25);
  }
}
</style>

<style scoped>
.compass-starfield {
  min-height: min(72vh, 640px);
  max-width: 56rem;
}

.compass-knowledge-star {
  animation: compass-twinkle 3s ease-in-out infinite;
}
</style>
