/**
 * 【点数充值 · 接口模块】
 * 对接 C 端点数充值进入页与商品列表接口，未配置接口基址时保留本地兜底展示。
 */
import { get, post } from '@/utils/request'

export const fallbackPointsRechargeEnter = {
  firstDiscountAvailable: false,
  firstDiscountRate: 0,
  firstDiscountExpireTime: ''
}

export const fallbackPointsProducts = []

/**
 * 获取当前会员点数。
 * GET /api/user/points
 * @returns {Promise<{ availablePoints?: number, vipAvailablePoints?: number, rechargeAvailablePoints?: number, giftAvailablePoints?: number }>}
 */
export function getCurrentUserPoints() {
  return get('/api/user/points')
}

/**
 * 进入点数充值页。
 * POST /api/recharge/points/enter
 * @returns {Promise<{ firstDiscountAvailable?: boolean, firstDiscountRate?: number, firstDiscountExpireTime?: string }>}
 */
export function enterPointsRechargePage() {
  return post('/api/recharge/points/enter')
}

/**
 * 点数商品列表。
 * GET /api/recharge/points/products
 * @returns {Promise<Array<Record<string, unknown>>>}
 */
export function listPointsProducts() {
  return get('/api/recharge/points/products')
}
