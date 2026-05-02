import { defineStore } from 'pinia'

export const useUserStore = defineStore('user', {
  state: () => ({
    token: 'mock-token',
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
    }
  }
})
