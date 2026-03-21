<template>
  <div class="compass-timeline px-4 pb-20 sm:px-6">
    <header class="mb-8 max-w-2xl">
      <h2 class="font-boutique-primary text-xl text-white">知识时间线</h2>
      <p class="mt-2 text-sm text-white/65">
        自上而下为从近到早，便于快速定位最近写过什么；点击条目可展开摘要。
      </p>
    </header>

    <div class="relative mx-auto max-w-2xl pl-6 sm:pl-8">
      <!-- 竖线 -->
      <div
        class="absolute bottom-0 left-[11px] top-0 w-px bg-white/35 sm:left-[15px]"
        aria-hidden="true"
      />

      <ul class="space-y-0">
        <li
          v-for="(item, index) in sortedNewestFirst"
          :key="item.id"
          class="relative pb-10 last:pb-2"
        >
          <!-- 节点 -->
          <div
            class="absolute left-0 top-1.5 z-[1] h-3 w-3 rounded-full border-2 border-white sm:top-2 sm:h-3.5 sm:w-3.5"
            :class="{ 'ring-2 ring-white/30': openId === item.id }"
            :style="{ backgroundColor: bgPrimary }"
          />

          <button
            type="button"
            class="ml-8 w-[calc(100%-2rem)] rounded-lg border border-white/18 bg-white/5 px-4 py-3 text-left transition hover:border-white/35 hover:bg-white/10"
            @click="toggle(item.id)"
          >
            <div class="flex flex-wrap items-baseline justify-between gap-2">
              <span class="font-boutique-primary text-base text-white">{{
                item.title
              }}</span>
              <time
                class="whitespace-nowrap text-xs text-white/50"
                :datetime="item.createdAt"
              >
                {{ formatDate(item.createdAt) }}
              </time>
            </div>
            <p
              v-if="openId === item.id"
              class="mt-2 border-t border-white/15 pt-2 text-sm leading-relaxed text-white/70"
            >
              {{ item.summary }}
            </p>
            <p v-else class="mt-1 line-clamp-1 text-xs text-white/45">
              {{ item.summary }}
            </p>
          </button>

          <span
            v-if="index === 0"
            class="absolute -left-0.5 top-0 rounded bg-white/15 px-1.5 py-0.5 text-[9px] uppercase tracking-wider text-white/70 sm:left-0"
          >
            最近
          </span>
        </li>
      </ul>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { getColor } from '@/config/theme.js'
import { useCompassRecords } from '@/composables/useCompassRecords.js'

const bgPrimary = getColor('background', 'primary')

const { sortedNewestFirst } = useCompassRecords()
const openId = ref(null)

function toggle(id) {
  openId.value = openId.value === id ? null : id
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
</script>
