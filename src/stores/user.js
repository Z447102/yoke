/**
 * 【用户 · Pinia】
 * - 登录态：token、profile、手机号引导（与 docs §8 一致）
 * - 微信会话：wxSessionUuid（/api/auth/wechat/session 返回，供手机号授权等后续步骤）
 * - 资产：points；登录态与本地缓存同步
 */
import { defineStore } from 'pinia'
import { getCurrentUserInfo } from '@/api/user'
import {
  readPersistedAuth,
  writePersistedAuth,
  clearPersistedAuth
} from '@/utils/auth'
import { isApiEnabled } from '@/utils/request'
import { mapUserMeToProfile } from '@/utils/user-profile'

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
    /**
     * 已登录：含正式 JWT，或微信预登录已下发 uuid 且待绑定手机号（与 session 仅 uuid 场景一致）。
     */
    isLogin: (state) =>
      Boolean(String(state.token || '').trim()) ||
      (Boolean(state.needBindPhone) && Boolean(String(state.wxSessionUuid || '').trim())),
    /** profile 中是否包含非空手机号 */
    hasPhone: (state) => Boolean(state.profile?.phone),
    /** 是否 VIP（后端 profile 字段约定：isVip / vip） */
    isVip: (state) =>
      Boolean(state.profile?.isVip === true || state.profile?.vip === true || state.profile?.vip === 1),
    /**
     * 是否仍属「首次开通会员」优惠价人群；未下发时默认可享首购（走设计二）。
     * 后端可设 `firstVipSubscribe: false` 表示老用户走设计三。
     */
    isFirstVipSubscribeEligible: (state) => {
      if (state.profile && typeof state.profile.firstVipSubscribe === 'boolean') {
        return state.profile.firstVipSubscribe
      }
      return true
    },
    /**
     * 点数充值是否走「活动价 / 8 折」样式（第一张设计图）。
     * 需显式 `profile.pointsTopUpPromo === true` 为 true；未下发为 false（第二张原价图）。
     */
    pointsTopUpHasPromo: (state) => Boolean(state.profile?.pointsTopUpPromo === true)
  },

  actions: {
    /**
     * 从本地缓存恢复登录态（App `onLaunch` 调用）。
     * 无 token 时不做任何写入。
     */
    hydrateFromStorage() {
      const raw = readPersistedAuth()
      if (!raw || typeof raw !== 'object') return
      const hasToken = Boolean(String(raw.token || '').trim())
      const uuid = typeof raw.wxSessionUuid === 'string' ? raw.wxSessionUuid.trim() : ''
      const needBind = Boolean(raw.needBindPhone)
      if (!hasToken && !(uuid && needBind)) return
      this.token = hasToken ? String(raw.token).trim() : ''
      this.profile = raw.profile || null
      this.needBindPhone = needBind
      this.loginType = raw.loginType || ''
      const n = Number(raw.points)
      this.points = Number.isFinite(n) ? Math.max(0, Math.floor(n)) : 0
      this.wxSessionUuid = uuid
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
    },

    /**
     * 合并 profile 增量并写入本地缓存（支付回调或前端模拟开通 VIP 等）。
     * @param {Record<string, unknown>} patch 与现有 profile 浅合并
     */
    mergeProfile(patch) {
      if (!patch || typeof patch !== 'object') return
      const base =
        this.profile && typeof this.profile === 'object'
          ? { ...this.profile }
          : {}
      this.profile = { ...base, ...patch }
      persistSlice(this)
    },

    /**
     * 拉取 GET /api/user/me 并合并到 profile（有 token 且已配置基址时）。
     * @returns {Promise<Record<string, unknown> | null>}
     */
    async refreshProfileFromApi() {
      if (!String(this.token || '').trim()) return null
      if (!isApiEnabled()) return null
      const data = await getCurrentUserInfo()
      const profile = mapUserMeToProfile(data)
      this.mergeProfile(profile)
      return profile
    }
  }
})
