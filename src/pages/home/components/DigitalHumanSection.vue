<template>
  <view class="digital-section">
    <view class="digital-header">
      <view class="digital-header__left">
        <image
          class="digital-header__title-icon"
          :src="digitalTitleIcon"
          mode="aspectFit"
          :lazy-load="false"
        />
        <view class="digital-header__title-copy">
          <view class="digital-header__title-row">
            <text class="digital-header__title">数字人视频</text>
            <image
              class="digital-header__title-trail-icon"
              :src="digitalTitleTrailIcon"
              mode="aspectFit"
              :lazy-load="false"
            />
          </view>
          <text class="digital-header__tag">60秒生成口播视频</text>
        </view>
      </view>
      <view class="digital-header__more">
        <text class="digital-header__more-text">全部形象</text>
        <image
          class="digital-header__more-icon"
          :src="digitalMoreIcon"
          mode="aspectFit"
          :lazy-load="false"
        />
      </view>
    </view>

    <view class="digital-human">
      <view class="create-card" @tap="$emit('create')">
        <view class="plus">
          <image
            class="plus-icon"
            :src="digitalPlusIcon"
            mode="aspectFit"
            :lazy-load="false"
          />
        </view>
        <text>创建数字人</text>
      </view>

      <view
        v-for="item in list"
        :key="item.id"
        class="human-card"
        :style="{ backgroundImage: `url(${item.avatar})` }"
      >
        <view class="human-tag">{{ item.tag }}</view>
        <view v-if="item.playable" class="play">
          <image
            class="play-icon"
            :src="digitalScrollIcon"
            mode="aspectFit"
            :lazy-load="false"
          />
        </view>
      </view>
    </view>
  </view>
</template>

<script setup>
import digitalTitleIcon from '@/static/home/home-digital-title-icon.png'
import digitalMoreIcon from '@/static/home/home-digital-more-icon.png'
import digitalCardArrowIcon from '@/static/home/home-digital-card-arrow-icon.png'
import digitalTitleTrailIcon from '@/static/home/home-digital-title-trail-icon-v3.png'
import digitalPlusIcon from '@/static/home/home-digital-plus-icon.png'
import digitalScrollIcon from '@/static/home/home-digital-scroll-icon.png'

defineProps({
  list: {
    type: Array,
    default: () => []
  }
})

defineEmits(['create'])
</script>

<style lang="scss" scoped>
.digital-section {
  padding-top: 10rpx;
}

.digital-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin: 28rpx 24rpx 14rpx;
}

.digital-header__left {
  display: flex;
  flex-direction: row;
  align-items: center;
  min-width: 0;
}

.digital-header__title-icon {
  width: 32rpx;
  height: 56rpx;
  margin-right: 10rpx;
  flex-shrink: 0;
  display: block;
}

.digital-header__title-copy {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  min-width: 0;
}

.digital-header__title-row {
  display: flex;
  align-items: center;
}

.digital-header__title {
  font-family: OPPOSans-medium, OPPOSans, -apple-system, sans-serif;
  color: #1f2937;
  font-size: 30rpx;
  font-weight: 600;
}

.digital-header__title-trail-icon {
  width: 32rpx;
  height: 32rpx;
  margin-left: 8rpx;
  flex-shrink: 0;
  display: block;
}

.digital-header__tag {
  margin-top: 4rpx;
  color: #ff9a23;
  font-size: 20rpx;
}

.digital-header__more {
  display: flex;
  align-items: center;
}

.digital-header__more-text {
  color: #6b7280;
  font-size: 28rpx;
  font-family: OPPOSans-regular, OPPOSans, -apple-system, sans-serif;
}

.digital-header__more-icon {
  width: 30rpx;
  height: 30rpx;
  margin-left: 4rpx;
  flex-shrink: 0;
  display: block;
}

.digital-human {
  display: flex;
  flex-direction: row;
  align-items: stretch;
  width: 730rpx;
  height: 320rpx;
  margin-top: 22rpx;
  margin-left: auto;
  border-radius: 62rpx 0 0 62rpx;
  background: linear-gradient(
    133.53deg,
    rgba(255, 197, 129, 1) 5.35%,
    rgba(255, 165, 84, 1) 92.61%
  );
  box-sizing: border-box;
  padding: 20rpx 20rpx 20rpx 20rpx;
}

/* 微信小程序 WXSS 不支持 `.parent > * + *` 中的通配符，改用相邻兄弟选择器 */
.create-card + .human-card,
.human-card + .human-card {
  margin-left: 20rpx;
}

.create-card,
.human-card {
  overflow: hidden;
  border-radius: 24rpx;
}

.create-card {
  flex: 0 0 216rpx;
  width: 216rpx;
  height: 280rpx;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: #ffffff;
  border-radius: 44rpx;
  background-color: rgba(255, 241, 226, 0.3);
  border: 1rpx solid rgba(255, 255, 255, 0.2);
}

.create-card text {
  font-size: 26rpx;
  color: #ffffff;
  font-family: OPPOSans-regular, OPPOSans, -apple-system, sans-serif;
}

.plus {
  width: 64rpx;
  height: 64rpx;
  margin-bottom: 24rpx;
  background-color: rgba(255, 255, 255, 1);
  box-shadow: 0 0 6rpx 0 rgba(223, 192, 192, 0.49);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.plus-icon {
  width: 24rpx;
  height: 24rpx;
  display: block;
}

.human-card {
  position: relative;
  flex: 0 0 216rpx;
  width: 216rpx;
  height: 280rpx;
  min-width: 216rpx;
  box-sizing: border-box;
  border-radius: 44rpx;
  background-color: rgba(229, 229, 229, 1);
  background-repeat: no-repeat;
  background-position: center;
  background-size: cover;
}

.human-tag {
  position: absolute;
  top: 0;
  left: 0;
  width: 168rpx;
  height: 58rpx;
  box-sizing: border-box;
  padding: 0 12rpx;
  color: #ffffff;
  font-size: 24rpx;
  font-family: OPPOSans-regular, OPPOSans, -apple-system, sans-serif;
  text-align: center;
  line-height: 58rpx;
  background-image: url('@/static/home/home-digital-tag-bg.png');
  background-repeat: no-repeat;
  background-position: center;
  background-size: 100% 100%;
  border-radius: 0;
  display: block;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.play {
  position: absolute;
  right: 12rpx;
  top: 50%;
  transform: translateY(-50%);
  width: 40rpx;
  height: 40rpx;
  text-align: center;
  background: transparent;
  box-shadow: none;
  display: flex;
  align-items: center;
  justify-content: center;
}

.play-icon {
  width: 40rpx;
  height: 40rpx;
  display: block;
}
</style>
