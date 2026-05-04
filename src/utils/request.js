/**
 * HTTP 封装：uni.request + 基址、超时、Token、统一错误与业务码（与 docs 请求章节对齐）
 */
import { getApiBaseUrl, getApiTimeout, isApiEnabled } from '@/config/env'
import { readPersistedAuth } from '@/utils/auth'
import { useUserStore } from '@/stores/user'

export { isApiEnabled }

export class HttpError extends Error {
  /**
   * @param {string} message
   * @param {{ statusCode?: number, data?: unknown, code?: string | number }} [extra]
   */
  constructor(message, extra = {}) {
    super(message)
    this.name = 'HttpError'
    this.statusCode = extra.statusCode
    this.data = extra.data
    this.code = extra.code
  }
}

/** 业务成功码（与后端约定一致后可改为读取配置） */
const BIZ_SUCCESS_CODE = 0

/** HTTP 200 但业务码表示登录态失效时清理本地（docs §8 错误码 TOKEN_EXPIRED 等） */
const FORCE_LOGOUT_BIZ_CODES = new Set([
  'TOKEN_EXPIRED',
  'UNAUTHORIZED',
  'WECHAT_SESSION_INVALID',
  40101,
  40102
])

function buildUrl(path) {
  const base = getApiBaseUrl()
  if (!path) return base
  if (/^https?:\/\//i.test(path)) return path
  const p = path.startsWith('/') ? path : `/${path}`
  return `${base}${p}`
}

function mergeHeaders(base, extra) {
  return { ...base, ...extra }
}

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
 * @param {object} options
 * @param {string} options.url 相对路径或绝对 URL
 * @param {string} [options.method='GET']
 * @param {Record<string, unknown>} [options.data]
 * @param {Record<string, string>} [options.header]
 * @param {number} [options.timeout]
 * @param {boolean} [options.auth=true] 是否附带 Authorization
 * @param {boolean} [options.rawResponse=false] 不解析 { code, data } 外壳
 * @param {string} [options.bizCodeKey='code'] 业务码字段名
 * @param {string} [options.bizDataKey='data'] 业务数据字段名
 * @param {string} [options.bizMsgKey='message'] 错误文案字段名
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
              (body && body[bizMsgKey]) || '登录已失效，请重新登录',
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
        if (bizCode === BIZ_SUCCESS_CODE) {
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
          new HttpError(String(body[bizMsgKey] || '业务异常'), {
            statusCode,
            data: body,
            code: bizCode
          })
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

export function get(url, data, opts = {}) {
  return request({ ...opts, url, method: 'GET', data })
}

export function post(url, data, opts = {}) {
  return request({ ...opts, url, method: 'POST', data })
}

export function put(url, data, opts = {}) {
  return request({ ...opts, url, method: 'PUT', data })
}

export function del(url, data, opts = {}) {
  return request({ ...opts, url, method: 'DELETE', data })
}
