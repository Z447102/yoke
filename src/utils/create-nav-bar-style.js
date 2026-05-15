import { StaticPath } from '@/config'
import { nextTick } from 'vue'
import {
  getCreateNavBarPaddingTopPx,
  getCreateNavBarStatusBarPaddingPx,
  getCreateNavBarCapsuleRowHeightPx
} from '@/utils/create-nav-padding'

const createNavTopBg = `${StaticPath}create/create-nav-top-bg.png`

/**
 * 顶栏外层：仅状态栏 padding-top；背景由 variant 决定。
 * - `banner`：一键成片顶区背景图
 * - `plain`：无顶图（发布页等由组件铺浅底色）
 * - `solid`：白底顶栏（我的 · 主营业务等）
 */
export function getCreateNavBarOuterStyle(variant = 'banner') {
  const sb = getCreateNavBarStatusBarPaddingPx()
  const base = {
    paddingTop: `${sb}px`,
    boxSizing: 'border-box',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'stretch'
  }
  if (variant === 'plain') {
    return base
  }
  if (variant === 'solid') {
    return {
      ...base,
      backgroundColor: '#ffffff'
    }
  }
  return {
    ...base,
    backgroundImage: `url(${createNavTopBg})`,
    backgroundSize: '100% 100%',
    backgroundRepeat: 'no-repeat',
    backgroundPosition: 'center top'
  }
}

/** 与胶囊同高的单行 flex，用于返回区 + 右侧占位与胶囊垂直对齐 */
export function getCreateNavBarRowStyle() {
  return {
    height: `${getCreateNavBarCapsuleRowHeightPx()}px`,
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
    flexShrink: 0,
    boxSizing: 'border-box',
    width: '100%'
  }
}

/**
 * 一键成片旧版整段顶距（胶囊下缘以下），供「我的-主营业务」等非 CreateNavBar 页沿用。
 * @deprecated 新顶栏请用 CreateNavBar + getCreateNavBarOuterStyle / getCreateNavBarRowStyle
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
