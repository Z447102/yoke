<template>
  <view v-if="show" class="vip-mask" @tap="emit('close')">
    <view class="vip-modal" @tap.stop>
      <view class="vip-modal-header">
        <text class="vip-modal-title">YOKE VIP</text>
        <view class="vip-modal-highlight">
          <view class="vip-highlight-inner">
            <text class="vip-highlight-points">628 点数/月</text>
            <text class="vip-highlight-desc">最多生成2000张图片60个视频</text>
          </view>
          <text class="vip-highlight-coin" aria-hidden="true">🪙</text>
        </view>
      </view>

      <view class="vip-modal-body">
        <view
          class="vip-plan-card"
          :class="{ 'vip-plan-card--active': selectedPlan === 'month' }"
          @tap="selectedPlan = 'month'"
        >
          <view class="vip-plan-card-head">
            <text class="vip-plan-name">连续包月首月</text>
            <view class="vip-discount-tag">6折</view>
          </view>
          <text class="vip-plan-price">¥41</text>
          <text class="vip-plan-renew">次月起¥69/月</text>
        </view>

        <view
          class="vip-plan-card vip-plan-card--annual"
          :class="{ 'vip-plan-card--active': selectedPlan === 'year' }"
          @tap="selectedPlan = 'year'"
        >
          <view class="vip-plan-card-head">
            <text class="vip-plan-name">连续包年首年</text>
            <view class="vip-discount-tag">6折</view>
          </view>
          <text class="vip-plan-price">¥399</text>
          <text class="vip-plan-renew">首年约¥33/月 · 次年¥659/年续费</text>
        </view>

        <view class="vip-agreement" @tap="agreed = !agreed">
          <view class="vip-agreement-check" :class="{ checked: agreed }">
            <text v-if="agreed" class="vip-agreement-tick">✓</text>
          </view>
          <text class="vip-agreement-text">已阅读并同意《有客付费协议》(含自动续费条款)</text>
        </view>

        <button class="vip-open-btn" @tap="handleConfirm">立即开通 享首月6折</button>
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref, watch } from 'vue'

const props = defineProps({
  show: { type: Boolean, default: false }
})

const emit = defineEmits(['close', 'confirm'])

const selectedPlan = ref('month')
const agreed = ref(false)

watch(
  () => props.show,
  (visible) => {
    if (visible) {
      selectedPlan.value = 'month'
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
  emit('confirm', { plan: selectedPlan.value })
}
</script>

<style lang="scss" scoped>
.vip-mask {
  position: fixed;
  inset: 0;
  z-index: 50;
  background: rgba(0, 0, 0, 0.55);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 40rpx 36rpx;
  box-sizing: border-box;
}

.vip-modal {
  width: 100%;
  max-width: 640rpx;
  max-height: 88vh;
  overflow: hidden;
  border-radius: 28rpx;
  background: #ffffff;
}

.vip-modal-header {
  padding: 36rpx 28rpx 32rpx;
  background: linear-gradient(145deg, #ff9a3d 0%, #ff7a2e 45%, #ff9835 100%);
}

.vip-modal-title {
  display: block;
  color: #ffffff;
  font-size: 40rpx;
  font-weight: 800;
  letter-spacing: 2rpx;
  text-align: center;
  margin-bottom: 28rpx;
}

.vip-modal-highlight {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16rpx;
  padding: 24rpx 22rpx;
  border-radius: 16rpx;
  background: #3d4450;
}

.vip-highlight-inner {
  flex: 1;
  min-width: 0;
}

.vip-highlight-points {
  display: block;
  color: #ffffff;
  font-size: 36rpx;
  font-weight: 800;
  line-height: 1.25;
}

.vip-highlight-desc {
  display: block;
  margin-top: 10rpx;
  color: rgba(255, 255, 255, 0.82);
  font-size: 22rpx;
  line-height: 1.45;
}

.vip-highlight-coin {
  font-size: 56rpx;
  line-height: 1;
  flex-shrink: 0;
}

.vip-modal-body {
  padding: 28rpx 24rpx calc(28rpx + env(safe-area-inset-bottom));
  background: linear-gradient(180deg, #fff8f4 0%, #ffffff 28%);
}

.vip-plan-card {
  position: relative;
  margin-bottom: 20rpx;
  padding: 24rpx 22rpx 22rpx;
  border-radius: 18rpx;
  border: 2rpx solid transparent;
  background: #ffffff;
  box-sizing: border-box;
}

.vip-plan-card--annual {
  background: #faf4ef;
}

.vip-plan-card--active {
  border-color: #1f2933;
  background: #ffffff;
}

.vip-plan-card--annual.vip-plan-card--active {
  border-color: #1f2933;
  background: #faf4ef;
}

.vip-plan-card-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12rpx;
  margin-bottom: 16rpx;
}

.vip-plan-name {
  flex: 1;
  color: #1f2933;
  font-size: 26rpx;
  font-weight: 700;
}

.vip-discount-tag {
  flex-shrink: 0;
  padding: 4rpx 14rpx;
  border-radius: 8rpx;
  background: linear-gradient(90deg, #ff9a3d 0%, #ff7a2e 100%);
  color: #ffffff;
  font-size: 22rpx;
  font-weight: 700;
}

.vip-plan-price {
  display: block;
  color: #1f2933;
  font-size: 48rpx;
  font-weight: 800;
  line-height: 1.1;
}

.vip-plan-renew {
  display: block;
  margin-top: 10rpx;
  color: #8b9499;
  font-size: 22rpx;
}

.vip-agreement {
  display: flex;
  align-items: flex-start;
  gap: 14rpx;
  margin: 28rpx 0 24rpx;
}

.vip-agreement-check {
  width: 34rpx;
  height: 34rpx;
  margin-top: 4rpx;
  border-radius: 50%;
  border: 2rpx solid #c5cad3;
  background: #ffffff;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
}

.vip-agreement-check.checked {
  border-color: #ff9835;
  background: #fff3e6;
}

.vip-agreement-tick {
  color: #ff9835;
  font-size: 22rpx;
  font-weight: 800;
}

.vip-agreement-text {
  flex: 1;
  color: #5d6672;
  font-size: 22rpx;
  line-height: 1.55;
}

.vip-open-btn {
  width: 100%;
  height: 96rpx;
  margin: 0;
  padding: 0;
  border: 0;
  border-radius: 999rpx;
  background: linear-gradient(90deg, #ffc98f 0%, #ff9835 100%);
  color: #ffffff;
  font-size: 30rpx;
  font-weight: 700;
  line-height: 96rpx;
}

.vip-open-btn::after {
  border: 0;
}
</style>
