<template>
  <view class="tool-section">
    <SectionTitle :title="title" />

    <!-- 默认一屏约 3 个入口宽度，横向滑动查看全部 -->
    <scroll-view
      v-if="tools.length"
      class="tool-scroll"
      scroll-x
      :show-scrollbar="false"
      :enable-flex="true"
    >
      <view class="tool-row">
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
    </scroll-view>

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
/* 与首页顶区一致：左右各 24rpx，3 列均分剩余宽度（约 226rpx/格） */
$tool-side-pad: 24rpx;
$tool-gap: 12rpx;
/* (750 - 2*24 - 2*12) / 3 = 226 */
$tool-cell: 226rpx;

.tool-section {
  padding-bottom: 24rpx;
}

.tool-scroll {
  width: 100%;
  height: 218rpx;
  white-space: nowrap;
}

.tool-row {
  display: flex;
  flex-direction: row;
  align-items: flex-start;
  padding: 10rpx $tool-side-pad 0;
  box-sizing: border-box;
}

.tool-row .tool-item + .tool-item {
  margin-left: $tool-gap;
}

.tool-item {
  flex: 0 0 $tool-cell;
  width: $tool-cell;
  box-sizing: border-box;
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

.tool-cta {
  width: 560rpx;
  height: 42rpx;
  margin: 18rpx auto 0;
  padding: 0 24rpx;
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
