/** 登录态本地缓存（与 docs §8 一致，不落敏感临时字段） */
export const AUTH_STORAGE_KEY = 'yoke_auth_v1'

export function readPersistedAuth() {
  try {
    const raw = uni.getStorageSync(AUTH_STORAGE_KEY)
    if (!raw) return null
    const data = typeof raw === 'string' ? JSON.parse(raw) : raw
    if (!data || typeof data !== 'object') return null
    return data
  } catch (_) {
    return null
  }
}

export function writePersistedAuth(payload) {
  try {
    uni.setStorageSync(AUTH_STORAGE_KEY, JSON.stringify(payload))
  } catch (_) {
    /* ignore */
  }
}

export function clearPersistedAuth() {
  try {
    uni.removeStorageSync(AUTH_STORAGE_KEY)
  } catch (_) {
    /* ignore */
  }
}
