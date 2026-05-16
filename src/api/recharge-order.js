/**
 * 【充值订单 · 接口模块】
 * 对接 C 端充值订单创建与详情查询接口，被点数充值与 VIP 充值共用。
 */
import { get, post } from '@/utils/request'

/**
 * 创建充值订单。
 * POST /api/recharge/orders
 * @param {{ productCode: string, channel?: 'wechat' | 'alipay' }} body 下单参数；channel 默认 wechat
 * @returns {Promise<{ orderNo: string, paymentNo: string, payAmount: number, payParams: Record<string, unknown> | null }>}
 */
export function createRechargeOrder(body) {
  const { productCode, channel = 'wechat' } = body || {}
  return post('/api/recharge/orders', { productCode, channel })
}

/**
 * 查询充值订单详情。
 * GET /api/recharge/orders/{orderNo}
 * @param {string} orderNo 业务订单号
 * @returns {Promise<{ orderNo: string, payAmount: number, payStatus: 'unpaid' | 'paid' | 'closed', grantStatus: 'not_started' | 'success' | 'failed', expired: boolean }>}
 */
export function getRechargeOrderDetail(orderNo) {
  const no = String(orderNo || '').trim()
  if (!no) return Promise.reject(new Error('订单号不能为空'))
  return get(`/api/recharge/orders/${encodeURIComponent(no)}`)
}
