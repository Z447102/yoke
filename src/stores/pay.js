/**
 * 【支付 · Pinia】
 * 通用充值支付流程：
 *   1) 调 POST /api/recharge/orders 创建订单，拿到微信小程序调起支付参数 payParams
 *   2) 调起 uni.requestPayment（wxpay）拉起微信支付收银台
 *   3) 收银台 success 后轮询 GET /api/recharge/orders/{orderNo} 直到 payStatus === 'paid'
 *      或者 closed / expired / 超过最大轮询次数时抛出对应错误
 *
 * 业务页面通常只需要：
 *   const pay = usePayStore()
 *   await pay.payByProductCode({ productCode: 'points_3000' })
 * 即可拿到「已支付成功」的订单详情。
 */
import { defineStore } from 'pinia'
import {
  createRechargeOrder,
  getRechargeOrderDetail
} from '@/api/recharge-order'

/** 支付状态枚举（与后端 ApiOrderDetailVO.payStatus 对齐） */
export const PayStatus = Object.freeze({
  UNPAID: 'unpaid',
  PAID: 'paid',
  CLOSED: 'closed'
})

const DEFAULT_POLL_MAX_ATTEMPTS = 10
const DEFAULT_POLL_INTERVAL_MS = 1000

/**
 * @typedef {Object} PayOptions
 * @property {string} productCode 商品编码，必填，来自点数或 VIP 商品列表
 * @property {'wechat' | 'alipay'} [channel='wechat'] 支付渠道，当前仅支持 wechat
 * @property {Object} [poll] 轮询查询订单详情的策略
 * @property {number} [poll.maxAttempts=10] 最大轮询次数
 * @property {number} [poll.intervalMs=1000] 每次轮询间隔（毫秒）
 * @property {boolean} [showLoading=false] 是否在创建订单 + 拉起支付期间显示 uni.showLoading
 * @property {string} [loadingText='正在发起支付...'] showLoading 的文案
 */

/**
 * @typedef {Object} PayResult
 * @property {{ orderNo: string, paymentNo: string, payAmount: number, payParams: Record<string, unknown> | null }} order 创建订单返回
 * @property {{ orderNo: string, payAmount: number, payStatus: string, grantStatus: string, expired: boolean }} detail 轮询确认后的订单详情
 */

export const usePayStore = defineStore('pay', {
  state: () => ({
    /** 是否正在创建订单 / 等待用户支付 */
    loading: false,
    /** 最近一次创建的订单返回（含 payParams） */
    lastOrder: null,
    /** 最近一次确认成功的订单详情 */
    lastPaidDetail: null
  }),

  actions: {
    /**
     * 通用支付入口：商品编码 → 拉起支付 → 查询订单确认已付。
     * @param {PayOptions} options
     * @returns {Promise<PayResult>}
     */
    async payByProductCode(options) {
      const productCode = String(options?.productCode || '').trim()
      if (!productCode) {
        throw new Error('缺少商品编码 productCode')
      }
      const channel = options?.channel || 'wechat'
      const pollCfg = options?.poll || {}
      const showLoading = Boolean(options?.showLoading)
      const loadingText = options?.loadingText || '正在发起支付...'

      this.loading = true
      if (showLoading) {
        try {
          uni.showLoading({ title: loadingText, mask: true })
        } catch (_) {}
      }

      try {
        const order = await createRechargeOrder({ productCode, channel })
        this.lastOrder = order
        if (!order || !order.orderNo) {
          throw new Error('创建订单失败：返回数据异常')
        }

        await invokeChannelPayment(channel, order.payParams)

        const detail = await pollOrderUntilPaid(order.orderNo, pollCfg)
        this.lastPaidDetail = detail
        return { order, detail }
      } finally {
        this.loading = false
        if (showLoading) {
          try {
            uni.hideLoading()
          } catch (_) {}
        }
      }
    },

    /**
     * 仅查询一次订单详情（不轮询），用于业务页主动刷新。
     * @param {string} orderNo
     */
    async fetchOrderDetail(orderNo) {
      return getRechargeOrderDetail(orderNo)
    },

    /**
     * 重置 store 状态（一般在页面 onUnload 时调用即可，可选）。
     */
    reset() {
      this.loading = false
      this.lastOrder = null
      this.lastPaidDetail = null
    }
  }
})

/**
 * 按渠道分发到具体的端能力。当前只实现 wechat（mp-weixin）。
 * @param {string} channel
 * @param {Record<string, unknown> | null} payParams 后端下发的调起支付参数
 */
function invokeChannelPayment(channel, payParams) {
  if (channel === 'wechat') return invokeWechatMpPayment(payParams)
  return Promise.reject(new Error(`暂不支持的支付渠道：${channel}`))
}

/**
 * 调起微信小程序支付（uni.requestPayment，对应 wx.requestPayment）。
 * payParams 字段以后端实际下发为准，常见为：
 *   { timeStamp, nonceStr, package, signType, paySign }
 * @param {Record<string, unknown> | null} payParams
 * @returns {Promise<UniApp.RequestPaymentSuccess>}
 */
function invokeWechatMpPayment(payParams) {
  return new Promise((resolve, reject) => {
    if (!payParams || typeof payParams !== 'object') {
      reject(new Error('支付参数缺失，无法调起微信支付'))
      return
    }

    uni.requestPayment({
      provider: 'wxpay',
      timeStamp: payParams.timeStamp,
      nonceStr: payParams.nonceStr,
      package: payParams.package,
      signType: payParams.signType || 'MD5',
      paySign: payParams.paySign,
      success: (res) => resolve(res),
      fail: (err) => {
        const raw = (err && (err.errMsg != null ? err.errMsg : err.message)) || ''
        const msg = String(raw)
        const lower = msg.toLowerCase()
        if (lower.includes('cancel')) {
          reject(Object.assign(new Error('已取消支付'), { cancel: true, raw: err }))
          return
        }
        reject(Object.assign(new Error(msg || '微信支付调起失败'), { raw: err }))
      }
    })
  })
}

/**
 * 轮询订单详情直到 payStatus === 'paid'；
 * 期间订单变为 closed 或 expired=true 时立即抛错；
 * 超过最大轮询次数仍未变更则抛超时错误。
 * @param {string} orderNo
 * @param {{ maxAttempts?: number, intervalMs?: number }} cfg
 */
async function pollOrderUntilPaid(orderNo, cfg) {
  const maxAttempts = positiveInt(cfg?.maxAttempts, DEFAULT_POLL_MAX_ATTEMPTS)
  const intervalMs = positiveInt(cfg?.intervalMs, DEFAULT_POLL_INTERVAL_MS)

  let lastDetail = null
  for (let i = 0; i < maxAttempts; i++) {
    const detail = await getRechargeOrderDetail(orderNo)
    lastDetail = detail

    if (detail?.payStatus === PayStatus.PAID) {
      return detail
    }
    if (detail?.payStatus === PayStatus.CLOSED) {
      throw Object.assign(new Error('订单已关闭'), { detail })
    }
    if (detail?.expired) {
      throw Object.assign(new Error('订单已过期'), { detail })
    }

    if (i < maxAttempts - 1) {
      await sleep(intervalMs)
    }
  }

  throw Object.assign(
    new Error('支付查询超时，请稍后在订单中查看支付结果'),
    { timeout: true, detail: lastDetail }
  )
}

function positiveInt(value, fallback) {
  const n = Number(value)
  if (!Number.isFinite(n) || n <= 0) return fallback
  return Math.floor(n)
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}
