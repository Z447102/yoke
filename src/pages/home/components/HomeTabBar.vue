<template>
  <view class="home-tab-bar">
    <view class="tab-item" :class="{ active: current === 'home' }" @tap="goTo('/pages/home/index')">
      <text class="tab-icon">⌂</text>
    </view>
    <view class="tab-main" @tap="goTo('/pages/create/index')">
      <text class="tab-main-icon">人</text>
    </view>
    <view class="tab-item" :class="{ active: current === 'mine' }" @tap="goTo('/pages/mine/index')">
      <text class="tab-icon">♟</text>
    </view>
  </view>
</template>

<script setup>
defineProps({
  current: {
    type: String,
    default: 'home'
  }
})

function goTo(url) {
  const pages = getCurrentPages()
  const currentPage = pages[pages.length - 1]
  const currentRoute = currentPage ? `/${currentPage.route}` : ''

  if (currentRoute === url) {
    return
  }

  uni.redirectTo({ url })
}
</script>

<style lang="scss" scoped>
.home-tab-bar {
  position: fixed;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 20;
  height: calc(108rpx + env(safe-area-inset-bottom));
  padding: 0 76rpx env(safe-area-inset-bottom);
  background: rgba(247, 247, 247, 0.96);
  display: flex;
  align-items: center;
  justify-content: space-between;
  box-shadow: 0 -8rpx 24rpx rgba(0, 0, 0, 0.04);
}

.tab-item {
  width: 90rpx;
  height: 90rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #c8c8c8;
}

.tab-item.active {
  color: #ff9634;
}

.tab-icon {
  font-size: 44rpx;
  font-weight: 800;
}

.tab-main {
  width: 96rpx;
  height: 96rpx;
  margin-top: -42rpx;
  border: 8rpx solid #fff0d5;
  border-radius: 50%;
  background: linear-gradient(180deg, #ffc56c 0%, #ff982f 100%);
  color: #ffffff;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 10rpx 24rpx rgba(255, 148, 48, 0.28);
}

.tab-main-icon {
  font-size: 46rpx;
  font-weight: 800;
}
</style>
