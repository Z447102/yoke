/**
 * 登录相关接口
 * - 未配置 `VITE_API_BASE_URL` 时走 Mock，便于本地与小程序预览
 * - 配置基址后走 `post` 真实请求（路径需与后端对齐）
 */
import { isApiEnabled, post } from '@/utils/request'

function delay(ms) {
  return new Promise((r) => setTimeout(r, ms))
}

async function silentLoginMock({ code }) {
  await delay(280)
  if (!code) {
    const err = new Error('登录 code 为空')
    err.code = 'EMPTY_CODE'
    throw err
  }
  return {
    token: `silent_${code.slice(0, 8)}_${Date.now()}`,
    profile: {
      id: 'wx_mock_1',
      nickname: '微信用户',
      phone: '',
      avatarUrl: ''
    },
    needBindPhone: true,
    points: 344
  }
}

async function bindPhoneByCodeMock({ phoneCode }) {
  await delay(320)
  if (!phoneCode) {
    const err = new Error('手机号授权失败')
    err.code = 'EMPTY_PHONE_CODE'
    throw err
  }
  return {
    token: `phone_${phoneCode.slice(0, 6)}_${Date.now()}`,
    profile: {
      id: 'wx_mock_1',
      nickname: '微信用户',
      phone: '138****0000',
      avatarUrl: ''
    },
    needBindPhone: false,
    points: 344
  }
}

async function logoutMock() {
  await delay(100)
  return { ok: true }
}

/**
 * 微信静默登录：用 code 换业务 token
 * @param {{ code: string }} param0
 */
export async function silentLogin({ code }) {
  if (!isApiEnabled()) {
    return silentLoginMock({ code })
  }
  return post(
    '/auth/wechat/silent',
    { code },
    { auth: false }
  )
}

/**
 * 手机号授权登录/绑定（新版 getPhoneNumber 返回的 code）
 * @param {{ phoneCode: string }} param0
 */
export async function bindPhoneByCode({ phoneCode }) {
  if (!isApiEnabled()) {
    return bindPhoneByCodeMock({ phoneCode })
  }
  return post(
    '/auth/wechat/bind-phone',
    { code: phoneCode },
    { auth: true }
  )
}

/**
 * 退出登录（需携带当前 token；路径与后端对齐）
 */
export async function logout() {
  if (!isApiEnabled()) {
    return logoutMock()
  }
  return post('/auth/logout', {}, { auth: true })
}
