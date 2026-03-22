<template>
  <div
    class="compass-stars-page relative h-full min-h-[420px] w-full min-w-0 overflow-visible"
    :style="{ backgroundColor: bgPrimary }"
  >
    <div
      class="stars-stage-shell absolute left-1/2 top-2 z-[10] w-[min(96vw,1000px)] max-w-[96vw] -translate-x-1/2 sm:top-2.5"
    >
      <!--
        取景器主题层：4:3 舞台与 ViewFinder_4By3 对齐。
        位置微调 → 见下方 scoped 样式中 .stars-viewfinder-wrap 的 CSS 变量。
      -->
      <div
        class="stars-viewfinder-wrap relative aspect-[4/3] w-full overflow-visible"
      >
        <!--
          取景器 PNG 与双手共用 .stars-viewfinder-raster：尺寸 = 4:3 舞台内 object-fit:contain 后的
          实际线框区域（与 ViewFinder_4By3.png 像素比 1898:1252 一致）。手的 % 相对此框，而非星图主体。
        -->
        <div class="stars-viewfinder-frame" aria-hidden="true">
          <!-- 线稿 PNG 单独一层 -->
          <div class="stars-viewfinder-raster">
            <img
              class="stars-viewfinder-frame__img"
              :src="viewFinderFrameUrl"
              alt=""
              draggable="false"
            />
          </div>
          <!-- 双手在 PNG 之上，避免角部线稿盖住手背/指尖 -->
          <div v-show="showViewfinderHands" class="stars-viewfinder-hand-layer">
            <!-- 右手在先、左手在后：大宽度时两图包络易重叠，后绘制的在上，避免右手盖住左手 -->
            <div
              class="stars-viewfinder-hand stars-viewfinder-hand--right"
              aria-hidden="true"
            >
              <img
                class="stars-viewfinder-hand__img"
                :src="viewFinderHandRightUrl"
                alt=""
                draggable="false"
              />
            </div>
            <div
              class="stars-viewfinder-hand stars-viewfinder-hand--left"
              aria-hidden="true"
            >
              <img
                class="stars-viewfinder-hand__img"
                :src="viewFinderHandLeftUrl"
                alt=""
                draggable="false"
              />
            </div>
          </div>
        </div>

        <div
          class="compass-zoom-bar pointer-events-none absolute right-0 top-[20%] z-[25] flex h-[60%] w-[min(36vw,176px)] max-w-[min(176px,calc(100%-6px))] translate-x-0 flex-col items-end pr-1 sm:w-[min(30vw,164px)] sm:max-w-[min(164px,calc(100%-8px))]"
          role="group"
          aria-label="画布缩放刻度"
        >
          <div class="compass-zoom-bar__chrome w-full shrink-0">
            <div
              class="font-boutique-primary text-right text-sm font-medium tabular-nums tracking-tight text-white/90 drop-shadow-[0_2px_12px_rgba(0,0,0,0.88)]"
            >
              <span
                class="text-[1.85rem] font-semibold leading-none text-white sm:text-[2rem]"
                >{{ zoomReadoutMain }}</span
              ><span class="align-super text-[0.62em] text-white/78">×</span>
            </div>
          </div>

          <div
            ref="zoomBarViewportRef"
            class="compass-zoom-bar__viewport pointer-events-auto relative mt-2 min-h-0 max-w-full flex-1 shrink-0 select-none overflow-hidden self-end"
            :style="{ width: `${BAR_SVG_W}px` }"
            @mousedown.stop
            @pointerdown.stop.prevent="onZoomDialPointerDown"
            @wheel.stop.prevent="onZoomDialWheel"
          >
            <!-- 固定水平游标（中线） -->
            <div
              class="pointer-events-none absolute inset-x-0 top-1/2 z-10 flex -translate-y-1/2 justify-end"
              aria-hidden="true"
            >
              <div
                class="compass-zoom-bar__needle h-[2px] w-[20%] max-w-[36px] shrink-0 rounded-full bg-[#FF3B30] shadow-[0_0_6px_rgba(255,59,48,0.45)]"
              />
            </div>
            <svg
              class="compass-zoom-bar__svg ml-auto block shrink-0 will-change-transform"
              :style="zoomBarSvgStyle"
              :viewBox="zoomBarViewBox"
              :width="BAR_SVG_W"
              :height="barSvgTotalH"
              aria-hidden="true"
            >
              <defs>
                <linearGradient
                  id="compass-zoom-rail-fade"
                  x1="0%"
                  y1="0%"
                  x2="0%"
                  y2="100%"
                >
                  <stop offset="0%" stop-color="#fff" stop-opacity="0" />
                  <stop offset="10%" stop-color="#fff" stop-opacity="0.22" />
                  <stop offset="50%" stop-color="#fff" stop-opacity="0.4" />
                  <stop offset="90%" stop-color="#fff" stop-opacity="0.22" />
                  <stop offset="100%" stop-color="#fff" stop-opacity="0" />
                </linearGradient>
              </defs>
              <line
                :x1="BAR_RAIL_X"
                :y1="BAR_STRIP_EDGE_PAD"
                :x2="BAR_RAIL_X"
                :y2="BAR_STRIP_EDGE_PAD + barStripLengthPx"
                stroke="url(#compass-zoom-rail-fade)"
                stroke-width="5"
                stroke-linecap="round"
                opacity="0.5"
              />
              <g class="compass-zoom-bar__ticks">
                <g v-for="(tk, i) in barTicks" :key="'bk-' + i">
                  <line
                    :x1="tk.x1"
                    :y1="tk.y"
                    :x2="tk.x2"
                    :y2="tk.y"
                    :stroke="
                      tk.major
                        ? 'rgba(255,255,255,0.94)'
                        : 'rgba(255,255,255,0.3)'
                    "
                    :stroke-width="tk.major ? 1.45 : 1.05"
                    stroke-linecap="round"
                  />
                  <text
                    v-if="tk.label"
                    :x="tk.tx"
                    :y="tk.ty"
                    fill="rgba(255,255,255,0.84)"
                    class="compass-zoom-bar__label"
                    font-size="11"
                    text-anchor="end"
                    dominant-baseline="middle"
                  >
                    {{ tk.label }}
                  </text>
                </g>
              </g>
            </svg>
          </div>
        </div>

        <div
          ref="clipRef"
          class="stars-stage-clip stars-stage-clip--inset absolute z-[12] overflow-hidden rounded-md border border-white/25 bg-[#201E28] shadow-[0_0_0_1px_rgba(255,255,255,0.06)_inset]"
          :class="clipStageCursorClass"
          @mousedown.prevent="onPanStart"
          @touchstart.prevent="onTouchStart"
          @wheel.prevent="onWheel"
        >
          <div
            class="stars-pannable absolute left-0 top-0 will-change-transform"
            :style="pannableStyle"
          >
            <div class="pointer-events-none" aria-hidden="true">
              <div
                v-for="s in ambientStars"
                :key="'a-' + s.id"
                class="absolute rounded-full bg-white"
                :style="ambientStyle(s)"
              />
            </div>

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
                    v-for="seg in c.segments"
                    :key="
                      'graph-' +
                      c.id +
                      '-' +
                      (seg.i1 < seg.i2
                        ? seg.i1 + '-' + seg.i2
                        : seg.i2 + '-' + seg.i1)
                    "
                    v-bind="segmentLineEndpoints(c, seg)"
                    stroke="rgba(255,255,255,0.55)"
                    stroke-width="1.35"
                    stroke-linecap="round"
                    class="cluster-edge"
                    :style="segmentEdgeStyle(c, seg)"
                  />
                </g>

                <g
                  v-for="node in c.nodes"
                  :key="node.record.id"
                  class="record-star-group"
                  :class="{
                    'record-star--pulse': pulseStarRecordId === node.record.id,
                  }"
                  @mouseenter="onStarGroupMouseEnter(node.record, $event)"
                  @mousemove="onStarGroupMouseMove($event)"
                  @mouseleave="onStarGroupMouseLeave"
                >
                  <circle
                    :cx="node.x"
                    :cy="node.y"
                    r="30"
                    fill="transparent"
                    class="select-none"
                    :class="recordStarHitCursorClass(node.record.id)"
                    @pointerdown.stop.prevent="
                      onRecordStarPointerDown(node.record, $event)
                    "
                  />
                  <circle
                    class="record-star-core"
                    :cx="node.x"
                    :cy="node.y"
                    r="4.75"
                    fill="#ffffff"
                    stroke="rgba(255,255,255,0.72)"
                    stroke-width="0.85"
                    filter="url(#compass-record-glow)"
                    pointer-events="none"
                  />
                </g>
              </g>
            </svg>
          </div>

          <p
            class="pointer-events-none absolute bottom-2 left-2 right-2 text-center text-[10px] text-white/35"
          >
            当天上星河转，我命已定盘。
          </p>
        </div>
      </div>
    </div>

    <Teleport to="body">
      <div
        v-if="starHoverTip"
        class="compass-star-hover-tip font-boutique-primary pointer-events-none fixed z-[1040] w-[min(16rem,calc(100vw-1.5rem))] rounded-lg border border-white/20 bg-black/80 px-3 py-2 text-left shadow-lg backdrop-blur-md"
        :style="starHoverTipStyle"
        role="tooltip"
      >
        <p
          class="text-[11px] font-medium leading-snug text-white/95 sm:text-xs"
        >
          {{ starHoverTip.record.title || "无标题" }}
        </p>
        <p class="mt-1 text-[9px] text-white/50 sm:text-[10px]">
          {{ formatDate(starHoverTip.record.createdAt) }}
        </p>
        <div v-if="starHoverTipTags.length" class="mt-1.5 flex flex-wrap gap-1">
          <span
            v-for="tg in starHoverTipTags"
            :key="tg"
            class="rounded-full border border-white/22 bg-white/[0.08] px-1.5 py-0.5 text-[8px] text-white/75 sm:text-[9px]"
            >{{ tg }}</span
          >
          <span
            v-if="starHoverTipMoreTagCount > 0"
            class="text-[8px] text-white/45 sm:text-[9px]"
            >+{{ starHoverTipMoreTagCount }}</span
          >
        </div>
        <p v-else class="mt-1 text-[9px] italic text-white/38 sm:text-[10px]">
          无标签
        </p>
      </div>
    </Teleport>
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
  shallowRef,
  inject,
} from "vue";
import { getColor } from "@/config/theme.js";
import { useCompassRecords } from "@/composables/useCompassRecords.js";
import { renderSimpleMarkdown } from "@/utils/simpleMarkdown.js";
import windbellUrl from "@/assets/music/windbell.mp3";
import gearRotationUrl from "@/assets/music/GearRotation.mp3";
import viewFinderFrameUrl from "@/assets/img/ViewFinder_4By3.png";
import viewFinderHandLeftUrl from "@/assets/img/ViewFinder_Hand_00.png";
import viewFinderHandRightUrl from "@/assets/img/ViewFinder_Hand_01.png";

const CANVAS_W = 3400;
const CANVAS_H = 2200;

const bgPrimary = getColor("background", "primary");
const { records, sortedOldestFirst, starPositions, setStarPosition } =
  useCompassRecords();
const compassRecordEditor = inject("compassRecordEditor", null);
const showViewfinderHands = inject("compassShowViewfinderHands", ref(true));

/** 鼠标悬停星点时的缩略预览（视口坐标） */
const starHoverTip = ref(null);
const HOVER_TIP_TAG_MAX = 6;

const starHoverTipTags = computed(() => {
  const r = starHoverTip.value?.record;
  const tags = Array.isArray(r?.tags) ? r.tags : [];
  return tags.slice(0, HOVER_TIP_TAG_MAX);
});

const starHoverTipMoreTagCount = computed(() => {
  const r = starHoverTip.value?.record;
  const tags = Array.isArray(r?.tags) ? r.tags : [];
  return Math.max(0, tags.length - HOVER_TIP_TAG_MAX);
});

const starHoverTipStyle = computed(() => {
  const t = starHoverTip.value;
  if (!t) return {};
  const pad = 14;
  return {
    left: `${t.x + pad}px`,
    top: `${t.y + pad}px`,
  };
});

const clipRef = ref(null);
const pan = reactive({ x: 0, y: 0 });
const scale = ref(1);
const isGrabbing = ref(false);
const drag = reactive({
  active: false,
  startX: 0,
  startY: 0,
  panStartX: 0,
  panStartY: 0,
});

const recordDrag = reactive({
  active: false,
  recordId: null,
});

/** 拖动中仅更新此项以驱动 UI，避免每帧写 starPositions 触发整图重算卡顿 */
const dragLive = reactive({
  recordId: null,
  x: 0,
  y: 0,
});

/** 视口像素：星星中心在指针下方一点，避免光标完全挡住星点；设为 0 则中心与指针点重合 */
const DRAG_STAR_UNDER_CURSOR_OFFSET_Y = 8;

const pulseStarRecordId = ref(null);
let pulseClearTimer = null;

/** 画布空白区域：默认箭头；拖星时为 grabbing（星上 hover 由 recordStarHitCursorClass 控制） */
const clipStageCursorClass = computed(() => {
  if (recordDrag.active) return "cursor-grabbing";
  return "cursor-default";
});

function recordStarHitCursorClass(recordId) {
  if (recordDrag.active && recordDrag.recordId === recordId) {
    return "cursor-grabbing";
  }
  if (hoverHubRecordId.value === recordId) return "cursor-grab";
  return "cursor-auto";
}

function triggerStarPulse(recordId) {
  pulseStarRecordId.value = recordId;
  if (pulseClearTimer) clearTimeout(pulseClearTimer);
  pulseClearTimer = setTimeout(() => {
    pulseStarRecordId.value = null;
    pulseClearTimer = null;
  }, 320);
}

/** 在星星上按下后等待短按 / 滑动拖 / 长按拖的指针状态 */
const starPointer = reactive({
  pending: false,
  recordId: null,
  pendingRecord: null,
  downTime: 0,
  downClientX: 0,
  downClientY: 0,
  lastClientX: 0,
  lastClientY: 0,
  captureTarget: null,
  capturePointerId: null,
});

let longPressTimer = null;

const ambientStars = ref([]);
const hoverHubRecordId = ref(null);
/** 正在按「从叶向根」顺序收起星线（与出现顺序镜像） */
const edgeRetracting = ref(false);
/** clusterId → (segmentKey → retractDelayMs) */
const retractScheduleByCluster = shallowRef(new Map());
/**
 * 收起动画阶段：0=与出现结束态一致；1=无过渡切到「实线 L + 尾隙 ε」（与全显几乎一致）；
 * 2=stroke-dasharray 由 `L ε` 过渡到 `ε L`：实线从父端画出、尾隙吃子端，是「变短」而非 offset 滑动（避免像重绘）。
 */
const retractAnimPhase = ref(0);
let retractFinishTimer = null;

let leaveDebounce = null;
/** 当前悬停 hub 开始时刻（performance.now），用于「画完后再保留」 */
let hoverHubAnchorTime = 0;
/** 以当前 hub 为根的有向树边，最后一条边画完相对 anchor 的时长 (ms) */
let lastHubTreeMaxDrawMs = 0;

/** 拨盘与画布缩放一致；滚轮亦限制在此区间 */
const SCALE_MIN = 0.5;
const SCALE_MAX = 2;

const MAJOR_ZOOM = [0.5, 0.75, 1, 1.25, 1.5, 1.75, 2];

/** 条形刻度：SVG 宽度；刻度带长度为视口高的倍数（可滚动对齐中线） */
const BAR_SVG_W = 138;
const BAR_STRIP_RATIO = 2.72;
const BAR_RAIL_X = BAR_SVG_W - 6;
/** 刻度从导轨向左伸出；主刻度仍长于次刻度，但整体更短 */
const BAR_TICK_MAJOR_LEN = 22;
const BAR_TICK_MINOR_LEN = 10;
/** 主刻度数字右缘与刻度左端间距，避免「1.25」被线穿过 */
const BAR_LABEL_GAP = 6;
/** SVG 上下留白，避免最上/最下主刻度数字被 overflow 裁掉一半 */
const BAR_STRIP_EDGE_PAD = 20;

const zoomBarViewportRef = ref(null);
const barViewportH = ref(300);
let zoomBarResizeObserver = null;

const zoomDialDrag = reactive({
  active: false,
  startPointerY: 0,
  startT: 0,
});

/** px 纵向拖动 ≈ 满量程 t（对数 0.5→2） */
const ZOOM_BAR_DRAG_SENS = 300;

function logTScale(s) {
  const lo = Math.log10(SCALE_MIN);
  const hi = Math.log10(SCALE_MAX);
  return (Math.log10(s) - lo) / (hi - lo);
}

function scaleFromT(t) {
  const lo = Math.log10(SCALE_MIN);
  const hi = Math.log10(SCALE_MAX);
  const tt = Math.min(1, Math.max(0, t));
  return 10 ** (lo + tt * (hi - lo));
}

function scaleToT(s) {
  const clamped = Math.min(SCALE_MAX, Math.max(SCALE_MIN, s));
  return logTScale(clamped);
}

function formatZoomReadout(s) {
  const x = Math.min(SCALE_MAX, Math.max(SCALE_MIN, s));
  if (x >= 1.995) return "2";
  if (x <= 0.505) return "0.5";
  if (x >= 1) {
    const t = x.toFixed(1);
    return t.endsWith(".0") ? String(Math.round(x)) : t;
  }
  return x.toFixed(2).replace(/\.?0+$/, "") || "0.5";
}

function formatTickLabel(m) {
  if (m >= 2 - 1e-6) return "2";
  if (m <= 0.5 + 1e-6) return "0.5";
  return String(Number.parseFloat(m.toFixed(2)));
}

const zoomReadoutMain = computed(() => formatZoomReadout(scale.value));

function measureZoomBarViewport() {
  const el = zoomBarViewportRef.value;
  if (el && el.clientHeight > 0) barViewportH.value = el.clientHeight;
}

const barStripLengthPx = computed(() => {
  const h = barViewportH.value > 0 ? barViewportH.value : 300;
  return Math.round(Math.max(280, h * BAR_STRIP_RATIO));
});

const barSvgTotalH = computed(
  () => barStripLengthPx.value + 2 * BAR_STRIP_EDGE_PAD,
);

/** 上端 t=1（倍率大），下端 t=0（倍率小）；当前 t 对齐视口垂直中线 */
const zoomBarTranslateY = computed(() => {
  const H = barViewportH.value > 0 ? barViewportH.value : 300;
  const L = barStripLengthPx.value;
  const pad = BAR_STRIP_EDGE_PAD;
  const t = scaleToT(scale.value);
  const yPos = pad + (1 - t) * L;
  return H / 2 - yPos;
});

const zoomBarSvgStyle = computed(() => ({
  transform: `translateY(${zoomBarTranslateY.value}px)`,
}));

const zoomBarViewBox = computed(() => `0 0 ${BAR_SVG_W} ${barSvgTotalH.value}`);

const barLabelIndexToMajor = computed(() => {
  const m = new Map();
  for (const v of MAJOR_ZOOM) {
    m.set(Math.round(scaleToT(v) * 100), v);
  }
  return m;
});

const barTicks = computed(() => {
  const L = barStripLengthPx.value;
  const pad = BAR_STRIP_EDGE_PAD;
  const majors = barLabelIndexToMajor.value;
  const xRail = BAR_RAIL_X;
  const out = [];
  for (let i = 0; i <= 100; i++) {
    const t = i / 100;
    const y = pad + (1 - t) * L;
    const majorVal = majors.get(i);
    const major = majorVal != null;
    const len = major ? BAR_TICK_MAJOR_LEN : BAR_TICK_MINOR_LEN;
    const x2 = xRail;
    const x1 = xRail - len;
    const label = major ? formatTickLabel(majorVal) : null;
    const tx = label != null ? x1 - BAR_LABEL_GAP : 0;
    const ty = y;
    out.push({
      x1,
      x2,
      y,
      major,
      label,
      tx,
      ty,
    });
  }
  return out;
});

function onZoomDialWheel(e) {
  const dt = (e.deltaY > 0 ? -1 : 1) * 0.028;
  const nt = Math.min(1, Math.max(0, scaleToT(scale.value) + dt));
  setScaleTowardCenter(scaleFromT(nt));
}

function onZoomDialPointerDown(e) {
  if (e.button != null && e.button !== 0) return;
  e.stopPropagation();
  zoomDialDrag.active = true;
  zoomDialDrag.startPointerY = e.clientY;
  zoomDialDrag.startT = scaleToT(scale.value);
  const el = e.currentTarget;
  if (el?.setPointerCapture && e.pointerId != null) {
    try {
      el.setPointerCapture(e.pointerId);
    } catch (_) {}
  }
}

function endZoomDialDrag() {
  if (!zoomDialDrag.active) return;
  zoomDialDrag.active = false;
}

/** 星间连线：欧氏距离须在 [STAR_LINK_DISTANCE_MARGIN, 1.5×] 内；每星无向度 ≤2，且作为「发起方」最多 2 次 */
const STAR_LINK_DISTANCE_MARGIN = 96;
const MAX_STAR_INITIATED_LINKS = 2;

/** 几乎不移动时，按住超过此时长后进入拖动；移动超过 STAR_DRAG_SLOP_PX 会立刻拖 */
const STAR_LONG_PRESS_MS = 380;
/** 视口像素：位移超过此值立即视为拖动 */
const STAR_DRAG_SLOP_PX = 6;
/** 短按：在 slop 内且按下时长小于此值 → 打开详情 */
const STAR_TAP_MAX_MS = 520;

/** 单条边从起点画到终点的时长；子星「被连接」时刻 = 该边开始时刻 + 此值；收起每条边也用此时长 */
const EDGE_DRAW_MS = 200;
/** 收起用 dash「尾隙」下限，避免 0 宽在部分引擎异常 */
const EDGE_RETRACT_TAIL_GAP_MIN = 0.28;
/** 全部星线画完后至少再保持可见多久，之后才因脱离悬停而收起 */
const EDGE_REST_AFTER_DRAW_MS = 1000;

/**
 * 自根传播：边 (p→c) 仅在 p 已连接且 p 的上一条出边画完后才开始；
 * 根星无入边，视为 t=0 已连接。
 */
function computePropagationStartMs(edges, hubIdx, nodeCount, drawMs) {
  const nodeReady = Array(nodeCount).fill(Infinity);
  const emitNextAt = Array(nodeCount).fill(0);
  nodeReady[hubIdx] = 0;
  emitNextAt[hubIdx] = 0;
  const starts = [];
  for (const e of edges) {
    const { pIdx, cIdx } = e;
    const start = Math.max(nodeReady[pIdx], emitNextAt[pIdx]);
    starts.push(start);
    emitNextAt[pIdx] = start + drawMs;
    nodeReady[cIdx] = start + drawMs;
  }
  return starts;
}

/**
 * 与 computePropagationStartMs 对称：从叶向根收。
 * 边 (p→c) 仅当 c 子树内所有向下的边都收完后才能开始；同一父节点下子边按「出现顺序」的逆序串行。
 * 故与 hub 相连的边一定最后才开始消失。
 */
function computeRetractionStartMs(edges, hubIdx, nodeCount, drawMs) {
  const children = Array.from({ length: nodeCount }, () => []);
  for (const e of edges) {
    children[e.pIdx].push(e.cIdx);
  }
  const retractStart = new Map();
  const subtreeDone = Array(nodeCount).fill(0);

  function dfs(v) {
    const chs = children[v];
    let slot = 0;
    for (let i = chs.length - 1; i >= 0; i--) {
      const ch = chs[i];
      dfs(ch);
      const start = Math.max(slot, subtreeDone[ch]);
      retractStart.set(mstSegmentKey(v, ch), start);
      slot = start + drawMs;
    }
    subtreeDone[v] = slot;
  }

  dfs(hubIdx);
  return retractStart;
}

const pannableStyle = computed(() => ({
  width: `${CANVAS_W}px`,
  height: `${CANVAS_H}px`,
  transformOrigin: "0 0",
  transform: `translate(${pan.x}px, ${pan.y}px) scale(${scale.value})`,
}));

/** 以视口内某点为锚缩放（坐标相对 clip 左上角） */
function setScaleTowardPoint(newS, viewportMx, viewportMy) {
  const oldS = scale.value;
  const clamped = Math.min(SCALE_MAX, Math.max(SCALE_MIN, newS));
  if (Math.abs(clamped - oldS) < 1e-9) return;
  const wx = (viewportMx - pan.x) / oldS;
  const wy = (viewportMy - pan.y) / oldS;
  pan.x = viewportMx - wx * clamped;
  pan.y = viewportMy - wy * clamped;
  scale.value = clamped;
  playGearRotationThrottled();
}

function setScaleTowardCenter(newS) {
  const el = clipRef.value;
  if (!el) return;
  setScaleTowardPoint(newS, el.clientWidth / 2, el.clientHeight / 2);
}

function cancelEdgeRetractInFlight() {
  if (retractFinishTimer != null) {
    clearTimeout(retractFinishTimer);
    retractFinishTimer = null;
  }
  edgeRetracting.value = false;
  retractAnimPhase.value = 0;
  retractScheduleByCluster.value = new Map();
}

function onStarEnter(recordId) {
  if (leaveDebounce) {
    clearTimeout(leaveDebounce);
    leaveDebounce = null;
  }
  cancelEdgeRetractInFlight();
  hoverHubRecordId.value = recordId;
  anchorHubHoverTiming(recordId);
}

function onStarLeave() {
  if (recordDrag.active) return;
  scheduleDeferredHubClear();
}

function onStarGroupMouseEnter(record, e) {
  onStarEnter(record.id);
  starHoverTip.value = {
    record,
    x: e.clientX,
    y: e.clientY,
  };
}

function onStarGroupMouseMove(e) {
  if (!starHoverTip.value) return;
  starHoverTip.value = {
    ...starHoverTip.value,
    x: e.clientX,
    y: e.clientY,
  };
}

function onStarGroupMouseLeave() {
  starHoverTip.value = null;
  onStarLeave();
}

function clearStarLongPressTimer() {
  if (longPressTimer) {
    clearTimeout(longPressTimer);
    longPressTimer = null;
  }
}

function playWindbell() {
  try {
    const a = new Audio(windbellUrl);
    a.volume = 0.88;
    void a.play();
  } catch (_) {}
}

let gearSoundLastPlay = 0;
const GEAR_SOUND_MIN_INTERVAL_MS = 72;

function playGearRotationThrottled() {
  const now = Date.now();
  if (now - gearSoundLastPlay < GEAR_SOUND_MIN_INTERVAL_MS) return;
  gearSoundLastPlay = now;
  try {
    const a = new Audio(gearRotationUrl);
    a.volume = 0.42;
    void a.play();
  } catch (_) {}
}

function resetStarPointer() {
  starPointer.pending = false;
  starPointer.recordId = null;
  starPointer.pendingRecord = null;
}

function releaseStarPointerCapture() {
  if (
    starPointer.captureTarget != null &&
    starPointer.capturePointerId != null
  ) {
    try {
      starPointer.captureTarget.releasePointerCapture(
        starPointer.capturePointerId,
      );
    } catch (_) {}
  }
  starPointer.captureTarget = null;
  starPointer.capturePointerId = null;
}

function maybeStartDragBySlop(clientX, clientY) {
  if (!starPointer.pending || recordDrag.active) return;
  const dx = clientX - starPointer.downClientX;
  const dy = clientY - starPointer.downClientY;
  const slop = STAR_DRAG_SLOP_PX;
  if (dx * dx + dy * dy < slop * slop) return;
  clearStarLongPressTimer();
  const id = starPointer.recordId;
  if (id != null) startActualStarDrag(id, clientX, clientY);
}

function startActualStarDrag(recordId, clientX, clientY) {
  if (!starPositions[recordId]) return;
  recordDrag.active = true;
  recordDrag.recordId = recordId;
  dragLive.recordId = recordId;
  applyRecordDrag(clientX, clientY);
}

function onRecordStarPointerDown(record, e) {
  if (e.pointerType === "mouse" && e.button !== 0) return;
  const recordId = record.id;
  if (!starPositions[recordId]) return;
  starHoverTip.value = null;
  clearStarLongPressTimer();
  releaseStarPointerCapture();
  cancelEdgeRetractInFlight();
  hoverHubRecordId.value = recordId;
  anchorHubHoverTiming(recordId);
  starPointer.pending = true;
  starPointer.recordId = recordId;
  starPointer.pendingRecord = record;
  starPointer.downTime = Date.now();
  starPointer.downClientX = e.clientX;
  starPointer.downClientY = e.clientY;
  starPointer.lastClientX = e.clientX;
  starPointer.lastClientY = e.clientY;
  if (e.currentTarget?.setPointerCapture && e.pointerId != null) {
    try {
      e.currentTarget.setPointerCapture(e.pointerId);
      starPointer.captureTarget = e.currentTarget;
      starPointer.capturePointerId = e.pointerId;
    } catch (_) {
      starPointer.captureTarget = null;
      starPointer.capturePointerId = null;
    }
  }
  longPressTimer = setTimeout(() => {
    longPressTimer = null;
    if (!starPointer.pending || starPointer.recordId !== recordId) return;
    startActualStarDrag(
      recordId,
      starPointer.lastClientX,
      starPointer.lastClientY,
    );
  }, STAR_LONG_PRESS_MS);
}

function finishStarPointerOnRelease(clientX, clientY) {
  clearStarLongPressTimer();
  releaseStarPointerCapture();
  const ux = Number.isFinite(clientX) ? clientX : starPointer.lastClientX;
  const uy = Number.isFinite(clientY) ? clientY : starPointer.lastClientY;
  const dx = ux - starPointer.downClientX;
  const dy = uy - starPointer.downClientY;
  const slop = STAR_DRAG_SLOP_PX;
  const withinSlop = dx * dx + dy * dy < slop * slop;
  const elapsed = Date.now() - starPointer.downTime;
  const isShortTap =
    withinSlop && elapsed < STAR_TAP_MAX_MS && !recordDrag.active;

  if (recordDrag.active) {
    playWindbell();
    endRecordDrag();
    resetStarPointer();
    if (!isPointerOverAnyStarGroup(ux, uy)) scheduleDeferredHubClear();
    return;
  }
  if (starPointer.pending && starPointer.pendingRecord) {
    playWindbell();
    if (isShortTap) {
      const rec = starPointer.pendingRecord;
      compassRecordEditor?.openPreview?.(rec.id);
      triggerStarPulse(rec.id);
    }
    resetStarPointer();
  }
}

function clientToCanvas(clientX, clientY) {
  const el = clipRef.value;
  if (!el) return { x: 0, y: 0 };
  const rect = el.getBoundingClientRect();
  const mx = clientX - rect.left;
  const my = clientY - rect.top;
  const s = scale.value;
  return {
    x: (mx - pan.x) / s,
    y: (my - pan.y) / s,
  };
}

function applyRecordDrag(clientX, clientY) {
  if (!recordDrag.active || recordDrag.recordId == null) return;
  const { x, y } = clientToCanvas(
    clientX,
    clientY + DRAG_STAR_UNDER_CURSOR_OFFSET_Y,
  );
  dragLive.recordId = recordDrag.recordId;
  dragLive.x = Math.min(CANVAS_W, Math.max(0, x));
  dragLive.y = Math.min(CANVAS_H, Math.max(0, y));
}

function endRecordDrag() {
  const id = recordDrag.recordId;
  if (id != null && dragLive.recordId === id) {
    setStarPosition(id, dragLive.x, dragLive.y);
  }
  recordDrag.active = false;
  recordDrag.recordId = null;
  dragLive.recordId = null;
}

function mulberry32(seed) {
  return function rand() {
    let t = (seed += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function simpleHash(str) {
  let h = 0;
  for (let i = 0; i < str.length; i++) h = (h << 5) - h + str.charCodeAt(i);
  return Math.abs(h) || 1;
}

function clusterCenters(count) {
  const rng = mulberry32(count * 9973);
  const centers = [];
  const baseR = 140;
  const step = 52;
  for (let k = 0; k < count; k++) {
    const angle = (k / Math.max(count, 1)) * Math.PI * 2 + 0.35 + rng() * 0.22;
    const radius = baseR + (k % 6) * step + rng() * 22;
    centers.push({
      cx: CANVAS_W / 2 + radius * Math.cos(angle),
      cy: CANVAS_H / 2 + radius * Math.sin(angle),
    });
  }
  return centers;
}

/** 黄金角 + 较大间距，再斥力迭代保证最小距离 */
function rngDet(a, b, c) {
  const t = Math.sin(a * 12.9898 + b * 78.233 + c * 37.719) * 43758.5453;
  return t - Math.floor(t);
}

function layoutClusterRecords(clusterRecords, cx, cy, clusterSeed) {
  const rng = mulberry32(
    simpleHash(clusterRecords.map((r) => r.id).join("-")) + clusterSeed,
  );
  const golden = Math.PI * (3 - Math.sqrt(5));
  const nodes = clusterRecords.map((record, j) => {
    const theta = j * golden + rng() * 0.25;
    const radius = 52 + Math.sqrt(j + 1) * 36 + rng() * 14;
    return {
      record,
      x: cx + radius * Math.cos(theta),
      y: cy + radius * Math.sin(theta),
    };
  });
  relaxNodes(nodes, 72, 56);
  return nodes;
}

function relaxNodes(nodes, minDist, iterations) {
  const min2 = minDist * minDist;
  for (let it = 0; it < iterations; it++) {
    for (let i = 0; i < nodes.length; i++) {
      for (let j = i + 1; j < nodes.length; j++) {
        let dx = nodes[j].x - nodes[i].x;
        let dy = nodes[j].y - nodes[i].y;
        let d2 = dx * dx + dy * dy;
        if (d2 < 1e-6) {
          dx = (rngDet(it, i, j) - 0.5) * 0.01;
          dy = (rngDet(it, j, i) - 0.5) * 0.01;
          d2 = dx * dx + dy * dy;
        }
        if (d2 < min2) {
          const d = Math.sqrt(d2);
          const push = (minDist - d) * 0.52;
          const nx = dx / d;
          const ny = dy / d;
          nodes[i].x -= nx * push;
          nodes[i].y -= ny * push;
          nodes[j].x += nx * push;
          nodes[j].y += ny * push;
        }
      }
    }
  }
}

function dist2(a, b) {
  const dx = a.x - b.x;
  const dy = a.y - b.y;
  return dx * dx + dy * dy;
}

const GEOM_EPS = 1e-9;

/** (b-a) × (p-a)，用于 CCW 判定 */
function crossABP(ax, ay, bx, by, px, py) {
  return (bx - ax) * (py - ay) - (by - ay) * (px - ax);
}

function orientTri(ax, ay, bx, by, cx, cy) {
  const v = crossABP(ax, ay, bx, by, cx, cy);
  if (Math.abs(v) < GEOM_EPS * 80) return 0;
  return v > 0 ? 1 : -1;
}

function onSegCollinear(ax, ay, bx, by, px, py) {
  return (
    px >= Math.min(ax, bx) - GEOM_EPS * 400 &&
    px <= Math.max(ax, bx) + GEOM_EPS * 400 &&
    py >= Math.min(ay, by) - GEOM_EPS * 400 &&
    py <= Math.max(ay, by) + GEOM_EPS * 400 &&
    Math.abs(crossABP(ax, ay, bx, by, px, py)) < GEOM_EPS * 400
  );
}

/** 两闭线段是否相交（共端点不算交叉） */
function segmentsIntersect(ax, ay, bx, by, cx, cy, dx, dy) {
  const o1 = orientTri(ax, ay, bx, by, cx, cy);
  const o2 = orientTri(ax, ay, bx, by, dx, dy);
  const o3 = orientTri(cx, cy, dx, dy, ax, ay);
  const o4 = orientTri(cx, cy, dx, dy, bx, by);

  if (o1 === 0 && onSegCollinear(ax, ay, bx, by, cx, cy)) return true;
  if (o2 === 0 && onSegCollinear(ax, ay, bx, by, dx, dy)) return true;
  if (o3 === 0 && onSegCollinear(cx, cy, dx, dy, ax, ay)) return true;
  if (o4 === 0 && onSegCollinear(cx, cy, dx, dy, bx, by)) return true;

  return o1 !== o2 && o3 !== o4;
}

/** 候选边 (i,j) 是否与已有边在内部相交（与邻边共点不视为交叉） */
function newEdgeCrossesAny(i, j, nodes, segments) {
  const ax = nodes[i].x;
  const ay = nodes[i].y;
  const bx = nodes[j].x;
  const by = nodes[j].y;
  for (const s of segments) {
    if (s.i1 === i || s.i1 === j || s.i2 === i || s.i2 === j) continue;
    const cx = nodes[s.i1].x;
    const cy = nodes[s.i1].y;
    const dx = nodes[s.i2].x;
    const dy = nodes[s.i2].y;
    if (segmentsIntersect(ax, ay, bx, by, cx, cy, dx, dy)) return true;
  }
  return false;
}

function findComponents(n, adj) {
  const seen = Array(n).fill(false);
  const comps = [];
  for (let s = 0; s < n; s++) {
    if (seen[s]) continue;
    const stack = [s];
    seen[s] = true;
    const cur = [];
    while (stack.length) {
      const u = stack.pop();
      cur.push(u);
      for (const v of adj[u]) {
        if (!seen[v]) {
          seen[v] = true;
          stack.push(v);
        }
      }
    }
    comps.push(cur);
  }
  return comps;
}

/** 仅用 nodeIndices 内的点与边，检查诱导子图是否连通 */
function isInducedConnected(nodeIndices, adj) {
  if (nodeIndices.length <= 1) return true;
  const set = new Set(nodeIndices);
  const start = nodeIndices[0];
  const seen = new Set([start]);
  const q = [start];
  while (q.length) {
    const u = q.shift();
    for (const v of adj[u]) {
      if (!set.has(v) || seen.has(v)) continue;
      seen.add(v);
      q.push(v);
    }
  }
  return seen.size === set.size;
}

function pushSegment(nodes, segments, deg, initCount, i, j, initiator) {
  const d = Math.sqrt(dist2(nodes[i], nodes[j]));
  const lo = Math.min(i, j);
  const hi = Math.max(i, j);
  const u = nodes[lo];
  const v = nodes[hi];
  segments.push({
    x1: u.x,
    y1: u.y,
    x2: v.x,
    y2: v.y,
    len: d,
    i1: lo,
    i2: hi,
    initiator,
  });
  initCount[initiator] += 1;
  deg[i] += 1;
  deg[j] += 1;
}

function pickInitiatorForPair(i, j, initCount) {
  const iCan = initCount[i] < MAX_STAR_INITIATED_LINKS;
  const jCan = initCount[j] < MAX_STAR_INITIATED_LINKS;
  if (iCan && jCan) return i < j ? i : j;
  if (iCan) return i;
  if (jCan) return j;
  return -1;
}

/** 跨连通块加一条最短且无与现有边交叉的桥接边 */
function tryAddCrossComponentBridge(nodes, segments, deg, initCount, n) {
  const adj = buildAdj(segments, n);
  const comps = findComponents(n, adj);
  if (comps.length <= 1) return false;

  const cands = [];
  for (let a = 0; a < comps.length; a++) {
    for (let b = a + 1; b < comps.length; b++) {
      for (const u of comps[a]) {
        for (const v of comps[b]) {
          if (deg[u] >= 2 || deg[v] >= 2) continue;
          const initiator = pickInitiatorForPair(u, v, initCount);
          if (initiator < 0) continue;
          const d = Math.sqrt(dist2(nodes[u], nodes[v]));
          cands.push({ u, v, d, initiator });
        }
      }
    }
  }
  cands.sort((p, q) => p.d - q.d);
  for (const c of cands) {
    if (newEdgeCrossesAny(c.u, c.v, nodes, segments)) continue;
    pushSegment(nodes, segments, deg, initCount, c.u, c.v, c.initiator);
    return true;
  }
  return false;
}

/**
 * 删掉一条「非割边」：去掉后，该边两端所在原连通块在诱导子图上仍连通（例如环上一边），从而腾出度给桥接。
 */
function tryRemoveNonCutEdge(segments, deg, initCount, n) {
  const adjFull = buildAdj(segments, n);
  const comps = findComponents(n, adjFull);

  for (let si = 0; si < segments.length; si++) {
    const s = segments[si];
    if (s.initiator == null) continue;
    const compNodes =
      comps.find((c) => c.includes(s.i1)) ||
      comps.find((c) => c.includes(s.i2));
    if (!compNodes || compNodes.length < 3) continue;

    const temp = segments.filter((_, i) => i !== si);
    const adjAfter = buildAdj(temp, n);
    if (!isInducedConnected(compNodes, adjAfter)) continue;

    segments.splice(si, 1);
    deg[s.i1] -= 1;
    deg[s.i2] -= 1;
    initCount[s.initiator] -= 1;
    return true;
  }
  return false;
}

/**
 * 阶段 1：距离 ∈ [margin, 1.5×margin] 内贪心，度≤2、发起≤2，且新边不与已有边交叉。
 * 阶段 2：保证全图连通——加不交叉的桥接边；若两端已满度则先删一条环上边再桥接。
 */
function buildClusterGraphEdges(nodes, margin) {
  const n = nodes.length;
  if (n < 2) return [];

  const lo2 = margin * margin;
  const hi2 = margin * 1.5 * (margin * 1.5);
  const bandCandidates = [];
  for (let i = 0; i < n; i++) {
    for (let j = i + 1; j < n; j++) {
      const d2 = dist2(nodes[i], nodes[j]);
      if (d2 < lo2 || d2 > hi2) continue;
      bandCandidates.push({ i, j, d: Math.sqrt(d2) });
    }
  }
  bandCandidates.sort((a, b) => a.d - b.d);

  const deg = Array(n).fill(0);
  const initCount = Array(n).fill(0);
  const segments = [];

  for (const { i, j } of bandCandidates) {
    if (deg[i] >= 2 || deg[j] >= 2) continue;
    const initiator = pickInitiatorForPair(i, j, initCount);
    if (initiator < 0) continue;
    if (newEdgeCrossesAny(i, j, nodes, segments)) continue;
    pushSegment(nodes, segments, deg, initCount, i, j, initiator);
  }

  const maxRepair = n * n * 6;
  for (let step = 0; step < maxRepair; step++) {
    const adj = buildAdj(segments, n);
    if (findComponents(n, adj).length <= 1) break;
    if (tryAddCrossComponentBridge(nodes, segments, deg, initCount, n))
      continue;
    if (tryRemoveNonCutEdge(segments, deg, initCount, n)) continue;
    break;
  }

  return segments;
}

function buildAdj(segments, n) {
  const adj = Array.from({ length: n }, () => []);
  for (const s of segments) {
    adj[s.i1].push(s.i2);
    adj[s.i2].push(s.i1);
  }
  return adj;
}

/**
 * 在图邻接表上做 BFS，得到以悬停星为根的「首次访问」有向树边（parent → child）。
 * 图由距离带构图 + 连通修复（桥接/必要时删环边）得到；动画仍按传播调度逐条播放。
 */
function buildDirectedTreeEdges(cluster, hubIdx) {
  const n = cluster.nodes.length;
  const parent = Array(n).fill(-1);
  parent[hubIdx] = hubIdx;
  const depth = Array(n).fill(Infinity);
  depth[hubIdx] = 0;
  const q = [hubIdx];
  const edges = [];

  while (q.length) {
    const u = q.shift();
    const neighbors = [...cluster.adj[u]].sort((a, b) => a - b);
    for (const v of neighbors) {
      if (parent[v] === -1) {
        parent[v] = u;
        depth[v] = depth[u] + 1;
        q.push(v);
        const pu = cluster.nodes[u];
        const pv = cluster.nodes[v];
        edges.push({
          x1: pu.x,
          y1: pu.y,
          x2: pv.x,
          y2: pv.y,
          len: Math.hypot(pv.x - pu.x, pv.y - pu.y),
          pIdx: u,
          cIdx: v,
          depth: depth[v],
        });
      }
    }
  }

  edges.sort((a, b) => {
    if (a.depth !== b.depth) return a.depth - b.depth;
    if (a.pIdx !== b.pIdx) return a.pIdx - b.pIdx;
    return a.cIdx - b.cIdx;
  });
  const starts = computePropagationStartMs(edges, hubIdx, n, EDGE_DRAW_MS);
  edges.forEach((e, i) => {
    e.animStartMs = starts[i];
  });
  return edges;
}

function computeMaxTreeDrawMsForHub(hubId) {
  if (hubId == null) return 0;
  const graph = starFieldGraph.value;
  for (const c of graph.clusters) {
    const hi = c.nodes.findIndex((n) => n.record.id === hubId);
    if (hi < 0) continue;
    const edges = buildDirectedTreeEdges(c, hi);
    if (!edges.length) return 0;
    let mx = 0;
    for (const e of edges) {
      mx = Math.max(mx, (e.animStartMs ?? 0) + EDGE_DRAW_MS);
    }
    return mx;
  }
  return 0;
}

function anchorHubHoverTiming(recordId) {
  hoverHubAnchorTime = performance.now();
  lastHubTreeMaxDrawMs = computeMaxTreeDrawMsForHub(recordId);
}

function isPointerOverAnyStarGroup(clientX, clientY) {
  if (typeof document === "undefined") return false;
  const el = document.elementFromPoint(clientX, clientY);
  return Boolean(el?.closest?.(".record-star-group"));
}

function scheduleDeferredHubClear() {
  if (hoverHubRecordId.value == null) return;
  if (leaveDebounce) {
    clearTimeout(leaveDebounce);
    leaveDebounce = null;
  }
  const elapsed = performance.now() - hoverHubAnchorTime;
  const minBeforeClear = lastHubTreeMaxDrawMs + EDGE_REST_AFTER_DRAW_MS;
  const waitMs = Math.max(0, minBeforeClear - elapsed);
  leaveDebounce = setTimeout(() => {
    leaveDebounce = null;
    beginEdgeRetraction();
  }, waitMs);
}

/** 与出现对称：computeRetractionStartMs；收起为子→父、dash offset 0→L（叶端先没），hub 边最后收 */
function beginEdgeRetraction() {
  const hubId = hoverHubRecordId.value;
  if (hubId == null) return;

  const graph = starFieldGraph.value;
  const mapByCluster = new Map();
  let maxEnd = 0;
  let hasRetractEdge = false;

  for (const c of graph.clusters) {
    const hi = c.nodes.findIndex((n) => n.record.id === hubId);
    if (hi < 0) continue;
    const edges = buildDirectedTreeEdges(c, hi);
    if (!edges.length) continue;
    hasRetractEdge = true;
    const m = computeRetractionStartMs(edges, hi, c.nodes.length, EDGE_DRAW_MS);
    for (const d of m.values()) {
      maxEnd = Math.max(maxEnd, d + EDGE_DRAW_MS);
    }
    mapByCluster.set(c.id, m);
  }

  if (!hasRetractEdge) {
    hoverHubRecordId.value = null;
    return;
  }

  const hubRecordIdForPulse = hoverHubRecordId.value;

  retractScheduleByCluster.value = mapByCluster;
  retractAnimPhase.value = 0;
  edgeRetracting.value = true;

  void nextTick(() => {
    requestAnimationFrame(() => {
      retractAnimPhase.value = 1;
      requestAnimationFrame(() => {
        retractAnimPhase.value = 2;
      });
    });
  });

  if (retractFinishTimer != null) clearTimeout(retractFinishTimer);
  retractFinishTimer = setTimeout(() => {
    retractFinishTimer = null;
    hoverHubRecordId.value = null;
    edgeRetracting.value = false;
    retractAnimPhase.value = 0;
    retractScheduleByCluster.value = new Map();
    if (hubRecordIdForPulse != null) triggerStarPulse(hubRecordIdForPulse);
  }, maxEnd + 48);
}

function mstSegmentKey(i1, i2) {
  return i1 < i2 ? `${i1},${i2}` : `${i2},${i1}`;
}

function placeNewRecordInCluster(sortedRecs, newRecord, cx, cy, clusterId) {
  const others = sortedRecs.filter((x) => x.id !== newRecord.id);
  const placed = others.filter((x) => starPositions[x.id] != null);
  const margin = 48;
  const clampVal = (v, lo, hi) => Math.min(hi, Math.max(lo, v));

  if (placed.length === 0) {
    return {
      x: clampVal(cx + 48, margin, CANVAS_W - margin),
      y: clampVal(cy + 28, margin, CANVAS_H - margin),
    };
  }

  let sx = 0;
  let sy = 0;
  for (const p of placed) {
    const pos = starPositions[p.id];
    sx += pos.x;
    sy += pos.y;
  }
  const ax = sx / placed.length;
  const ay = sy / placed.length;
  const idx = sortedRecs.findIndex((r) => r.id === newRecord.id);
  const golden = Math.PI * (3 - Math.sqrt(5));
  const rand = mulberry32(simpleHash(newRecord.id) + clusterId * 2113);
  const radius = 72 + Math.sqrt(idx + 1) * 42 + rand() * 20;
  const theta = idx * golden + rand() * 0.25;
  return {
    x: clampVal(ax + radius * Math.cos(theta), margin, CANVAS_W - margin),
    y: clampVal(ay + radius * Math.sin(theta), margin, CANVAS_H - margin),
  };
}

/** 不按 clusterId 分簇：全体记录共用一块画布锚点，新记录只相对「已有星」落位 */
function syncMissingStarPositions() {
  const list = sortedOldestFirst.value;
  if (!list.length) return;

  const recs = [...list].sort(
    (a, b) => new Date(a.createdAt) - new Date(b.createdAt),
  );
  const centers = clusterCenters(1);
  const { cx, cy } = centers[0] || {
    cx: CANVAS_W / 2,
    cy: CANVAS_H / 2,
  };

  const missing = recs.filter((r) => starPositions[r.id] == null);
  if (!missing.length) return;

  if (missing.length === recs.length) {
    const nodes = layoutClusterRecords(recs, cx, cy, 0);
    nodes.forEach((n) => setStarPosition(n.record.id, n.x, n.y));
    return;
  }

  for (const r of missing) {
    const pos = placeNewRecordInCluster(recs, r, cx, cy, 0);
    setStarPosition(r.id, pos.x, pos.y);
  }
}

/** 全局一张图：凡满足距离带与度限制的近邻均可连边，与 record.clusterId 无关 */
const starFieldGraph = computed(() => {
  const list = sortedOldestFirst.value;
  if (!list.length) return { clusters: [] };

  const recs = [...list].sort(
    (a, b) => new Date(a.createdAt) - new Date(b.createdAt),
  );
  const dragId = recordDrag.active ? recordDrag.recordId : null;
  const nodes = recs.map((record) => {
    const p = starPositions[record.id];
    let x = p?.x ?? 0;
    let y = p?.y ?? 0;
    if (dragId === record.id && dragLive.recordId === record.id) {
      x = dragLive.x;
      y = dragLive.y;
    }
    return { record, x, y };
  });

  const segments = buildClusterGraphEdges(nodes, STAR_LINK_DISTANCE_MARGIN);
  const adj = buildAdj(segments, nodes.length);

  return {
    clusters: [{ id: 0, nodes, segments, adj }],
  };
});

/** 悬停时全局图边 → BFS 有向动画元数据（稳定 DOM 上的 <line> 才能触发 dash 过渡） */
const edgeHoverState = computed(() => {
  const hubId = hoverHubRecordId.value;
  const graph = starFieldGraph.value;
  const byCluster = new Map();
  if (hubId == null) return byCluster;
  for (const c of graph.clusters) {
    const hi = c.nodes.findIndex((n) => n.record.id === hubId);
    if (hi < 0) continue;
    const edges = buildDirectedTreeEdges(c, hi);
    const meta = new Map();
    for (const e of edges) {
      meta.set(mstSegmentKey(e.pIdx, e.cIdx), {
        animStartMs: e.animStartMs,
        pIdx: e.pIdx,
        cIdx: e.cIdx,
      });
    }
    byCluster.set(c.id, meta);
  }
  return byCluster;
});

function treeEdgePixelLen(cluster, meta) {
  const pu = cluster.nodes[meta.pIdx];
  const pv = cluster.nodes[meta.cIdx];
  return Math.max(1, Math.hypot(pv.x - pu.x, pv.y - pu.y));
}

function segmentLineEndpoints(cluster, segment) {
  const metaMap = edgeHoverState.value.get(cluster.id);
  if (!metaMap) {
    return {
      x1: segment.x1,
      y1: segment.y1,
      x2: segment.x2,
      y2: segment.y2,
    };
  }
  const segKey = mstSegmentKey(segment.i1, segment.i2);
  const meta = metaMap.get(segKey);
  if (!meta) {
    return {
      x1: segment.x1,
      y1: segment.y1,
      x2: segment.x2,
      y2: segment.y2,
    };
  }
  const pu = cluster.nodes[meta.pIdx];
  const pv = cluster.nodes[meta.cIdx];
  /* 出现与收起同向：父→子；收起用 dasharray 缩短实线、尾隙吃子端，不从 offset 滑整条线 */
  return { x1: pu.x, y1: pu.y, x2: pv.x, y2: pv.y };
}

function segmentEdgeStyle(cluster, segment) {
  if (hoverHubRecordId.value == null) return edgeInactiveStyle(segment);

  const metaMap = edgeHoverState.value.get(cluster.id);
  if (!metaMap) return edgeInactiveStyle(segment);

  const segKey = mstSegmentKey(segment.i1, segment.i2);
  const meta = metaMap.get(segKey);
  if (!meta) return edgeInactiveStyle(segment);

  if (edgeRetracting.value) {
    const rDel = retractScheduleByCluster.value.get(cluster.id)?.get(segKey);
    if (rDel == null) return edgeInactiveStyle(segment);
    const L = treeEdgePixelLen(cluster, meta);
    const tailEps = Math.max(EDGE_RETRACT_TAIL_GAP_MIN, L * 1e-4);
    const ph = retractAnimPhase.value;
    if (ph <= 0) {
      return {
        strokeDasharray: L,
        strokeDashoffset: 0,
        strokeLinecap: "butt",
        opacity: 1,
        transitionProperty: "none",
      };
    }
    if (ph === 1) {
      return {
        strokeDasharray: `${L} ${tailEps}`,
        strokeDashoffset: 0,
        strokeLinecap: "butt",
        opacity: 1,
        transitionProperty: "none",
      };
    }
    return {
      strokeDasharray: `0.01 ${L}`,
      strokeDashoffset: 0,
      strokeLinecap: "butt",
      opacity: 1,
      transitionDelay: `${rDel}ms`,
      transitionProperty: "stroke-dasharray",
      transitionDuration: `${EDGE_DRAW_MS / 1000}s`,
      transitionTimingFunction: "linear",
    };
  }

  const delayMs = meta.animStartMs ?? 0;
  const L = treeEdgePixelLen(cluster, meta);
  return {
    strokeDasharray: L,
    strokeDashoffset: 0,
    opacity: 1,
    transitionDelay: `${delayMs}ms`,
    transitionProperty: "stroke-dashoffset",
    transitionDuration: `${EDGE_DRAW_MS / 1000}s`,
    transitionTimingFunction: "linear",
  };
}

function edgeInactiveStyle(seg) {
  return {
    strokeDasharray: seg.len,
    strokeDashoffset: seg.len,
    opacity: 0,
    transitionDelay: "0ms",
    /* 收起末态 offset=0、dash 极短；若对 offset 做过渡会从 0→L 把整条线扫出来，与 pulse 叠在一起像抽搐 */
    transition:
      "stroke-dasharray 0s linear, stroke-dashoffset 0s linear, opacity 0.16s ease",
  };
}

function generateAmbient() {
  const rng = mulberry32(42);
  const out = [];
  for (let i = 0; i < 380; i++) {
    out.push({
      id: i,
      x: rng() * CANVAS_W,
      y: rng() * CANVAS_H,
      size: rng() * 1.25 + 0.45,
      delay: rng() * 4,
      duration: rng() * 2 + 2,
    });
  }
  ambientStars.value = out;
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
    animationName: "compass-twinkle",
    animationIterationCount: "infinite",
    animationTimingFunction: "ease-in-out",
  };
}

function fitPanToCenter() {
  const el = clipRef.value;
  if (!el) return;
  const w = el.clientWidth;
  const h = el.clientHeight;
  const s = scale.value;
  pan.x = w / 2 - (CANVAS_W / 2) * s;
  pan.y = h / 2 - (CANVAS_H / 2) * s;
}

function onWheel(e) {
  const el = clipRef.value;
  if (!el) return;
  const rect = el.getBoundingClientRect();
  const mx = e.clientX - rect.left;
  const my = e.clientY - rect.top;
  const factor = e.deltaY > 0 ? 0.92 : 1.08;
  const newS = Math.min(SCALE_MAX, Math.max(SCALE_MIN, scale.value * factor));
  setScaleTowardPoint(newS, mx, my);
}

function isRecordStarTarget(el) {
  if (!el?.closest) return false;
  return Boolean(el.closest(".record-star-group"));
}

function onPanStart(e) {
  if (e.button !== 0) return;
  if (isRecordStarTarget(e.target)) return;
  isGrabbing.value = true;
  drag.active = true;
  drag.startX = e.clientX;
  drag.startY = e.clientY;
  drag.panStartX = pan.x;
  drag.panStartY = pan.y;
}

function onPanMove(e) {
  if (zoomDialDrag.active) {
    const dy = e.clientY - zoomDialDrag.startPointerY;
    const nt = Math.min(
      1,
      Math.max(0, zoomDialDrag.startT + dy / ZOOM_BAR_DRAG_SENS),
    );
    setScaleTowardCenter(scaleFromT(nt));
    return;
  }
  if (recordDrag.active) {
    applyRecordDrag(e.clientX, e.clientY);
    return;
  }
  if (starPointer.pending) {
    starPointer.lastClientX = e.clientX;
    starPointer.lastClientY = e.clientY;
    maybeStartDragBySlop(e.clientX, e.clientY);
    return;
  }
  if (!drag.active) return;
  pan.x = drag.panStartX + (e.clientX - drag.startX);
  pan.y = drag.panStartY + (e.clientY - drag.startY);
}

function onGlobalPointerEnd(e) {
  endZoomDialDrag();
  const p = e.changedTouches?.[0] ?? e;
  finishStarPointerOnRelease(p.clientX, p.clientY);
  drag.active = false;
  isGrabbing.value = false;
}

function onTouchStart(e) {
  if (e.touches.length !== 1) return;
  const t = e.touches[0];
  const el = document.elementFromPoint(t.clientX, t.clientY);
  if (isRecordStarTarget(el)) return;
  isGrabbing.value = true;
  drag.active = true;
  drag.startX = t.clientX;
  drag.startY = t.clientY;
  drag.panStartX = pan.x;
  drag.panStartY = pan.y;
}

function onTouchMove(e) {
  if (zoomDialDrag.active && e.touches.length === 1) {
    const t = e.touches[0];
    const dy = t.clientY - zoomDialDrag.startPointerY;
    const nt = Math.min(
      1,
      Math.max(0, zoomDialDrag.startT + dy / ZOOM_BAR_DRAG_SENS),
    );
    setScaleTowardCenter(scaleFromT(nt));
    return;
  }
  if (recordDrag.active && e.touches.length === 1) {
    e.preventDefault();
    const t = e.touches[0];
    applyRecordDrag(t.clientX, t.clientY);
    return;
  }
  if (starPointer.pending && e.touches.length === 1) {
    const t = e.touches[0];
    starPointer.lastClientX = t.clientX;
    starPointer.lastClientY = t.clientY;
    maybeStartDragBySlop(t.clientX, t.clientY);
    return;
  }
  if (!drag.active || e.touches.length !== 1) return;
  e.preventDefault();
  const t = e.touches[0];
  pan.x = drag.panStartX + (t.clientX - drag.startX);
  pan.y = drag.panStartY + (t.clientY - drag.startY);
}

function onTouchEnd(e) {
  onGlobalPointerEnd(e);
}

function formatDate(iso) {
  try {
    return new Date(iso).toLocaleString("zh-CN", {
      dateStyle: "medium",
      timeStyle: "short",
    });
  } catch {
    return iso;
  }
}

onMounted(async () => {
  generateAmbient();
  await nextTick();
  scale.value = Math.min(SCALE_MAX, Math.max(SCALE_MIN, scale.value));
  fitPanToCenter();
  measureZoomBarViewport();
  await nextTick();
  measureZoomBarViewport();
  window.addEventListener("pointermove", onPanMove);
  window.addEventListener("pointerup", onGlobalPointerEnd);
  window.addEventListener("pointercancel", onGlobalPointerEnd);
  window.addEventListener("mouseup", onGlobalPointerEnd);
  window.addEventListener("mouseleave", onGlobalPointerEnd);
  window.addEventListener("touchmove", onTouchMove, { passive: false });
  window.addEventListener("touchend", onTouchEnd);
  window.addEventListener("touchcancel", onTouchEnd);
});

onUnmounted(() => {
  if (leaveDebounce) clearTimeout(leaveDebounce);
  if (retractFinishTimer != null) clearTimeout(retractFinishTimer);
  if (pulseClearTimer) clearTimeout(pulseClearTimer);
  clearStarLongPressTimer();
  window.removeEventListener("pointermove", onPanMove);
  window.removeEventListener("pointerup", onGlobalPointerEnd);
  window.removeEventListener("pointercancel", onGlobalPointerEnd);
  window.removeEventListener("mouseup", onGlobalPointerEnd);
  window.removeEventListener("mouseleave", onGlobalPointerEnd);
  window.removeEventListener("touchmove", onTouchMove);
  window.removeEventListener("touchend", onTouchEnd);
  window.removeEventListener("touchcancel", onTouchEnd);
});

watch(
  () => records.value.map((r) => r.id).join(","),
  () => {
    syncMissingStarPositions();
  },
  { immediate: true },
);

watch(
  zoomBarViewportRef,
  (el) => {
    if (zoomBarResizeObserver) {
      zoomBarResizeObserver.disconnect();
      zoomBarResizeObserver = null;
    }
    if (!el) return;
    zoomBarResizeObserver = new ResizeObserver(() => measureZoomBarViewport());
    zoomBarResizeObserver.observe(el);
    measureZoomBarViewport();
  },
  { flush: "post" },
);
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
@keyframes record-star-pulse {
  0% {
    transform: scale(1);
    opacity: 1;
  }
  40% {
    transform: scale(1.22);
    opacity: 0.92;
  }
  100% {
    transform: scale(1);
    opacity: 1;
  }
}

.record-star-group.record-star--pulse .record-star-core {
  transform-box: fill-box;
  transform-origin: center;
  animation: record-star-pulse 0.32s ease-out;
}

/*
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * 取景器主题 · 位置微调（改 .stars-viewfinder-wrap 里的变量即可）
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * --stars-inner-clip-inset  星图主体相对外框的内缩（越小则取景器相对主体越大）
 * --vf-frame-*     ViewFinder_4By3.png 外框相对 4:3 舞台的内边距/偏移
 * --vf-hand-width   左右手共用宽度（相对 hand-layer = 取景器 raster 宽）
 * --vf-hand-left-* / --vf-hand-right-* 角位与 transform；勿把宽度设到 ~100% 再加大幅负偏移
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 */
.stars-viewfinder-wrap {
  /* 中心星图画布：小于外框，使取景器线框套在「外面」 */
  --stars-inner-clip-inset: 8%;
  /* 主取景器框（默认略放大，整体大于内缩后的主体） */
  --vf-frame-top: -2%;
  --vf-frame-right: -2%;
  --vf-frame-bottom: -2%;
  --vf-frame-left: -2%;
  --vf-frame-transform: translateZ(0) scale(1.1);
  --vf-frame-transform-origin: center center;
  /*
   * 单手宽度：相对 .stars-viewfinder-hand-layer 的宽度（= 取景器 PNG 显示宽）。
   * 勿用 min(100%, 极大px)：接近 100% 再叠加负 left/right 会撑开 main 横向滚动，竖条滚动条会随手势显隐抖动。
   */
  --vf-hand-width: min(100%, 960px);
  --vf-hand-left-left: -22%;
  --vf-hand-left-top: -24%;
  --vf-hand-left-transform: translate(2%, 2%) rotate(0deg);
  --vf-hand-left-transform-origin: 84% 76%;
  --vf-hand-right-right: -22%;
  --vf-hand-right-bottom: -24%;
  --vf-hand-right-transform: translate(-2%, -2%) rotate(0deg);
  --vf-hand-right-transform-origin: 16% 24%;
}

.stars-viewfinder-wrap > .stars-stage-clip--inset {
  inset: var(--stars-inner-clip-inset);
}

.stars-viewfinder-frame {
  position: absolute;
  z-index: 16;
  overflow: visible;
  pointer-events: none;
  top: var(--vf-frame-top);
  right: var(--vf-frame-right);
  bottom: var(--vf-frame-bottom);
  left: var(--vf-frame-left);
  transform: var(--vf-frame-transform);
  transform-origin: var(--vf-frame-transform-origin);
}

/*
 * 与舞台 4/3 内 object-fit:contain 一致：ViewFinder_4By3 宽于 4/3，故上下留空、宽贴满。
 * h_raster / h_frame = (4/3) * (1252/1898)
 */
.stars-viewfinder-raster,
.stars-viewfinder-hand-layer {
  position: absolute;
  left: 0;
  right: 0;
  top: 50%;
  width: 100%;
  height: calc(100% * 4 * 1252 / (3 * 1898));
  transform: translateY(-50%);
  pointer-events: none;
  overflow: visible;
}

.stars-viewfinder-raster {
  z-index: 0;
}

.stars-viewfinder-hand-layer {
  z-index: 2;
}

.stars-viewfinder-frame__img {
  position: absolute;
  inset: 0;
  display: block;
  width: 100%;
  height: 100%;
  object-fit: fill;
  object-position: center;
  user-select: none;
}

.stars-viewfinder-hand-layer .stars-viewfinder-hand {
  position: absolute;
  pointer-events: none;
}

.stars-viewfinder-hand__img {
  display: block;
  width: 100%;
  height: auto;
  user-select: none;
}

.stars-viewfinder-hand-layer .stars-viewfinder-hand--left {
  z-index: 2;
  left: var(--vf-hand-left-left);
  top: var(--vf-hand-left-top);
  width: var(--vf-hand-width);
  transform: var(--vf-hand-left-transform);
  transform-origin: var(--vf-hand-left-transform-origin);
}

.stars-viewfinder-hand-layer .stars-viewfinder-hand--right {
  z-index: 1;
  right: var(--vf-hand-right-right);
  bottom: var(--vf-hand-right-bottom);
  width: var(--vf-hand-width);
  transform: var(--vf-hand-right-transform);
  transform-origin: var(--vf-hand-right-transform-origin);
}

.compass-zoom-bar__viewport {
  touch-action: none;
}

.compass-zoom-bar__svg {
  touch-action: none;
  user-select: none;
}

.compass-zoom-bar__label {
  font-family: var(
    --font-boutique,
    "BoutiqueBitmap9x9",
    "Courier New",
    monospace
  );
  font-weight: 500;
}

</style>
