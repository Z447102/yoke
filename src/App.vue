<script>
import { useUserStore } from '@/stores/user'
import { StaticPath } from '@/config'

/**
 * 应用根组件：全局样式入口（docs §4、§8）。
 * 静默登录在启动页同意《隐私政策》后由 pages/splash 触发，避免未授权先请求。
 */
export default {
  /** 应用启动：从本地恢复登录态 */
  onLaunch() {
    const userStore = useUserStore()
    userStore.hydrateFromStorage()
    if (userStore.token) {
      userStore.refreshProfileFromApi().catch(() => {})
    }
    console.log('onLaunch')
    uni.loadFontFace({
      family: 'OPPOSans',
      global: true,
      /** 与各端一致：使用 CDN 字体（参见 src/config.js StaticPath）；小程序需在后台配置 downloadFile 合法域名 */
      source: `url("${StaticPath}fonts/OPPOSans-4.0.ttf")`,
      success: () => {
        console.log('字体加载成功')
      },
      fail: () => {
        console.log('字体加载失败')
      }
    })
  }
}
</script>

<style lang="scss">
@use './styles/common.scss';
</style>
