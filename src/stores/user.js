import { defineStore } from 'pinia'

export const useUserStore = defineStore('user', {
  state: () => ({
    token: 'mock-token',
    /** 创作消耗等逻辑依赖点数，联调后由接口刷新 */
    points: 100,
    profile: {
      id: '1',
      nickname: '有客用户',
      phone: '13800000000'
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
