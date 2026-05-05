/** 登录态本地缓存（与 docs §8 一致，不落敏感临时字段） */
export const AUTH_STORAGE_KEY = 'yoke_auth_v1'

/**
 * 从本地 Storage 读取已持久化的登录切片（token、profile 等）。
 * @returns {Record<string, unknown> | null} 解析后的对象；无数据或异常时返回 null
 */
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

/**
 * 将登录相关字段写入本地 Storage（JSON 序列化）。
 * @param {Record<string, unknown>} payload 待写入的键值（如 token、profile、wxSessionUuid）
 */
export function writePersistedAuth(payload) {
  try {
    uni.setStorageSync(AUTH_STORAGE_KEY, JSON.stringify(payload))
  } catch (_) {
    /* ignore */
  }
}

/** 移除本地登录态缓存键。 */
export function clearPersistedAuth() {
  try {
    uni.removeStorageSync(AUTH_STORAGE_KEY)
  } catch (_) {
    /* ignore */
  }
}
