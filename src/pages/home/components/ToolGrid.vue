<template>
  <view class="tool-section">
    <SectionTitle :title="title" />

    <view class="tool-grid">
      <view
        v-for="tool in tools"
        :key="tool.key"
        class="tool-item"
        @tap="$emit('select', tool)"
      >
        <view class="tool-icon">
          <text>{{ tool.icon }}</text>
          <view v-if="tool.badge" class="tool-badge">{{ tool.badge }}</view>
        </view>
        <text class="tool-name">{{ tool.name }}</text>
        <text class="tool-desc">{{ tool.desc }}</text>
      </view>
    </view>

    <view class="pager">
      <view class="pager-dot"></view>
    </view>

    <view class="tool-cta">
      <text>‹‹</text>
      <text>{{ ctaText }}</text>
      <text class="tool-cta__circle">○</text>
    </view>
  </view>
</template>

<script setup>
import SectionTitle from './SectionTitle.vue'

defineProps({
  title: {
    type: String,
    required: true
  },
  tools: {
    type: Array,
    default: () => []
  },
  ctaText: {
    type: String,
    default: ''
  }
})

defineEmits(['select'])
</script>

<style lang="scss" scoped>
.tool-section {
  padding-bottom: 24rpx;
}

.tool-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  row-gap: 22rpx;
  column-gap: 6rpx;
  margin: 10rpx 20rpx 0;
}

.tool-item {
  min-height: 118rpx;
  padding: 12rpx 4rpx 8rpx;
  border-radius: 20rpx;
  background: transparent;
  text-align: center;
}

.tool-icon {
  position: relative;
  width: 52rpx;
  height: 52rpx;
  margin: 0 auto 10rpx;
  border-radius: 16rpx;
  background: linear-gradient(180deg, #ffffff 0%, #f9f9f9 100%);
  color: #ff922f;
  font-size: 31rpx;
  line-height: 52rpx;
  box-shadow: 0 8rpx 22rpx rgba(20, 20, 20, 0.06);
}

.tool-badge {
  position: absolute;
  top: -8rpx;
  right: -12rpx;
  padding: 2rpx 8rpx;
  border-radius: 999rpx;
  background: #ff8e24;
  color: #ffffff;
  font-size: 15rpx;
  line-height: 1.2;
}

.tool-name {
  display: block;
  color: #3a3a3a;
  font-size: 20rpx;
  font-weight: 600;
  line-height: 1.2;
}

.tool-desc {
  display: block;
  margin-top: 6rpx;
  color: #b0b0b0;
  font-size: 14rpx;
  line-height: 1.2;
}

.pager {
  display: flex;
  justify-content: center;
  margin-top: 18rpx;
}

.pager-dot {
  width: 34rpx;
  height: 8rpx;
  border-radius: 999rpx;
  background: #ff9a31;
}

.tool-cta {
  width: 560rpx;
  height: 42rpx;
  margin: 18rpx auto 0;
  padding: 0 22rpx;
  border-radius: 999rpx;
  background: linear-gradient(90deg, #ff9831, #ffc760);
  color: #ffffff;
  font-size: 22rpx;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.tool-cta__circle {
  font-size: 28rpx;
}
</style>
