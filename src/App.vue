<script>
import { useUserStore } from '@/stores/user'

/**
 * 应用根组件：全局样式入口（docs §4、§8）。
 * 静默登录在启动页同意《隐私政策》后由 pages/splash 触发，避免未授权先请求。
 */
export default {
  onLaunch() {
    const userStore = useUserStore()
    userStore.hydrateFromStorage()
  }
}
</script>

<style lang="scss">
@use './styles/common.scss';
</style>
