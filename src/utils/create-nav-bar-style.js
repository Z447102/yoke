import { StaticPath } from '@/config'
import { nextTick } from 'vue'
const createNavTopBg = `${StaticPath}create/create-nav-top-bg.png`
import { getCreateNavBarPaddingTopPx } from '@/utils/create-nav-padding'

/**
 * 一键成片自定义导航栏内联样式：顶距 + 顶区背景图（替换原 CSS 渐变）。
 * 资源路径：`src/static/create/create-nav-top-bg.png`，可按设计替换同路径文件。
 */
export function getCreateNavBarInlineStyle() {
  return {
    paddingTop: `${getCreateNavBarPaddingTopPx()}px`,
    backgroundImage: `url(${createNavTopBg})`,
    backgroundSize: '100% 100%',
    backgroundRepeat: 'no-repeat',
    backgroundPosition: 'center top'
  }
}

/**
 * 胶囊/窗口信息在首帧可能未就绪：与「我的」页类似，延后多拍刷新顶栏样式。
 * @param {{ value: Record<string, string> }} styleRef
 */
export function scheduleCreateNavBarStyleRefresh(styleRef) {
  const apply = () => {
    styleRef.value = getCreateNavBarInlineStyle()
  }
  apply()
  nextTick(apply)
  setTimeout(apply, 48)
  setTimeout(apply, 200)
}
