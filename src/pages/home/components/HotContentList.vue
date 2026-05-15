<template>
  <view class="section">
    <view class="section__header">
      <view class="section__title">
        <image
          class="section__flame-icon"
          :src="hotContentFlameIcon"
          mode="aspectFit"
        />
        <text>今日爆款内容</text>
      </view>
      <view class="section__more" @tap="$emit('refresh')">
        <image
          class="section__refresh-icon"
          :src="hotRefreshIcon"
          mode="aspectFit"
          :lazy-load="false"
        />
        <text class="section__more-text">换一批</text>
      </view>
    </view>
    <!-- 可视区宽度 = 两整卡 + 卡间距 + 第三卡露 210rpx，可横滑 -->
    <view class="hot-scroll-viewport">
      <scroll-view
        scroll-x
        class="hot-scroll"
        :show-scrollbar="false"
        :enable-flex="true"
      >
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
                <view class="hot-card__heat">
                  <image :src="hotHeatLikeIcon" class="hot-card__heat-icon" mode="aspectFit" />
                  <text>{{ item.heat }}</text>
                </view>
              </view>
            </view>
          </view>
        </view>
      </scroll-view>
      <scroll-view
        scroll-x
        class="hot-scroll"
        style="margin-top: 20rpx;"
        :show-scrollbar="false"
        :enable-flex="true"
      >
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
                <view class="hot-card__heat">
                  <image :src="hotHeatLikeIcon" class="hot-card__heat-icon" mode="aspectFit" />
                  <text>{{ item.heat }}</text>
                </view>
              </view>
            </view>
          </view>
        </view>
      </scroll-view>
    </view>
  </view>
</template>

<script setup>
import { StaticPath } from '@/config'
const hotContentFlameIcon = `${StaticPath}home/icon-title-hot-flame.png`
const hotRefreshIcon = `${StaticPath}home/home-hot-refresh-icon.png`
const hotHeatLikeIcon = `${StaticPath}home/hone-like.svg`

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
  /* 与上方「今日爆款评分」卡片间距 34rpx */
  margin-top: 0rpx;
  /* 左缘与 hero / 评分标题同一垂线（仅由 hero 的 24rpx 承担水平边距） */
  padding: 0;
}

.section__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0;
  padding: 24rpx 24rpx 18rpx;
}

.section__title {
  display: flex;
  align-items: center;
  color: #553214;
  font-size: 27rpx;
  font-weight: 700;
  letter-spacing: 1rpx;
}

.section__flame-icon {
  width: 34rpx;
  height: 34rpx;
  flex-shrink: 0;
  margin-right: 8rpx;
  display: block;
}

.section__more {
  display: flex;
  align-items: center;
}

.section__refresh-icon {
  width: 32rpx;
  height: 32rpx;
  flex-shrink: 0;
  margin-right: 8rpx;
  display: block;
}

.section__more-text {
  font-size: 24rpx;
  color: rgba(31, 41, 55, 0.6);
  font-family: OPPOSans-regular, OPPOSans, -apple-system, sans-serif;
}

/* 可视宽度 712 = 244*2 + 14 + 210：两整卡 + 卡间距 + 第三卡露出 210rpx */
.hot-scroll-viewport {
  /* 内容区宽 + 右侧补偿（hero 的 24rpx + safe-area），保证第三张贴齐页面右边 */
  width: calc(100% + 24rpx + constant(safe-area-inset-right));
  width: calc(100% + 24rpx + env(safe-area-inset-right));
  overflow: hidden;
}

.hot-scroll {
  width: 100%;
  /* 小程序 scroll-x 需明确高度；与单卡高度 336rpx 对齐 */
  height: 336rpx;
  overflow: hidden;
}

.hot-list {
  display: flex;
  flex-direction: row;
  flex-wrap: nowrap;
  align-items: stretch;
  width: max-content;
  height: 100%;
  padding: 0 20rpx 6rpx 0;
  box-sizing: border-box;
}

.hot-card {
  overflow: hidden;
  flex-shrink: 0;
  box-sizing: border-box;
  width: 244rpx;
  height: 336rpx;
  margin-right: 15rpx;
  margin-bottom: 15rpx;
  border-radius: 24rpx;
  background-color: rgba(229, 229, 229, 1);
  display: flex;
  flex-direction: column;

  &:first-child {
    margin-left: 24rpx;
  }
}

// .hot-card:nth-child(3n) {
//   margin-right: 0;
// }

.hot-card__image-wrap {
  overflow: hidden;
  flex: 0 0 200rpx;
  width: 100%;
  height: 200rpx;
  background: #ffe1b7;
}

.hot-card__image {
  display: block;
  width: 100%;
  height: 200rpx;
}

.hot-card__body {
  flex: 1;
  min-height: 0;
  box-sizing: border-box;
  padding: 10rpx 12rpx 12rpx;
  display: flex;
  flex-direction: column;
  background-color: rgba(255, 255, 255, 1);
}

.hot-card__title {
  display: block;
  overflow: hidden;
  color: #3d3d3d;
  font-size: 24rpx;
  font-weight: 700;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.hot-card__desc {
  display: block;
  overflow: hidden;
  margin-top: 4rpx;
  color: #777777;
  font-size: 20rpx;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.hot-card__meta {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: auto;
  padding-top: 8rpx;
}

.hot-card__tag {
  padding: 3rpx 8rpx;
  color: #ff8b1f;
  font-size: 18rpx;
  background: #fff1dc;
  border-radius: 6rpx;
  letter-spacing: 1.2rpx;
}

.hot-card__heat {
  display: flex;
  align-items: center;
  color: #ff9b36;
  font-size: 20rpx;
}

.hot-card__heat-icon {
  width: 24rpx;
  height: 24rpx;
  margin-right: 4rpx;
}
</style>
