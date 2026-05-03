<template>
  <view class="video-section">
    <SectionTitle title="视频创作" more-text="创作技巧" />

    <view class="creator-card">
      <view>
        <view class="creator-title">数字人创作</view>
        <view class="creator-count">作品 {{ stats.digitalHuman || 0 }}</view>
      </view>
      <view class="creator-action">
        <text class="pen">✎</text>
        <text>开始创作</text>
      </view>
      <view class="folder">▱</view>
    </view>

    <view class="video-actions">
      <view class="video-action">
        <view>图片转视频</view>
        <text>作品 {{ stats.imageToVideo || 0 }}</text>
        <text class="line-icon">〽</text>
      </view>
      <view class="video-action">
        <view>视频剪辑</view>
        <text>作品 {{ stats.videoEdit || 0 }}</text>
        <text class="line-icon">〽</text>
      </view>
    </view>
  </view>
</template>

<script setup>
import SectionTitle from './SectionTitle.vue'

defineProps({
  stats: {
    type: Object,
    default: () => ({})
  }
})
</script>

<style lang="scss" scoped>
.video-section {
  padding: 0 20rpx;
}

.creator-card {
  height: 116rpx;
  margin-top: 14rpx;
  padding: 22rpx 26rpx;
  border-radius: 28rpx;
  background: linear-gradient(135deg, #4b4b4b, #151515);
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: space-between;
  box-shadow: 0 14rpx 28rpx rgba(0, 0, 0, 0.12);
}

.creator-title {
  font-size: 28rpx;
  font-weight: 700;
}

.creator-count {
  margin-top: 12rpx;
  font-size: 22rpx;
}

.creator-action {
  min-width: 142rpx;
  height: 44rpx;
  padding: 0 20rpx;
  border: 2rpx solid rgba(255, 255, 255, 0.88);
  border-radius: 999rpx;
  font-size: 22rpx;
  display: flex;
  align-items: center;
  justify-content: center;
}

.creator-action .pen {
  margin-right: 6rpx;
}

.folder {
  width: 52rpx;
  height: 52rpx;
  border: 2rpx solid rgba(255, 255, 255, 0.5);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: rgba(255, 255, 255, 0.75);
}

.video-actions {
  margin-top: 18rpx;
  display: flex;
  flex-direction: row;
  align-items: stretch;
}

.video-action + .video-action {
  margin-left: 18rpx;
}

.video-action {
  position: relative;
  flex: 1;
  min-width: 0;
  min-height: 118rpx;
  padding: 22rpx;
  border-radius: 26rpx;
  color: #fff;
  background: linear-gradient(135deg, #ffb04d 0%, #ff8e24 100%);
  box-shadow: 0 12rpx 22rpx rgba(255, 147, 48, 0.22);
  overflow: hidden;
}

.video-action view {
  font-size: 27rpx;
  font-weight: 700;
}

.video-action text {
  display: block;
  margin-top: 14rpx;
  font-size: 22rpx;
}

.line-icon {
  position: absolute;
  right: 20rpx;
  bottom: 12rpx;
  width: 76rpx;
  height: 36rpx;
  border: 2rpx solid rgba(255, 255, 255, 0.7);
  border-radius: 999rpx;
  display: flex !important;
  align-items: center;
  justify-content: center;
  font-size: 24rpx !important;
  margin: 0 !important;
}
</style>
