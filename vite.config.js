import { defineConfig } from 'vite'
import uniPlugin from '@dcloudio/vite-plugin-uni'

const uni = uniPlugin.default || uniPlugin

export default defineConfig({
  plugins: [uni()],
  /** 减轻 Sass legacy API 弃用警告刷屏（uni 编译链仍会走部分 legacy 调用时可保留） */
  css: {
    preprocessorOptions: {
      scss: {
        silenceDeprecations: ['legacy-js-api']
      }
    }
  }
})
