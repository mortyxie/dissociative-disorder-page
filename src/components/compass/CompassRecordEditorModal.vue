<template>
  <Teleport to="body">
    <div
      v-if="modelValue"
      class="compass-record-editor-overlay fixed inset-0 z-[12500] flex items-center justify-center p-2 sm:p-5"
      role="dialog"
      aria-modal="true"
      aria-labelledby="compass-editor-title"
    >
      <div
        class="absolute inset-0 bg-black/50 backdrop-blur-md"
        aria-hidden="true"
        @click="onBackdropClick"
      />
      <div
        class="compass-editor-panel relative flex max-h-[min(92dvh,880px)] w-full max-w-3xl flex-col overflow-hidden rounded-xl border border-white/18 shadow-2xl"
        :style="panelChromeStyle"
        @click.stop
      >
        <header
          class="flex shrink-0 items-center justify-between gap-2 border-b border-white/12 px-4 py-3 sm:px-5"
        >
          <h2
            id="compass-editor-title"
            class="font-boutique-primary text-sm font-medium text-white/95 sm:text-base"
          >
            {{ modalTitle }}
          </h2>
          <div class="flex shrink-0 items-center gap-1">
            <button
              v-if="canEditExisting && uiMode === 'edit'"
              type="button"
              class="rounded-md border border-white/22 bg-white/[0.08] px-2.5 py-1 text-[11px] font-medium text-white/85 transition hover:bg-white/14 sm:text-xs"
              @click="switchToPreview"
            >
              预览
            </button>
            <button
              v-if="canEditExisting && uiMode === 'preview'"
              type="button"
              class="rounded-md border border-[rgba(146,212,184,0.45)] bg-[rgba(146,212,184,0.14)] px-2.5 py-1 text-[11px] font-medium text-[#c8f0df] transition hover:bg-[rgba(146,212,184,0.22)] sm:text-xs"
              @click="switchToEdit"
            >
              编辑
            </button>
            <button
              v-if="canEditExisting && editingRecordId"
              type="button"
              class="rounded-md border border-red-400/35 bg-red-500/15 px-2.5 py-1 text-[11px] font-medium text-red-200/95 transition hover:bg-red-500/25 sm:text-xs"
              @click="confirmDeleteEditingRecord"
            >
              删除
            </button>
            <button
              type="button"
              class="rounded-md px-2 py-1 text-lg leading-none text-white/45 transition hover:bg-white/10 hover:text-white/85"
              aria-label="关闭"
              @click="onHeaderClose"
            >
              ×
            </button>
          </div>
        </header>

        <div
          class="min-h-0 flex-1 overflow-y-auto overscroll-y-contain px-4 py-3 sm:px-5 sm:py-4"
        >
          <!-- 已有记录：只读预览 -->
          <div
            v-if="editingRecordId && uiMode === 'preview'"
            class="space-y-4"
          >
            <div>
              <p class="text-[11px] text-white/50 sm:text-xs">标题</p>
              <p
                class="font-boutique-primary mt-1 text-base font-medium text-white/95 sm:text-lg"
              >
                {{ displayTitle }}
              </p>
            </div>
            <p
              v-if="previewCreatedAt"
              class="text-[11px] text-white/45 sm:text-xs"
            >
              {{ formatRecordDate(previewCreatedAt) }}
            </p>
            <div v-if="selectedTags.length">
              <p class="text-[11px] text-white/50 sm:text-xs">标签</p>
              <div class="mt-2 flex flex-wrap gap-1.5">
                <span
                  v-for="t in selectedTags"
                  :key="'pv-' + t"
                  class="rounded-full border border-white/20 bg-white/8 px-2.5 py-0.5 text-[10px] text-white/80 sm:text-[11px]"
                  >{{ t }}</span
                >
              </div>
            </div>
            <div>
              <p class="text-[11px] text-white/50 sm:text-xs">正文</p>
              <div
                class="compass-md-preview compass-record-readonly-md mt-2 min-h-[min(42vh,320px)] overflow-auto rounded-lg border border-white/12 bg-[#1e1c28] p-4 sm:min-h-[min(48vh,400px)]"
                v-html="readonlyPreviewHtml"
              />
            </div>
          </div>

          <template v-else>
          <label class="block text-[11px] text-white/50 sm:text-xs">
            <span class="flex items-baseline justify-between gap-2">
              <span>标题</span>
              <span class="font-mono text-[10px] text-white/35 tabular-nums sm:text-[11px]">
                {{ titleCharCount }}/{{ COMPASS_RECORD_TITLE_MAX }}
              </span>
            </span>
            <input
              v-model.trim="editorTitle"
              type="text"
              class="mt-1 w-full rounded-lg border border-white/15 bg-[#252336] px-3 py-2 text-sm text-white/92 outline-none placeholder:text-white/30 focus:border-[rgba(146,212,184,0.45)] focus:ring-2 focus:ring-[rgba(146,212,184,0.25)]"
              placeholder="最多 30 字；留空则保存为「无标题」"
            />
          </label>

          <div class="mt-4">
            <p class="text-[11px] text-white/50 sm:text-xs">
              标签：先点选已有标签（可多选）；若没有合适的，再到下方新建。
            </p>
            <div class="mt-2 flex flex-wrap gap-1.5">
              <button
                v-for="t in userTags"
                :key="t"
                type="button"
                class="rounded-full border px-2.5 py-0.5 text-[10px] transition sm:text-[11px]"
                :class="
                  selectedTags.includes(t)
                    ? 'border-[rgba(146,212,184,0.55)] bg-[rgba(146,212,184,0.18)] text-[#c8f0df]'
                    : 'border-white/18 bg-white/[0.06] text-white/70 hover:border-white/28 hover:bg-white/10'
                "
                @click="toggleTag(t)"
              >
                {{ t }}
              </button>
              <span
                v-if="!userTags.length"
                class="text-[10px] text-white/38"
                >还没有已保存的标签，请先在下方新建。</span
              >
            </div>

            <div
              class="mt-4 rounded-lg border border-dashed border-white/14 bg-white/[0.04] px-3 py-2.5"
            >
              <p class="text-[10px] text-white/45 sm:text-[11px]">
                没有合适标签时，新建一个（创建后会自动选中，可与其他标签叠加）
              </p>
              <div class="mt-2 flex flex-wrap gap-2">
                <input
                  v-model.trim="newTagName"
                  type="text"
                  class="min-w-[6rem] flex-1 rounded-md border border-white/12 bg-[#252336] px-2 py-1.5 text-xs text-white/90 outline-none placeholder:text-white/28 focus:border-[rgba(146,212,184,0.4)] sm:max-w-[14rem]"
                  placeholder="新标签名称"
                  @keydown.enter.prevent="createTag"
                />
                <button
                  type="button"
                  class="rounded-md border border-[rgba(146,212,184,0.45)] bg-[rgba(146,212,184,0.14)] px-3 py-1.5 text-xs font-medium text-[#c8f0df] hover:bg-[rgba(146,212,184,0.22)]"
                  @click="createTag"
                >
                  创建并选中
                </button>
              </div>
              <p v-if="tagHint" class="mt-1.5 text-[10px] text-red-300/90">
                {{ tagHint }}
              </p>
            </div>
          </div>

          <div
            class="mt-4 flex flex-wrap items-center justify-end gap-2 border-b border-white/10 pb-2"
          >
            <div
              class="flex rounded-lg border border-white/12 bg-[#1e1c28] p-0.5 text-[10px] sm:text-[11px]"
            >
              <button
                type="button"
                class="rounded-md px-2.5 py-1 transition"
                :class="
                  panelTab === 'preview'
                    ? 'bg-white/12 text-white/95 shadow-sm'
                    : 'text-white/45'
                "
                @click="setPanelTab('preview')"
              >
                预览
              </button>
              <button
                type="button"
                class="rounded-md px-2.5 py-1 transition"
                :class="
                  panelTab === 'source'
                    ? 'bg-white/12 text-white/95 shadow-sm'
                    : 'text-white/45'
                "
                @click="setPanelTab('source')"
              >
                Markdown 源码
              </button>
            </div>
          </div>

          <!-- 默认：可编辑预览区，粘贴图片直接插入像素 -->
          <div
            v-show="panelTab === 'preview'"
            ref="richRef"
            contenteditable="true"
            spellcheck="false"
            class="compass-rich-editable compass-md-preview mt-3 min-h-[min(42vh,320px)] w-full overflow-auto rounded-lg border border-white/12 bg-[#1e1c28] p-4 outline-none focus:border-[rgba(146,212,184,0.45)] focus:ring-2 focus:ring-[rgba(146,212,184,0.2)] sm:min-h-[min(48vh,400px)]"
            @input="onRichInput"
            @keydown="onRichKeydown"
            @paste="onRichPaste"
          />

          <textarea
            v-show="panelTab === 'source'"
            ref="bodyRef"
            v-model="editorBody"
            class="compass-editor-textarea mt-3 min-h-[min(42vh,320px)] w-full resize-y rounded-lg border border-white/15 bg-[#252336] p-3 text-[13px] leading-relaxed text-white/90 outline-none placeholder:text-white/30 focus:border-[rgba(146,212,184,0.45)] focus:ring-2 focus:ring-[rgba(146,212,184,0.2)] sm:min-h-[min(48vh,400px)]"
            placeholder="Markdown 源码。粘贴截图会插入为 ![](data:...) 语法。"
            @paste="onPasteSource"
          />
          </template>
        </div>

        <footer
          v-if="editingRecordId && uiMode === 'preview'"
          class="flex shrink-0 items-center justify-end gap-2 border-t border-white/10 bg-[#1a1824]/90 px-4 py-3 sm:px-5"
        >
          <button
            type="button"
            class="rounded-lg border border-white/20 bg-white/[0.08] px-4 py-2 text-xs font-medium text-white/88 hover:bg-white/14"
            @click="closeWithoutSave"
          >
            关闭
          </button>
        </footer>
        <footer
          v-else
          class="flex shrink-0 items-center justify-between gap-2 border-t border-white/10 bg-[#1a1824]/90 px-4 py-3 sm:px-5"
        >
          <p class="text-[10px] text-white/38 sm:text-[11px]">
            预览：「# / ## / ###」后敲空格即变标题；「- 」或「1.」后敲空格即变列表；列表内回车续行，空项回车退出。
          </p>
          <button
            type="button"
            class="shrink-0 rounded-lg border border-[rgba(146,212,184,0.5)] bg-[rgba(146,212,184,0.2)] px-4 py-2 text-xs font-medium text-[#e8faf1] hover:bg-[rgba(146,212,184,0.28)]"
            @click="closeAndCommit"
          >
            完成
          </button>
        </footer>
      </div>
    </div>
  </Teleport>
</template>

<script setup>
import { ref, watch, computed, nextTick } from 'vue'
import { getColor } from '@/config/theme.js'
import { renderSimpleMarkdown } from '@/utils/simpleMarkdown.js'
import { htmlToMarkdownFromEditor } from '@/utils/markdownHtmlSync.js'
import {
  applyLiveBlockTransforms,
  handleRichEditorEnter,
} from '@/utils/richEditorLiveMd.js'
import {
  useCompassRecords,
  clampRecordTitle,
  COMPASS_RECORD_TITLE_MAX,
} from '@/composables/useCompassRecords.js'

const props = defineProps({
  modelValue: { type: Boolean, default: false },
  /** 非空时编辑该 id 的已有记录 */
  editingRecordId: { type: String, default: undefined },
  /** 打开已有记录时的初始界面：preview=只读预览，edit=直接编辑（未传时默认预览） */
  initialView: {
    type: String,
    default: 'preview',
    validator: (v) => v === 'preview' || v === 'edit',
  },
})

const emit = defineEmits(['update:modelValue'])

const panelChromeStyle = computed(() => ({
  backgroundColor: getColor('background', 'secondary'),
  color: getColor('text', 'primary'),
  boxShadow: `0 25px 50px -12px ${getColor('dialog', 'shadow')}`,
}))

const {
  records,
  commitNewRecordFromEditor,
  updateRecordFromEditor,
  deleteRecordById,
  addUserTag,
  userTags,
  saveEditorDraft,
  loadEditorDraft,
  clearEditorDraft,
  canPersistRecords,
} = useCompassRecords()

/** @type {import('vue').Ref<'preview'|'edit'>} */
const uiMode = ref('edit')
const previewCreatedAt = ref('')

const canEditExisting = computed(() => {
  const id = props.editingRecordId
  if (!id) return false
  if (!canPersistRecords.value) return false
  if (String(id).startsWith('guest-')) return false
  return true
})

const modalTitle = computed(() => {
  if (!props.editingRecordId) return '新建知识星'
  if (uiMode.value === 'preview') return '预览知识星'
  return '编辑知识星'
})

const displayTitle = computed(() => {
  const t = (editorTitle.value || '').trim()
  return t || '无标题'
})

const readonlyPreviewHtml = computed(() => {
  const md = (editorBody.value || '').trim()
  return md
    ? renderSimpleMarkdown(md)
    : '<div class="compass-md-root"><p class="compass-md-p text-white/42">暂无正文</p></div>'
})

const editorTitle = ref('')
const editorBody = ref('')
const selectedTags = ref([])
const newTagName = ref('')
const tagHint = ref('')
/** @type {import('vue').Ref<'preview'|'source'>} */
const panelTab = ref('preview')
const bodyRef = ref(null)
const richRef = ref(null)

const titleCharCount = computed(
  () => Array.from(editorTitle.value || '').length,
)

let draftSaveTimer = null
let richToMdTimer = null
let richSyncLock = false

function scheduleDraftSave() {
  if (props.editingRecordId) return
  clearTimeout(draftSaveTimer)
  draftSaveTimer = setTimeout(() => {
    draftSaveTimer = null
    saveEditorDraft({
      title: editorTitle.value,
      bodyMd: editorBody.value,
      selectedTagNames: [...selectedTags.value],
    })
  }, 600)
}

function scheduleRichToMd() {
  clearTimeout(richToMdTimer)
  richToMdTimer = setTimeout(() => {
    richToMdTimer = null
    if (!richRef.value || panelTab.value !== 'preview') return
    if (richSyncLock) return
    editorBody.value = htmlToMarkdownFromEditor(richRef.value.innerHTML)
  }, 50)
}

function flushRichToMd() {
  clearTimeout(richToMdTimer)
  richToMdTimer = null
  if (!richRef.value || panelTab.value !== 'preview') return
  editorBody.value = htmlToMarkdownFromEditor(richRef.value.innerHTML)
}

function setRichFromMd() {
  const el = richRef.value
  if (!el) return
  richSyncLock = true
  const md = editorBody.value.trim()
  el.innerHTML = md
    ? renderSimpleMarkdown(md)
    : '<div class="compass-md-root"><p class="compass-md-p"><br></p></div>'
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      richSyncLock = false
    })
  })
}

function setPanelTab(tab) {
  if (panelTab.value === 'preview' && tab === 'source') {
    flushRichToMd()
  }
  panelTab.value = tab
  if (tab === 'preview') {
    nextTick(() => setRichFromMd())
  }
}

function resetForm() {
  editorTitle.value = ''
  editorBody.value = ''
  selectedTags.value = []
  newTagName.value = ''
  tagHint.value = ''
  panelTab.value = 'preview'
  uiMode.value = 'edit'
  previewCreatedAt.value = ''
}

function formatRecordDate(iso) {
  try {
    return new Date(iso).toLocaleString('zh-CN', {
      dateStyle: 'medium',
      timeStyle: 'short',
    })
  } catch {
    return iso
  }
}

function switchToPreview() {
  if (panelTab.value === 'preview') flushRichToMd()
  uiMode.value = 'preview'
}

function switchToEdit() {
  uiMode.value = 'edit'
  nextTick(() => {
    if (panelTab.value === 'preview') setRichFromMd()
  })
}

function closeWithoutSave() {
  resetForm()
  emit('update:modelValue', false)
}

function onHeaderClose() {
  if (props.editingRecordId && uiMode.value === 'preview') {
    closeWithoutSave()
  } else {
    closeAndCommit()
  }
}

function onBackdropClick() {
  onHeaderClose()
}

function hydrateFromDraft() {
  const d = loadEditorDraft()
  if (d && typeof d === 'object') {
    editorTitle.value = clampRecordTitle(
      typeof d.title === 'string' ? d.title : '',
    )
    editorBody.value = typeof d.bodyMd === 'string' ? d.bodyMd : ''
    selectedTags.value = Array.isArray(d.selectedTagNames)
      ? d.selectedTagNames.filter(Boolean)
      : []
  } else {
    resetForm()
  }
}

function hydrateFromRecordId(recordId) {
  const r = records.value.find((x) => x.id === recordId)
  if (!r) {
    resetForm()
    return
  }
  editorTitle.value = clampRecordTitle(
    typeof r.title === 'string' ? r.title : '',
  )
  editorBody.value = typeof r.bodyMd === 'string' ? r.bodyMd : ''
  selectedTags.value = Array.isArray(r.tags) ? [...r.tags] : []
  newTagName.value = ''
  tagHint.value = ''
  panelTab.value = 'preview'
  previewCreatedAt.value =
    typeof r.createdAt === 'string' ? r.createdAt : ''
  uiMode.value = props.initialView === 'edit' ? 'edit' : 'preview'
}

watch(
  () => props.modelValue,
  (open) => {
    if (open) {
      if (props.editingRecordId) {
        hydrateFromRecordId(props.editingRecordId)
      } else {
        hydrateFromDraft()
        uiMode.value = 'edit'
        previewCreatedAt.value = ''
      }
      nextTick(() => {
        if (uiMode.value === 'edit' && panelTab.value === 'preview') {
          setRichFromMd()
        }
        scheduleDraftSave()
      })
    } else {
      clearTimeout(draftSaveTimer)
      clearTimeout(richToMdTimer)
      draftSaveTimer = null
      richToMdTimer = null
    }
  },
)

watch(
  [editorTitle, editorBody, selectedTags],
  () => {
    if (props.modelValue && !props.editingRecordId) scheduleDraftSave()
  },
  { deep: true },
)

watch(editorTitle, (v) => {
  const c = clampRecordTitle(v)
  if (c !== v) editorTitle.value = c
})

function createTag() {
  tagHint.value = ''
  const r = addUserTag(newTagName.value)
  if (!r.ok) {
    tagHint.value = r.message || '创建失败'
    return
  }
  newTagName.value = ''
  if (r.name && !selectedTags.value.includes(r.name)) {
    selectedTags.value = [...selectedTags.value, r.name]
  }
}

function toggleTag(t) {
  const i = selectedTags.value.indexOf(t)
  if (i >= 0) {
    selectedTags.value = selectedTags.value.filter((x) => x !== t)
  } else {
    selectedTags.value = [...selectedTags.value, t]
  }
}

function insertNodeAtCaret(node) {
  const shell = richRef.value
  if (!shell) return
  shell.focus()
  const sel = window.getSelection()
  if (!sel) return
  let range
  if (sel.rangeCount) {
    range = sel.getRangeAt(0)
    if (!shell.contains(range.commonAncestorContainer)) {
      range = document.createRange()
      const root = shell.querySelector('.compass-md-root') || shell
      range.selectNodeContents(root)
      range.collapse(false)
    }
  } else {
    range = document.createRange()
    const root = shell.querySelector('.compass-md-root') || shell
    range.selectNodeContents(root)
    range.collapse(false)
  }
  range.deleteContents()
  range.insertNode(node)
  const tail = document.createTextNode('\u200B')
  node.after(tail)
  range.setStart(tail, 1)
  range.collapse(true)
  sel.removeAllRanges()
  sel.addRange(range)
}

function readFileAsDataUrl(f) {
  return new Promise((resolve, reject) => {
    const r = new FileReader()
    r.onload = () => resolve(String(r.result))
    r.onerror = reject
    r.readAsDataURL(f)
  })
}

async function onRichPaste(e) {
  const dt = e.clipboardData
  if (!dt?.items?.length) return
  const imageFiles = []
  for (let i = 0; i < dt.items.length; i++) {
    const it = dt.items[i]
    if (it.kind === 'file' && it.type.startsWith('image/')) {
      const f = it.getAsFile()
      if (f) imageFiles.push(f)
    }
  }
  if (!imageFiles.length) return
  e.preventDefault()
  for (const f of imageFiles) {
    try {
      const url = await readFileAsDataUrl(f)
      const img = document.createElement('img')
      img.className = 'compass-md-img'
      img.src = url
      img.alt = ''
      img.loading = 'lazy'
      insertNodeAtCaret(img)
    } catch (_) {}
  }
  applyLiveBlockTransforms(richRef.value)
  scheduleRichToMd()
}

function onRichInput() {
  if (richSyncLock) return
  if (richRef.value) applyLiveBlockTransforms(richRef.value)
  scheduleRichToMd()
}

function onRichKeydown(e) {
  if (!richRef.value || panelTab.value !== 'preview') return
  if (handleRichEditorEnter(e, richRef.value)) {
    applyLiveBlockTransforms(richRef.value)
    scheduleRichToMd()
  }
}

function insertImagesAtCursorInTextarea(files) {
  const list = Array.from(files).filter((f) => f.type.startsWith('image/'))
  if (!list.length) return
  const ta = bodyRef.value
  let start = ta?.selectionStart ?? editorBody.value.length

  let chain = Promise.resolve()
  for (const f of list) {
    chain = chain.then(
      () =>
        new Promise((resolve) => {
          const reader = new FileReader()
          reader.onload = () => {
            const url = reader.result
            const insert = `\n\n![图片](${url})\n\n`
            const body = editorBody.value
            editorBody.value =
              body.slice(0, start) + insert + body.slice(start)
            start += insert.length
            resolve()
          }
          reader.onerror = () => resolve()
          reader.readAsDataURL(f)
        }),
    )
  }
  void chain.then(() => {
    nextTick(() => {
      if (ta) {
        ta.focus()
        ta.selectionStart = ta.selectionEnd = start
      }
    })
  })
}

function onPasteSource(e) {
  const dt = e.clipboardData
  if (!dt?.items?.length) return
  const imageFiles = []
  for (let i = 0; i < dt.items.length; i++) {
    const it = dt.items[i]
    if (it.kind === 'file' && it.type.startsWith('image/')) {
      const f = it.getAsFile()
      if (f) imageFiles.push(f)
    }
  }
  if (!imageFiles.length) return
  e.preventDefault()
  insertImagesAtCursorInTextarea(imageFiles)
}

function closeAndCommit() {
  if (panelTab.value === 'preview') {
    flushRichToMd()
  }
  if (props.editingRecordId) {
    const ok = updateRecordFromEditor({
      id: props.editingRecordId,
      title: editorTitle.value,
      bodyMd: editorBody.value,
      tags: selectedTags.value,
    })
    if (!ok) return
  } else {
    const id = commitNewRecordFromEditor({
      title: editorTitle.value,
      bodyMd: editorBody.value,
      tags: selectedTags.value,
    })
    if (id != null) {
      clearEditorDraft()
    } else {
      saveEditorDraft({
        title: editorTitle.value,
        bodyMd: editorBody.value,
        selectedTagNames: [...selectedTags.value],
      })
    }
  }
  resetForm()
  emit('update:modelValue', false)
}

function confirmDeleteEditingRecord() {
  const id = props.editingRecordId
  if (!id) return
  if (!window.confirm('确定删除这条记录？此操作不可撤销。')) return
  deleteRecordById(id)
  resetForm()
  emit('update:modelValue', false)
}

</script>

<style scoped>
.compass-editor-textarea {
  font-family: var(
    --font-ui,
    ui-sans-serif,
    system-ui,
    'Segoe UI',
    'PingFang SC',
    'Microsoft YaHei',
    sans-serif
  );
}

.compass-rich-editable {
  font-family: var(
    --font-ui,
    ui-sans-serif,
    system-ui,
    'Segoe UI',
    'PingFang SC',
    'Microsoft YaHei',
    sans-serif
  );
}

.compass-md-preview :deep(.compass-md-root) {
  font-size: 0.875rem;
  line-height: 1.65;
  color: rgba(255, 255, 255, 0.88);
  min-height: 4rem;
}

.compass-md-preview :deep(.compass-md-h1) {
  font-size: 1.3rem;
  font-weight: 700;
  margin: 0 0 0.5rem;
  color: rgba(255, 255, 255, 0.96);
}

.compass-md-preview :deep(.compass-md-h2) {
  font-size: 1.1rem;
  font-weight: 650;
  margin: 1rem 0 0.35rem;
  color: rgba(255, 255, 255, 0.92);
}

.compass-md-preview :deep(.compass-md-h3) {
  font-size: 1rem;
  font-weight: 600;
  margin: 0.75rem 0 0.25rem;
  color: rgba(255, 255, 255, 0.9);
}

.compass-md-preview :deep(.compass-md-p) {
  margin: 0 0 0.5rem;
}

.compass-md-preview :deep(.compass-md-ul) {
  margin: 0.25rem 0 0.75rem 1.1rem;
  list-style: disc;
}

.compass-md-preview :deep(.compass-md-ol) {
  margin: 0.25rem 0 0.75rem 1.25rem;
  list-style: decimal;
  padding-left: 0.25rem;
}

.compass-md-preview :deep(.compass-md-code) {
  background: rgba(255, 255, 255, 0.08);
  padding: 0.1em 0.35em;
  border-radius: 0.25rem;
  font-size: 0.9em;
  color: rgba(255, 255, 255, 0.92);
}

.compass-md-preview :deep(.compass-md-pre) {
  margin: 0.5rem 0;
  padding: 0.75rem;
  background: #121018;
  color: rgba(255, 255, 255, 0.88);
  border-radius: 0.5rem;
  overflow: auto;
  font-size: 0.8rem;
  border: 1px solid rgba(255, 255, 255, 0.08);
}

.compass-md-preview :deep(.compass-md-img) {
  max-width: 100%;
  height: auto;
  border-radius: 0.35rem;
  margin: 0.5rem 0;
  vertical-align: middle;
}

.compass-md-preview :deep(.compass-md-a) {
  color: #92d4b8;
  text-decoration: underline;
}
</style>
