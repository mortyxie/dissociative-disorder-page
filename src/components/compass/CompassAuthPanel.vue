<template>
  <div class="font-boutique-primary flex flex-col items-end gap-1">
    <div
      v-if="isLoggedIn"
      class="flex max-w-[min(72vw,240px)] flex-wrap items-center justify-end gap-1.5 rounded-md border border-white/20 bg-black/25 px-2 py-1 text-[10px] text-white/90 shadow backdrop-blur-sm sm:text-[11px]"
    >
      <span class="truncate text-white/75" :title="currentUser?.username">{{
        currentUser?.displayName || currentUser?.username
      }}</span>
      <button
        type="button"
        class="shrink-0 rounded-sm px-1.5 py-0.5 text-white/80 transition-colors hover:bg-white/10 hover:text-white"
        @click="logout"
      >
        退出
      </button>
    </div>
    <button
      v-else
      type="button"
      class="rounded-md border border-white/20 bg-black/25 px-2.5 py-1 text-[10px] text-white/90 shadow backdrop-blur-sm transition-colors hover:bg-white/10 hover:text-white sm:px-3 sm:text-[11px]"
      @click="openModal('login')"
    >
      登录
    </button>

    <Teleport to="body">
      <div
        v-if="modalOpen"
        class="font-boutique-primary fixed inset-0 z-[12000] flex items-end justify-center p-3 sm:items-center sm:p-6"
        role="dialog"
        aria-modal="true"
        :aria-labelledby="titleId"
      >
        <div
          class="absolute inset-0 bg-black/55 backdrop-blur-[2px]"
          aria-hidden="true"
          @click="closeModal"
        />
        <div
          class="relative z-[1] w-full max-w-[380px] rounded-lg border border-white/15 bg-[rgba(32,30,40,0.97)] p-4 text-white shadow-2xl sm:p-5"
          @keydown.escape="closeModal"
        >
          <div class="mb-3 flex items-start justify-between gap-2">
            <h2 :id="titleId" class="text-sm font-medium text-white/95">
              {{ panelTitle }}
            </h2>
            <button
              type="button"
              class="rounded px-1.5 py-0.5 text-lg leading-none text-white/50 hover:bg-white/10 hover:text-white"
              aria-label="关闭"
              @click="closeModal"
            >
              ×
            </button>
          </div>

          <div
            v-if="mode !== 'forgot2'"
            class="mb-4 flex gap-1 rounded-md border border-white/10 bg-black/20 p-0.5 text-[10px] sm:text-[11px]"
            role="tablist"
          >
            <button
              v-for="tab in tabs"
              :key="tab.id"
              type="button"
              role="tab"
              :aria-selected="mode === tab.id"
              class="flex-1 rounded px-2 py-1.5 transition-colors"
              :class="
                mode === tab.id
                  ? 'bg-white/15 text-white'
                  : 'text-white/55 hover:bg-white/5 hover:text-white/85'
              "
              @click="switchMode(tab.id)"
            >
              {{ tab.label }}
            </button>
          </div>

          <p
            v-if="feedback"
            class="mb-3 rounded border px-2 py-1.5 text-[10px] leading-snug sm:text-[11px]"
            :class="
              feedbackOk
                ? 'border-[rgba(146,212,184,0.45)] bg-[rgba(146,212,184,0.12)] text-[#c8f0df]'
                : 'border-red-400/35 bg-red-500/10 text-red-100'
            "
          >
            {{ feedback }}
          </p>

          <!-- 登录 -->
          <form
            v-if="mode === 'login'"
            class="space-y-3"
            @submit.prevent="onLogin"
          >
            <label class="block text-[10px] text-white/55 sm:text-[11px]">
              用户名
              <input
                v-model.trim="loginUsername"
                type="text"
                autocomplete="username"
                required
                class="mt-1 w-full rounded border border-white/15 bg-black/25 px-2 py-1.5 text-[11px] text-white outline-none ring-[var(--compass-ring-focus)] placeholder:text-white/30 focus:border-white/25 focus:ring-2"
                placeholder="2～24 位，字母数字下划线或中文"
              />
            </label>
            <label class="block text-[10px] text-white/55 sm:text-[11px]">
              密码
              <input
                v-model="loginPassword"
                type="password"
                autocomplete="current-password"
                required
                class="mt-1 w-full rounded border border-white/15 bg-black/25 px-2 py-1.5 text-[11px] text-white outline-none ring-[var(--compass-ring-focus)] focus:border-white/25 focus:ring-2"
              />
            </label>
            <button
              type="submit"
              class="w-full rounded-md border border-[rgba(146,212,184,0.45)] bg-[rgba(146,212,184,0.18)] py-2 text-[11px] font-medium text-[#e8faf1] transition-colors hover:bg-[rgba(146,212,184,0.28)]"
              :disabled="busy"
            >
              {{ busy ? '处理中…' : '登录' }}
            </button>
          </form>

          <!-- 注册 -->
          <form
            v-else-if="mode === 'register'"
            class="space-y-3"
            @submit.prevent="onRegister"
          >
            <label class="block text-[10px] text-white/55 sm:text-[11px]">
              用户名
              <input
                v-model.trim="regUsername"
                type="text"
                autocomplete="username"
                required
                class="mt-1 w-full rounded border border-white/15 bg-black/25 px-2 py-1.5 text-[11px] text-white outline-none ring-[var(--compass-ring-focus)] placeholder:text-white/30 focus:border-white/25 focus:ring-2"
                placeholder="2～24 位，字母数字下划线或中文"
              />
            </label>
            <label class="block text-[10px] text-white/55 sm:text-[11px]">
              密码（至少 6 位）
              <input
                v-model="regPassword"
                type="password"
                autocomplete="new-password"
                required
                minlength="6"
                class="mt-1 w-full rounded border border-white/15 bg-black/25 px-2 py-1.5 text-[11px] text-white outline-none ring-[var(--compass-ring-focus)] focus:border-white/25 focus:ring-2"
              />
            </label>
            <label class="block text-[10px] text-white/55 sm:text-[11px]">
              确认密码
              <input
                v-model="regPassword2"
                type="password"
                autocomplete="new-password"
                required
                class="mt-1 w-full rounded border border-white/15 bg-black/25 px-2 py-1.5 text-[11px] text-white outline-none ring-[var(--compass-ring-focus)] focus:border-white/25 focus:ring-2"
              />
            </label>
            <button
              type="submit"
              class="w-full rounded-md border border-[rgba(146,212,184,0.45)] bg-[rgba(146,212,184,0.18)] py-2 text-[11px] font-medium text-[#e8faf1] transition-colors hover:bg-[rgba(146,212,184,0.28)]"
              :disabled="busy"
            >
              {{ busy ? '处理中…' : '注册并登录' }}
            </button>
            <p class="text-[9px] leading-snug text-white/40 sm:text-[10px]">
              账号与知识记录均保存在本机浏览器；不同用户名对应不同本地存档。
            </p>
          </form>

          <!-- 找回密码 1 -->
          <form
            v-else-if="mode === 'forgot'"
            class="space-y-3"
            @submit.prevent="onForgotStep1"
          >
            <p class="text-[10px] leading-relaxed text-white/60 sm:text-[11px]">
              输入注册时的用户名。若存在该账号，可在此直接设置新密码（无邮件，仅本机演示）。
            </p>
            <label class="block text-[10px] text-white/55 sm:text-[11px]">
              用户名
              <input
                v-model.trim="forgotUsername"
                type="text"
                autocomplete="username"
                required
                class="mt-1 w-full rounded border border-white/15 bg-black/25 px-2 py-1.5 text-[11px] text-white outline-none ring-[var(--compass-ring-focus)] focus:border-white/25 focus:ring-2"
              />
            </label>
            <button
              type="submit"
              class="w-full rounded-md border border-white/20 bg-white/10 py-2 text-[11px] font-medium text-white/90 transition-colors hover:bg-white/15"
              :disabled="busy"
            >
              {{ busy ? '处理中…' : '验证用户名' }}
            </button>
          </form>

          <!-- 找回密码 2 -->
          <form
            v-else-if="mode === 'forgot2'"
            class="space-y-3"
            @submit.prevent="onForgotStep2"
          >
            <p class="text-[10px] text-white/60 sm:text-[11px]">
              为用户名
              <span class="text-white/85">{{ forgotUsername }}</span>
              设置新密码
            </p>
            <label class="block text-[10px] text-white/55 sm:text-[11px]">
              新密码
              <input
                v-model="forgotNewPw"
                type="password"
                autocomplete="new-password"
                required
                minlength="6"
                class="mt-1 w-full rounded border border-white/15 bg-black/25 px-2 py-1.5 text-[11px] text-white outline-none ring-[var(--compass-ring-focus)] focus:border-white/25 focus:ring-2"
              />
            </label>
            <label class="block text-[10px] text-white/55 sm:text-[11px]">
              确认新密码
              <input
                v-model="forgotNewPw2"
                type="password"
                autocomplete="new-password"
                required
                class="mt-1 w-full rounded border border-white/15 bg-black/25 px-2 py-1.5 text-[11px] text-white outline-none ring-[var(--compass-ring-focus)] focus:border-white/25 focus:ring-2"
              />
            </label>
            <div class="flex gap-2">
              <button
                type="button"
                class="flex-1 rounded-md border border-white/15 bg-black/30 py-2 text-[11px] text-white/80 hover:bg-black/45"
                @click="mode = 'forgot'"
              >
                上一步
              </button>
              <button
                type="submit"
                class="flex-1 rounded-md border border-[rgba(146,212,184,0.45)] bg-[rgba(146,212,184,0.18)] py-2 text-[11px] font-medium text-[#e8faf1] hover:bg-[rgba(146,212,184,0.28)]"
                :disabled="busy"
              >
                {{ busy ? '处理中…' : '保存新密码' }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted, onUnmounted } from 'vue'
import { useCompassAuth } from '@/composables/useCompassAuth.js'

const titleId = 'compass-auth-title'

const {
  currentUser,
  isLoggedIn,
  register,
  login,
  logout,
  accountExists,
  resetPassword,
} = useCompassAuth()

const modalOpen = ref(false)
/** @type {import('vue').Ref<'login'|'register'|'forgot'|'forgot2'>} */
const mode = ref('login')
const busy = ref(false)
const feedback = ref('')
const feedbackOk = ref(false)

const loginUsername = ref('')
const loginPassword = ref('')
const regUsername = ref('')
const regPassword = ref('')
const regPassword2 = ref('')
const forgotUsername = ref('')
const forgotNewPw = ref('')
const forgotNewPw2 = ref('')

const tabs = [
  { id: 'login', label: '登录' },
  { id: 'register', label: '注册' },
  { id: 'forgot', label: '找回密码' },
]

const panelTitle = computed(() => {
  if (mode.value === 'register') return '注册账号'
  if (mode.value === 'forgot' || mode.value === 'forgot2') return '找回密码'
  return '登录'
})

function clearFeedback() {
  feedback.value = ''
}

function openModal(initial) {
  mode.value = initial || 'login'
  modalOpen.value = true
  clearFeedback()
}

function closeModal() {
  modalOpen.value = false
  clearFeedback()
  busy.value = false
}

function switchMode(m) {
  if (m === 'forgot2') return
  mode.value = m
  clearFeedback()
}

watch(mode, () => {
  clearFeedback()
})

async function onLogin() {
  clearFeedback()
  busy.value = true
  try {
    const r = await login(loginUsername.value, loginPassword.value)
    feedback.value = r.message
    feedbackOk.value = r.ok
    if (r.ok) {
      loginPassword.value = ''
      closeModal()
    }
  } finally {
    busy.value = false
  }
}

async function onRegister() {
  clearFeedback()
  if (regPassword.value !== regPassword2.value) {
    feedback.value = '两次输入的密码不一致'
    feedbackOk.value = false
    return
  }
  busy.value = true
  try {
    const r = await register(regUsername.value, regPassword.value)
    feedback.value = r.message
    feedbackOk.value = r.ok
    if (r.ok) {
      regPassword.value = ''
      regPassword2.value = ''
      closeModal()
    }
  } finally {
    busy.value = false
  }
}

async function onForgotStep1() {
  clearFeedback()
  busy.value = true
  try {
    await new Promise((r) => setTimeout(r, 120))
    const name = forgotUsername.value.trim()
    if (!name) {
      feedback.value = '请填写用户名'
      feedbackOk.value = false
      return
    }
    if (!accountExists(name)) {
      feedback.value = '未找到该用户名'
      feedbackOk.value = false
      return
    }
    feedback.value = '用户名已验证，请设置新密码'
    feedbackOk.value = true
    forgotNewPw.value = ''
    forgotNewPw2.value = ''
    mode.value = 'forgot2'
  } finally {
    busy.value = false
  }
}

async function onForgotStep2() {
  clearFeedback()
  if (forgotNewPw.value !== forgotNewPw2.value) {
    feedback.value = '两次输入的新密码不一致'
    feedbackOk.value = false
    return
  }
  busy.value = true
  try {
    const r = await resetPassword(forgotUsername.value, forgotNewPw.value)
    feedback.value = r.message
    feedbackOk.value = r.ok
    if (r.ok) {
      forgotNewPw.value = ''
      forgotNewPw2.value = ''
      mode.value = 'login'
      loginUsername.value = forgotUsername.value.trim()
    }
  } finally {
    busy.value = false
  }
}

function onKeydown(e) {
  if (e.key === 'Escape' && modalOpen.value) {
    e.preventDefault()
    closeModal()
  }
}

onMounted(() => {
  window.addEventListener('keydown', onKeydown)
})
onUnmounted(() => {
  window.removeEventListener('keydown', onKeydown)
})
</script>
