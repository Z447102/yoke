/**
 * 【用户 · Pinia】
 * - 登录态：token、profile、手机号引导（与 docs §8 一致）
 * - 微信会话：wxSessionUuid（/api/auth/wechat/session 返回，供手机号授权等后续步骤）
 * - 资产：points；登录态与本地缓存同步
 */
import { defineStore } from 'pinia'
import {
  readPersistedAuth,
  writePersistedAuth,
  clearPersistedAuth
} from '@/utils/auth'

/**
 * 将当前 store 中需持久化的字段写入 Storage。
 * @param {{ token: string, profile: unknown, needBindPhone: boolean, loginType: string, points: number, wxSessionUuid: string }} state Pinia user store 的 state 快照（与 this 字段一致）
 */
function persistSlice(state) {
  writePersistedAuth({
    token: state.token,
    profile: state.profile,
    needBindPhone: state.needBindPhone,
    loginType: state.loginType,
    points: state.points,
    wxSessionUuid: state.wxSessionUuid
  })
}

export const useUserStore = defineStore('user', {
  state: () => ({
    token: '',
    points: 0,
    profile: null,
    needBindPhone: false,
    loginType: '',
    /** 预登录会话 id，来自 POST /api/auth/wechat/session 的 data.uuid */
    wxSessionUuid: ''
  }),

  getters: {
    /** 是否存在非空 token（视为已登录） */
    isLogin: (state) => Boolean(state.token),
    /** profile 中是否包含非空手机号 */
    hasPhone: (state) => Boolean(state.profile?.phone)
  },

  actions: {
    /**
     * 从本地缓存恢复登录态（App `onLaunch` 调用）。
     * 无 token 时不做任何写入。
     */
    hydrateFromStorage() {
      const raw = readPersistedAuth()
      if (!raw || !raw.token) return
      this.token = raw.token
      this.profile = raw.profile || null
      this.needBindPhone = Boolean(raw.needBindPhone)
      this.loginType = raw.loginType || ''
      const n = Number(raw.points)
      this.points = Number.isFinite(n) ? Math.max(0, Math.floor(n)) : 0
      this.wxSessionUuid =
        typeof raw.wxSessionUuid === 'string' ? raw.wxSessionUuid : ''
    },

    /**
     * 写入登录态并持久化；未出现的字段按原逻辑保留或清空 wxSessionUuid。
     * @param {{ token?: string, profile?: object | null, needBindPhone?: boolean, loginType?: string, points?: number, wxSessionUuid?: string }} payload
     */
    setLoginState(payload) {
      this.token = payload.token || ''
      this.profile = payload.profile || null
      this.needBindPhone = Boolean(payload.needBindPhone)
      this.loginType = payload.loginType || ''
      if (payload.points != null) {
        const n = Number(payload.points)
        this.points = Number.isFinite(n) ? Math.max(0, Math.floor(n)) : 0
      }
      if (Object.prototype.hasOwnProperty.call(payload, 'wxSessionUuid')) {
        this.wxSessionUuid =
          typeof payload.wxSessionUuid === 'string' ? payload.wxSessionUuid : ''
      } else if (!payload.needBindPhone) {
        this.wxSessionUuid = ''
      }
      persistSlice(this)
    },

    /** 清空登录态与本地缓存。 */
    clearLoginState() {
      this.token = ''
      this.profile = null
      this.needBindPhone = false
      this.loginType = ''
      this.points = 0
      this.wxSessionUuid = ''
      clearPersistedAuth()
    },

    /**
     * 更新点数并持久化。
     * @param {number|string} value 新点数
     */
    setPoints(value) {
      const n = Number(value)
      this.points = Number.isFinite(n) ? Math.max(0, Math.floor(n)) : 0
      persistSlice(this)
    }
  }
})
