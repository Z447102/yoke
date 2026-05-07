<template>
  <!-- 一键成片 · VIP 充值：设计一连续订阅 / 设计二首购单次 / 设计三标准单次 -->
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
        <view class="vip-modal-drag" aria-hidden="true" />
        <view class="vip-modal-close" aria-label="关闭" @tap="emit('close')">
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
              <text class="vip-highlight-points">200 送点数/月</text>
              <image
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
        <!-- 设计一：连续包月 / 包年 -->
        <template v-if="variant === 'continuous'">
          <view
            class="vip-plan-row"
            :class="{ 'vip-plan-row--active': selectedPlan === 'month' }"
            @tap="selectedPlan = 'month'"
          >
            <view class="vip-plan-row__left">
              <view class="vip-plan-row__title-line">
                <text class="vip-plan-row__name">连续包月首月</text>
                <view class="vip-tag">6.8折</view>
              </view>
              <text class="vip-plan-row__sub">次月起¥60/月 · 可随时取消</text>
            </view>
            <view class="vip-plan-row__price-wrap">
              <text class="vip-plan-row__price-symbol">¥</text>
              <text class="vip-plan-row__price-num">41</text>
            </view>
          </view>

          <view
            class="vip-plan-row vip-plan-row--cream"
            :class="{ 'vip-plan-row--active': selectedPlan === 'year' }"
            @tap="selectedPlan = 'year'"
          >
            <view class="vip-plan-row__left">
              <view class="vip-plan-row__title-line">
                <text class="vip-plan-row__name">连续包年首年</text>
                <view class="vip-tag vip-tag--discount-points">7.5折送2000点</view>
              </view>
              <text class="vip-plan-row__sub">次年¥399/年续费 · 可随时取消</text>
            </view>
            <view class="vip-plan-row__price-wrap">
              <text class="vip-plan-row__price-symbol">¥</text>
              <text class="vip-plan-row__price-num">300</text>
            </view>
          </view>

          <view class="vip-once-links">
            <view class="vip-once-link" @tap.stop="emit('aux-buy', { kind: 'year-once' })">
              <view class="vip-once-link__label">
                <text class="vip-once-link__price">¥399</text>
                <text class="vip-once-link__rest"> 购买单年会员</text>
              </view>
              <image
                class="vip-once-link__arrow"
                :src="iconChevronRightLight"
                mode="aspectFit"
                aria-hidden="true"
              />
            </view>
            <view class="vip-once-link" @tap.stop="emit('aux-buy', { kind: 'month-once' })">
              <view class="vip-once-link__label">
                <text class="vip-once-link__price">¥60</text>
                <text class="vip-once-link__rest"> 购买单月会员</text>
              </view>
              <image
                class="vip-once-link__arrow"
                :src="iconChevronRightLight"
                mode="aspectFit"
                aria-hidden="true"
              />
            </view>
          </view>
        </template>

        <!-- 设计二：非连续 + 首次开通 -->
        <template v-else-if="variant === 'first_time_once'">
          <view
            class="vip-plan-row"
            :class="{ 'vip-plan-row--active': selectedPlan === 'month' }"
            @tap="selectedPlan = 'month'"
          >
            <view class="vip-plan-row__left">
              <view class="vip-plan-row__title-line">
                <text class="vip-plan-row__name">首次开通月VIP</text>
                <view class="vip-tag">6.8折</view>
              </view>
              <text class="vip-plan-row__sub">次月恢复原价¥60/月</text>
            </view>
            <view class="vip-plan-row__price-wrap">
              <text class="vip-plan-row__price-symbol">¥</text>
              <text class="vip-plan-row__price-num">41</text>
            </view>
          </view>

          <view
            class="vip-plan-row vip-plan-row--cream"
            :class="{ 'vip-plan-row--active': selectedPlan === 'year' }"
            @tap="selectedPlan = 'year'"
          >
            <view class="vip-plan-row__left">
              <view class="vip-plan-row__title-line">
                <text class="vip-plan-row__name">首次开通年VIP</text>
                <view class="vip-tag vip-tag--discount-points">7.5折送2000点</view>
              </view>
              <text class="vip-plan-row__sub">次年恢复原价¥399/年</text>
            </view>
            <view class="vip-plan-row__price-wrap">
              <text class="vip-plan-row__price-symbol">¥</text>
              <text class="vip-plan-row__price-num">300</text>
            </view>
          </view>
        </template>

        <!-- 设计三：非连续 + 非首购 -->
        <template v-else>
          <view
            class="vip-plan-row"
            :class="{ 'vip-plan-row--active': selectedPlan === 'month' }"
            @tap="selectedPlan = 'month'"
          >
            <view class="vip-plan-row__left">
              <text class="vip-plan-row__name">开通月VIP</text>
            </view>
            <view class="vip-plan-row__price-wrap">
              <text class="vip-plan-row__price-symbol">¥</text>
              <text class="vip-plan-row__price-num">60</text>
            </view>
          </view>

          <view
            class="vip-plan-row vip-plan-row--cream"
            :class="{ 'vip-plan-row--active': selectedPlan === 'year' }"
            @tap="selectedPlan = 'year'"
          >
            <view class="vip-plan-row__left">
              <text class="vip-plan-row__name">开通年VIP</text>
            </view>
            <view class="vip-plan-row__price-wrap">
              <text class="vip-plan-row__price-symbol">¥</text>
              <text class="vip-plan-row__price-num">399</text>
            </view>
          </view>
        </template>

        <view class="vip-agreement" @tap="agreed = !agreed">
          <view class="vip-agreement-check" :class="{ checked: agreed }">
            <text v-if="agreed" class="vip-agreement-tick">✓</text>
          </view>
          <text class="vip-agreement-text">{{ agreementLabel }}</text>
        </view>

        <button class="vip-open-btn" @tap="handleConfirm">{{ ctaLabel }}</button>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup>
/**
 * 事件：close | confirm({ plan, variant }) | aux-buy({ kind })
 */
import { computed, ref, watch } from 'vue'
import vipModalFullBg from '@/static/create/vip-modal-full-bg.png'
import vipModalTitleImg from '@/static/create/vip-modal-title-youke-vip.png'
import vipHighlight200PointsBg from '@/static/create/vip-highlight-200-points-bg.png'
import vipHighlightPointsCoin from '@/static/create/vip-highlight-points-coin.png'
import vipModalBodyTrayBg from '@/static/create/vip-modal-body-tray-bg.png'
import iconChevronRightLight from '@/static/mine/icon-chevron-right-light.svg'

const props = defineProps({
  show: { type: Boolean, default: false },
  /** 设计一：支持连续订阅；设计二：不支持连续且首购；设计三：不支持连续且非首购 */
  variant: {
    type: String,
    default: 'continuous',
    validator: (v) => ['continuous', 'first_time_once', 'standard_once'].includes(v)
  }
})

const emit = defineEmits(['close', 'confirm', 'aux-buy'])

const selectedPlan = ref('year')
const agreed = ref(false)

const ctaLabel = computed(() =>
  props.variant === 'standard_once' ? '立即开通' : '立即开通 首年立省¥99'
)

const agreementLabel = computed(() =>
  props.variant === 'continuous'
    ? '已阅读并同意《有客付费协议》(含自动续费条款)'
    : '已阅读并同意《有客付费协议》'
)

/** 整弹窗底图（上圆角与抽屉一致） */
const vipModalShellStyle = {
  backgroundImage: `url(${vipModalFullBg})`,
  backgroundSize: 'cover',
  backgroundPosition: 'center top',
  backgroundRepeat: 'no-repeat',
  backgroundColor: 'transparent'
}

watch(
  () => props.show,
  (visible) => {
    if (visible) {
      selectedPlan.value = 'year'
      agreed.value = false
    }
  }
)

function handleConfirm() {
  if (!agreed.value) {
    uni.showToast({
      title: '请先阅读并同意付费协议',
      icon: 'none'
    })
    return
  }
  emit('confirm', { plan: selectedPlan.value, variant: props.variant })
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
  font-size: 34rpx;
  font-weight: 900;
  line-height: 1.25;
}

.vip-highlight-points-icon {
  width: 48rpx;
  height: 48rpx;
  flex-shrink: 0;
  display: block;
}

.vip-highlight-desc {
  display: block;
  margin-top: 10rpx;
  color: rgba(255, 255, 255, 0.82);
  font-size: 22rpx;
  line-height: 1.45;
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
  padding: 22rpx 20rpx;
  border-radius: 18rpx;
  border: 2rpx solid transparent;
  background: #ffffff;
  box-sizing: border-box;
}

.vip-plan-row--cream {
  background: #faf4ef;
}

.vip-plan-row--active {
  border-color: #1f2933;
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
  color: #1f2933;
  font-size: 26rpx;
  font-weight: 700;
}

.vip-tag {
  flex-shrink: 0;
  padding: 4rpx 12rpx;
  border-radius: 8rpx;
  background: linear-gradient(90deg, #ff9a3d 0%, #ff7a2e 100%);
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
  color: #8b9499;
  font-size: 22rpx;
  line-height: 1.4;
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

.vip-once-links {
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  align-items: center;
  justify-content: center;
  gap: 32rpx;
  margin-bottom: 8rpx;
}

.vip-once-link {
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 4rpx;
  color: #1f2937;
  font-size: 28rpx;
  font-weight: 400;
}

.vip-once-link__label {
  display: flex;
  flex-direction: row;
  align-items: baseline;
  flex-wrap: nowrap;
}

.vip-once-link__price {
  font-weight: 700;
  color: #1f2937;
  font-size: 28rpx;
}

.vip-once-link__rest {
  font-weight: 400;
  color: #1f2937;
  font-size: 28rpx;
}

.vip-once-link__arrow {
  width: 30rpx;
  height: 30rpx;
  flex-shrink: 0;
  display: block;
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
</style>
