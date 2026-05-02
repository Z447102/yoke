<template>
  <view class="quick-actions">
    <view class="quick-card" @tap="handleClick('AI 一键成片')">
      <view class="quick-icon">▣</view>
      <text>AI一键成片</text>
    </view>
    <view class="quick-card" @tap="handleClick('引流数据')">
      <view class="quick-icon">▥</view>
      <text>引流数据</text>
    </view>
  </view>
</template>

<script setup>
function handleClick(name) {
  uni.showToast({
    title: name,
    icon: 'none'
  })
}
</script>

<style lang="scss" scoped>
.quick-actions {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 18rpx;
  padding: 16rpx 20rpx;
}

.quick-card {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 16rpx;
  height: 74rpx;
  border-radius: 40rpx;
  background: linear-gradient(180deg, #fff4df 0%, #ffe7bd 100%);
  color: #7a4b16;
  font-size: 29rpx;
  font-weight: 700;
  box-shadow: 0 10rpx 18rpx rgba(255, 159, 46, 0.16);
}

.quick-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 42rpx;
  height: 42rpx;
  border-radius: 50%;
  background: #ff8b1f;
  color: #ffffff;
  font-size: 22rpx;
}
</style>
