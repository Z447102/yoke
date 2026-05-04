/**
 * 运行环境（Vite：根目录 .env / .env.development 中 VITE_* 变量）
 */

export function getApiBaseUrl() {
  const raw = import.meta.env.VITE_API_BASE_URL
  if (raw == null || typeof raw !== 'string') return ''
  return raw.trim().replace(/\/+$/, '')
}

/** 未配置基址时不走网络，业务接口可继续走本地 Mock */
export function isApiEnabled() {
  return Boolean(getApiBaseUrl())
}

export function getApiTimeout() {
  const n = Number(import.meta.env.VITE_API_TIMEOUT)
  return Number.isFinite(n) && n > 0 ? n : 15000
}
