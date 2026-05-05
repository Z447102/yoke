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
   * @param {{ statusCode?: number, data?: unknown, code?: string | number }} [extra] 附加诊断信息
   */
  constructor(message, extra = {}) {
    super(message)
    this.name = 'HttpError'
    this.statusCode = extra.statusCode
    this.data = extra.data
    this.code = extra.code
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
 * @param {object} options
 * @param {string} options.url 相对路径或绝对 URL
 * @param {string} [options.method='GET']
 * @param {Record<string, unknown>} [options.data]
 * @param {Record<string, string>} [options.header]
 * @param {number} [options.timeout]
 * @param {boolean} [options.auth=true] 是否附带 Authorization: Bearer
 * @param {boolean} [options.rawResponse=false] 不解析 { code, data } 外壳
 * @param {string} [options.bizCodeKey='code'] 业务码字段名
 * @param {string} [options.bizDataKey='data'] 业务数据字段名
 * @param {string} [options.bizMsgKey='message'] 错误文案首选字段名
 * @returns {Promise<unknown>}
 */
export function request(options) {
  if (!isApiEnabled()) {
    return Promise.reject(
      new HttpError('未配置 VITE_API_BASE_URL', { code: 'NO_BASE_URL' })
    )
  }

  const {
    url,
    method = 'GET',
    data,
    header = {},
    timeout = getApiTimeout(),
    auth = true,
    rawResponse = false,
    bizCodeKey = 'code',
    bizDataKey = 'data',
    bizMsgKey = 'message'
  } = options

  const headers = mergeHeaders(
    {
      'Content-Type': 'application/json'
    },
    header
  )

  if (auth) {
    const persisted = readPersistedAuth()
    const token = persisted && persisted.token
    if (token) {
      headers.Authorization = `Bearer ${token}`
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
        const statusCode = res.statusCode || 0
        const body = tryParseJson(res.data)

        if (statusCode === 401) {
          try {
            useUserStore().clearLoginState()
          } catch (_) {
            /* Pinia 未就绪时忽略 */
          }
          reject(
            new HttpError(
              pickBizMessage(body, bizMsgKey) || '登录已失效，请重新登录',
              { statusCode, data: body, code: 'HTTP_401' }
            )
          )
          return
        }

        if (statusCode < 200 || statusCode >= 300) {
          reject(
            new HttpError(`请求失败 (${statusCode})`, {
              statusCode,
              data: body,
              code: statusCode
            })
          )
          return
        }

        if (rawResponse || body == null || typeof body !== 'object') {
          resolve(body)
          return
        }

        if (!(bizCodeKey in body)) {
          resolve(body)
          return
        }

        const bizCode = body[bizCodeKey]
        /* == 兼容 number / string，且 success 码可由 VITE_API_BIZ_CODE_SUCCESS 配置 */
        if (bizCode == getApiBizSuccessCode()) {
          resolve(
            Object.prototype.hasOwnProperty.call(body, bizDataKey)
              ? body[bizDataKey]
              : body
          )
          return
        }

        if (FORCE_LOGOUT_BIZ_CODES.has(bizCode)) {
          try {
            useUserStore().clearLoginState()
          } catch (_) {
            /* Pinia 未就绪时忽略 */
          }
        }

        reject(
          new HttpError(
            String(pickBizMessage(body, bizMsgKey) || '业务异常'),
            {
              statusCode,
              data: body,
              code: bizCode
            }
          )
        )
      },
      fail: (err) => {
        const msg =
          (err && (err.errMsg || err.message)) || '网络异常，请稍后重试'
        reject(new HttpError(String(msg), { code: 'NETWORK_ERROR', data: err }))
      }
    })
  })
}

/** GET 请求封装。 */
export function get(url, data, opts = {}) {
  return request({ ...opts, url, method: 'GET', data })
}

/** POST 请求封装。 */
export function post(url, data, opts = {}) {
  return request({ ...opts, url, method: 'POST', data })
}

/** PUT 请求封装。 */
export function put(url, data, opts = {}) {
  return request({ ...opts, url, method: 'PUT', data })
}

/** DELETE 请求封装。 */
export function del(url, data, opts = {}) {
  return request({ ...opts, url, method: 'DELETE', data })
}
