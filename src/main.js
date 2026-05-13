/**
 * 应用入口：创建 Vue 与 Pinia（docs §6 / 项目根 README）
 */
import { createSSRApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'

/**
 * 创建 SSR App 并注册 Pinia（各平台入口调用）。
 */
export function createApp() {
  const app = createSSRApp(App)
  app.use(createPinia())

  return {
    app
  }
}
