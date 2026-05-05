/** @returns {Record<string, number> | null} */
function readMenuButtonRect() {
  try {
    if (typeof wx !== 'undefined' && typeof wx.getMenuButtonBoundingClientRect === 'function') {
      const mb = wx.getMenuButtonBoundingClientRect()
      if (mb && typeof mb.top === 'number' && mb.top > 0) {
        return mb
      }
    }
  } catch {
    /* 非微信环境 */
  }
  try {
    if (typeof uni !== 'undefined' && typeof uni.getMenuButtonBoundingClientRect === 'function') {
      const mb = uni.getMenuButtonBoundingClientRect()
      if (mb && typeof mb.top === 'number' && mb.top > 0) {
        return mb
      }
    }
  } catch {
    /* 忽略 */
  }
  return null
}

/** 与「我的」页一致：胶囊下缘 px，用于顶栏内容整体避开系统状态区与胶囊行 */
function menuButtonBottomPx(mb) {
  if (!mb || typeof mb.top !== 'number') return 0
  const h = typeof mb.height === 'number' && mb.height > 0 ? mb.height : 32
  const byBottom = typeof mb.bottom === 'number' && mb.bottom > 0 ? mb.bottom : 0
  const byTop = mb.top + h
  return Math.max(byBottom, byTop)
}

/**
 * 状态栏 / 刘海顶部安全区高度（px），不含导航条额外留白。
 * 用于选点页地图顶栏等「非 create 导航条」场景。
 * @returns {number}
 */
export function getCreateSafeAreaTopPx() {
  try {
    let winTop = 0
    if (typeof uni !== 'undefined' && typeof uni.getWindowInfo === 'function') {
      try {
        const wi = uni.getWindowInfo()
        if (wi) {
          if (typeof wi.statusBarHeight === 'number' && wi.statusBarHeight > 0) {
            winTop = Math.max(winTop, wi.statusBarHeight)
          }
          if (wi.safeArea && typeof wi.safeArea.top === 'number') {
            winTop = Math.max(winTop, wi.safeArea.top)
          }
        }
      } catch {
        /* 低版本基础库无 getWindowInfo */
      }
    }

    const si = uni.getSystemInfoSync()
    const safeTop =
      si.safeAreaInsets && typeof si.safeAreaInsets.top === 'number'
        ? si.safeAreaInsets.top
        : 0
    const statusH =
      typeof si.statusBarHeight === 'number' && si.statusBarHeight > 0
        ? si.statusBarHeight
        : 44
    return Math.round(Math.max(winTop, safeTop, statusH, 20))
  } catch {
    return 44
  }
}

/**
 * 一键成片自定义导航 `padding-top`（px）。
 * 优先按微信小程序胶囊下缘 + 间距（与 `pages/mine` 顶区算法一致），避免标题/返回与状态栏时间、胶囊叠盖；
 * 无胶囊信息时回退为 statusBar / safeArea + rpx 留白。
 * @returns {number}
 */
export function getCreateNavBarPaddingTopPx() {
  try {
    const si = uni.getSystemInfoSync()
    const safeTop =
      si.safeAreaInsets && typeof si.safeAreaInsets.top === 'number'
        ? Number(si.safeAreaInsets.top)
        : 0
    const sb =
      typeof si.statusBarHeight === 'number' && si.statusBarHeight > 0
        ? Number(si.statusBarHeight)
        : 0

    const topInset = getCreateSafeAreaTopPx()
    const mb = readMenuButtonRect()
    const gapBelow = typeof uni.upx2px === 'function' ? uni.upx2px(10) : 10

    let padPx = 0
    if (mb) {
      const navBottom = menuButtonBottomPx(mb)
      if (navBottom > 0) {
        padPx = navBottom + gapBelow
      }
    }

    if (padPx <= 0) {
      const merged = Math.max(sb, safeTop, 20)
      const base = merged > 0 ? merged : 44
      const extra = typeof uni.upx2px === 'function' ? uni.upx2px(36) : 34
      padPx = base + extra + 10
    }

    const minPad =
      Math.max(sb, safeTop, topInset) +
      (typeof uni.upx2px === 'function' ? uni.upx2px(48) : 46)
    return Math.round(Math.max(padPx, minPad))
  } catch {
    return 96
  }
}
