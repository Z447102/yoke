/**
 * 【VIP 充值 · 接口模块】
 * 对接 C 端 VIP 商品与权益表接口，未配置接口基址时保留本地兜底展示。
 */
import { get, isApiEnabled } from '@/utils/request'

export const fallbackVipBenefits = []

export const fallbackVipProducts = []

/**
 * VIP 商品列表。
 * GET /api/recharge/vip/products
 * @returns {Promise<Array<Record<string, unknown>>>}
 */
export function listVipProducts() {
  return get('/api/recharge/vip/products')
}

/**
 * VIP 权益表。
 * GET /api/recharge/vip/benefits
 * 后端返回二维数组，列顺序：权益、VIP年卡、VIP月卡、普通用户。
 * @returns {Promise<Array<Array<string>>>}
 */
export function listVipBenefits() {
  return get('/api/recharge/vip/benefits')
}
