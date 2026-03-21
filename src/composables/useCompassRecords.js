import { ref, computed, reactive } from 'vue'

/** 星盘画布绝对坐标（与 CompassStarsView 中 CANVAS 一致） */
const STAR_POS_LS_KEY = 'compass-star-positions-v1'

function loadStarPositionsRaw() {
  try {
    const raw = localStorage.getItem(STAR_POS_LS_KEY)
    if (!raw) return {}
    const o = JSON.parse(raw)
    if (o && typeof o === 'object' && !Array.isArray(o)) return o
  } catch (_) {}
  return {}
}

const starPositions = reactive(loadStarPositionsRaw())

let starPosPersistTimer = null
function schedulePersistStarPositions() {
  clearTimeout(starPosPersistTimer)
  starPosPersistTimer = setTimeout(() => {
    try {
      localStorage.setItem(STAR_POS_LS_KEY, JSON.stringify({ ...starPositions }))
    } catch (_) {}
  }, 60)
}

/** 写入某条 record 在星盘 SVG 中的绝对坐标并持久化 */
export function setStarPosition(recordId, x, y) {
  if (recordId == null) return
  const nx = Number(x)
  const ny = Number(y)
  if (!Number.isFinite(nx) || !Number.isFinite(ny)) return
  starPositions[recordId] = { x: nx, y: ny }
  schedulePersistStarPositions()
}

/**
 * clusterId：稳定分簇，新增记录只进入「时间上新的一簇」或新开一簇，不会重算旧记录的簇归属。
 * 种子数据：0～6 为第一簇，7～13 为第二簇。
 */
const seedRecords = [
  {
    id: '1',
    title: 'Vue Router 嵌套路由',
    summary: 'children + RouterView 布局拆分',
    createdAt: '2025-03-20T10:00:00.000Z',
    clusterId: 0,
  },
  {
    id: '2',
    title: '收件箱原则',
    summary: '先捕获再分类，降低摩擦',
    createdAt: '2025-03-18T14:30:00.000Z',
    clusterId: 0,
  },
  {
    id: '3',
    title: 'History 与 404',
    summary: '静态托管需回退 index.html',
    createdAt: '2025-03-15T09:00:00.000Z',
    clusterId: 0,
  },
  {
    id: '4',
    title: '碎片化阅读',
    summary: '主题复盘代替无限收藏',
    createdAt: '2025-03-10T20:00:00.000Z',
    clusterId: 0,
  },
  {
    id: '5',
    title: '设计令牌',
    summary: 'theme.js 与 CSS 变量统一色板',
    createdAt: '2025-03-08T12:00:00.000Z',
    clusterId: 0,
  },
  {
    id: '6',
    title: '像素字与可读性',
    summary: 'boutique 与 ui 栈分工',
    createdAt: '2025-03-05T08:00:00.000Z',
    clusterId: 0,
  },
  {
    id: '7',
    title: '北斗占位星 7',
    summary: '凑满北斗示例',
    createdAt: '2025-03-03T16:00:00.000Z',
    clusterId: 0,
  },
  {
    id: '8',
    title: '星簇数据 8',
    summary: '第二簇起点',
    createdAt: '2025-03-02T12:00:00.000Z',
    clusterId: 1,
  },
  {
    id: '9',
    title: '星簇 9',
    summary: 'MST 连线示意',
    createdAt: '2025-03-01T10:00:00.000Z',
    clusterId: 1,
  },
  {
    id: '10',
    title: '星簇 10',
    summary: '同一区域聚类',
    createdAt: '2025-02-28T18:00:00.000Z',
    clusterId: 1,
  },
  {
    id: '11',
    title: '星簇 11',
    summary: '5~12 颗/簇',
    createdAt: '2025-02-27T09:00:00.000Z',
    clusterId: 1,
  },
  {
    id: '12',
    title: '星簇 12',
    summary: 'Prim 最小生成树',
    createdAt: '2025-02-26T15:00:00.000Z',
    clusterId: 1,
  },
  {
    id: '13',
    title: '星簇 13',
    summary: '旧记录先入簇',
    createdAt: '2025-02-25T11:00:00.000Z',
    clusterId: 1,
  },
  {
    id: '14',
    title: '星簇 14',
    summary: '画布可拖动',
    createdAt: '2025-02-24T08:00:00.000Z',
    clusterId: 1,
  },
]

const records = ref(seedRecords.map((r) => ({ ...r })))

let draftSeq = 0

function maxClusterId(list) {
  let m = -1
  for (const r of list) {
    const c = r.clusterId
    if (typeof c === 'number' && c > m) m = c
  }
  return m
}

export function useCompassRecords() {
  const sortedNewestFirst = computed(() =>
    [...records.value].sort(
      (a, b) => new Date(b.createdAt) - new Date(a.createdAt),
    ),
  )

  const sortedOldestFirst = computed(() =>
    [...records.value].sort(
      (a, b) => new Date(a.createdAt) - new Date(b.createdAt),
    ),
  )

  /**
   * 新记录只加入「当前时间上最新一条」所在簇；该簇已满 12 则新建簇。
   * 不重新划分历史记录。
   */
  function addDemoRecord() {
    draftSeq += 1
    const now = new Date().toISOString()
    const list = [...records.value].sort(
      (a, b) => new Date(a.createdAt) - new Date(b.createdAt),
    )

    let clusterId = 0
    if (list.length > 0) {
      const newest = list[list.length - 1]
      const lastCid =
        typeof newest.clusterId === 'number' ? newest.clusterId : 0
      const inLast = list.filter((r) => r.clusterId === lastCid).length
      clusterId =
        inLast >= 12 ? maxClusterId(list) + 1 : lastCid
    }

    records.value.push({
      id: `demo-${Date.now()}`,
      title: `新星辰 ${draftSeq}`,
      summary: '演示：星盘与时间线会同步出现新条目',
      createdAt: now,
      clusterId,
    })
  }

  return {
    records,
    sortedNewestFirst,
    sortedOldestFirst,
    addDemoRecord,
    starPositions,
    setStarPosition,
  }
}
