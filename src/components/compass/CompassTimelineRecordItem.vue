<template>
  <div class="relative font-boutique-primary">
    <div
      class="absolute left-0 top-1.5 z-[1] h-3 w-3 rounded-full border-2 border-white sm:top-2 sm:h-3.5 sm:w-3.5"
      :style="{ backgroundColor: bgPrimary }"
    />
    <div class="ml-8 flex w-[calc(100%-2rem)] gap-2">
      <button
        type="button"
        class="min-w-0 flex-1 rounded-lg border border-white/18 bg-white/5 px-4 py-3 text-left transition hover:border-white/35 hover:bg-white/10"
        @click="openRecordPreview"
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
        <div v-if="item.tags?.length" class="mt-2 flex flex-wrap gap-1">
          <span
            v-for="tg in item.tags"
            :key="tg"
            class="rounded-full border border-white/20 bg-white/8 px-2 py-0.5 text-[9px] text-white/75"
            >{{ tg }}</span
          >
        </div>
        <p class="mt-1 line-clamp-1 text-xs text-white/45">
          {{ item.summary }}
        </p>
      </button>
      <button
        type="button"
        class="shrink-0 self-start rounded-md border px-2 py-1.5 text-[10px] font-medium transition sm:text-[11px]"
        :class="
          canPin
            ? item.pinned
              ? 'border-[rgba(146,212,184,0.45)] bg-[rgba(146,212,184,0.15)] text-[#c8f0df] hover:bg-[rgba(146,212,184,0.22)]'
              : 'border-white/20 bg-white/[0.06] text-white/70 hover:border-white/35 hover:bg-white/10'
            : 'cursor-not-allowed border-white/10 bg-white/[0.03] text-white/30'
        "
        :disabled="!canPin"
        :title="
          item.pinned ? '取消置顶' : canPin ? '置顶' : '登录后可置顶'
        "
        @click.stop="$emit('toggle-pin', item.id)"
      >
        {{ item.pinned ? '已置顶' : '置顶' }}
      </button>
    </div>
  </div>
</template>

<script setup>
import { inject } from 'vue'

const props = defineProps({
  item: { type: Object, required: true },
  bgPrimary: { type: String, required: true },
  canPin: { type: Boolean, default: false },
})

defineEmits(['toggle-pin'])

const compassRecordEditor = inject('compassRecordEditor', null)

function openRecordPreview() {
  compassRecordEditor?.openPreview?.(props.item.id)
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
