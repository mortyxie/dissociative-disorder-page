<template>
  <div
    class="compass-stars-page relative h-[calc(100vh-4.25rem)] min-h-[420px] w-full overflow-hidden"
    :style="{ backgroundColor: bgPrimary }"
  >
    <div
      class="pointer-events-none absolute inset-0 z-[1] select-none"
      aria-hidden="true"
    >
      <div
        class="stars-bg-hand stars-bg-hand--right absolute bottom-[6%] right-0 flex w-[min(22vw,200px)] flex-col items-center justify-end sm:w-[min(24vw,260px)]"
      >
        <div
          class="flex aspect-[3/5] w-[88%] flex-col items-center justify-center rounded-lg border border-dashed border-white/25 bg-white/[0.04] text-center"
        >
          <span class="px-2 text-[9px] leading-tight text-white/40">透明 PNG</span>
          <span class="font-boutique-primary text-[10px] text-white/55">右手构图</span>
        </div>
      </div>
    </div>

    <div
      class="stars-stage-shell absolute left-1/2 top-[48%] z-[10] w-[min(92vw,920px)] max-w-[92vw] -translate-x-1/2 -translate-y-1/2"
    >
      <div class="relative aspect-[4/3] w-full">
        <div
          class="pointer-events-none absolute inset-0 z-[15]"
          aria-hidden="true"
        >
          <span class="vf-corner vf-corner--tl" />
          <span class="vf-corner vf-corner--tr" />
          <span class="vf-corner vf-corner--bl" />
          <span class="vf-corner vf-corner--br" />
        </div>

        <div
          class="pointer-events-none absolute left-0 top-0 z-[20] flex w-[min(18vw,160px)] -translate-x-[6%] -translate-y-[10%] flex-col items-start sm:w-[min(20vw,200px)]"
        >
          <div
            class="flex aspect-[3/5] w-full flex-col items-center justify-center rounded-lg border border-dashed border-white/25 bg-white/[0.06] text-center shadow-sm"
          >
            <span class="px-2 text-[9px] leading-tight text-white/40">透明 PNG</span>
            <span class="font-boutique-primary text-[10px] text-white/55">左手构图</span>
          </div>
        </div>

        <div
          ref="clipRef"
          class="stars-stage-clip absolute inset-0 overflow-hidden rounded-md border border-white/25 bg-[#201E28] shadow-[0_0_0_1px_rgba(255,255,255,0.06)_inset]"
          :class="isGrabbing ? 'cursor-grabbing' : 'cursor-grab'"
          @mousedown.prevent="onPanStart"
          @touchstart.prevent="onTouchStart"
          @wheel.prevent="onWheel"
        >
          <div
            class="stars-pannable absolute left-0 top-0 will-change-transform"
            :style="pannableStyle"
          >
            <!-- 仅氛围星（小、暗、闪烁；无 record 含义） -->
            <div class="pointer-events-none" aria-hidden="true">
              <div
                v-for="s in ambientStars"
                :key="'a-' + s.id"
                class="absolute rounded-full bg-white"
                :style="ambientStyle(s)"
              />
            </div>

            <!-- 有 record 才有：星点 + 星线，同一 SVG、同一用户坐标系 -->
            <svg
              v-if="starFieldGraph.clusters.length > 0"
              class="stars-record-layer absolute left-0 top-0 block overflow-visible"
              :width="CANVAS_W"
              :height="CANVAS_H"
              :viewBox="`0 0 ${CANVAS_W} ${CANVAS_H}`"
              shape-rendering="geometricPrecision"
            >
              <defs>
                <filter
                  id="compass-record-glow"
                  x="-80%"
                  y="-80%"
                  width="260%"
                  height="260%"
                >
                  <feGaussianBlur stdDeviation="1.4" result="blur" />
                  <feMerge>
                    <feMergeNode in="blur" />
                    <feMergeNode in="SourceGraphic" />
                  </feMerge>
                </filter>
              </defs>

              <g
                v-for="c in starFieldGraph.clusters"
                :key="'cl-' + c.id"
                class="star-cluster"
              >
                <g class="pointer-events-none">
                  <line
                    v-for="(seg, i) in c.segments"
                    :key="'ln-' + c.id + '-' + i"
                    :x1="seg.x1"
                    :y1="seg.y1"
                    :x2="seg.x2"
                    :y2="seg.y2"
                    stroke="rgba(255,255,255,0.55)"
                    stroke-width="1.35"
                    stroke-linecap="round"
                    :stroke-dasharray="seg.len"
                    :stroke-dashoffset="
                      hoverClusterId === c.id ? 0 : seg.len
                    "
                    :opacity="hoverClusterId === c.id ? 1 : 0"
                    class="cluster-edge"
                  />
                </g>
                <circle
                  v-for="node in c.nodes"
                  :key="node.record.id"
                  class="record-star"
                  :cx="node.x"
                  :cy="node.y"
                  r="4.5"
                  fill="#ffffff"
                  stroke="rgba(255,255,255,0.7)"
                  stroke-width="0.85"
                  filter="url(#compass-record-glow)"
                  @mouseenter="onStarEnter(c.id)"
                  @mouseleave="onStarLeave"
                  @click.stop="selected = node.record"
                  @touchstart.stop.prevent="onRecordTouchStart(c.id)"
                />
              </g>
            </svg>
          </div>

          <p
            class="pointer-events-none absolute bottom-2 left-2 right-2 text-center text-[10px] text-white/35"
          >
            大星仅对应记录 · 悬停任一颗可动画连线同簇 · 拖曳平移 · 滚轮缩放
          </p>
        </div>
      </div>
    </div>

    <div
      v-if="selected"
      class="absolute bottom-4 left-4 right-4 z-[30] rounded-md border border-white/25 bg-black/55 p-3 text-left text-sm text-white backdrop-blur-md sm:left-auto sm:right-4 sm:w-[min(22rem,90vw)]"
      @mousedown.stop
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
          class="shrink-0 text-lg leading-none text-white/50 hover:text-white"
          aria-label="关闭"
          @click="selected = null"
        >
          ×
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import {
  ref,
  reactive,
  computed,
  watch,
  onMounted,
  onUnmounted,
  nextTick,
} from 'vue'
import { getColor } from '@/config/theme.js'
import { useCompassRecords } from '@/composables/useCompassRecords.js'

const CANVAS_W = 3400
const CANVAS_H = 2200

const bgPrimary = getColor('background', 'primary')
const { records, sortedOldestFirst } = useCompassRecords()

const clipRef = ref(null)
const pan = reactive({ x: 0, y: 0 })
const scale = ref(1)
const isGrabbing = ref(false)
const drag = reactive({
  active: false,
  startX: 0,
  startY: 0,
  panStartX: 0,
  panStartY: 0,
})

const selected = ref(null)
const ambientStars = ref([])
const hoverClusterId = ref(null)

let leaveDebounce = null
let touchLineTimer = null

const SCALE_MIN = 0.28
const SCALE_MAX = 3.2

const pannableStyle = computed(() => ({
  width: `${CANVAS_W}px`,
  height: `${CANVAS_H}px`,
  transformOrigin: '0 0',
  transform: `translate(${pan.x}px, ${pan.y}px) scale(${scale.value})`,
}))

function onStarEnter(clusterId) {
  if (leaveDebounce) {
    clearTimeout(leaveDebounce)
    leaveDebounce = null
  }
  hoverClusterId.value = clusterId
}

function onStarLeave() {
  leaveDebounce = setTimeout(() => {
    hoverClusterId.value = null
    leaveDebounce = null
  }, 120)
}

function onRecordTouchStart(clusterId) {
  if (touchLineTimer) clearTimeout(touchLineTimer)
  hoverClusterId.value = clusterId
  touchLineTimer = setTimeout(() => {
    hoverClusterId.value = null
    touchLineTimer = null
  }, 2400)
}

function mulberry32(seed) {
  return function rand() {
    let t = (seed += 0x6d2b79f5)
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

function clusterizeRecords(list) {
  if (list.length === 0) return []
  const rng = mulberry32(list.length * 7919 + simpleHash(String(list[0].id)))
  const clusters = []
  let i = 0
  while (i < list.length) {
    const rem = list.length - i
    let size
    if (rem <= 12) {
      if (rem < 5 && clusters.length > 0) {
        clusters[clusters.length - 1].records.push(...list.slice(i))
        break
      }
      size = rem
    } else {
      size = 5 + Math.floor(rng() * 8)
      size = Math.min(size, rem)
      const left = rem - size
      if (left > 0 && left < 5) size = rem
    }
    clusters.push({ id: clusters.length, records: list.slice(i, i + size) })
    i += size
  }
  return clusters
}

function clusterCenters(count) {
  const rng = mulberry32(count * 9973)
  const centers = []
  const baseR = 140
  const step = 52
  for (let k = 0; k < count; k++) {
    const angle = (k / Math.max(count, 1)) * Math.PI * 2 + 0.35 + rng() * 0.22
    const radius = baseR + (k % 6) * step + rng() * 22
    centers.push({
      cx: CANVAS_W / 2 + radius * Math.cos(angle),
      cy: CANVAS_H / 2 + radius * Math.sin(angle),
    })
  }
  return centers
}

/** 单簇内星点更分散 */
function layoutClusterRecords(clusterRecords, cx, cy, clusterSeed) {
  const rng = mulberry32(simpleHash(clusterRecords.map((r) => r.id).join('-')) + clusterSeed)
  const m = clusterRecords.length
  return clusterRecords.map((record, j) => {
    const t = j / Math.max(m, 1)
    const angle = t * Math.PI * 2 + rng() * 0.32
    const radius = 26 + Math.sqrt(j + 1) * 22 + rng() * 16
    const x = cx + radius * Math.cos(angle)
    const y = cy + radius * Math.sin(angle)
    return { record, x, y }
  })
}

function dist2(a, b) {
  const dx = a.x - b.x
  const dy = a.y - b.y
  return dx * dx + dy * dy
}

function mstEdges(nodes) {
  if (nodes.length < 2) return []
  const n = nodes.length
  const inTree = new Set([0])
  const edges = []
  while (inTree.size < n) {
    let bestI = -1
    let bestJ = -1
    let bestD = Infinity
    for (const i of inTree) {
      for (let j = 0; j < n; j++) {
        if (inTree.has(j)) continue
        const d = dist2(nodes[i], nodes[j])
        if (d < bestD) {
          bestD = d
          bestI = i
          bestJ = j
        }
      }
    }
    if (bestJ < 0) break
    edges.push([bestI, bestJ])
    inTree.add(bestJ)
  }
  return edges.map(([a, b]) => {
    const x1 = nodes[a].x
    const y1 = nodes[a].y
    const x2 = nodes[b].x
    const y2 = nodes[b].y
    const len = Math.hypot(x2 - x1, y2 - y1)
    return { x1, y1, x2, y2, len }
  })
}

/**
 * 仅由真实 record 生成簇；线端点与 circle 的 cx/cy 完全一致（同一 SVG）
 */
const starFieldGraph = computed(() => {
  const list = sortedOldestFirst.value
  if (!list.length) return { clusters: [] }

  const rawClusters = clusterizeRecords(list)
  const centers = clusterCenters(rawClusters.length)
  const clusters = []

  rawClusters.forEach((cl, k) => {
    const { cx, cy } = centers[k] || { cx: CANVAS_W / 2, cy: CANVAS_H / 2 }
    const nodes = layoutClusterRecords(cl.records, cx, cy, k * 97)
    const segments = mstEdges(nodes)
    clusters.push({ id: k, nodes, segments })
  })

  return { clusters }
})

function simpleHash(str) {
  let h = 0
  for (let i = 0; i < str.length; i++) h = (h << 5) - h + str.charCodeAt(i)
  return Math.abs(h) || 1
}

function generateAmbient() {
  const rng = mulberry32(42)
  const out = []
  const count = 380
  for (let i = 0; i < count; i++) {
    out.push({
      id: i,
      x: rng() * CANVAS_W,
      y: rng() * CANVAS_H,
      size: rng() * 1.25 + 0.45,
      delay: rng() * 4,
      duration: rng() * 2 + 2,
    })
  }
  ambientStars.value = out
}

function ambientStyle(s) {
  return {
    left: `${s.x}px`,
    top: `${s.y}px`,
    width: `${s.size}px`,
    height: `${s.size}px`,
    opacity: 0.42,
    animationDelay: `${s.delay}s`,
    animationDuration: `${s.duration}s`,
    animationName: 'compass-twinkle',
    animationIterationCount: 'infinite',
    animationTimingFunction: 'ease-in-out',
  }
}

function fitPanToCenter() {
  const el = clipRef.value
  if (!el) return
  const w = el.clientWidth
  const h = el.clientHeight
  const s = scale.value
  pan.x = w / 2 - (CANVAS_W / 2) * s
  pan.y = h / 2 - (CANVAS_H / 2) * s
}

function onWheel(e) {
  const el = clipRef.value
  if (!el) return
  const rect = el.getBoundingClientRect()
  const mx = e.clientX - rect.left
  const my = e.clientY - rect.top
  const oldS = scale.value
  const factor = e.deltaY > 0 ? 0.92 : 1.08
  const newS = Math.min(SCALE_MAX, Math.max(SCALE_MIN, oldS * factor))
  if (newS === oldS) return

  const wx = (mx - pan.x) / oldS
  const wy = (my - pan.y) / oldS
  pan.x = mx - wx * newS
  pan.y = my - wy * newS
  scale.value = newS
}

function isRecordStarTarget(el) {
  if (!el || !el.closest) return false
  return Boolean(el.closest('circle.record-star'))
}

function onPanStart(e) {
  if (e.button !== 0) return
  if (isRecordStarTarget(e.target)) return
  isGrabbing.value = true
  drag.active = true
  drag.startX = e.clientX
  drag.startY = e.clientY
  drag.panStartX = pan.x
  drag.panStartY = pan.y
}

function onPanMove(e) {
  if (!drag.active) return
  pan.x = drag.panStartX + (e.clientX - drag.startX)
  pan.y = drag.panStartY + (e.clientY - drag.startY)
}

function onPanEnd() {
  drag.active = false
  isGrabbing.value = false
}

function onTouchStart(e) {
  if (e.touches.length !== 1) return
  const t = e.touches[0]
  const el = document.elementFromPoint(t.clientX, t.clientY)
  if (isRecordStarTarget(el)) return
  isGrabbing.value = true
  drag.active = true
  drag.startX = t.clientX
  drag.startY = t.clientY
  drag.panStartX = pan.x
  drag.panStartY = pan.y
}

function onTouchMove(e) {
  if (!drag.active || e.touches.length !== 1) return
  e.preventDefault()
  const t = e.touches[0]
  pan.x = drag.panStartX + (t.clientX - drag.startX)
  pan.y = drag.panStartY + (t.clientY - drag.startY)
}

function onTouchEnd() {
  onPanEnd()
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

onMounted(async () => {
  generateAmbient()
  await nextTick()
  fitPanToCenter()
  window.addEventListener('mousemove', onPanMove)
  window.addEventListener('mouseup', onPanEnd)
  window.addEventListener('mouseleave', onPanEnd)
  window.addEventListener('touchmove', onTouchMove, { passive: false })
  window.addEventListener('touchend', onTouchEnd)
  window.addEventListener('touchcancel', onTouchEnd)
})

onUnmounted(() => {
  if (leaveDebounce) clearTimeout(leaveDebounce)
  if (touchLineTimer) clearTimeout(touchLineTimer)
  window.removeEventListener('mousemove', onPanMove)
  window.removeEventListener('mouseup', onPanEnd)
  window.removeEventListener('mouseleave', onPanEnd)
  window.removeEventListener('touchmove', onTouchMove)
  window.removeEventListener('touchend', onTouchEnd)
  window.removeEventListener('touchcancel', onTouchEnd)
})

watch(
  () => records.value.length,
  () => {
    selected.value = null
  },
)
</script>

<style>
@keyframes compass-twinkle {
  0%,
  100% {
    opacity: 0.18;
    transform: scale(1);
  }
  50% {
    opacity: 0.85;
    transform: scale(1.2);
  }
}
</style>

<style scoped>
.cluster-edge {
  transition:
    stroke-dashoffset 0.48s cubic-bezier(0.33, 1, 0.68, 1),
    opacity 0.28s ease;
}

.record-star {
  cursor: pointer;
}

.vf-corner {
  position: absolute;
  width: 32px;
  height: 32px;
  border-color: rgba(255, 255, 255, 0.45);
  border-style: solid;
  pointer-events: none;
}
.vf-corner--tl {
  left: 0;
  top: 0;
  border-width: 2px 0 0 2px;
}
.vf-corner--tr {
  right: 0;
  top: 0;
  border-width: 2px 2px 0 0;
}
.vf-corner--bl {
  left: 0;
  bottom: 0;
  border-width: 0 0 2px 2px;
}
.vf-corner--br {
  right: 0;
  bottom: 0;
  border-width: 0 2px 2px 0;
}
</style>
