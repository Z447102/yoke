<script>
import { useUserStore } from '@/stores/user'

/**
 * 应用根组件：全局样式入口（docs §4、§8）。
 * 静默登录在启动页同意《隐私政策》后由 pages/splash 触发，避免未授权先请求。
 */
export default {
  /** 应用启动：从本地恢复登录态 */
  onLaunch() {
    const userStore = useUserStore()
    userStore.hydrateFromStorage()
    console.log('onLaunch')
    uni.loadFontFace({
      family: 'OPPOSans',
      source: 'url("https://www.jzdmedia.cn/OPPOSans-4.0.ttf")',
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
