/**
 * 页面内请求配套的 Loading（uni-app 全端可用 mask 拦截误触）。
 * 必须与 try/finally 配对，避免接口异常时不 hide。
 */

export const DEFAULT_LOADING_TITLE = '加载中...'

/**
 * 显隐：showPageLoading
 */
export function showPageLoading(title = DEFAULT_LOADING_TITLE) {
  try {
    uni.showLoading({ title: String(title), mask: true })
  } catch {
    /* 非 uni 环境忽略 */
  }
}

/**
 * 显隐：hidePageLoading
 */
export function hidePageLoading() {
  try {
    uni.hideLoading()
  } catch {
    /* 非 uni 环境忽略 */
  }
}
