<template>
  <view class="section-title">
    <view class="section-title__left">
      <text class="section-title__icon">{{ icon }}</text>
      <text class="section-title__text">{{ title }}</text>
      <text v-if="tag" class="section-title__tag">{{ tag }}</text>
    </view>
    <view v-if="moreText" class="section-title__more" @tap="$emit('more')">
      <text>{{ moreText }}</text>
      <text class="section-title__arrow">›</text>
    </view>
  </view>
</template>

<script setup>
defineProps({
  icon: {
    type: String,
    default: ''
  },
  title: {
    type: String,
    required: true
  },
  tag: {
    type: String,
    default: ''
  },
  moreText: {
    type: String,
    default: ''
  }
})

defineEmits(['more'])
</script>

<style lang="scss" scoped>
.section-title {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin: 28rpx 22rpx 14rpx;

  &__left {
    display: flex;
    align-items: center;
    min-width: 0;
  }

  &__icon {
    margin-right: 6rpx;
    font-size: 28rpx;
  }

  &__text {
    color: #222222;
    font-size: 30rpx;
    font-weight: 700;
  }

  &__tag {
    margin-left: 8rpx;
    color: #ff9a23;
    font-size: 20rpx;
  }

  &__more {
    display: flex;
    align-items: center;
    color: #999999;
    font-size: 22rpx;
  }

  &__arrow {
    margin-left: 4rpx;
    font-size: 28rpx;
  }
}
</style>
