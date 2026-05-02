import { defineStore } from 'pinia'
import { getHomeDashboard, getHotContents } from '@/api/home'

export const useHomeStore = defineStore('home', {
  state: () => ({
    scoreSummary: null,
    scoreFilters: {
      platform: 'platform',
      industry: 'industry'
    },
    hotContents: [],
    digitalHumans: [],
    creationStats: {
      digitalHuman: 0,
      imageToVideo: 0,
      videoEdit: 0
    },
    smartTools: [],
    copywritingTools: [],
    loading: false,
    loaded: false
  }),
  actions: {
    async fetchDashboard() {
      this.loading = true
      try {
        const data = await getHomeDashboard(this.scoreFilters)
        this.scoreSummary = data.scoreSummary
        this.hotContents = data.hotContents || []
        this.digitalHumans = data.digitalHumans || []
        this.creationStats = data.creationStats || this.creationStats
        this.smartTools = data.smartTools || []
        this.copywritingTools = data.copywritingTools || []
        this.loaded = true
      } finally {
        this.loading = false
      }
    },
    async refreshHotContents() {
      const data = await getHotContents(this.scoreFilters)
      this.hotContents = data.list || []
    },
    setScoreFilter(key, value) {
      this.scoreFilters[key] = value
    }
  }
})
