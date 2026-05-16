<template>
  <view class="recharge-page">
    <MineVipNavBar
      left-text="点数充值"
      left-arrow
      :custom-style="{ background: 'transparent' }"
      :border="false"
      @click-left="goBack"
    />

    <view class="content">
      <!-- Top Card -->
      <view class="top-card">
        <view class="card-top">
          <view class="total-points">
            <view class="coin-icon">
              <image src="../static/recharge/recharge-icon-coin.png" mode="aspectFit"></image>
            </view>
            <text class="points-value">
              {{ totalPointsInteger }}<text class="points-decimal">.{{ totalPointsDecimal }}</text>
            </text>
          </view>
          <view class="details-btn">明细</view>
        </view>
        <view class="card-bottom">
          <view class="stat-item">
            <text class="stat-val">{{ vipPoints }}</text>
            <text class="stat-label">会员点数</text>
          </view>
          <view class="stat-divider"></view>
          <view class="stat-item">
            <text class="stat-val">{{ rechargePoints }}</text>
            <text class="stat-label">充值点数</text>
          </view>
          <view class="stat-divider"></view>
          <view class="stat-item">
            <text class="stat-val">{{ giftPoints }}</text>
            <text class="stat-label">赠送点数</text>
          </view>
        </view>
      </view>

      <!-- Recharge Title -->
      <view class="section-title">请选择充值金额</view>

      <!-- Activity Banner -->
      <view v-if="hasPromo" class="activity-banner">
        <view class="activity-tag">活动</view>
        <view class="activity-text">首次购买享 <text class="highlight">{{ discountLabel }}</text></view>
        <view class="activity-countdown">{{ countdownText }}</view>
      </view>

      <!-- Options Grid -->
      <view class="options-grid">
        <view 
          v-for="(item, index) in options" 
          :key="item.id"
          class="option-item"
          :class="{ 'is-selected': selectedIndex === index }"
          @click="selectOption(index)"
        >
          <view class="option-points">
            <image class="option-points-icon" src="../static/recharge/recharge-icon-coin.png" mode="aspectFit"></image>
            <!-- <view :class="selectedIndex === index ? 'coin-icon-white' : 'coin-icon-small'"></view> -->
            <view class="points-num">{{ item.points }}</view>
          </view>
          <view class="option-price">
            <text class="price-current">¥{{ formatYuan(item.price) }}</text>
            <text v-if="item.originalPrice > item.price" class="price-original">¥{{ formatYuan(item.originalPrice) }}</text>
          </view>
        </view>
      </view>

      <!-- Bottom Fixed Area -->
      <view class="bottom-area">
        <view class="agreement" @click="agree = !agree">
          <view class="checkbox" :class="{ 'is-checked': agree }"></view>
          <text>已阅读并同意《有客付费协议》</text>
        </view>
        <view class="pay-btn" @click="handleBuy">
          立即购买 ¥{{ formatYuan(selectedItem.price) }}
          <text v-if="savedPrice > 0" class="pay-discount">已优惠¥{{ formatYuan(savedPrice) }}</text>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'
import {
  enterPointsRechargePage,
  fallbackPointsProducts,
  fallbackPointsRechargeEnter,
  getCurrentUserPoints,
  listPointsProducts
} from '@/api/points'
import MineVipNavBar from '@/pages/components/MineVipNavBar.vue'
import { useUserStore } from '@/stores/user'

const userStore = useUserStore()
const agree = ref(false)
const selectedIndex = ref(0)
const rechargeEnter = ref(fallbackPointsRechargeEnter)
const options = ref(normalizeProducts(fallbackPointsProducts))
const countdownSeconds = ref(0)
let promoTimer = null

const selectedItem = computed(() => options.value[selectedIndex.value] || options.value[0] || {
  id: '',
  productId: '',
  points: 0,
  price: 0,
  originalPrice: 0,
  raw: null
})
const savedPrice = computed(() =>
  Math.max(0, Number(selectedItem.value.originalPrice) - Number(selectedItem.value.price))
)
const hasPromo = computed(() =>
  Boolean(rechargeEnter.value?.firstDiscountAvailable)
)
const discountLabel = computed(() => {
  const rate = Number(rechargeEnter.value?.firstDiscountRate)
  if (!Number.isFinite(rate) || rate <= 0) return '8折'
  return `${Number((rate / 10).toFixed(1))}折`
})
const countdownText = computed(() => {
  if (countdownSeconds.value <= 0) return '活动限时进行中'
  const total = Math.max(0, Math.floor(countdownSeconds.value))
  const d = Math.floor(total / 86400)
  const h = Math.floor((total % 86400) / 3600)
  const m = Math.floor((total % 3600) / 60)
  const s = total % 60
  return `活动剩余：${d}天${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
})
const currentPoints = computed(() => Math.max(0, Number(userStore.points) || 0))
const totalPointsText = computed(() => currentPoints.value.toFixed(2))
const totalPointsInteger = computed(() => totalPointsText.value.split('.')[0] || '0')
const totalPointsDecimal = computed(() => totalPointsText.value.split('.')[1] || '00')
const vipPoints = computed(() => pointNumber(userStore.profile?.vipAvailablePoints))
const rechargePoints = computed(() => pointNumber(userStore.profile?.rechargeAvailablePoints))
const giftPoints = computed(() => pointNumber(userStore.profile?.giftAvailablePoints))

onMounted(() => {
  loadRechargePage()
})

onBeforeUnmount(() => {
  stopPromoTimer()
})

async function loadRechargePage() {
  try {
    await refreshCurrentUserPoints()
    const [enterData, products] = await Promise.all([
      enterPointsRechargePage(),
      listPointsProducts()
    ])
    rechargeEnter.value = enterData && typeof enterData === 'object'
      ? enterData
      : fallbackPointsRechargeEnter
    const normalized = normalizeProducts(products)
    if (normalized.length) {
      options.value = normalized
      selectedIndex.value = 0
    }
    userStore.mergeProfile({
      pointsTopUpPromo: Boolean(rechargeEnter.value?.firstDiscountAvailable)
    })
    resetPromoTimer()
  } catch (_) {
    rechargeEnter.value = fallbackPointsRechargeEnter
    options.value = normalizeProducts(fallbackPointsProducts)
    selectedIndex.value = 0
    resetPromoTimer()
  }
}

async function refreshCurrentUserPoints() {
  try {
    const data = await getCurrentUserPoints()
    if (!data || typeof data !== 'object') return
    userStore.setPoints(data.availablePoints)
    userStore.mergeProfile({
      availablePoints: pointNumber(data.availablePoints),
      vipAvailablePoints: pointNumber(data.vipAvailablePoints),
      rechargeAvailablePoints: pointNumber(data.rechargeAvailablePoints),
      giftAvailablePoints: pointNumber(data.giftAvailablePoints)
    })
  } catch (_) {
    // 点数刷新失败不阻塞充值商品与优惠信息展示。
  }
}

function normalizeProducts(products) {
  if (!Array.isArray(products)) return []
  return products
    .map((item, index) => {
      if (!item || typeof item !== 'object') return null
      const points = pointNumber(item.points)
      const originalPrice = amountToYuan(item.priceAmount)
      const price = amountToYuan(item.payAmount ?? item.priceAmount)
      if (points <= 0 || originalPrice <= 0 || price <= 0) return null
      return {
        id: String(item.productId ?? item.productCode ?? item.name ?? index),
        productId: item.productId,
        points,
        price,
        originalPrice,
        firstDiscountApplied: Boolean(item.firstDiscountApplied),
        raw: item
      }
    })
    .filter(Boolean)
}

function pointNumber(value) {
  const n = Number(value)
  return Number.isFinite(n) ? Math.max(0, Math.floor(n)) : 0
}

function amountToYuan(amount) {
  const n = Number(amount)
  if (!Number.isFinite(n) || n <= 0) return 0
  const yuan = n / 100
  return Number.isInteger(yuan) ? yuan : Number(yuan.toFixed(2))
}

function formatYuan(value) {
  const n = Number(value)
  if (!Number.isFinite(n)) return '0'
  if (Math.abs(n - Math.round(n)) < 1e-6) return String(Math.round(n))
  return n.toFixed(2)
}

function selectOption(index) {
  selectedIndex.value = index
}

function resetPromoTimer() {
  stopPromoTimer()
  countdownSeconds.value = parseExpireSeconds(rechargeEnter.value?.firstDiscountExpireTime)
  if (hasPromo.value && countdownSeconds.value > 0) {
    promoTimer = setInterval(() => {
      if (countdownSeconds.value <= 0) {
        stopPromoTimer()
        return
      }
      countdownSeconds.value -= 1
    }, 1000)
  }
}

function parseExpireSeconds(expireTime) {
  const text = String(expireTime || '').trim()
  if (!text) return 0
  const time = new Date(text.replace(/-/g, '/')).getTime()
  if (!Number.isFinite(time)) return 0
  return Math.max(0, Math.floor((time - Date.now()) / 1000))
}

function stopPromoTimer() {
  if (!promoTimer) return
  clearInterval(promoTimer)
  promoTimer = null
}

function handleBuy() {
  if (!agree.value) {
    uni.showToast({ title: '请先阅读并同意付费协议', icon: 'none' })
    return
  }
  uni.showToast({ title: '支付功能待接入', icon: 'none' })
}

function goBack() {
  uni.navigateBack({
    fail: () => {
      uni.switchTab({
        url: '/pages/home/index',
        fail: () => {
          uni.redirectTo({ url: '/pages/home/index' })
        }
      })
    }
  })
}
</script>

<style lang="scss" scoped>
.recharge-page {
  min-height: 100vh;
  // background-color: #FBA440;
  background: linear-gradient(180deg, rgba(255,148,50,1) 0%,rgba(255,192,119,1) 52%,rgba(255,190,114,1) 97%);
  display: flex;
  flex-direction: column;
}

.content {
  padding: 20rpx;
  display: flex;
  flex-direction: column;
  flex: 1;
}

/* Top Card */
.top-card {
  border-radius: 32rpx;
  overflow: hidden;
  margin-bottom: 40rpx;
  background-color: rgba(255,241,226,1);
}

.card-top {
  background: linear-gradient(69deg, rgba(255,241,226,1) 16.31%,rgba(255,241,241,0.1) 94.96%);
  padding: 40rpx 40rpx 30rpx;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.total-points {
  display: flex;
  align-items: flex-end;
}

.coin-icon {
  margin-right: 16rpx;
  image {
    width: 40rpx;
    height: 40rpx;
  }
}

.points-value {
  font-size: 64rpx;
  font-weight: bold;
  color: #333;
  line-height: 1;
}

.points-decimal {
  font-size: 40rpx;
}

.details-btn {
  background-color: rgba(255,255,255,0.8);
  border-radius: 40rpx;
  padding: 10rpx 40rpx;
  font-size: 26rpx;
  color: #666;
  font-weight: 500;
}

.card-bottom {
  background-color: #FEB661;
  padding: 24rpx 0;
  display: flex;
  align-items: center;
}

.stat-item {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.stat-val {
  font-size: 32rpx;
  font-weight: bold;
  color: #fff;
  margin-bottom: 4rpx;
}

.stat-label {
  font-size: 22rpx;
  color: rgba(255, 255, 255, 0.8);
}

.stat-divider {
  width: 2rpx;
  height: 40rpx;
  background-color: rgba(255, 255, 255, 0.4);
}

/* Recharge Title */
.section-title {
  font-size: 28rpx;
  font-weight: 600;
  color: #1F2937;
  margin-bottom: 30rpx;
}

/* Activity Banner */
.activity-banner {
  background-color: #FDC783;
  border-radius: 14rpx;
  display: flex;
  align-items: center;
  font-size: 28rpx;
  // padding: 12rpx;
  margin-bottom: 30rpx;
}

.activity-tag {
  background-color: #FFF;
  color: #333;
  padding: 8rpx 12rpx;
  display: flex;
  height: 100%;
  font-width: 500;
  align-items: center;
  justify-content: center;
  border-radius: 14rpx 0 0 14rpx;
}

.activity-text {
  color: #1F2937;
  margin-left: 16rpx;
  flex: 1;
  padding: 8rpx 0;
  letter-spacing: 1rpx;
}

.activity-text .highlight {
  color: #333;
  font-weight: bold;
}

.activity-countdown {
  color: #1F2937;
  margin-right: 16rpx;
  letter-spacing: 1rpx;
}

/* Options Grid */
.options-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 18rpx;
  // justify-content: space-between;
}

.option-item {
  width: 224rpx;
  background-color: rgba(255,241,226,0.2);
  border-radius: 24rpx;
  height: 150rpx;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  box-sizing: border-box;
  transition: all 0.2s;
  border: 4rpx solid transparent;
}

.option-item.is-selected {
  background: linear-gradient(135deg, #4A5666, #212936);
  border-color: white;

  .option-points-icon {
    filter: brightness(0) invert(1);
  }
}

.option-points {
  display: flex;
  align-items: center;
  margin-bottom: 18rpx;
  height: max-content;
}

.option-points-icon {
  width: 28rpx;
  height: 28rpx;
  margin-right: 10rpx;
}

.coin-icon-small {
  width: 32rpx;
  height: 32rpx;
  background-image: url("data:image/svg+xml,%3Csvg width='24' height='24' viewBox='0 0 24 24' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M12 7.5C16.4183 7.5 20 6.15685 20 4.5C20 2.84315 16.4183 1.5 12 1.5C7.58172 1.5 4 2.84315 4 4.5C4 6.15685 7.58172 7.5 12 7.5Z' fill='%23333333'/%3E%3Cpath d='M20 9C20 10.6569 16.4183 12 12 12C7.58172 12 4 10.6569 4 9V10.5C4 12.1569 7.58172 13.5 12 13.5C16.4183 13.5 20 12.1569 20 10.5V9Z' fill='%23333333'/%3E%3Cpath d='M20 15C20 16.6569 16.4183 18 12 18C7.58172 18 4 16.6569 4 15V16.5C4 18.1569 7.58172 19.5 12 19.5C16.4183 19.5 20 18.1569 20 16.5V15Z' fill='%23333333'/%3E%3C/svg%3E");
  background-size: cover;
  margin-right: 8rpx;
}

.coin-icon-white {
  width: 32rpx;
  height: 32rpx;
  background-image: url("data:image/svg+xml,%3Csvg width='24' height='24' viewBox='0 0 24 24' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M12 7.5C16.4183 7.5 20 6.15685 20 4.5C20 2.84315 16.4183 1.5 12 1.5C7.58172 1.5 4 2.84315 4 4.5C4 6.15685 7.58172 7.5 12 7.5Z' fill='%23FFFFFF'/%3E%3Cpath d='M20 9C20 10.6569 16.4183 12 12 12C7.58172 12 4 10.6569 4 9V10.5C4 12.1569 7.58172 13.5 12 13.5C16.4183 13.5 20 12.1569 20 10.5V9Z' fill='%23FFFFFF'/%3E%3Cpath d='M20 15C20 16.6569 16.4183 18 12 18C7.58172 18 4 16.6569 4 15V16.5C4 18.1569 7.58172 19.5 12 19.5C16.4183 19.5 20 18.1569 20 16.5V15Z' fill='%23FFFFFF'/%3E%3C/svg%3E");
  background-size: cover;
  margin-right: 8rpx;
}

.points-num {
  font-size: 36rpx;
  font-weight: bold;
  color: #1F2937;
}

.is-selected .points-num {
  color: #FFF;
}

.option-price {
  display: flex;
  align-items: baseline;
}

.price-current {
  font-size: 28rpx;
  font-weight: bold;
  color: #1F2937;
  margin-right: 8rpx;
}

.is-selected .price-current {
  color: #FFF;
}

.price-original {
  font-size: 20rpx;
  color: rgba(31,41,55,0.55);
  text-decoration: line-through;
}

.is-selected .price-original {
  color: rgba(255,255,255,0.55);
}

/* Bottom Area */
.bottom-area {
  margin-top: 60rpx;
  padding-bottom: 40rpx;
}

.agreement {
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 26rpx;
  height: 34rpx;
}

.checkbox {
  width: 24rpx;
  height: 24rpx;
  border-radius: 50%;
  border: 2rpx solid rgba(31,41,55,1);;
  margin-right: 6rpx;
  display: flex;
  align-items: center;
  justify-content: center;
}

.checkbox.is-checked {
  background-color: #333;
  border-color: #333;
}

.checkbox.is-checked::after {
  content: '';
  width: 14rpx;
  height: 8rpx;
  border-left: 3rpx solid #FFF;
  border-bottom: 3rpx solid #FFF;
  transform: rotate(-45deg);
  margin-top: -4rpx;
}

.agreement text {
  font-size: 22rpx;
  color: #1F2937;
  letter-spacing: 1rpx;
}

.pay-btn {
  height: 114rpx;
  border-radius: 36rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 30rpx;
  font-weight: bold;
  color: #1F2937;
  letter-spacing: 1rpx;
  background-color: rgba(255,241,226,1);
}

.pay-discount {
  font-size: 24rpx;
  color: #888;
  margin-left: 16rpx;
  font-weight: normal;
  letter-spacing: 1rpx;
}
</style>
