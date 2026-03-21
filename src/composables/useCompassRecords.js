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
