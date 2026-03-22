import { ref, computed } from 'vue'

const USERS_KEY = 'compass_auth_users_v2'
const SESSION_KEY = 'compass_auth_session_v2'

/** @type {import('vue').Ref<{ username: string, displayName: string } | null>} */
const currentUser = ref(null)

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

/** 登录名：去首尾空白，统一小写作为账号主键 */
export function normalizeUsername(name) {
  return String(name || '')
    .trim()
    .toLowerCase()
}

const USERNAME_RE = /^[a-zA-Z0-9_\u4e00-\u9fff]{2,24}$/

export function isValidUsername(name) {
  const s = String(name || '').trim()
  return USERNAME_RE.test(s)
}

async function hashPassword(password) {
  const raw = String(password || '')
  if (typeof crypto !== 'undefined' && crypto.subtle) {
    const buf = await crypto.subtle.digest(
      'SHA-256',
      new TextEncoder().encode(raw),
    )
    return Array.from(new Uint8Array(buf))
      .map((b) => b.toString(16).padStart(2, '0'))
      .join('')
  }
  return `fallback:${btoa(unescape(encodeURIComponent(raw)))}`
}

function loadUsers() {
  const list = readJson(USERS_KEY, [])
  return Array.isArray(list) ? list : []
}

function saveUsers(users) {
  writeJson(USERS_KEY, users)
}

function persistSession(user) {
  if (user == null) {
    localStorage.removeItem(SESSION_KEY)
    return
  }
  writeJson(SESSION_KEY, {
    username: user.username,
    displayName: user.displayName || user.username,
  })
}

function hydrateSession() {
  const s = readJson(SESSION_KEY, null)
  const u = s?.username ?? s?.email
  if (s && typeof u === 'string' && u.trim()) {
    const username = String(u).trim()
    currentUser.value = {
      username,
      displayName: s.displayName || username,
    }
  } else {
    currentUser.value = null
  }
}

hydrateSession()

export async function register(username, password) {
  const raw = String(username || '').trim()
  if (!raw || !password) {
    return { ok: false, message: '请填写用户名与密码' }
  }
  if (!isValidUsername(raw)) {
    return {
      ok: false,
      message: '用户名为 2～24 位，仅字母、数字、下划线或中文',
    }
  }
  if (password.length < 6) {
    return { ok: false, message: '密码至少 6 位' }
  }
  const key = normalizeUsername(raw)
  const users = loadUsers()
  if (users.some((x) => normalizeUsername(x.username) === key)) {
    return { ok: false, message: '该用户名已被占用' }
  }
  const passwordHash = await hashPassword(password)
  users.push({ username: raw, passwordHash })
  saveUsers(users)
  const session = { username: raw, displayName: raw }
  currentUser.value = session
  persistSession(session)
  return { ok: true, message: '注册成功' }
}

export async function login(username, password) {
  const raw = String(username || '').trim()
  if (!raw || !password) {
    return { ok: false, message: '请填写用户名与密码' }
  }
  const key = normalizeUsername(raw)
  const users = loadUsers()
  const u = users.find((x) => normalizeUsername(x.username) === key)
  if (!u) {
    return { ok: false, message: '用户名或密码错误' }
  }
  const h = await hashPassword(password)
  if (h !== u.passwordHash) {
    return { ok: false, message: '用户名或密码错误' }
  }
  const display = u.username || raw
  const session = { username: display, displayName: display }
  currentUser.value = session
  persistSession(session)
  return { ok: true, message: '登录成功' }
}

export function logout() {
  currentUser.value = null
  persistSession(null)
}

export function accountExists(username) {
  const key = normalizeUsername(username)
  if (!key) return false
  return loadUsers().some((u) => normalizeUsername(u.username) === key)
}

export async function resetPassword(username, newPassword) {
  const raw = String(username || '').trim()
  if (!raw) {
    return { ok: false, message: '请填写用户名' }
  }
  if (!newPassword || newPassword.length < 6) {
    return { ok: false, message: '新密码至少 6 位' }
  }
  const key = normalizeUsername(raw)
  const users = loadUsers()
  const i = users.findIndex((u) => normalizeUsername(u.username) === key)
  if (i < 0) {
    return { ok: false, message: '未找到该用户名' }
  }
  users[i] = {
    ...users[i],
    passwordHash: await hashPassword(newPassword),
  }
  saveUsers(users)
  return { ok: true, message: '密码已更新，请使用新密码登录' }
}

export function useCompassAuth() {
  const isLoggedIn = computed(() => currentUser.value != null)

  return {
    currentUser,
    isLoggedIn,
    register,
    login,
    logout,
    accountExists,
    resetPassword,
  }
}

export { currentUser }
