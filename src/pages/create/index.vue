<template>
  <view class="page create-page">
    <view class="hero">
      <text class="title">数字人视频</text>
      <text class="subtitle">创建数字形象并开始制作内容</text>
    </view>

    <YokeTabBar active-key="create" />
  </view>
</template>

<script>
import YokeTabBar from '@/components/YokeTabBar.vue'

export default {
  name: 'CreatePage',
  components: {
    YokeTabBar
  }
}
</script>

<style scoped>
.page {
  min-height: 100vh;
  padding: 80rpx 32rpx 180rpx;
  background: linear-gradient(180deg, #fff7ed 0%, #f7f7f7 62%, #f4f4f4 100%);
  box-sizing: border-box;
}

.hero {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 480rpx;
  border-radius: 40rpx;
  background: #ffffff;
}

.title {
  color: #292929;
  font-size: 42rpx;
  font-weight: 700;
}

.subtitle {
  margin-top: 18rpx;
  color: #999999;
  font-size: 26rpx;
}
</style>
