/** 点数充值档位：点数与原价（元）；有活动时按 PROMO_DISCOUNT 展示折扣价 */
export const POINTS_TOP_UP_PROMO_DISCOUNT = 0.8

export const POINTS_RECHARGE_PACKAGES = [
  { id: 'p100', points: 100, priceYuan: 10 },
  { id: 'p500', points: 500, priceYuan: 50 },
  { id: 'p1000', points: 1000, priceYuan: 100 },
  { id: 'p2000', points: 2000, priceYuan: 200 },
  { id: 'p5000', points: 5000, priceYuan: 500 },
  { id: 'p10000', points: 10000, priceYuan: 1000 }
]

/**
 * @param {{ priceYuan: number }} pkg
 * @param {boolean} hasPromo
 * @returns {number}
 */
export function getPackageDisplayPriceYuan(pkg, hasPromo) {
  if (!hasPromo) return pkg.priceYuan
  return Math.round(pkg.priceYuan * POINTS_TOP_UP_PROMO_DISCOUNT * 100) / 100
}

/**
 * 为凑满 deficitPoints 推荐默认选中的档位 id
 * @param {number} deficitPoints
 * @returns {string}
 */
export function defaultPackageIdForDeficit(deficitPoints) {
  const need = Math.max(1, Math.ceil(Number(deficitPoints) || 0))
  const sorted = [...POINTS_RECHARGE_PACKAGES]
  const hit = sorted.find((p) => p.points >= need)
  return (hit || sorted[sorted.length - 1]).id
}
