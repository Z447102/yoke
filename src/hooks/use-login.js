/**
 * 登录流程编排：uni.login + 静默接口 + Pinia（docs §8）
 * 产品约定（uuid / 微信 mobile-login / 短信登录 / 登录后跳转）见 `api/auth.js` 文件头注释。
 */
import {
  silentLogin,
  bindPhoneByCode,
  logout as logoutApi,
  loginWithSms
} from '@/api/auth'
import { isApiEnabled } from '@/utils/request'
import { useUserStore } from '@/stores/user'

/** 进行中的静默登录 Promise，用于去重并发 `uni.login` */
let silentLoginTask = null

/**
 * 将 session 接口归一化结果写入 user store（微信静默类型）。
 * @param {{ token: string, profile: object, needBindPhone: boolean, points?: number, wxSessionUuid?: string }} data
 */
function applyWechatSilentPayload(data) {
  const store = useUserStore()
  const pn = Number(data.points)
  store.setLoginState({
    token: data.token,
    profile: data.profile,
    needBindPhone: Boolean(data.needBindPhone),
    loginType: 'wechat_silent',
    points: Number.isFinite(pn) ? pn : 0,
    wxSessionUuid: data.wxSessionUuid != null ? String(data.wxSessionUuid) : ''
  })
}

/**
 * 调用微信侧 `uni.login` 获取临时 `code`（小程序等价 `wx.login`）。
 * @returns {Promise<{ code?: string, [key: string]: unknown }>}
 */
function uniLoginWeixin() {
  return new Promise((resolve, reject) => {
    uni.login({
      provider: 'weixin',
      success: (res) => resolve(res),
      fail: (err) => reject(err || new Error('uni.login 失败'))
    })
  })
}

/**
 * 先 `uni.login` 取 code，再请求 session；若业务码为 `WECHAT_CODE_INVALID` 则重新 login 重试一次。
 * H5 / 非微信环境常拿不到 code：在 **未接真实后端（Mock）** 时用合成 code 走本地静默，避免一直游客态。
 * @returns {Promise<object>} 与 `silentLogin` 相同结构的归一化数据
 */
async function exchangeWechatCodeForSession() {
  let code = ''
  try {
    const res = await uniLoginWeixin()
    code = (res && res.code) || ''
  } catch (err) {
    console.warn('[Yoke] uni.login 失败（H5 或非微信端常见）', err)
  }

  if (!code) {
    if (!isApiEnabled()) {
      code = `mock_silent_${Date.now()}`
      console.info('[Yoke] 本地 Mock：无微信 code，使用合成 code 完成静默登录')
    } else {
      throw new Error('微信登录 code 为空')
    }
  } else {
    console.info('[Yoke] uni.login code:', code)
  }

  try {
    return await silentLogin({ code })
  } catch (e) {
    if (e && e.code === 'WECHAT_CODE_INVALID') {
      let code2 = ''
      try {
        const res2 = await uniLoginWeixin()
        code2 = (res2 && res2.code) || ''
      } catch (err2) {
        console.warn('[Yoke] uni.login 重试失败', err2)
      }
      if (!code2) {
        if (!isApiEnabled()) {
          return await silentLogin({ code: `mock_retry_${Date.now()}` })
        }
        throw new Error('微信登录 code 为空')
      }
      console.info('[Yoke] uni.login code (retry):', code2)
      return await silentLogin({ code: code2 })
    }
    throw e
  }
}

/** 进行中的一次静默刷新（token 失效后 uni.login → session），并发合并 */
let silentRefreshTask = null

/**
 * 强制静默登录（无视本地是否已有 token），用于 Access Token 失效后换新会话。
 * @returns {Promise<{ ok: true, data: object } | { ok: false, error?: unknown }>}
 */
export function silentLoginForceRefresh() {
  if (silentRefreshTask) return silentRefreshTask
  silentRefreshTask = Promise.resolve(exchangeWechatCodeForSession())
    .then((data) => {
      applyWechatSilentPayload(data)
      return { ok: true, data }
    })
    .catch((error) => ({ ok: false, error }))
    .finally(() => {
      silentRefreshTask = null
    })
  return silentRefreshTask
}

/**
 * 静默刷新失败或未拿到可用 token：跳转登录页，引导手机号验证码登录。
 */
export function navigateToReauthAfterSessionLost() {
  try {
    const pages = getCurrentPages()
    const cur = pages[pages.length - 1]
    const route = cur?.route ? String(cur.route) : ''
    if (route.includes('pages/login/index')) {
      uni.showToast({
        title: '登录已失效，请使用手机号登录',
        icon: 'none',
        duration: 2500
      })
      return
    }
    const url =
      '/pages/login/index?needReauth=1&redirect=' +
      encodeURIComponent('/pages/home/index')
    uni.navigateTo({
      url,
      fail: () => {
        uni.reLaunch({ url: '/pages/login/index?needReauth=1' })
      }
    })
  } catch (_) {
    uni.reLaunch({ url: '/pages/login/index?needReauth=1' })
  }
}

/**
 * 静默登录：无 token 时 `uni.login` + session；有 token 时跳过；并发复用同一 Promise。
 * 注意：**不会**在此函数内请求 `mobile-login`；该接口仅在用户授权手机号后由 `loginWithPhoneCode` 触发。
 * @returns {Promise<object|{ skipped: boolean }>}
 */
export function silentLoginOnce() {
  const store = useUserStore()
  if (store.token) {
    return Promise.resolve({ skipped: true })
  }
  if (silentLoginTask) {
    return silentLoginTask
  }
  silentLoginTask = Promise.resolve(exchangeWechatCodeForSession())
    .then((data) => {
      applyWechatSilentPayload(data)
      if (import.meta.env.DEV && data.needBindPhone) {
        console.info(
          '[Yoke] 静默登录已完成 session；需绑定时请在登录页「授权手机号」或「手机号验证码登录」（见 api/auth.js 说明）'
        )
      }
      return data
    })
    .finally(() => {
      silentLoginTask = null
    })
  return silentLoginTask
}

/**
 * 登录页「微信一键登录」：始终重新 `uni.login` 并换 session，不因已有 token 跳过。
 * @returns {Promise<object>}
 */
export function loginWithWechatExplicit() {
  return Promise.resolve(exchangeWechatCodeForSession()).then((data) => {
    applyWechatSilentPayload(data)
    return data
  })
}

/**
 * 手机号授权成功回调：用 `getPhoneNumber` 的 code + 本地 `wxSessionUuid` 调 mobile-login，并合并 profile/points。
 * @param {string} phoneCode 微信组件返回的动态令牌
 * @returns {Promise<object>}
 */
export async function loginWithPhoneCode(phoneCode) {
  const store = useUserStore()
  const wxSessionUuid = store.wxSessionUuid ? String(store.wxSessionUuid) : ''
  const prevProfile = store.profile
  const prevPoints = store.points
  const data = await bindPhoneByCode({ phoneCode, wxSessionUuid })
  const nextPoints =
    data.points != null ? data.points : prevPoints
  const pn = Number(nextPoints)
  store.setLoginState({
    token: data.token,
    profile: data.profile != null ? data.profile : prevProfile,
    needBindPhone: Boolean(data.needBindPhone),
    loginType: 'phone',
    points: Number.isFinite(pn) ? Math.max(0, Math.floor(pn)) : prevPoints,
    wxSessionUuid: data.wxSessionUuid != null ? String(data.wxSessionUuid) : ''
  })
  return data
}

/**
 * 登录页：手机号 + 短信验证码登录（`POST /api/auth/login`），成功后写入 token 等。
 * @param {{ mobile: string, code: string }} param0
 * @returns {Promise<object>}
 */
export async function loginWithSmsCredentials({ mobile, code }) {
  const store = useUserStore()
  const m = String(mobile || '').trim()
  const data = await loginWithSms({ mobile: m, code })
  const base =
    data.profile && typeof data.profile === 'object'
      ? { ...data.profile }
      : { id: '', nickname: '', phone: '', avatarUrl: '' }
  if (!String(base.phone || '').trim()) {
    base.phone = m
  }
  const pn = Number(data.points)
  store.setLoginState({
    token: data.token,
    profile: base,
    needBindPhone: false,
    loginType: 'sms',
    points: Number.isFinite(pn) ? Math.max(0, Math.floor(pn)) : 0,
    wxSessionUuid: ''
  })
  return data
}

/**
 * 退出登录：可选请求后端，再清空本地 store 与 Storage。
 * @returns {Promise<void>}
 */
export async function performLogout() {
  const store = useUserStore()
  if (!store.token) {
    store.clearLoginState()
    return
  }
  if (isApiEnabled()) {
    try {
      await logoutApi()
    } catch (_) {
      /* 忽略：仍执行本地清理 */
    }
  }
  store.clearLoginState()
}
