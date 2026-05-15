/**
 * HTTP 封装：uni.request + 基址、超时、Token、统一错误与业务码（与 docs 请求章节对齐）
 */
import {
  getApiBaseUrl,
  getApiTimeout,
  isApiEnabled,
  getApiBizSuccessCode
} from '@/config/env'
import { readPersistedAuth } from '@/utils/auth'
import { useUserStore } from '@/stores/user'

export { isApiEnabled }

/** 统一请求错误类型，携带 HTTP 状态、原始 body、业务 code。 */
export class HttpError extends Error {
  /**
   * @param {string} message 展示给用户的文案
   * @param {{ statusCode?: number, data?: unknown, code?: string | number, refreshAuth?: boolean }} [extra] 附加诊断信息
   */
  constructor(message, extra = {}) {
    super(message)
    this.name = 'HttpError'
    this.statusCode = extra.statusCode
    this.data = extra.data
    this.code = extra.code
    /** 是否为「可尝试静默刷新 token」的登录失效（HTTP 401 或业务 401 且本次请求带了 Bearer） */
    this.refreshAuth = Boolean(extra.refreshAuth)
  }
}

/** HTTP 200 但业务码表示登录态失效时清理本地（docs §8 错误码 TOKEN_EXPIRED 等） */
const FORCE_LOGOUT_BIZ_CODES = new Set([
  'TOKEN_EXPIRED',
  'UNAUTHORIZED',
  'WECHAT_SESSION_INVALID',
  40101,
  40102
])

/** 内部标记：不进行静默刷新重试 */
const SKIP_SILENT_REFRESH_RETRY = Symbol('SKIP_SILENT_REFRESH_RETRY')

/**
 * 解析 uni.request success：返回业务数据或抛出 HttpError。
 * @param {UniApp.RequestSuccessCallbackResult} res
 * @param {Parameters<typeof request>[0]} options
 * @param {boolean} sentAuthorizationBearer
 */
function interpretSuccess(res, options, sentAuthorizationBearer) {
  const statusCode = res.statusCode || 0
  const body = tryParseJson(res.data)
  const {
    rawResponse,
    bizCodeKey = 'code',
    bizDataKey = 'data',
    bizMsgKey = 'message'
  } = options

  if (statusCode === 401) {
    const serverMsg = pickBizMessage(body, bizMsgKey)
    throw new HttpError(
      serverMsg ||
        (sentAuthorizationBearer
          ? '登录已失效，请重新登录'
          : '请先登录后再使用该功能'),
      {
        statusCode,
        data: body,
        code: 'HTTP_401',
        refreshAuth: sentAuthorizationBearer
      }
    )
  }

  if (statusCode < 200 || statusCode >= 300) {
    throw new HttpError(`请求失败 (${statusCode})`, {
      statusCode,
      data: body,
      code: statusCode
    })
  }

  if (rawResponse || body == null || typeof body !== 'object') {
    return body
  }

  if (!(bizCodeKey in body)) {
    return body
  }

  const bizCode = body[bizCodeKey]
  if (bizCode == getApiBizSuccessCode()) {
    return Object.prototype.hasOwnProperty.call(body, bizDataKey)
      ? body[bizDataKey]
      : body
  }

  if (FORCE_LOGOUT_BIZ_CODES.has(bizCode)) {
    try {
      useUserStore().clearLoginState()
    } catch (_) {
      /* Pinia 未就绪 */
    }
  }

  const isBiz401 = bizCode == 401 || bizCode === '401'
  throw new HttpError(String(pickBizMessage(body, bizMsgKey) || '业务异常'), {
    statusCode,
    data: body,
    code: bizCode,
    refreshAuth: Boolean(sentAuthorizationBearer && isBiz401)
  })
}

function shouldAttemptSilentRefresh(err, options) {
  if (options.auth === false) return false
  if (!(err instanceof HttpError)) return false
  return Boolean(err.refreshAuth)
}

/**
 * Token 失效时静默登录一次并重试原请求；失败则清空登录态并跳转手机号登录。
 */
async function trySilentRefreshAndRetry(err, options, authAttempt) {
  if (authAttempt > 0) return SKIP_SILENT_REFRESH_RETRY
  if (!shouldAttemptSilentRefresh(err, options)) return SKIP_SILENT_REFRESH_RETRY

  const mod = await import('@/hooks/use-login.js')
  const refresh = await mod.silentLoginForceRefresh()
  const store = useUserStore()

  if (!refresh.ok) {
    try {
      store.clearLoginState()
    } catch (_) {}
    mod.navigateToReauthAfterSessionLost()
    throw err
  }

  if (!String(store.token || '').trim()) {
    try {
      store.clearLoginState()
    } catch (_) {}
    mod.navigateToReauthAfterSessionLost()
    throw err
  }

  return executeRequest(options, authAttempt + 1)
}

function executeRequest(options, authAttempt) {
  const {
    url,
    method: methodRaw,
    data,
    header = {},
    timeout = getApiTimeout(),
    auth = true,
    bizCodeKey = 'code',
    bizDataKey = 'data',
    bizMsgKey = 'message'
  } = options

  const method = String(methodRaw || 'GET').toUpperCase()

  const headers = mergeHeaders(
    {
      'Content-Type': 'application/json'
    },
    header
  )

  let sentAuthorizationBearer = false
  if (auth) {
    const token = readBearerTokenForRequest()
    if (token) {
      headers.Authorization = `Bearer ${token}`
      sentAuthorizationBearer = true
    }
  }

  const fullUrl = buildUrl(url)

  return new Promise((resolve, reject) => {
    uni.request({
      url: fullUrl,
      method,
      data: data ?? {},
      header: headers,
      timeout,
      success: (res) => {
        void (async () => {
          try {
            resolve(interpretSuccess(res, options, sentAuthorizationBearer))
          } catch (err) {
            try {
              const ret = await trySilentRefreshAndRetry(
                err,
                options,
                authAttempt
              )
              if (ret !== SKIP_SILENT_REFRESH_RETRY) {
                resolve(await ret)
                return
              }
            } catch (inner) {
              reject(inner)
              return
            }
            reject(err)
          }
        })()
      },
      fail: (err) => {
        const raw =
          (err && (err.errMsg != null ? err.errMsg : err.message)) || ''
        const s = String(raw)
        let msg = s.trim() !== '' ? s : '网络异常，请稍后重试'
        if (
          /timeout/i.test(s) ||
          /^timeout$/i.test(String(err && err.message))
        ) {
          msg = `请求超时（已等待 ${timeout}ms）。可检查网络、接口域名校验或调大环境变量 VITE_API_TIMEOUT`
        }
        reject(new HttpError(msg, { code: 'NETWORK_ERROR', data: err }))
      }
    })
  })
}

/**
 * 拼接完整请求 URL：支持绝对 http(s) 或相对 path（拼在基址后）。
 * @param {string} path 相对路径或完整 URL
 * @returns {string}
 */
function buildUrl(path) {
  const base = getApiBaseUrl()
  if (!path) return base
  if (/^https?:\/\//i.test(path)) return path
  const p = path.startsWith('/') ? path : `/${path}`
  return `${base}${p}`
}

/**
 * 浅合并请求头对象。
 * @param {Record<string, string>} base 默认头
 * @param {Record<string, string>} extra 调用方覆盖
 * @returns {Record<string, string>}
 */
function mergeHeaders(base, extra) {
  return { ...base, ...extra }
}

/**
 * 读取本次请求可用的 Bearer token：优先本地持久化，其次 Pinia（避免刚登录尚未落盘时漏带头）。
 * @returns {string}
 */
function readBearerTokenForRequest() {
  try {
    const persisted = readPersistedAuth()
    const t = persisted?.token != null ? String(persisted.token).trim() : ''
    if (t) return t
  } catch (_) {
    /* ignore */
  }
  try {
    const store = useUserStore()
    const t = store.token != null ? String(store.token).trim() : ''
    if (t) return t
  } catch (_) {
    /* Pinia 未就绪 */
  }
  return ''
}

/**
 * 将 uni.request 返回的 data 尽量解析为对象；已是对象则原样返回。
 * @param {unknown} raw
 * @returns {unknown}
 */
function tryParseJson(raw) {
  if (raw == null || raw === '') return raw
  if (typeof raw === 'object') return raw
  if (typeof raw === 'string') {
    try {
      return JSON.parse(raw)
    } catch (_) {
      return raw
    }
  }
  return raw
}

/**
 * 从响应体中取出业务错误文案，兼容 `message` / `msg` 等字段。
 * @param {Record<string, unknown>} body 响应 JSON
 * @param {string} bizMsgKey 首选字段名（默认 message）
 * @returns {string}
 */
function pickBizMessage(body, bizMsgKey) {
  if (!body || typeof body !== 'object') return ''
  const p = body[bizMsgKey]
  if (p != null && String(p).trim() !== '') return String(p)
  if (body.msg != null && String(body.msg).trim() !== '') return String(body.msg)
  if (body.message != null && String(body.message).trim() !== '')
    return String(body.message)
  return ''
}

/**
 * 发起 HTTP 请求；成功且业务码匹配时 resolve `data` 或整包。
 * Token 失效（HTTP 401 或业务 code 401，且请求携带 Bearer）时会先静默登录一次并重试该请求。
 */
export function request(options) {
  if (!isApiEnabled()) {
    return Promise.reject(
      new HttpError('未配置 VITE_API_BASE_URL', { code: 'NO_BASE_URL' })
    )
  }
  return executeRequest(options, 0)
}

/** GET 请求封装。 */
export function get(url, data, opts = {}) {
  const o = opts && typeof opts === 'object' ? { ...opts } : {}
  delete o.method
  return request({ ...o, url, method: 'GET', data })
}

/** POST 请求封装。 */
export function post(url, data, opts = {}) {
  const o = opts && typeof opts === 'object' ? { ...opts } : {}
  delete o.method
  return request({ ...o, url, method: 'POST', data: data ?? {} })
}

/** PUT 请求封装。 */
export function put(url, data, opts = {}) {
  const o = opts && typeof opts === 'object' ? { ...opts } : {}
  delete o.method
  return request({ ...o, url, method: 'PUT', data: data ?? {} })
}

/** DELETE 请求封装。 */
export function del(url, data, opts = {}) {
  const o = opts && typeof opts === 'object' ? { ...opts } : {}
  delete o.method
  return request({ ...o, url, method: 'DELETE', data: data ?? {} })
}
