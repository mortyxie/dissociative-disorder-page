<template>
  <div class="compass-timeline font-boutique-primary px-4 pb-20 sm:px-6">
    <header class="mb-5 max-w-2xl">
      <h2 class="font-boutique-primary text-xl text-white">知识时间线</h2>
      <p class="mt-2 text-sm text-white/65">
        支持搜索、置顶与二级分组（时间↔标签）；标题在编辑器中最多 30 字。
      </p>
    </header>

    <div class="mx-auto mb-6 max-w-2xl">
      <label class="sr-only" for="compass-timeline-search">搜索记录</label>
      <input
        id="compass-timeline-search"
        v-model.trim="searchQuery"
        type="search"
        autocomplete="off"
        placeholder="搜索标题、摘要、标签或正文…"
        class="font-boutique-primary w-full rounded-lg border border-white/18 bg-white/[0.06] px-3 py-2.5 text-sm text-white/92 outline-none placeholder:text-white/35 focus:border-[rgba(146,212,184,0.45)] focus:ring-2 focus:ring-[rgba(146,212,184,0.2)]"
      />
    </div>

    <div
      class="mx-auto mb-8 flex max-w-2xl flex-wrap items-center gap-2"
      role="group"
      aria-label="二级分组：主维度"
    >
      <span class="text-[11px] text-white/45 sm:text-xs">主分类</span>
      <div
        class="inline-flex rounded-lg border border-white/14 bg-white/[0.05] p-0.5 text-[10px] sm:text-[11px]"
      >
        <button
          type="button"
          class="rounded-md px-3 py-1.5 font-medium transition"
          :class="
            groupMode === 'time'
              ? 'bg-white/14 text-white/95'
              : 'text-white/50 hover:bg-white/8 hover:text-white/80'
          "
          @click="groupMode = 'time'"
        >
          先按时间
        </button>
        <button
          type="button"
          class="rounded-md px-3 py-1.5 font-medium transition"
          :class="
            groupMode === 'tag'
              ? 'bg-white/14 text-white/95'
              : 'text-white/50 hover:bg-white/8 hover:text-white/80'
          "
          @click="groupMode = 'tag'"
        >
          先按标签
        </button>
      </div>
      <span class="text-[10px] text-white/38 sm:text-[11px]">
        次级为{{ groupMode === 'time' ? '标签' : '时间分段' }}
      </span>
    </div>

    <div class="relative mx-auto max-w-2xl pl-6 sm:pl-8">
      <div
        class="absolute bottom-0 left-[11px] top-0 w-px bg-white/35 sm:left-[15px]"
        aria-hidden="true"
      />

      <section v-if="pinnedFiltered.length" class="relative mb-12">
        <h3
          class="font-boutique-primary mb-4 text-sm font-medium tracking-wide text-[#c8f0df]/95"
        >
          置顶
        </h3>
        <ul class="space-y-0">
          <li
            v-for="item in pinnedFiltered"
            :key="'pin-' + item.id"
            class="relative pb-10 last:pb-2"
          >
            <CompassTimelineRecordItem
              :item="item"
              :bg-primary="bgPrimary"
              :can-pin="canPersistRecords"
              @toggle-pin="toggleRecordPin"
            />
          </li>
        </ul>
      </section>

      <template v-if="groupMode === 'time'">
        <section
          v-for="group in timeFirstGroups"
          :key="'tb-' + group.bucket"
          class="relative mb-10 last:mb-0"
        >
          <h3
            class="font-boutique-primary mb-3 text-sm font-medium text-white/90"
          >
            {{ group.bucket }}
          </h3>
          <div
            v-for="sec in group.tagSections"
            :key="group.bucket + '-tg-' + sec.tag"
            class="mb-6 last:mb-0"
          >
            <h4
              class="mb-2 border-b border-white/10 pb-1 text-[11px] font-medium text-white/55 sm:text-xs"
            >
              {{ sec.tag }}
            </h4>
            <ul class="space-y-0">
              <li
                v-for="item in sec.items"
                :key="group.bucket + '-' + sec.tag + '-' + item.id"
                class="relative pb-10 last:pb-2"
              >
                <CompassTimelineRecordItem
                  :item="item"
                  :bg-primary="bgPrimary"
                  :can-pin="canPersistRecords"
                  @toggle-pin="toggleRecordPin"
                />
              </li>
            </ul>
          </div>
        </section>
      </template>

      <template v-else>
        <section
          v-for="group in tagFirstGroups"
          :key="'tg-' + group.tag"
          class="relative mb-10 last:mb-0"
        >
          <h3
            class="font-boutique-primary mb-3 text-sm font-medium text-white/90"
          >
            {{ group.tag }}
          </h3>
          <div
            v-for="sec in group.timeSections"
            :key="group.tag + '-tb-' + sec.bucket"
            class="mb-6 last:mb-0"
          >
            <h4
              class="mb-2 border-b border-white/10 pb-1 text-[11px] font-medium text-white/55 sm:text-xs"
            >
              {{ sec.bucket }}
            </h4>
            <ul class="space-y-0">
              <li
                v-for="item in sec.items"
                :key="group.tag + '-' + sec.bucket + '-' + item.id"
                class="relative pb-10 last:pb-2"
              >
                <CompassTimelineRecordItem
                  :item="item"
                  :bg-primary="bgPrimary"
                  :can-pin="canPersistRecords"
                  @toggle-pin="toggleRecordPin"
                />
              </li>
            </ul>
          </div>
        </section>
      </template>

      <p
        v-if="
          !pinnedFiltered.length &&
          !timeFirstGroups.length &&
          !tagFirstGroups.length
        "
        class="ml-8 text-sm text-white/45"
      >
        {{ searchQuery ? '没有匹配的记录' : '暂无记录' }}
      </p>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { getColor } from '@/config/theme.js'
import { useCompassRecords } from '@/composables/useCompassRecords.js'
import CompassTimelineRecordItem from '@/components/compass/CompassTimelineRecordItem.vue'

const bgPrimary = getColor('background', 'primary')

const { records, toggleRecordPin, canPersistRecords } = useCompassRecords()

const searchQuery = ref('')
/** @type {import('vue').Ref<'time'|'tag'>} */
const groupMode = ref('time')

const TIME_BUCKET_ORDER = [
  '今天',
  '昨天',
  '7天内',
  '一个月内',
  '3个月内',
  '1年内',
  '2年内',
  '更早',
]

const UNTAGGED = '无标签'

function startOfLocalDay(d) {
  const x = new Date(d)
  return new Date(x.getFullYear(), x.getMonth(), x.getDate()).getTime()
}

function timeBucketForRecord(createdAt) {
  const now = new Date()
  const dayMs = 86400000
  const todayStart = startOfLocalDay(now)
  const c = new Date(createdAt)
  if (Number.isNaN(c.getTime())) return '更早'
  const cStart = startOfLocalDay(c)
  const diffDays = Math.floor((todayStart - cStart) / dayMs)
  if (diffDays < 0) return '更早'
  if (diffDays === 0) return '今天'
  if (diffDays === 1) return '昨天'
  if (diffDays < 7) return '7天内'
  if (diffDays < 30) return '一个月内'
  if (diffDays < 90) return '3个月内'
  if (diffDays < 365) return '1年内'
  if (diffDays < 730) return '2年内'
  return '更早'
}

function sortByCreatedDesc(list) {
  return [...list].sort(
    (a, b) => new Date(b.createdAt) - new Date(a.createdAt),
  )
}

function sortByPinnedThenCreated(list) {
  return [...list].sort((a, b) => {
    const ap = a.pinned ? 1 : 0
    const bp = b.pinned ? 1 : 0
    if (ap !== bp) return bp - ap
    if (ap) {
      const pa = a.pinnedAt || a.createdAt
      const pb = b.pinnedAt || b.createdAt
      return String(pb).localeCompare(String(pa))
    }
    return new Date(b.createdAt) - new Date(a.createdAt)
  })
}

function tagsForRecord(r) {
  return r.tags?.length ? [...r.tags] : [UNTAGGED]
}

function compareTags(a, b) {
  if (a === UNTAGGED) return 1
  if (b === UNTAGGED) return -1
  return a.localeCompare(b, 'zh')
}

function recordMatchesQuery(r, q) {
  if (!q) return true
  const needle = q.toLowerCase()
  const hay = [
    r.title,
    r.summary,
    r.bodyMd,
    ...(r.tags || []),
  ]
    .filter(Boolean)
    .join('\n')
    .toLowerCase()
  return hay.includes(needle)
}

const filteredRecords = computed(() =>
  records.value.filter((r) => recordMatchesQuery(r, searchQuery.value)),
)

const pinnedFiltered = computed(() =>
  sortByPinnedThenCreated(filteredRecords.value.filter((r) => r.pinned)),
)

const nonPinnedFiltered = computed(() =>
  filteredRecords.value.filter((r) => !r.pinned),
)

const timeFirstGroups = computed(() => {
  if (groupMode.value !== 'time') return []
  const list = nonPinnedFiltered.value
  const byBucket = new Map()
  for (const b of TIME_BUCKET_ORDER) {
    byBucket.set(b, new Map())
  }
  for (const r of list) {
    const bucket = timeBucketForRecord(r.createdAt)
    const tagMap = byBucket.get(bucket)
    if (!tagMap) continue
    for (const tg of tagsForRecord(r)) {
      if (!tagMap.has(tg)) tagMap.set(tg, [])
      tagMap.get(tg).push(r)
    }
  }
  const out = []
  for (const bucket of TIME_BUCKET_ORDER) {
    const tagMap = byBucket.get(bucket)
    const tagKeys = [...tagMap.keys()].sort(compareTags)
    const tagSections = []
    for (const tag of tagKeys) {
      const items = sortByCreatedDesc(tagMap.get(tag) || [])
      if (items.length) tagSections.push({ tag, items })
    }
    if (tagSections.length) out.push({ bucket, tagSections })
  }
  return out
})

const tagFirstGroups = computed(() => {
  if (groupMode.value !== 'tag') return []
  const list = nonPinnedFiltered.value
  const byTag = new Map()
  for (const r of list) {
    for (const tg of tagsForRecord(r)) {
      if (!byTag.has(tg)) byTag.set(tg, new Map())
      const bucketMap = byTag.get(tg)
      const bucket = timeBucketForRecord(r.createdAt)
      if (!bucketMap.has(bucket)) bucketMap.set(bucket, [])
      bucketMap.get(bucket).push(r)
    }
  }
  const tagKeys = [...byTag.keys()].sort(compareTags)
  const out = []
  for (const tag of tagKeys) {
    const bucketMap = byTag.get(tag)
    const timeSections = []
    for (const bucket of TIME_BUCKET_ORDER) {
      const items = sortByCreatedDesc(bucketMap.get(bucket) || [])
      if (items.length) timeSections.push({ bucket, items })
    }
    if (timeSections.length) out.push({ tag, timeSections })
  }
  return out
})

</script>
