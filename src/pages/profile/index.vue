<template>
  <view class="page-shell">
    <view class="placeholder">我的</view>
    <YokeTabBar active-key="profile" />
  </view>
</template>

<script>
import YokeTabBar from '@/components/YokeTabBar.vue'

export default {
  components: {
    YokeTabBar
  }
}
</script>

<style scoped>
.page-shell {
  min-height: 100vh;
  background: #f7f7f7;
  padding-bottom: calc(112rpx + env(safe-area-inset-bottom));
}

.placeholder {
  padding: 96rpx 32rpx;
  color: #333;
  font-size: 32rpx;
}
</style>
