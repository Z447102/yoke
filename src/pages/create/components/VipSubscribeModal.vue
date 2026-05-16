<template>
  <!-- 一键成片 · VIP 充值：首次开通 / 非首次开通 -->
  <view v-if="show" class="vip-mask" @tap="emit('close')">
    <view class="vip-modal" :style="vipModalShellStyle" @tap.stop>
      <!-- 背景大图：使用 image 以兼容小程序真机渲染差异 -->
      <image
        class="vip-modal-bg"
        :src="vipModalFullBg"
        mode="aspectFill"
        aria-hidden="true"
      />
      <view class="vip-modal-header">
        <view v-if="showDrag" class="vip-modal-drag" aria-hidden="true" />
        <view v-if="showClose" class="vip-modal-close" aria-label="关闭" @tap="emit('close')">
          <text class="vip-modal-close__x">×</text>
        </view>
        <image
          class="vip-modal-title-img"
          :src="vipModalTitleImg"
          mode="widthFix"
          aria-label="有客VIP"
        />
        <view class="vip-modal-highlight">
          <image
            class="vip-highlight-bg"
            :src="vipHighlight200PointsBg"
            mode="scaleToFill"
            aria-hidden="true"
          />
          <view class="vip-highlight-inner">
            <view class="vip-highlight-points-row">
              <text v-if="highlightPoints" class="vip-highlight-points">
                <text class="vip-highlight-points-num">{{ highlightPoints }}</text>
                送点数/月</text>
              <image
                v-if="highlightPoints"
                class="vip-highlight-points-icon"
                :src="vipHighlightPointsCoin"
                mode="aspectFit"
                aria-hidden="true"
              />
            </view>
            <text class="vip-highlight-desc">最多生成1000张图片10个视频</text>
          </view>
        </view>
      </view>

      <view class="vip-modal-body">
        <image
          class="vip-modal-body-bg"
          :src="vipModalBodyTrayBg"
          mode="aspectFill"
          aria-hidden="true"
        />
        <view class="vip-modal-body-content">
          <view v-if="productsLoading" class="vip-products-state">VIP 商品加载中...</view>
          <view v-else-if="productsError" class="vip-products-state">{{ productsError }}</view>
          <block v-else>
            <block
              v-for="(product, index) in vipProducts"
              :key="productKey(product, index)"
            >
              <view
                class="vip-plan-row"
                :class="{
                  'vip-plan-row--active': selectedProductIndex === index
                }"
                @tap="selectProduct(index)"
              >
                <view class="vip-plan-row__left">
                  <view class="vip-plan-row__title-line">
                    <text class="vip-plan-row__name">{{ productTitle(product) }}</text>
                    <view
                      v-if="productTag(product)"
                      class="vip-tag"
                    >
                      {{ productTag(product) }}
                    </view>
                  </view>
                  <text v-if="productSub(product)" class="vip-plan-row__sub">{{ productSub(product) }}</text>
                </view>
                <view class="vip-plan-row__price-wrap">
                  <text class="vip-plan-row__price-symbol">¥</text>
                  <text class="vip-plan-row__price-num">{{ productPrice(product) }}</text>
                </view>
              </view>
            </block>
            <view v-if="!vipProducts.length" class="vip-products-state">暂无可购买的 VIP 商品</view>
          </block>

          <view class="vip-agreement" @tap="agreed = !agreed">
            <view class="vip-agreement-check" :class="{ checked: agreed }">
              <text v-if="agreed" class="vip-agreement-tick">✓</text>
            </view>
            <text class="vip-agreement-text">{{ agreementLabel }}</text>
          </view>

          <button
            class="vip-open-btn"
            :class="{ 'vip-open-btn--disabled': !canConfirm }"
            :disabled="!canConfirm"
            @tap="handleConfirm"
          >
            {{ ctaLabel }}
          </button>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup>
import { StaticPath } from '@/config'
import { listVipProducts } from '@/api/vip'
/**
 * 事件：close | confirm({ plan, variant, product, productId })
 */
import { computed, ref, watch } from 'vue'
const vipModalFullBg = `${StaticPath}create/vip-modal-full-bg.png`
const vipModalTitleImg = `${StaticPath}create/vip-modal-title-youke-vip.png`
const vipHighlight200PointsBg = `${StaticPath}create/vip-highlight-200-points-bg.png`
const vipHighlightPointsCoin = `${StaticPath}create/vip-highlight-points-coin.png`
const vipModalBodyTrayBg = `${StaticPath}create/vip-modal-body-tray-bg.png`

const props = defineProps({
  show: { type: Boolean, default: false },
  /** 是否显示顶部拖拽条 */
  showDrag: { type: Boolean, default: true },
  /** 是否显示关闭按钮 */
  showClose: { type: Boolean, default: true },
  /** 兼容旧调用；实际展示由 VIP 商品列表接口返回的首开状态决定 */
  variant: {
    type: String,
    default: '',
    validator: (v) => ['', 'continuous', 'first_time_once', 'standard_once'].includes(v)
  },
  /** 兼容旧页面传参，组件展示始终以接口请求结果为准 */
  vipProducts: { type: Array, default: () => [] }
})

const emit = defineEmits(['close', 'confirm', 'aux-buy'])

const selectedProductIndex = ref(0)
const agreed = ref(false)
const vipProducts = ref([])
const productsLoading = ref(false)
const productsError = ref('')
let productsRequestSeq = 0

const selectedProduct = computed(() => vipProducts.value[selectedProductIndex.value] || null)
const selectedProductFirstOpen = computed(() =>
  isFirstOpenProduct(selectedProduct.value)
)
const currentVariant = computed(() =>
  selectedProductFirstOpen.value ? 'first_time_once' : 'standard_once'
)
const highlightPoints = computed(() => {
  const points = Number(selectedProduct.value?.monthlyGrantPoints)
  return Number.isFinite(points) && points > 0 ? points : ''
})

const ctaLabel = computed(() => {
  const savedPrice = productSavedPrice(selectedProduct.value)
  if (!selectedProductFirstOpen.value || !savedPrice) return '立即开通'
  const unit = isYearProduct(selectedProduct.value) ? '首年' : '首月'
  return `立即开通 ${unit}立省¥${savedPrice}`
})

const agreementLabel = computed(() => '已阅读并同意《有客付费协议》')

const canConfirm = computed(
  () =>
    !productsLoading.value &&
    !productsError.value &&
    Boolean(selectedProduct.value) &&
    Boolean(productPrice(selectedProduct.value))
)

/** 整弹窗底图（上圆角与抽屉一致） */
const vipModalShellStyle = {
  backgroundImage: `url(${vipModalFullBg})`,
  backgroundSize: 'cover',
  backgroundPosition: 'center top',
  backgroundRepeat: 'no-repeat',
  backgroundColor: 'transparent'
}

function selectProduct(index) {
  selectedProductIndex.value = index
}

function productKey(product, index) {
  return String(product?.productId ?? product?.productCode ?? product?.id ?? index)
}

function productPeriodMonths(product) {
  const numericFields = [
    product?.durationMonth,
    product?.durationMonths,
    product?.vipDurationMonths,
    product?.monthCount,
    product?.months
  ]
  const numeric = numericFields
    .map((value) => Number(value))
    .find((value) => Number.isFinite(value) && value > 0)
  if (numeric) return numeric

  const text = [
    product?.productCode,
    product?.name,
    product?.title,
    product?.productName,
    product?.period,
    product?.duration
  ]
    .filter((value) => value != null)
    .join(' ')
    .toLowerCase()
  if (/12\s*(month|个月|月)/.test(text) || /1\s*(year|年)/.test(text)) return 12
  if (/1\s*(month|个月|月)/.test(text)) return 1
  return 0
}

function isYearProduct(product) {
  const months = productPeriodMonths(product)
  if (months) return months >= 12
  const text = [
    product?.productCode,
    product?.name,
    product?.title,
    product?.productName
  ]
    .filter((value) => value != null)
    .join(' ')
    .toLowerCase()
  return ['year', 'yearly', 'annual', 'vip_year', 'vip_yearly', '年'].some((word) =>
    text.includes(word)
  )
}

function productTitle(product) {
  const title = product?.name || product?.productName || product?.title
  if (title) {
    return isFirstOpenProduct(product) && !String(title).startsWith('首次开通')
      ? `首次开通${title}`
      : title
  }
  const periodName = isYearProduct(product) ? '年VIP' : '月VIP'
  return isFirstOpenProduct(product) ? `首次开通${periodName}` : `开通${periodName}`
}

function productSub(product) {
  const originalPrice = productOriginalPrice(product)
  if (!isFirstOpenProduct(product) || !originalPrice) return ''
  return isYearProduct(product)
    ? `次年恢复原价¥${originalPrice}/年`
    : `次月恢复原价¥${originalPrice}/月`
}

function productTag(product) {
  if (!isFirstOpenProduct(product)) return ''
  return discountLabel(product?.vipFirstDiscountRate)
}

function productOriginalPrice(product) {
  return amountToYuan(product?.priceAmount)
}

function productPrice(product) {
  if (!product) return ''
  const originalPrice = productOriginalPrice(product)
  const firstOpenPrice = amountToYuan(product.firstOpenPriceAmount)
  const payPrice = amountToYuan(product.payAmount)
  return isFirstOpenProduct(product)
    ? firstOpenPrice || payPrice || originalPrice
    : payPrice || originalPrice
}

function productSavedPrice(product) {
  const originalPrice = Number(productOriginalPrice(product))
  const price = Number(productPrice(product))
  if (!Number.isFinite(originalPrice) || !Number.isFinite(price)) return 0
  return Math.max(0, Number((originalPrice - price).toFixed(2)))
}

function amountToYuan(amount) {
  const n = Number(amount)
  if (!Number.isFinite(n) || n <= 0) return ''
  const yuan = n / 100
  return Number.isInteger(yuan) ? yuan : Number(yuan.toFixed(2))
}

function discountLabel(rate) {
  const n = Number(rate)
  if (!Number.isFinite(n) || n <= 0) return ''
  return `${Number((n / 10).toFixed(1))}折`
}

function isFirstOpenProduct(product) {
  if (!product || typeof product !== 'object') return false
  if (product.firstOpen != null) return Boolean(product.firstOpen)
  if (product.firstDiscountApplied != null) return Boolean(product.firstDiscountApplied)

  const originalPrice = Number(product.priceAmount)
  const firstOpenPrice = Number(product.firstOpenPriceAmount)
  return Number.isFinite(originalPrice) && Number.isFinite(firstOpenPrice) && firstOpenPrice > 0 && firstOpenPrice < originalPrice
}

async function loadVipProducts() {
  const requestSeq = ++productsRequestSeq
  productsLoading.value = true
  productsError.value = ''
  try {
    const products = await listVipProducts()
    if (requestSeq !== productsRequestSeq) return
    vipProducts.value = Array.isArray(products) ? products : []
    selectedProductIndex.value = 0
  } catch (_) {
    if (requestSeq !== productsRequestSeq) return
    vipProducts.value = []
    productsError.value = 'VIP 商品加载失败，请稍后重试'
  } finally {
    if (requestSeq === productsRequestSeq) {
      productsLoading.value = false
    }
  }
}

watch(
  () => props.show,
  (visible) => {
    if (visible) {
      selectedProductIndex.value = 0
      agreed.value = false
      loadVipProducts()
    }
  },
  { immediate: true }
)

/**
 * 处理：handleConfirm
 */
function handleConfirm() {
  if (!selectedProduct.value) {
    uni.showToast({
      title: productsError.value || '暂无可购买的 VIP 商品',
      icon: 'none'
    })
    return
  }
  if (!agreed.value) {
    uni.showToast({
      title: '请先阅读并同意付费协议',
      icon: 'none'
    })
    return
  }
  emit('confirm', {
    plan: isYearProduct(selectedProduct.value) ? 'year' : 'month',
    variant: currentVariant.value,
    product: selectedProduct.value,
    productId: selectedProduct.value?.productId
  })
}
</script>

<style lang="scss" scoped>
.vip-mask {
  position: fixed;
  inset: 0;
  z-index: 120;
  background: rgba(0, 0, 0, 0.55);
  display: flex;
  align-items: flex-end;
  justify-content: center;
  box-sizing: border-box;
  padding: 0;
}

.vip-modal {
  position: relative;
  width: 100%;
  max-height: 88vh;
  overflow-x: hidden;
  overflow-y: auto;
  border-radius: 60rpx 60rpx 0rpx 0rpx;
  box-sizing: border-box;
  animation: vip-sheet-in 0.28s ease-out;
  scrollbar-width: none;
  -ms-overflow-style: none;
}

.vip-modal-bg {
  position: absolute;
  inset: 0;
  z-index: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
}

.vip-modal::-webkit-scrollbar {
  display: none;
  width: 0;
  height: 0;
  background: transparent;
}

@keyframes vip-sheet-in {
  from {
    transform: translateY(100%);
    opacity: 0.96;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}

.vip-modal-header {
  position: relative;
  padding: 12rpx 28rpx 0;
  box-sizing: border-box;
}

.vip-highlight-bg {
  position: absolute;
  inset: 0;
  z-index: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
}

.vip-modal-drag {
  width: 72rpx;
  height: 8rpx;
  margin: 8rpx auto 16rpx;
  border-radius: 999rpx;
  background: rgba(255, 255, 255, 0.5);
}

.vip-modal-close {
  position: absolute;
  top: 20rpx;
  right: 24rpx;
  z-index: 2;
  width: 56rpx;
  height: 56rpx;
  display: flex;
  align-items: center;
  justify-content: center;
}

.vip-modal-close__x {
  color: #ffffff;
  font-size: 44rpx;
  font-weight: 300;
  line-height: 1;
}

.vip-modal-title-img {
  display: block;
  width: 200rpx;
  height: 64rpx;
  margin: 0 auto 28rpx;
}

.vip-modal-highlight {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: stretch;
  justify-content: center;
  width: 622rpx;
  height: 146rpx;
  margin: 0 auto;
  padding: 20rpx 28rpx;
  border-radius: 40rpx 40rpx 0rpx 0rpx;
  overflow: hidden;
  box-sizing: border-box;
}

.vip-highlight-inner {
  position: relative;
  z-index: 1;
  width: 100%;
  min-width: 0;
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.vip-highlight-points-row {
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: flex-start;
  gap: 12rpx;
}

.vip-highlight-points {
  color: #ffffff;
  font-size: 28rpx;
  font-weight: 400;

  .vip-highlight-points-num {
    text-shadow: 2rpx 4rpx 4rpx rgba(0, 0, 0, 0.4);
    font-size: 48rpx;
    font-width: 900;
  }
}

.vip-highlight-points-icon {
  width: 48rpx;
  height: 48rpx;
  flex-shrink: 0;
  display: block;
}

.vip-highlight-desc {
  display: block;
  margin-top: 8rpx;
  color: rgba(255, 255, 255, 0.82);
  font-size: 24rpx;
  letter-spacing: 1rpx;
}

.vip-modal-body {
  position: relative;
  border-radius: 60rpx 60rpx 0rpx 0rpx;
  padding: 0;
  box-sizing: border-box;
  overflow: hidden;
}

.vip-modal-body-bg {
  position: absolute;
  left: 0;
  top: 0;
  width: 100%;
  height: 100%;
  z-index: 0;
  pointer-events: none;
}

.vip-modal-body-content {
  position: relative;
  z-index: 1;
  padding: 28rpx 24rpx calc(28rpx + constant(safe-area-inset-bottom));
  padding: 28rpx 24rpx calc(28rpx + env(safe-area-inset-bottom));
  box-sizing: border-box;
}

.vip-plan-row {
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  gap: 16rpx;
  margin-bottom: 20rpx;
  padding: 30rpx 40rpx 24rpx;
  border-radius: 24rpx;
  background-color: rgba(255,255,255,0.63);
  box-sizing: border-box;
  border: 1rpx solid rgba(255,255,255,1);
}

.vip-plan-row--cream {
  border: 1rpx solid rgba(31,41,55,1);
}

.vip-plan-row--active {
  border-color: #1f2933;
  background-color: rgba(255,255,255,1);
}

.vip-plan-row__left {
  flex: 1;
  min-width: 0;
}

.vip-plan-row__title-line {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 10rpx;
  margin-bottom: 8rpx;
}

.vip-plan-row__name {
  color: #1F2937;
  font-size: 30rpx;
  letter-spacing: 1rpx;
  font-weight: 600;
}

.vip-tag {
  flex-shrink: 0;
  padding: 4rpx 12rpx;
  border-radius: 12rpx;
  background: linear-gradient(180deg, rgba(255,197,129,1) 0%,rgba(255,148,50,1) 100%);
  color: #ffffff;
  font-size: 20rpx;
  font-weight: 700;
}

/** 7.5折 + 送2000点 合并标签（固定 192×30rpx） */
.vip-tag--discount-points {
  width: 192rpx;
  height: 30rpx;
  margin-right: 20rpx;
  padding: 0;
  border-radius: 8rpx;
  box-sizing: border-box;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(
    180deg,
    rgba(255, 197, 129, 1) 0%,
    rgba(255, 148, 50, 1) 100%
  );
  font-size: 18rpx;
  font-weight: 700;
  line-height: 1;
  white-space: nowrap;
}

.vip-plan-row__sub {
  display: block;
  color: rgba(107,114,128,1);
  font-size: 24rpx;
  letter-spacing: 1rpx;
}

.vip-plan-row__price-wrap {
  flex-shrink: 0;
  display: flex;
  flex-direction: row;
  align-items: baseline;
  gap: 2rpx;
  color: #1f2933;
}

/** 货币符号：常规字重（不加粗） */
.vip-plan-row__price-symbol {
  font-size: 30rpx;
  font-weight: 400;
  line-height: 1;
}

/** 金额数字：加粗 */
.vip-plan-row__price-num {
  font-size: 44rpx;
  font-weight: 900;
  line-height: 1;
}

.vip-products-state {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 184rpx;
  margin-bottom: 20rpx;
  color: #8b9499;
  font-size: 26rpx;
  line-height: 1.5;
  text-align: center;
  background: #ffffff;
  border-radius: 18rpx;
}

.vip-agreement {
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: center;
  gap: 10rpx;
  margin: 24rpx 0 22rpx;
  padding: 0 8rpx;
  box-sizing: border-box;
}

.vip-agreement-check {
  width: 24rpx;
  height: 24rpx;
  margin-top: 0;
  border-radius: 50%;
  border: 2rpx solid #c5cad3;
  background: #ffffff;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  box-sizing: border-box;
}

.vip-agreement-check.checked {
  border-color: #ff9835;
  background: #fff3e6;
}

.vip-agreement-tick {
  color: #ff9835;
  font-size: 16rpx;
  font-weight: 800;
  line-height: 1;
}

.vip-agreement-text {
  flex: 0 1 auto;
  max-width: 100%;
  color: #5d6672;
  font-size: 22rpx;
  line-height: 1.55;
  text-align: left;
}

.vip-open-btn {
  display: block;
  width: 670rpx;
  height: 114rpx;
  margin: 0 auto;
  padding: 0;
  border: 0;
  border-radius: 36rpx;
  background: linear-gradient(
    180deg,
    rgba(255, 197, 129, 1) 0%,
    rgba(255, 148, 50, 1) 100%
  );
  color: rgba(31, 41, 55, 1);
  font-size: 30rpx;
  font-family: OPPOSans-medium, 'PingFang SC', 'Microsoft YaHei', sans-serif;
  font-weight: 500;
  line-height: 114rpx;
}

.vip-open-btn::after {
  border: 0;
}

.vip-open-btn--disabled {
  opacity: 0.55;
}
</style>
