<template>
  <!-- 登录占位：静默登录/手机号等见 docs §8，后续接真实页 -->
  <view class="placeholder-page">
    <text class="placeholder-title">登录</text>
    <text class="placeholder-desc">微信静默登录和手机号登录流程后续接入真实接口。</text>
  </view>
</template>

<style lang="scss" scoped>
.placeholder-page {
  min-height: 100vh;
  padding: 160rpx 48rpx;
  background: #f7f7f7;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.placeholder-title {
  color: #222;
  font-size: 42rpx;
  font-weight: 700;
}

.placeholder-desc {
  margin-top: 24rpx;
  color: #999;
  font-size: 26rpx;
  text-align: center;
  line-height: 1.6;
}
</style>
