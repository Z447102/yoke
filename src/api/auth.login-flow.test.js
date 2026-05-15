/**
 * 无后端（未配置 VITE_API_BASE_URL）时 Mock 登录链路的契约测试。
 * 真实微信小程序需 uni.login + 后端换 session，无法在 Node 中完整 E2E。
 */
import { beforeAll, describe, expect, it, vi } from 'vitest'

vi.mock('@/config/env', () => ({
  getApiBaseUrl: () => '',
  isApiEnabled: () => false,
  getApiTimeout: () => 15000,
  getAuthWechatSilentPath: () => '/api/auth/wechat/session',
  getAuthWechatMobileLoginPath: () => '/api/auth/wechat/mobile-login',
  getAuthWechatBindPhonePath: () => '/api/auth/wechat/mobile-login',
  getApiBizSuccessCode: () => 200
}))

import { bindPhoneByCode, loginWithSms, silentLogin } from '@/api/auth.js'

beforeAll(() => {
  globalThis.uni = {
    getStorageSync: vi.fn(() => ''),
    setStorageSync: vi.fn(),
    removeStorageSync: vi.fn()
  }
})

describe('Mock 登录流程（isApiEnabled === false）', () => {
  it('silentLogin：返回 token、需绑手机、带 wxSessionUuid', async () => {
    const r = await silentLogin({ code: 'test_code_abc' })
    expect(r.token).toMatch(/^silent_test_cod/)
    expect(r.needBindPhone).toBe(true)
    expect(String(r.wxSessionUuid || '')).toMatch(/^mock_wx_session_/)
    expect(r.points).toBe(50)
  })

  it('bindPhoneByCode：Mock 完成后 needBindPhone 为 false', async () => {
    const r = await bindPhoneByCode({ phoneCode: 'wx_mock_phone_code' })
    expect(r.needBindPhone).toBe(false)
    expect(r.token).toMatch(/^phone_wx_moc/)
    expect(r.profile && String(r.profile.phone || '')).toContain('*')
  })

  it('loginWithSms：合法手机号 + 验证码成功', async () => {
    const r = await loginWithSms({ mobile: '13800138000', code: '123456' })
    expect(r.needBindPhone).toBe(false)
    expect(r.token).toMatch(/^sms_8000/)
    expect(r.profile && r.profile.phone).toBe('13800138000')
  })

  it('loginWithSms：非法手机号应拒绝', async () => {
    await expect(
      loginWithSms({ mobile: '123', code: '123456' })
    ).rejects.toMatchObject({ code: 'INVALID_INPUT' })
  })
})
