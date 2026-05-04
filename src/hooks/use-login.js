/**
 * 登录流程编排：uni.login + 静默接口 + Pinia（docs §8）
 */
import { silentLogin, bindPhoneByCode, logout as logoutApi } from '@/api/auth'
import { isApiEnabled } from '@/utils/request'
import { useUserStore } from '@/stores/user'

let silentLoginTask = null

function applyWechatSilentPayload(data) {
  const store = useUserStore()
  store.setLoginState({
    token: data.token,
    profile: data.profile,
    needBindPhone: Boolean(data.needBindPhone),
    loginType: 'wechat_silent',
    points: data.points
  })
}

/**
 * 调 uni.login 换后端静默登录态（不判断本地是否已有 token）
 */
function exchangeWechatCodeForSession() {
  return new Promise((resolve, reject) => {
    uni.login({
      provider: 'weixin',
      success: async (res) => {
        try {
          const code = res && res.code
          if (!code) {
            throw new Error('微信登录 code 为空')
          }
          const data = await silentLogin({ code })
          resolve(data)
        } catch (e) {
          reject(e)
        }
      },
      fail: (err) => {
        reject(err || new Error('uni.login 失败'))
      }
    })
  })
}

/**
 * 静默登录（可复用进行中的 Promise，避免并发重复 uni.login）
 * 已有 token 时直接 resolve，不打断冷启动。
 */
export function silentLoginOnce() {
  const store = useUserStore()
  if (store.token) {
    return Promise.resolve({ skipped: true })
  }
  if (silentLoginTask) {
    return silentLoginTask
  }
  silentLoginTask = exchangeWechatCodeForSession()
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
 * 登录页：始终拉取新 code 换票（即使用户本地已有 token，也允许刷新会话）
 */
export function loginWithWechatExplicit() {
  return exchangeWechatCodeForSession().then((data) => {
    applyWechatSilentPayload(data)
    return data
  })
}

/**
 * 手机号授权回调里的 code 换登录态
 */
export async function loginWithPhoneCode(phoneCode) {
  const store = useUserStore()
  const data = await bindPhoneByCode({ phoneCode })
  store.setLoginState({
    token: data.token,
    profile: data.profile,
    needBindPhone: Boolean(data.needBindPhone),
    loginType: 'phone',
    points: data.points
  })
  return data
}

/**
 * 退出：尽量通知后端，再清理本地（后端失败仍清本地，docs §8）
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
