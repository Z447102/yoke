/**
 * 运行环境（Vite：根目录 .env / .env.development / .env.production 中 VITE_* 变量）
 */

/**
 * 读取接口基址，自动去掉末尾 `/`。
 * @returns {string} 空字符串表示未配置
 */
export function getApiBaseUrl() {
  const raw = import.meta.env.VITE_API_BASE_URL
  if (raw == null || typeof raw !== 'string') return ''
  return raw.trim().replace(/\/+$/, '')
}

/**
 * 是否已配置基址；未配置时业务接口可走 Mock、不发起 uni.request。
 * @returns {boolean}
 */
export function isApiEnabled() {
  return Boolean(getApiBaseUrl())
}

/**
 * 请求超时时间（毫秒），未配置或非法时使用 15000。
 * @returns {number}
 */
export function getApiTimeout() {
  const n = Number(import.meta.env.VITE_API_TIMEOUT)
  return Number.isFinite(n) && n > 0 ? n : 15000
}

/**
 * 规范化 API 路径：非空则 trim，无前导 `/` 时补上。
 * @param {string | undefined} raw 环境变量中的路径片段
 * @param {string} fallback 默认值
 * @returns {string}
 */
function normalizeApiPath(raw, fallback) {
  const s = typeof raw === 'string' ? raw.trim() : ''
  if (!s) return fallback
  return s.startsWith('/') ? s : `/${s}`
}

/**
 * 微信 code 换会话接口路径（相对 `VITE_API_BASE_URL`）。
 * @returns {string}
 */
export function getAuthWechatSilentPath() {
  return normalizeApiPath(
    import.meta.env.VITE_AUTH_WECHAT_SILENT_PATH,
    '/api/auth/wechat/session'
  )
}

/**
 * 微信手机号授权登录接口路径（相对基址）。
 * @returns {string}
 */
export function getAuthWechatMobileLoginPath() {
  return normalizeApiPath(
    import.meta.env.VITE_AUTH_WECHAT_MOBILE_LOGIN_PATH,
    '/api/auth/wechat/mobile-login'
  )
}

/**
 * @deprecated 请优先使用 getAuthWechatMobileLoginPath；保留以兼容旧环境变量名。
 * @returns {string}
 */
export function getAuthWechatBindPhonePath() {
  return normalizeApiPath(
    import.meta.env.VITE_AUTH_WECHAT_BIND_PHONE_PATH,
    '/api/auth/wechat/mobile-login'
  )
}

/**
 * 业务成功码：与后端 `{ code, data, msg }` 中 `code` 一致。
 * 未配置时默认 200；其它环境可设 `VITE_API_BIZ_CODE_SUCCESS=0`。
 * @returns {number}
 */
export function getApiBizSuccessCode() {
  const raw = import.meta.env.VITE_API_BIZ_CODE_SUCCESS
  if (raw === undefined || raw === null || String(raw).trim() === '') return 200
  const n = Number(raw)
  return Number.isFinite(n) ? n : 200
}
