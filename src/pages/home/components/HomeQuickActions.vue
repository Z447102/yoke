<template>
  <view class="quick-actions">
    <view class="quick-card" @tap="goToCreate">
      <view class="quick-icon">
        <image
          class="quick-icon__img quick-icon__img--create"
          :src="quickCreateIcon"
          mode="aspectFit"
          :lazy-load="false"
        />
      </view>
      <text>AI一键成片</text>
    </view>
    <view class="quick-card" @tap="handleClick('引流数据')">
      <view class="quick-icon">
        <image
          class="quick-icon__img"
          :src="quickDrainIcon"
          mode="aspectFit"
          :lazy-load="false"
        />
      </view>
      <text>引流数据</text>
    </view>
  </view>
</template>

<script setup>
import quickCreateIcon from '@/static/home/home-quick-create-icon.png'
import quickDrainIcon from '@/static/home/home-quick-drain-icon.png'

function goToCreate() {
  uni.navigateTo({
    url: '/pages/create/index'
  })
}

function handleClick(name) {
  uni.showToast({
    title: name,
    icon: 'none'
  })
}
</script>

<style lang="scss" scoped>
.quick-actions {
  display: flex;
  flex-direction: row;
  align-items: stretch;
  justify-content: space-between;
  padding: 50rpx 36rpx 20rpx;
}

.quick-card {
  width: 320rpx;
  height: 88rpx;
  min-width: 320rpx;
  box-sizing: border-box;
  display: flex;
  align-items: center;
  justify-content: flex-start;
  padding-left: 10rpx;
  border-radius: 44rpx;
  background-color: rgba(255, 241, 226, 0.8);
  border: 1rpx solid rgba(255, 255, 255, 0.5);
  color: rgba(31, 41, 55, 1);
}

.quick-card + .quick-card {
  margin-left: 0;
}

.quick-card text {
  font-size: 30rpx;
  color: rgba(31, 41, 55, 1);
  font-family: OPPOSans-medium, OPPOSans, -apple-system, sans-serif;
  letter-spacing: 3rpx;
}

.quick-icon {
  flex-shrink: 0;
  margin-right: 36rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 68rpx;
  height: 68rpx;
  border-radius: 50%;
  background: linear-gradient(
    180deg,
    rgba(255, 197, 129, 1) 0%,
    rgba(255, 148, 50, 1) 100%
  );
}

.quick-icon__img {
  width: 32rpx;
  height: 32rpx;
  display: block;
}

.quick-icon__img--create {
  width: 38rpx;
  height: 38rpx;
}
</style>
