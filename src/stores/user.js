/**
 * 【用户 · Pinia】
 * - 登录态：token、profile、手机号引导（与 docs §8 一致）
 * - 资产：points；登录态与本地缓存同步
 */
import { defineStore } from 'pinia'
import {
  readPersistedAuth,
  writePersistedAuth,
  clearPersistedAuth
} from '@/utils/auth'

function persistSlice(state) {
  writePersistedAuth({
    token: state.token,
    profile: state.profile,
    needBindPhone: state.needBindPhone,
    loginType: state.loginType,
    points: state.points
  })
}

export const useUserStore = defineStore('user', {
  state: () => ({
    token: '',
    points: 0,
    profile: null,
    needBindPhone: false,
    loginType: ''
  }),

  getters: {
    isLogin: (state) => Boolean(state.token),
    hasPhone: (state) => Boolean(state.profile?.phone)
  },

  actions: {
    /** 从本地缓存恢复（App onLaunch 调用） */
    hydrateFromStorage() {
      const raw = readPersistedAuth()
      if (!raw || !raw.token) return
      this.token = raw.token
      this.profile = raw.profile || null
      this.needBindPhone = Boolean(raw.needBindPhone)
      this.loginType = raw.loginType || ''
      const n = Number(raw.points)
      this.points = Number.isFinite(n) ? Math.max(0, Math.floor(n)) : 0
    },

    setLoginState(payload) {
      this.token = payload.token || ''
      this.profile = payload.profile || null
      this.needBindPhone = Boolean(payload.needBindPhone)
      this.loginType = payload.loginType || ''
      if (payload.points != null) {
        const n = Number(payload.points)
        this.points = Number.isFinite(n) ? Math.max(0, Math.floor(n)) : 0
      }
      persistSlice(this)
    },

    clearLoginState() {
      this.token = ''
      this.profile = null
      this.needBindPhone = false
      this.loginType = ''
      this.points = 0
      clearPersistedAuth()
    },

    setPoints(value) {
      const n = Number(value)
      this.points = Number.isFinite(n) ? Math.max(0, Math.floor(n)) : 0
      persistSlice(this)
    }
  }
})
