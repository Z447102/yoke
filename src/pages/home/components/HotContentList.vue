<template>
  <view class="section">
    <view class="section__header">
      <view class="section__title">
        <text class="section__flame">♨</text>
        <text>今日爆款内容</text>
      </view>
      <view class="section__more" @tap="$emit('refresh')">
        <text class="section__reload">⟳</text>
        <text>换一批</text>
      </view>
    </view>
    <scroll-view scroll-x class="hot-scroll" :show-scrollbar="false">
      <view class="hot-list">
        <view v-for="item in list" :key="item.id" class="hot-card">
          <view class="hot-card__image-wrap">
            <image class="hot-card__image" :src="item.image" mode="aspectFill" />
          </view>
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
  list: {
    type: Array,
    default: () => []
  }
})

defineEmits(['refresh'])
</script>

<style lang="scss" scoped>
.section {
  margin-top: 18rpx;
}

.section__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 4rpx;
  margin-bottom: 12rpx;
}

.section__title {
  display: flex;
  align-items: center;
  color: #553214;
  font-size: 27rpx;
  font-weight: 700;
}

.section__flame {
  color: #ff982d;
  margin-right: 8rpx;
  font-size: 26rpx;
}

.section__more {
  display: flex;
  align-items: center;
  color: #8f8f8f;
  font-size: 21rpx;
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
  gap: 14rpx;
  padding: 0 4rpx 6rpx;
}

.hot-card {
  overflow: hidden;
  width: 218rpx;
  background: #ffffff;
  border-radius: 18rpx;
  box-shadow: 0 8rpx 20rpx rgba(255, 137, 30, 0.14);
}

.hot-card__image-wrap {
  overflow: hidden;
  width: 218rpx;
  height: 132rpx;
  background: #ffe1b7;
}

.hot-card__image {
  display: block;
  width: 218rpx;
  height: 132rpx;
}

.hot-card__body {
  padding: 9rpx 10rpx 10rpx;
}

.hot-card__title {
  display: block;
  overflow: hidden;
  color: #3d3d3d;
  font-size: 21rpx;
  font-weight: 700;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.hot-card__desc {
  display: block;
  overflow: hidden;
  margin-top: 4rpx;
  color: #777777;
  font-size: 17rpx;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.hot-card__meta {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: 9rpx;
}

.hot-card__tag {
  padding: 3rpx 9rpx;
  color: #ff8b1f;
  font-size: 15rpx;
  background: #fff1dc;
  border-radius: 6rpx;
}

.hot-card__heat {
  color: #ff9b36;
  font-size: 17rpx;
}
</style>
