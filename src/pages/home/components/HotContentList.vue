<template>
  <view class="section">
    <view class="section__header">
      <view class="section__title">
        <text class="section__flame">今</text>
        <text>今日爆款内容</text>
      </view>
      <view class="section__more" @click="$emit('refresh')">
        <text class="section__reload">⟳</text>
        <text>换一批</text>
      </view>
    </view>
    <scroll-view scroll-x class="hot-scroll" show-scrollbar="false">
      <view class="hot-list">
        <view v-for="item in list" :key="item.id" class="hot-card">
          <image class="hot-card__image" :src="item.image" mode="aspectFill" />
          <view class="hot-card__body">
            <text class="hot-card__title">{{ item.title }}</text>
            <text class="hot-card__desc">{{ item.desc }}</text>
            <view class="hot-card__meta">
              <text class="hot-card__tag">{{ item.tag }}</text>
              <text class="hot-card__heat">❤ {{ item.heat }}</text>
            </view>
          </view>
        </view>
      </view>
    </scroll-view>
  </view>
</template>

<script setup>
defineProps({
  items: {
    type: Array,
    default: () => []
  }
})

defineEmits(['refresh'])
</script>

<style lang="scss" scoped>
.section {
  margin-top: 20rpx;
}

.section__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 18rpx;
  margin-bottom: 14rpx;
}

.section__title {
  display: flex;
  align-items: center;
  color: #553214;
  font-size: 28rpx;
  font-weight: 700;
}

.section__flame {
  color: #ff982d;
  margin-right: 6rpx;
}

.section__more {
  display: flex;
  align-items: center;
  color: #8f8f8f;
  font-size: 22rpx;
}

.section__reload {
  margin-right: 4rpx;
}

.hot-scroll {
  width: 100%;
  white-space: nowrap;
}

.hot-list {
  display: inline-flex;
  gap: 12rpx;
  padding: 0 18rpx 4rpx;
}

.hot-card {
  overflow: hidden;
  width: 214rpx;
  background: #ffffff;
  border-radius: 18rpx;
  box-shadow: 0 8rpx 20rpx rgba(255, 137, 30, 0.14);
}

.hot-card__image {
  display: block;
  width: 214rpx;
  height: 132rpx;
  background: #ffe1b7;
}

.hot-card__body {
  padding: 10rpx;
}

.hot-card__title {
  display: block;
  overflow: hidden;
  color: #3d3d3d;
  font-size: 22rpx;
  font-weight: 700;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.hot-card__desc {
  display: block;
  overflow: hidden;
  margin-top: 4rpx;
  color: #777777;
  font-size: 18rpx;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.hot-card__meta {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: 10rpx;
}

.hot-card__tag {
  padding: 3rpx 8rpx;
  color: #ff8b1f;
  font-size: 16rpx;
  background: #fff1dc;
  border-radius: 6rpx;
}

.hot-card__heat {
  color: #ff9b36;
  font-size: 17rpx;
}
</style>
