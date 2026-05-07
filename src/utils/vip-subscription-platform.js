/**
 * 当前运行端是否具备「连续包月 / 连续包年」签约续费能力（由产品/支付渠道决定）。
 * 返回 true 时走 VIP 弹窗设计一；false 时再按是否首购区分设计二、三。
 */
export function supportsContinuousVipSubscription() {
  try {
    const info = uni.getSystemInfoSync()
    const p = info.uniPlatform || ''
    if (p === 'app') return true
    if (p === 'mp-weixin') return true
    return false
  } catch {
    return false
  }
}
