/**
 * 【用户 · Pinia】
 * - 登录态：token、profile、手机号引导（与 docs §8 一致）
 * - 资产：points 用于成片扣费前置校验；支付/登录态刷新后由接口写回
 */
import { defineStore } from 'pinia'

export const useUserStore = defineStore('user', {
  state: () => ({
    // --- 登录态（Mock，联调后由静默登录/授权回填） ---
    token: 'mock-token',
    /** 点数：一键成片等消耗逻辑读取；联调后随用户信息刷新 */
    points: 344,
    profile: {
      id: '1',
      nickname: 'Cat - 先生',
      phone: '13800000000',
      avatarUrl:
        'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=240&h=240&fit=crop'
    },
    needBindPhone: false,
    loginType: 'wechat_silent'
  }),

  getters: {
    isLogin: (state) => Boolean(state.token),
    hasPhone: (state) => Boolean(state.profile?.phone)
  },

  actions: {
    setLoginState(payload) {
      this.token = payload.token || ''
      this.profile = payload.profile || null
      this.needBindPhone = Boolean(payload.needBindPhone)
      this.loginType = payload.loginType || ''
    },
    clearLoginState() {
      this.token = ''
      this.profile = null
      this.needBindPhone = false
      this.loginType = ''
      this.points = 0
    },
    setPoints(value) {
      const n = Number(value)
      this.points = Number.isFinite(n) ? Math.max(0, Math.floor(n)) : 0
    }
  }
})
