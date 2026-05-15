<template>
  <view class="video-section">
    <view class="video-header">
      <view class="video-header__left">
        <image
          class="video-header__icon"
          :src="videoCreateTitleIcon"
          mode="aspectFit"
          :lazy-load="false"
        />
        <text class="video-header__title">视频创作</text>
      </view>
      <view class="video-header__more">
        <image
          class="video-header__tips-icon"
          :src="videoCreateTipsIcon"
          mode="aspectFit"
          :lazy-load="false"
        />
        <text>创作技巧</text>
        <image
          class="video-header__tips-arrow"
          :src="digitalMoreIcon"
          mode="aspectFit"
          :lazy-load="false"
        />
      </view>
    </view>

    <view class="creator-card">
      <view>
        <view class="creator-title">
          <text>数字人创作</text>
          <image
            class="creator-title__icon"
            :src="videoDigitalCreateIcon"
            mode="aspectFit"
            :lazy-load="false"
          />
        </view>
        <view class="work-count">
          <text class="work-count__label">作品</text>
          <text class="work-count__num">{{ stats.digitalHuman || 0 }}</text>
        </view>
      </view>
      <view class="creator-card__actions">
        <view class="creator-action">
          <image
            class="creator-action__icon"
            :src="videoCreateStartIcon"
            mode="aspectFit"
            :lazy-load="false"
          />
          <text>开始创作</text>
        </view>
        <view class="folder">
          <image
            class="folder__icon"
            :src="videoCreateFolderIcon"
            mode="aspectFit"
            :lazy-load="false"
          />
        </view>
      </view>
    </view>

    <view class="video-actions">
      <view class="video-action video-action--image-to-video">
        <view class="video-action__title">图片转视频</view>
        <view class="work-count">
          <text class="work-count__label">作品</text>
          <text class="work-count__num">{{ stats.imageToVideo || 0 }}</text>
        </view>
        <view class="line-icon">
          <view class="line-icon__img"></view>
        </view>
      </view>
      <view class="video-action video-action--video-edit">
        <view class="video-action__title">视频剪辑</view>
        <view class="work-count">
          <text class="work-count__label">作品</text>
          <text class="work-count__num">{{ stats.videoEdit || 0 }}</text>
        </view>
        <view class="line-icon">
          <view class="line-icon__img"></view>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup>
import { StaticPath } from '@/config'
const videoCreateTitleIcon = `${StaticPath}home/home-video-create-title-icon.png`
const videoCreateTipsIcon = `${StaticPath}home/home-video-create-tips-icon.png`
const videoCreateStartIcon = `${StaticPath}home/home-video-create-start-icon.png`
const videoDigitalCreateIcon = `${StaticPath}home/home-video-digital-create-icon.png`
const videoCreateFolderIcon = `${StaticPath}home/home-video-create-folder-icon.png`
const digitalMoreIcon = `${StaticPath}home/home-digital-more-icon.png`

defineProps({
  stats: {
    type: Object,
    default: () => ({})
  }
})
</script>

<style lang="scss" scoped>
.video-section {
  padding: 0 24rpx;
}

.video-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin: 28rpx 0 14rpx;
}

.video-header__left {
  display: flex;
  align-items: center;
  min-width: 0;
}

.video-header__icon {
  width: 36rpx;
  height: 36rpx;
  margin-right: 12rpx;
  flex-shrink: 0;
  display: block;
}

.video-header__title {
  color: #1f2937;
  font-size: 30rpx;
  font-weight: 600;
  font-family: OPPOSans-medium, OPPOSans, -apple-system, sans-serif;
}

.video-header__more {
  display: flex;
  align-items: center;
  color: #6b7280;
  font-size: 28rpx;
  font-family: OPPOSans-regular, OPPOSans, -apple-system, sans-serif;
}

.video-header__tips-icon {
  width: 30rpx;
  height: 30rpx;
  margin-right: 8rpx;
  flex-shrink: 0;
  display: block;
}

.video-header__tips-arrow {
  width: 30rpx;
  height: 30rpx;
  margin-left: 6rpx;
  flex-shrink: 0;
  display: block;
}

.creator-card {
  width: 710rpx;
  max-width: 100%;
  height: 184rpx;
  margin-top: 26rpx;
  padding: 22rpx 26rpx;
  border-radius: 44rpx;
  background: linear-gradient(
    187.53deg,
    rgba(35, 35, 35, 1) -23.45%,
    rgba(107, 96, 84, 1) 94.81%
  );
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: space-between;
  box-shadow: 0 14rpx 28rpx rgba(0, 0, 0, 0.12);
}

.creator-card__actions {
  display: flex;
  align-items: center;
  gap: 18rpx;
  flex-shrink: 0;
}

.creator-title {
  display: flex;
  align-items: flex-end;
  font-size: 28rpx;
  font-weight: 700;
}

.creator-title__icon {
  width: 20rpx;
  height: 38rpx;
  margin-left: 6rpx;
  flex-shrink: 0;
  display: block;
  margin-bottom: 6rpx;
}

.creator-count {
  margin-top: 12rpx;
}

.creator-action {
  width: 206rpx;
  height: 62rpx;
  box-sizing: border-box;
  padding: 0 20rpx;
  border: 2rpx solid rgba(255, 255, 255, 1);
  border-radius: 32rpx;
  background-color: rgba(44, 44, 44, 1);
  box-shadow: 10rpx 10rpx 22rpx 0 rgba(0, 0, 0, 0.4);
  font-size: 22rpx;
  display: flex;
  align-items: center;
  justify-content: center;
}

.creator-action__icon {
  width: 38rpx;
  height: 28rpx;
  margin-right: 6rpx;
  flex-shrink: 0;
  display: block;
}

.folder {
  width: 88rpx;
  height: 62rpx;
  border-radius: 34rpx;
  background-color: rgba(44, 44, 44, 1);
  box-shadow: 10rpx 10rpx 22rpx 0 rgba(0, 0, 0, 0.4);
  border: 2rpx solid rgba(255, 255, 255, 1);
  display: flex;
  align-items: center;
  justify-content: center;
  box-sizing: border-box;
}

.folder__icon {
  width: 40rpx;
  height: 30rpx;
  display: block;
}

.video-actions {
  margin-top: 18rpx;
  display: flex;
  flex-direction: row;
  align-items: stretch;
  gap: 18rpx;
}

.video-action {
  position: relative;
  width: 344rpx;
  max-width: 100%;
  height: 184rpx;
  box-sizing: border-box;
  padding: 36rpx 36rpx 34rpx 46rpx;
  border-radius: 44rpx;
  color: #fff;
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
  box-shadow: 0 12rpx 22rpx rgba(255, 147, 48, 0.22);
  overflow: hidden;
  flex-shrink: 0;
}

.video-action--image-to-video {
  background-image: url("https://static.compoai.cn/static/home/home-video-action-image-to-video-bg.png");
}

.video-action--video-edit {
  background-image: url("https://static.compoai.cn/static/home/home-video-action-video-edit-bg.png");
}

.video-action__title {
  font-size: 28rpx;
  color: #ffffff;
  font-family: OPPOSans-regular, OPPOSans, -apple-system, sans-serif;
}

.work-count {
  display: flex;
  align-items: baseline;
  gap: 6rpx;
  margin-top: 12rpx;
}

.creator-card .work-count {
  margin-top: 28rpx;
}

.work-count__label {
  font-size: 26rpx;
  color: rgba(255, 255, 255, 1);
  font-family: OPPOSans-regular, OPPOSans, -apple-system, sans-serif;
}

.work-count__num {
  font-size: 32rpx;
  line-height: 42rpx;
  color: rgba(255, 255, 255, 1);
  font-family: OPPOSans-bold, OPPOSans, -apple-system, sans-serif;
}

.line-icon {
  position: absolute;
  right: 36rpx;
  top: 50%;
  z-index: 2;
  width: 88rpx;
  height: 62rpx;
  margin-top: -31rpx;
  box-sizing: border-box;
  border-radius: 34rpx;
  background-color: rgba(255, 154, 63, 1);
  box-shadow: 10rpx 14rpx 22rpx 0 rgba(92, 55, 0, 0.27);
  border: 2rpx solid rgba(255, 255, 255, 1);
  display: flex;
  align-items: center;
  justify-content: center;
}

.line-icon__img {
  display: block;
  width: 38rpx;
  height: 28rpx;
  flex-shrink: 0;
  background-image: url("https://static.compoai.cn/static/home/home-video-action-line-icon.png");
  background-size: contain;
  background-position: center;
  background-repeat: no-repeat;
}
</style>
