<template>
  <view class="section-title">
    <view class="title-wrap">
      <text class="mark"></text>
      <text class="title">{{ title }}</text>
    </view>
    <text class="action">{{ action }} ></text>
  </view>
</template>

<script>
export default {
  name: 'SectionTitle',
  props: {
    title: {
      type: String,
      required: true
    },
    action: {
      type: String,
      default: ''
    }
  }
}
</script>

<style lang="scss" scoped>
.section-title {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin: 26rpx 0 16rpx;
}

.title-wrap {
  display: flex;
  align-items: center;
}

.mark {
  width: 10rpx;
  height: 28rpx;
  margin-right: 10rpx;
  border-radius: 8rpx;
  background: #111111;
}

.title {
  color: #333333;
  font-size: 28rpx;
  font-weight: 700;
}

.action {
  color: #999999;
  font-size: 22rpx;
}
</style>
