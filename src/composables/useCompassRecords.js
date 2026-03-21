import { ref, computed } from 'vue'

/** 演示用种子数据；后续可换 localStorage / API */
const seedRecords = [
  {
    id: '1',
    title: 'Vue Router 嵌套路由',
    summary: 'children + RouterView 布局拆分',
    createdAt: '2025-03-20T10:00:00.000Z',
  },
  {
    id: '2',
    title: '收件箱原则',
    summary: '先捕获再分类，降低摩擦',
    createdAt: '2025-03-18T14:30:00.000Z',
  },
  {
    id: '3',
    title: 'History 与 404',
    summary: '静态托管需回退 index.html',
    createdAt: '2025-03-15T09:00:00.000Z',
  },
  {
    id: '4',
    title: '碎片化阅读',
    summary: '主题复盘代替无限收藏',
    createdAt: '2025-03-10T20:00:00.000Z',
  },
  {
    id: '5',
    title: '设计令牌',
    summary: 'theme.js 与 CSS 变量统一色板',
    createdAt: '2025-03-08T12:00:00.000Z',
  },
  {
    id: '6',
    title: '像素字与可读性',
    summary: 'boutique 与 ui 栈分工',
    createdAt: '2025-03-05T08:00:00.000Z',
  },
  {
    id: '7',
    title: '北斗占位星 7',
    summary: '凑满北斗示例',
    createdAt: '2025-03-03T16:00:00.000Z',
  },
  {
    id: '8',
    title: '星簇数据 8',
    summary: '第二簇起点',
    createdAt: '2025-03-02T12:00:00.000Z',
  },
  {
    id: '9',
    title: '星簇 9',
    summary: 'MST 连线示意',
    createdAt: '2025-03-01T10:00:00.000Z',
  },
  {
    id: '10',
    title: '星簇 10',
    summary: '同一区域聚类',
    createdAt: '2025-02-28T18:00:00.000Z',
  },
  {
    id: '11',
    title: '星簇 11',
    summary: '5~12 颗/簇',
    createdAt: '2025-02-27T09:00:00.000Z',
  },
  {
    id: '12',
    title: '星簇 12',
    summary: 'Prim 最小生成树',
    createdAt: '2025-02-26T15:00:00.000Z',
  },
  {
    id: '13',
    title: '星簇 13',
    summary: '旧记录先入簇',
    createdAt: '2025-02-25T11:00:00.000Z',
  },
  {
    id: '14',
    title: '星簇 14',
    summary: '画布可拖动',
    createdAt: '2025-02-24T08:00:00.000Z',
  },
]

const records = ref(seedRecords.map((r) => ({ ...r })))

let draftSeq = 0

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

  function addDemoRecord() {
    draftSeq += 1
    const now = new Date().toISOString()
    records.value.unshift({
      id: `demo-${Date.now()}`,
      title: `新星辰 ${draftSeq}`,
      summary: '演示：星盘与时间线会同步出现新条目',
      createdAt: now,
    })
  }

  return {
    records,
    sortedNewestFirst,
    sortedOldestFirst,
    addDemoRecord,
  }
}
