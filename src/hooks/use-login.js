/**
 * 登录流程编排：uni.login + 静默接口 + Pinia（docs §8）
 */
import { silentLogin, bindPhoneByCode, logout as logoutApi } from '@/api/auth'
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
  store.setLoginState({
    token: data.token,
    profile: data.profile,
    needBindPhone: Boolean(data.needBindPhone),
    loginType: 'wechat_silent',
    points: data.points,
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
 * @returns {Promise<object>} 与 `silentLogin` 相同结构的归一化数据
 */
async function exchangeWechatCodeForSession() {
  const res = await uniLoginWeixin()

  const code = res && res.code
  if (!code) {
    throw new Error('微信登录 code 为空')
  }
  console.info('[Yoke] uni.login code:', code)
  try {
    return await silentLogin({ code })
  } catch (e) {
    if (e && e.code === 'WECHAT_CODE_INVALID') {
      const res2 = await uniLoginWeixin()
      const code2 = res2 && res2.code
      if (!code2) {
        throw new Error('微信登录 code 为空')
      }
      console.info('[Yoke] uni.login code (retry):', code2)
      return await silentLogin({ code: code2 })
    }
    throw e
  }
}

/**
 * 静默登录：无 token 时 `uni.login` + session；有 token 时跳过；并发复用同一 Promise。
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
  store.setLoginState({
    token: data.token,
    profile: data.profile != null ? data.profile : prevProfile,
    needBindPhone: Boolean(data.needBindPhone),
    loginType: 'phone',
    points: data.points != null ? data.points : prevPoints,
    wxSessionUuid: data.wxSessionUuid != null ? String(data.wxSessionUuid) : ''
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
