import { ref, computed, reactive, watch } from 'vue'
import { currentUser, normalizeUsername } from '@/composables/useCompassAuth.js'
import { excerptFromMarkdown } from '@/utils/simpleMarkdown.js'

const BUNDLE_KEY_PREFIX = 'compass_user_bundle_v1:'
const DRAFT_KEY_PREFIX = 'compass_record_editor_draft_v1:'

/** 未登录：仅展示这 5 条占位，不写本地、不累计演示添加 */
const GUEST_RECORDS = [
  {
    id: 'guest-1',
    title: 'Vue Router 嵌套路由',
    summary: 'children + RouterView 布局拆分',
    createdAt: '2025-03-20T10:00:00.000Z',
    clusterId: 0,
  },
  {
    id: 'guest-2',
    title: '收件箱原则',
    summary: '先捕获再分类，降低摩擦',
    createdAt: '2025-03-18T14:30:00.000Z',
    clusterId: 0,
  },
  {
    id: 'guest-3',
    title: 'History 与 404',
    summary: '静态托管需回退 index.html',
    createdAt: '2025-03-15T09:00:00.000Z',
    clusterId: 0,
  },
  {
    id: 'guest-4',
    title: '碎片化阅读',
    summary: '主题复盘代替无限收藏',
    createdAt: '2025-03-10T20:00:00.000Z',
    clusterId: 0,
  },
  {
    id: 'guest-5',
    title: '设计令牌',
    summary: 'theme.js 与 CSS 变量统一色板',
    createdAt: '2025-03-08T12:00:00.000Z',
    clusterId: 0,
  },
]

function readJson(key, fallback) {
  if (typeof localStorage === 'undefined') return fallback
  try {
    const t = localStorage.getItem(key)
    return t ? JSON.parse(t) : fallback
  } catch {
    return fallback
  }
}

function writeJson(key, value) {
  if (typeof localStorage === 'undefined') return
  localStorage.setItem(key, JSON.stringify(value))
}

function bundleKey(usernameNorm) {
  return `${BUNDLE_KEY_PREFIX}${usernameNorm}`
}

function draftKey(usernameNorm) {
  return `${DRAFT_KEY_PREFIX}${usernameNorm}`
}

const records = ref([])
const starPositions = reactive({})
/** @type {import('vue').Ref<string[]>} */
const userTags = ref([])

/** 当前已加载数据所属用户（normalize 后）；null 表示访客视图 */
let activeUsernameNorm = null

let draftSeq = 0
let persistTimer = null

function clearReactiveObject(obj) {
  for (const k of Object.keys(obj)) delete obj[k]
}

function cloneRecords(list) {
  return list.map((r) => ({ ...r }))
}

function normalizeTagList(arr) {
  if (!Array.isArray(arr)) return []
  const seen = new Set()
  const out = []
  for (const x of arr) {
    const t = String(x || '').trim()
    if (!t) continue
    const k = t.toLowerCase()
    if (seen.has(k)) continue
    seen.add(k)
    out.push(t)
  }
  return out.sort((a, b) => a.localeCompare(b, 'zh'))
}

function applyGuestView() {
  activeUsernameNorm = null
  records.value = cloneRecords(GUEST_RECORDS)
  clearReactiveObject(starPositions)
  userTags.value = []
}

function loadUserBundle(usernameNorm) {
  const raw = readJson(bundleKey(usernameNorm), null)
  clearReactiveObject(starPositions)
  if (raw && Array.isArray(raw.records)) {
    records.value = cloneRecords(raw.records)
    const sp = raw.starPositions
    if (sp && typeof sp === 'object') {
      for (const [k, v] of Object.entries(sp)) {
        if (v && Number.isFinite(Number(v.x)) && Number.isFinite(Number(v.y))) {
          starPositions[k] = { x: Number(v.x), y: Number(v.y) }
        }
      }
    }
    userTags.value = normalizeTagList(raw.tags)
  } else {
    records.value = []
    userTags.value = []
  }
  activeUsernameNorm = usernameNorm
}

function persistActiveBundle() {
  if (activeUsernameNorm == null) return
  writeJson(bundleKey(activeUsernameNorm), {
    records: cloneRecords(records.value),
    starPositions: { ...starPositions },
    tags: normalizeTagList(userTags.value),
  })
}

function schedulePersist() {
  if (activeUsernameNorm == null) return
  clearTimeout(persistTimer)
  persistTimer = setTimeout(() => {
    persistTimer = null
    persistActiveBundle()
  }, 80)
}

watch(
  currentUser,
  (u) => {
    if (u?.username) {
      loadUserBundle(normalizeUsername(u.username))
    } else {
      applyGuestView()
    }
  },
  { immediate: true },
)

watch(() => records.value, schedulePersist, { deep: true })

watch(
  () =>
    Object.keys(starPositions)
      .map((k) => `${k}:${starPositions[k]?.x},${starPositions[k]?.y}`)
      .join('|'),
  () => schedulePersist(),
)

watch(userTags, schedulePersist, { deep: true })

function maxClusterId(list) {
  let m = -1
  for (const r of list) {
    const c = r.clusterId
    if (typeof c === 'number' && c > m) m = c
  }
  return m
}

/** 写入某条 record 在星盘 SVG 中的绝对坐标；登录用户会持久化 */
export function setStarPosition(recordId, x, y) {
  if (recordId == null) return
  const nx = Number(x)
  const ny = Number(y)
  if (!Number.isFinite(nx) || !Number.isFinite(ny)) return
  starPositions[recordId] = { x: nx, y: ny }
  schedulePersist()
}

export function saveEditorDraft(payload) {
  if (activeUsernameNorm == null) return
  writeJson(draftKey(activeUsernameNorm), {
    ...payload,
    updatedAt: Date.now(),
  })
}

export function loadEditorDraft() {
  if (activeUsernameNorm == null) return null
  return readJson(draftKey(activeUsernameNorm), null)
}

export function clearEditorDraft() {
  if (activeUsernameNorm == null) return
  try {
    localStorage.removeItem(draftKey(activeUsernameNorm))
  } catch (_) {}
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

  const canPersistRecords = computed(() => activeUsernameNorm != null)

  function addUserTag(name) {
    const t = String(name || '').trim()
    if (!t) return { ok: false, message: '标签名不能为空' }
    if (
      userTags.value.some((x) => x.toLowerCase() === t.toLowerCase())
    ) {
      return { ok: false, message: '已有同名标签' }
    }
    userTags.value = normalizeTagList([...userTags.value, t])
    return { ok: true, name: t }
  }

  /**
   * 从编辑器提交一条记录（Markdown、标签、内嵌本地图均为 data URL 存在 bodyMd 内）
   * @returns {string|null} 新 record id，未创建则 null
   */
  function commitNewRecordFromEditor({ title, bodyMd, tags }) {
    if (activeUsernameNorm == null) return null
    const body = String(bodyMd || '')
    const bodyTrim = body.trim()
    const t = String(title || '').trim()
    const finalTitle = t || '无标题'
    if (!bodyTrim && !t) return null

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
      clusterId = inLast >= 12 ? maxClusterId(list) + 1 : lastCid
    }

    const summary =
      excerptFromMarkdown(body, 200) || finalTitle.slice(0, 120)

    const rec = {
      id: `r-${Date.now()}-${draftSeq}`,
      title: finalTitle,
      summary,
      bodyMd: body,
      tags: normalizeTagList(tags),
      createdAt: now,
      clusterId,
    }
    records.value.push(rec)
    return rec.id
  }

  /**
   * 按 id 更新已有记录（登录用户）
   * @returns {boolean} 是否成功写入
   */
  function updateRecordFromEditor({ id, title, bodyMd, tags }) {
    if (activeUsernameNorm == null || id == null) return false
    const idx = records.value.findIndex((r) => r.id === id)
    if (idx < 0) return false
    const body = String(bodyMd || '')
    const bodyTrim = body.trim()
    const t = String(title || '').trim()
    if (!bodyTrim && !t) return false
    const finalTitle = t || '无标题'
    const summary =
      excerptFromMarkdown(body, 200) || finalTitle.slice(0, 120)
    const prev = records.value[idx]
    records.value[idx] = {
      ...prev,
      title: finalTitle,
      summary,
      bodyMd: body,
      tags: normalizeTagList(tags),
    }
    schedulePersist()
    return true
  }

  /** 删除记录及其星盘坐标（登录用户） */
  function deleteRecordById(id) {
    if (activeUsernameNorm == null || id == null) return false
    const idx = records.value.findIndex((r) => r.id === id)
    if (idx < 0) return false
    records.value.splice(idx, 1)
    delete starPositions[id]
    schedulePersist()
    return true
  }

  function addDemoRecord() {
    if (activeUsernameNorm == null) return
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
      clusterId = inLast >= 12 ? maxClusterId(list) + 1 : lastCid
    }

    records.value.push({
      id: `r-${Date.now()}-${draftSeq}`,
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
    commitNewRecordFromEditor,
    updateRecordFromEditor,
    deleteRecordById,
    addUserTag,
    userTags,
    starPositions,
    setStarPosition,
    canPersistRecords,
    saveEditorDraft,
    loadEditorDraft,
    clearEditorDraft,
  }
}
