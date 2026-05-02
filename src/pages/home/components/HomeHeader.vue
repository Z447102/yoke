<template>
  <view class="home-header">
    <view class="brand">
      <text class="brand-name">有客</text>
      <text class="brand-sub">YDKE</text>
    </view>
    <text class="date">4.22 星期三</text>
    <view class="capsule">
      <text class="dot">•••</text>
      <view class="circle"></view>
    </view>
  </view>
</template>

<style lang="scss" scoped>
.home-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 28rpx 24rpx 18rpx;
  color: #111;
}

.brand {
  display: flex;
  align-items: baseline;
  min-width: 150rpx;
}

.brand-name {
  font-size: 34rpx;
  font-weight: 800;
  letter-spacing: -2rpx;
}

.brand-sub {
  margin-left: 4rpx;
  font-size: 18rpx;
  font-weight: 700;
  color: #fff;
}

.date {
  font-size: 20rpx;
  font-weight: 600;
  color: rgba(255, 255, 255, 0.9);
}

.capsule {
  display: flex;
  align-items: center;
  justify-content: space-around;
  width: 104rpx;
  height: 46rpx;
  border-radius: 28rpx;
  background: rgba(255, 255, 255, 0.78);
}

.dot {
  margin-top: -8rpx;
  font-size: 24rpx;
  font-weight: 800;
  color: #111;
}

.circle {
  width: 18rpx;
  height: 18rpx;
  border: 4rpx solid #111;
  border-radius: 50%;
}
</style>
