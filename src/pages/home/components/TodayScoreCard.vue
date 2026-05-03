<template>
  <view class="score-card">
    <view class="score-card__filters">
      <text class="score-card__title">今日爆款评分</text>
      <view class="score-card__selects">
        <view class="score-card__select">{{ filters.platform || '平台' }}</view>
        <view class="score-card__select">{{ filters.industry || '行业' }}</view>
      </view>
    </view>

    <view class="score-card__content">
      <view class="score-card__score">
        <text class="score-card__number">{{ summary.score }}</text>
        <text class="score-card__fire">🔥</text>
      </view>
      <view class="score-card__metrics">
        <view class="score-card__metric">
          <text class="score-card__metric-value">{{ summary.clueCount }}</text>
          <text class="score-card__metric-label">线索数</text>
        </view>
        <view class="score-card__metric">
          <text class="score-card__metric-value">{{ summary.viewCount }}</text>
          <text class="score-card__metric-label">浏览数</text>
        </view>
        <view class="score-card__metric">
          <text class="score-card__metric-value">{{ summary.conversionRate }}</text>
          <text class="score-card__metric-label">客户总转化率</text>
        </view>
      </view>
    </view>

    <view class="score-card__footer">
      <text>🔥 我快爆区</text>
      <text>小提示：紧跟视频，客户会越来越多</text>
      <text class="score-card__emoji">😺</text>
    </view>
  </view>
</template>

<script setup>
defineProps({
  summary: {
    type: Object,
    default: () => ({})
  },
  filters: {
    type: Object,
    default: () => ({})
  }
})
</script>

<style lang="scss" scoped>
.score-card {
  margin: 6rpx 0 0;
  /* 左缘与 hero 对齐；右侧保留内边距避免与筛选项贴边 */
  padding: 20rpx 24rpx 16rpx 0;
  border-radius: 24rpx;
  background: rgba(255, 244, 225, 0.95);
  box-shadow: 0 8rpx 20rpx rgba(190, 101, 0, 0.12);
}

.score-card__filters,
.score-card__content,
.score-card__footer,
.score-card__selects,
.score-card__metrics {
  display: flex;
  align-items: center;
}

.score-card__filters {
  justify-content: space-between;
}

.score-card__title {
  color: #3d2d1f;
  font-size: 24rpx;
  font-weight: 600;
}

.score-card__selects {
  gap: 14rpx;
}

.score-card__select {
  min-width: 118rpx;
  height: 44rpx;
  border-radius: 24rpx;
  background: #ffe4bc;
  color: #6c4a24;
  font-size: 22rpx;
  line-height: 44rpx;
  text-align: center;
}

.score-card__content {
  justify-content: space-between;
  margin-top: 14rpx;
}

.score-card__score {
  display: flex;
  align-items: flex-start;
}

.score-card__number {
  color: #25364b;
  font-size: 60rpx;
  font-weight: 800;
  line-height: 1;
}

.score-card__fire {
  margin-left: 4rpx;
  font-size: 26rpx;
}

.score-card__metrics {
  flex: 1;
  justify-content: space-around;
  margin-left: 28rpx;
}

.score-card__metric {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.score-card__metric-value {
  color: #344055;
  font-size: 28rpx;
  font-weight: 700;
}

.score-card__metric-label {
  margin-top: 6rpx;
  color: #9d7651;
  font-size: 18rpx;
}

.score-card__footer {
  justify-content: space-between;
  margin-top: 12rpx;
  color: #c98c4a;
  font-size: 18rpx;
}

.score-card__emoji {
  font-size: 34rpx;
}
</style>
