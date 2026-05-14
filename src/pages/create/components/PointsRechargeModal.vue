<template>
  <!-- 一键成片 · 点数充值（有活动 / 无活动设计稿） -->
  <view v-if="show" class="prm-mask" @tap="emit('close')">
    <view class="prm-sheet" @tap.stop>
      <view class="prm-handle" aria-hidden="true" />

      <view class="prm-head">
        <text class="prm-title">最小充值金额</text>
        <view
          class="prm-need-box"
          :class="{
            'prm-need-box--active': needBoxIsActive,
            'prm-need-box--inactive': !needBoxIsActive
          }"
          @tap.stop="toggleNeedBoxActive"
        >
          <text class="prm-need-line">完成当前视频至少还需</text>
          <view class="prm-need-right">
            <image
              class="prm-need-coin"
              :src="needBoxCoinImg"
              mode="aspectFit"
              aria-hidden="true"
            />
            <view class="prm-need-num-wrap">
              <text class="prm-need-num-int">{{ deficitIntegerPart }}</text>
              <text class="prm-need-num-decimal">.{{ deficitDecimalPart }}</text>
            </view>
          </view>
        </view>
      </view>

      <view class="prm-body">
        <text class="prm-section-title">其他充值金额</text>

        <view v-if="hasPromo" class="prm-promo-bar">
          <view class="prm-promo-tag">活动</view>
          <text class="prm-promo-text">首次购买享 8折</text>
          <text class="prm-promo-time">{{ countdownText }}</text>
        </view>

        <view class="prm-grid">
          <view
            v-for="pkg in packages"
            :key="pkg.id"
            class="prm-card"
            :class="{ 'prm-card--active': selectedId === pkg.id }"
            @tap.stop="onSelectPackage(pkg.id)"
          >
            <view class="prm-card-top">
              <image
                class="prm-card-coin"
                :src="selectedId === pkg.id ? coinImgSelected : coinImgUnselected"
                mode="aspectFit"
                aria-hidden="true"
              />
              <text class="prm-card-points">{{ pkg.points }}</text>
            </view>
            <view v-if="hasPromo" class="prm-card-price-row">
              <text class="prm-card-price">¥{{ formatYuan(displayPrice(pkg)) }}</text>
              <text class="prm-card-origin">¥{{ formatYuan(pkg.priceYuan) }}</text>
            </view>
            <text v-else class="prm-card-price">¥{{ formatYuan(displayPrice(pkg)) }}</text>
          </view>
        </view>

        <view class="prm-agreement" @tap.stop="agreed = !agreed">
          <view class="prm-check" :class="{ 'prm-check--on': agreed }">
            <text v-if="agreed" class="prm-check-tick">✓</text>
          </view>
          <text class="prm-agreement-text">已阅读并同意《有客付费协议》</text>
        </view>

        <button class="prm-buy-btn" @tap="handleBuy">
          <view class="prm-buy-btn-inner">
            <template v-if="hasPromo">
              <text class="prm-buy-btn-strong">立即购买 ¥{{ formatYuan(displayPrice(selectedPkg)) }}</text>
              <text v-if="showMinRechargeTag" class="prm-buy-btn-sub">最小充值金额</text>
            </template>
            <text v-else class="prm-buy-btn-plain">立即购买 ¥{{ formatYuan(displayPrice(selectedPkg)) }}</text>
          </view>
        </button>
      </view>
    </view>
  </view>
</template>

<script setup>
import { StaticPath } from '@/config'
import { computed, onBeforeUnmount, ref, watch } from 'vue'
import {
  POINTS_RECHARGE_PACKAGES,
  getPackageDisplayPriceYuan,
  defaultPackageIdForDeficit
} from '@/constants/points-recharge'
/** 选中态（深色底）：浅色金币栈 */
const coinImgSelected = `${StaticPath}create/points-recharge-coin-selected.png`
/** 未选中态（浅色底）：深色金币栈 */
const coinImgUnselected = `${StaticPath}create/points-recharge-coin-unselected.png`

const props = defineProps({
  show: { type: Boolean, default: false },
  deficitPoints: { type: Number, default: 0 },
  hasPromo: { type: Boolean, default: false },
  promoCountdownText: { type: String, default: '活动剩余：1天23:59:58:20' }
})

const emit = defineEmits(['close', 'confirm'])

const packages = POINTS_RECHARGE_PACKAGES
const selectedId = ref(packages[0].id)
const agreed = ref(false)
const countdownSeconds = ref(0)
let promoTimer = null

const formattedDeficit = computed(() => {
  const n = Math.max(0, Number(props.deficitPoints) || 0)
  return n.toFixed(2)
})
const deficitIntegerPart = computed(() => formattedDeficit.value.split('.')[0] || '0')
const deficitDecimalPart = computed(() => formattedDeficit.value.split('.')[1] || '00')

/** 顶部「至少还需」条状态：支持手动点击切换 */
const needBoxIsActive = ref(Boolean(props.hasPromo))
const needBoxCoinImg = computed(() =>
  needBoxIsActive.value ? coinImgSelected : coinImgUnselected
)

const selectedPkg = computed(() => packages.find((p) => p.id === selectedId.value) || packages[0])
const requiredDeficitPoints = computed(() => Math.max(1, Math.ceil(Number(props.deficitPoints) || 0)))
const showMinRechargeTag = computed(
  () => Boolean(props.hasPromo) && Number(selectedPkg.value?.points || 0) === requiredDeficitPoints.value
)

watch(
  () => props.show,
  (visible) => {
    if (visible) {
      selectedId.value = defaultPackageIdForDeficit(props.deficitPoints)
      agreed.value = false
      needBoxIsActive.value = Boolean(props.hasPromo)
      if (props.hasPromo) {
        countdownSeconds.value = parsePromoSeconds(props.promoCountdownText)
        startPromoTimer()
      } else {
        stopPromoTimer()
      }
    } else {
      stopPromoTimer()
    }
  }
)

watch(
  () => props.deficitPoints,
  (d) => {
    if (props.show) selectedId.value = defaultPackageIdForDeficit(d)
  }
)

watch(
  () => props.hasPromo,
  (v) => {
    if (!props.show) return
    needBoxIsActive.value = Boolean(v)
    if (v) {
      countdownSeconds.value = parsePromoSeconds(props.promoCountdownText)
      startPromoTimer()
    } else {
      stopPromoTimer()
    }
  }
)

watch(
  () => props.promoCountdownText,
  (nextText) => {
    if (!props.show || !props.hasPromo) return
    countdownSeconds.value = parsePromoSeconds(nextText)
  }
)

/**
 * 函数：safeHideKeyboard
 */
function safeHideKeyboard() {
  try {
    if (typeof uni !== 'undefined' && typeof uni.hideKeyboard === 'function') {
      uni.hideKeyboard()
    }
  } catch {
    // ignore in non-uni runtimes
  }
}

/**
 * 函数：displayPrice
 */
function displayPrice(pkg) {
  return getPackageDisplayPriceYuan(pkg, props.hasPromo)
}

/**
 * 函数：formatYuan
 */
function formatYuan(n) {
  const v = Number(n)
  if (!Number.isFinite(v)) return '0'
  if (Math.abs(v - Math.round(v)) < 1e-6) return String(Math.round(v))
  return v.toFixed(2)
}

/**
 * 函数：parsePromoSeconds
 */
function parsePromoSeconds(text) {
  const s = String(text || '')
  const m = s.match(/(\d+)\s*天\s*(\d{1,2}):(\d{1,2}):(\d{1,2})/)
  if (!m) return 2 * 24 * 60 * 60
  const d = Number(m[1]) || 0
  const hh = Number(m[2]) || 0
  const mm = Number(m[3]) || 0
  const ss = Number(m[4]) || 0
  return Math.max(0, d * 86400 + hh * 3600 + mm * 60 + ss)
}

const countdownText = computed(() => {
  const total = Math.max(0, Math.floor(countdownSeconds.value))
  const d = Math.floor(total / 86400)
  const h = Math.floor((total % 86400) / 3600)
  const m = Math.floor((total % 3600) / 60)
  const s = total % 60
  return `活动剩余：${d}天${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
})

/**
 * 函数：startPromoTimer
 */
function startPromoTimer() {
  stopPromoTimer()
  promoTimer = setInterval(() => {
    if (countdownSeconds.value <= 0) {
      stopPromoTimer()
      return
    }
    countdownSeconds.value -= 1
  }, 1000)
}

/**
 * 函数：stopPromoTimer
 */
function stopPromoTimer() {
  if (!promoTimer) return
  clearInterval(promoTimer)
  promoTimer = null
}

/**
 * 事件处理：onSelectPackage
 */
function onSelectPackage(id) {
  selectedId.value = id
  // 避免页面上已有输入框（如文案 textarea）在切换金额时被重新聚焦而唤起键盘
  safeHideKeyboard()
}

/**
 * 切换状态：toggleNeedBoxActive
 */
function toggleNeedBoxActive() {
  needBoxIsActive.value = !needBoxIsActive.value
  safeHideKeyboard()
}

/**
 * 处理：handleBuy
 */
function handleBuy() {
  safeHideKeyboard()
  if (!agreed.value) {
    uni.showToast({ title: '请先阅读并同意付费协议', icon: 'none' })
    return
  }
  const pkg = selectedPkg.value
  emit('confirm', {
    packageId: pkg.id,
    points: pkg.points,
    payYuan: displayPrice(pkg),
    hasPromo: props.hasPromo
  })
}

onBeforeUnmount(() => {
  stopPromoTimer()
})
</script>

<style lang="scss" scoped>
.prm-mask {
  position: fixed;
  inset: 0;
  z-index: 125;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: flex-end;
  justify-content: center;
  box-sizing: border-box;
}

/* 顶部无圆角；无关闭按钮 */
.prm-sheet {
  width: 100%;
  max-height: 88vh;
  overflow: hidden;
  border-radius: 0;
  background: linear-gradient(
    180deg,
    rgba(255, 190, 114, 1) 0%,
    rgba(255, 192, 119, 1) 52%,
    rgba(255, 148, 50, 1) 97%
  );
  box-sizing: border-box;
  padding-bottom: calc(24rpx + constant(safe-area-inset-bottom));
  padding-bottom: calc(24rpx + env(safe-area-inset-bottom));
  position: relative;
}

.prm-handle {
  width: 72rpx;
  height: 8rpx;
  margin: 16rpx auto 12rpx;
  border-radius: 999rpx;
  background: rgba(255, 255, 255, 0.65);
}

.prm-head {
  padding: 8rpx 28rpx 16rpx;
}

.prm-title {
  display: block;
  text-align: center;
  color: #1f2937;
  font-size: 28rpx;
  font-family: OPPOSans-medium, 'PingFang SC', 'Microsoft YaHei', sans-serif;
  font-weight: 500;
  margin-bottom: 20rpx;
}

/* 未选中状态：浅底条 + 深色文案 */
.prm-need-box {
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  gap: 16rpx;
  width: 710rpx;
  height: 150rpx;
  margin: 0 auto;
  border-radius: 16rpx;
  background-color: rgba(255, 241, 226, 1);
  border: 1rpx solid rgba(255, 255, 255, 1);
  padding: 22rpx 70rpx 22rpx 44rpx;
  box-sizing: border-box;
}

/* 选中状态：与选中档位一致的灰阶渐变 + 白边 + 白字 */
.prm-need-box--active {
  background: linear-gradient(156.23deg, rgba(107, 114, 128, 1) 8.94%, rgba(31, 41, 55, 1) 85.54%);
  border: 4rpx solid rgba(255, 255, 255, 1);
}

.prm-need-box--inactive {
  background-color: rgba(255, 241, 226, 1);
  border: 1rpx solid rgba(255, 255, 255, 1);
}

.prm-need-box--active .prm-need-num {
  color: #ffffff;
}

.prm-need-box--active .prm-need-line,
.prm-need-box--active .prm-need-num-int,
.prm-need-box--active .prm-need-num-decimal {
  color: #ffffff;
}

.prm-need-line {
  flex: 1;
  min-width: 0;
  color: #1f2937;
  font-size: 28rpx;
  font-family: OPPOSans-regular, 'PingFang SC', 'Microsoft YaHei', sans-serif;
  font-weight: 400;
  margin: 0;
  line-height: 1.4;
}

.prm-need-right {
  flex-shrink: 0;
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 16rpx;
}

.prm-need-coin {
  width: 40rpx;
  height: 40rpx;
  display: block;
}

.prm-need-num {
  color: #1f2937;
  font-size: 44rpx;
  font-weight: 800;
  line-height: 1;
}

.prm-need-num-wrap {
  display: flex;
  flex-direction: row;
  align-items: baseline;
}

.prm-need-num-int {
  color: #1f2937;
  font-size: 64rpx;
  font-weight: 800;
  line-height: 1;
}

.prm-need-num-decimal {
  color: #1f2937;
  font-size: 44rpx;
  font-weight: 800;
  line-height: 1;
}

.prm-body {
  padding: 8rpx 24rpx 0;
}

.prm-section-title {
  display: block;
  text-align: center;
  color: #1f2937;
  font-size: 28rpx;
  font-family: OPPOSans-medium, 'PingFang SC', 'Microsoft YaHei', sans-serif;
  font-weight: 500;
  margin-bottom: 16rpx;
}

.prm-promo-bar {
  display: flex;
  flex-wrap: nowrap;
  align-items: center;
  justify-content: space-between;
  width: 710rpx;
  height: 58rpx;
  margin: 0 auto 30rpx;
  gap: 12rpx;
  padding: 0 24rpx 0 0;
  border-radius: 20rpx;
  background-color: rgba(255, 241, 226, 1);
  border: 2rpx solid rgba(255, 255, 255, 1);
  box-sizing: border-box;
}

.prm-promo-tag {
  width: 92rpx;
  height: 58rpx;
  padding: 0;
  border-radius: 20rpx 0rpx 0rpx 20rpx;
  background: #ffffff;
  color: #1f2937;
  font-size: 20rpx;
  font-weight: 800;
  display: flex;
  align-items: center;
  justify-content: center;
  box-sizing: border-box;
}

.prm-promo-text {
  flex: 1;
  color: #1f2933;
  font-size: 24rpx;
  font-weight: 700;
}

.prm-promo-time {
  flex-shrink: 0;
  color: #6b7280;
  font-size: 22rpx;
  text-align: right;
}

.prm-grid {
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  gap: 16rpx 0;
  justify-content: space-between;
}

.prm-card {
  width: 224rpx;
  height: 150rpx;
  box-sizing: border-box;
  padding: 18rpx 10rpx;
  border-radius: 16rpx;
  border: 2rpx solid transparent;
  background-color: rgba(255, 241, 226, 1);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.prm-card--active {
  border: 4rpx solid rgba(255, 255, 255, 1);
  background: linear-gradient(156.23deg, rgba(107, 114, 128, 1) 8.94%, rgba(31, 41, 55, 1) 85.54%);
}

.prm-card-top {
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: center;
  gap: 6rpx;
}

.prm-card-coin {
  width: 28rpx;
  height: 28rpx;
  flex-shrink: 0;
  display: block;
}

.prm-card-points {
  font-size: 26rpx;
  font-weight: 800;
  color: #1f2937;
}

.prm-card--active .prm-card-points {
  color: #ffffff;
}

.prm-card-price {
  margin-top: 8rpx;
  font-size: 28rpx;
  font-weight: 800;
  color: #1f2937;
}

.prm-card-price-row {
  margin-top: 8rpx;
  display: flex;
  flex-direction: row;
  align-items: baseline;
  justify-content: center;
  gap: 8rpx;
}

.prm-card--active .prm-card-price {
  color: #ffffff;
}

.prm-card-origin {
  margin-top: 0;
  font-size: 20rpx;
  color: #9ca3af;
  text-decoration: line-through;
}

.prm-card--active .prm-card-origin {
  color: rgba(255, 255, 255, 0.55);
}

.prm-agreement {
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: center;
  gap: 12rpx;
  margin: 24rpx 0 20rpx;
  padding: 0 12rpx;
  box-sizing: border-box;
}

.prm-check {
  width: 24rpx;
  height: 24rpx;
  border-radius: 50%;
  border: 2rpx solid rgba(107, 114, 128, 1);
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: transparent;
  box-sizing: border-box;
}

.prm-check--on {
  border-color: rgba(107, 114, 128, 1);
  background: transparent;
}

.prm-check-tick {
  color: rgba(107, 114, 128, 1);
  font-size: 16rpx;
  font-weight: 800;
  line-height: 1;
}

.prm-agreement-text {
  font-size: 22rpx;
  color: #6b7280;
  line-height: 1.5;
  text-align: center;
}

.prm-buy-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 670rpx;
  height: 114rpx;
  margin: 0 auto;
  padding: 0 16rpx;
  border: 0;
  border-radius: 36rpx;
  background-color: rgba(255, 241, 226, 1);
  box-sizing: border-box;
}

.prm-buy-btn::after {
  border: 0;
}

.prm-buy-btn-inner {
  display: flex;
  flex-direction: row;
  align-items: baseline;
  justify-content: center;
  flex-wrap: wrap;
  gap: 6rpx 10rpx;
  max-width: 100%;
}

.prm-buy-btn-plain {
  color: #1f2937;
  font-size: 32rpx;
  font-weight: 700;
  text-align: center;
}

.prm-buy-btn-strong {
  color: #1f2937;
  font-size: 32rpx;
  font-weight: 700;
}

.prm-buy-btn-sub {
  color: #1f2937;
  font-size: 24rpx;
  font-weight: 400;
}
</style>
