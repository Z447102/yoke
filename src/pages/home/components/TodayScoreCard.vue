<template>
  <view
    class="score-card"
    :class="{ 'score-card--dropdown-open': openDropdown }"
  >
    <view
      v-if="openDropdown"
      class="score-card__mask"
      @tap="closeDropdown"
    />

    <view class="score-card__filters">
      <view class="score-card__title-wrap">
        <text class="score-card__title">今日爆款评分</text>
      </view>
      <view class="score-card__selects">
        <view class="score-card__dropdown-wrap">
          <view
            class="score-card__select score-card__select--trigger"
            @tap.stop="toggleDropdown('platform')"
          >
            <text class="score-card__select-text">{{
              filters.platform || '平台'
            }}</text>
            <image
              class="score-card__select-arrow"
              :class="{ 'score-card__select-arrow--up': openDropdown === 'platform' }"
              :src="arrowIcon"
              mode="aspectFit"
            />
          </view>
          <view
            v-if="openDropdown === 'platform'"
            class="score-card__menu"
            @tap.stop
          >
            <view
              v-for="opt in platformOptions"
              :key="opt"
              class="score-card__menu-item"
              :class="{
                'score-card__menu-item--active': opt === filters.platform
              }"
              @tap.stop="selectPlatform(opt)"
            >
              <text>{{ opt }}</text>
            </view>
          </view>
        </view>

        <view class="score-card__dropdown-wrap">
          <view
            class="score-card__select score-card__select--trigger"
            @tap.stop="toggleDropdown('industry')"
          >
            <text class="score-card__select-text">{{
              filters.industry || '行业'
            }}</text>
            <image
              class="score-card__select-arrow"
              :class="{ 'score-card__select-arrow--up': openDropdown === 'industry' }"
              :src="arrowIcon"
              mode="aspectFit"
            />
          </view>
          <view
            v-if="openDropdown === 'industry'"
            class="score-card__menu"
            @tap.stop
          >
            <view
              v-for="opt in industryOptions"
              :key="opt"
              class="score-card__menu-item"
              :class="{
                'score-card__menu-item--active': opt === filters.industry
              }"
              @tap.stop="selectIndustry(opt)"
            >
              <text>{{ opt }}</text>
            </view>
          </view>
        </view>
      </view>
    </view>

    <view class="score-card__content">
      <view class="score-card__score">
        <text class="score-card__number">{{ summary.score }}</text>
        <text class="score-card__fire">🔥</text>
      </view>
      <view class="score-card__metrics">
        <view class="score-card__metric">
          <text class="score-card__metric-label">线索下单</text>
          <text class="score-card__metric-value">{{ summary.clueCount }}</text>
        </view>
        <view class="score-card__metric">
          <text class="score-card__metric-label">视频发布</text>
          <text class="score-card__metric-value">{{ summary.viewCount }}</text>
        </view>
        <view class="score-card__metric">
          <text class="score-card__metric-label">转化率</text>
          <text class="score-card__metric-value">{{
            summary.conversionRate
          }}</text>
        </view>
      </view>
    </view>

    <view class="score-card__bottom">
      <view class="score-card__loc-pill" @tap.stop="onRequestLocation">
        <text class="score-card__loc-icon">📍</text>
        <text class="score-card__loc-text">获取位置</text>
        <text class="score-card__loc-chev">＞</text>
      </view>
      <view class="score-card__tip-wrap">
        <view class="score-card__tip">{{ tipDisplay }}</view>
        <text class="score-card__emoji">👍</text>
      </view>
    </view>
  </view>
</template>

<script setup>
import { computed, ref } from 'vue'
import { useHomeStore } from '@/stores/home'
import arrowIcon from '@/static/home/icon-score-select-arrow.png'

const props = defineProps({
  summary: {
    type: Object,
    default: () => ({})
  },
  filters: {
    type: Object,
    default: () => ({})
  }
})

const platformOptions = ['抖音', '快手', '小红书', '视频号', '美团']
const industryOptions = ['餐饮', '零售', '美业', '教育', '家政']

const homeStore = useHomeStore()
const openDropdown = ref(null)

const tipDisplay = computed(
  () =>
    props.summary?.scoreTip ||
    '小提示：紧跟视频，客户会越来越多'
)

function onRequestLocation() {
  uni.getLocation({
    type: 'gcj02',
    success() {
      uni.showToast({ title: '定位成功', icon: 'none' })
      homeStore.fetchDashboard().catch(() => {})
    },
    fail() {
      uni.showToast({
        title: '请开启位置权限',
        icon: 'none'
      })
    }
  })
}

function toggleDropdown(which) {
  openDropdown.value = openDropdown.value === which ? null : which
}

function closeDropdown() {
  openDropdown.value = null
}

async function selectPlatform(val) {
  if (val === props.filters.platform) {
    closeDropdown()
    return
  }
  homeStore.setScoreFilter('platform', val)
  closeDropdown()
  await homeStore.fetchDashboard()
}

async function selectIndustry(val) {
  if (val === props.filters.industry) {
    closeDropdown()
    return
  }
  homeStore.setScoreFilter('industry', val)
  closeDropdown()
  await homeStore.fetchDashboard()
}
</script>

<style lang="scss" scoped>
.score-card {
  position: relative;
  box-sizing: border-box;
  margin: 6rpx 0 0;
  padding: 20rpx 24rpx 16rpx 20rpx;
  overflow: hidden;
  border: 1rpx solid rgba(255, 255, 255, 1);
  border-radius: 22rpx;
  background-color: rgba(255, 241, 226, 1);
  box-shadow: 0 8rpx 20rpx rgba(190, 101, 0, 0.12);
}

.score-card--dropdown-open {
  z-index: 100;
}

.score-card__mask {
  position: fixed;
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;
  z-index: 998;
  background: transparent;
}

.score-card__filters,
.score-card__content,
.score-card__bottom,
.score-card__selects,
.score-card__metrics {
  display: flex;
  align-items: center;
}

.score-card__filters {
  position: relative;
  z-index: 1000;
  justify-content: space-between;
}

.score-card__title-wrap {
  flex-shrink: 0;
  max-width: 46%;
}

.score-card__title {
  color: #3d2d1f;
  font-size: 24rpx;
  font-weight: 600;
  line-height: 1.3;
}

.score-card__selects {
  display: flex;
  align-items: center;
  flex-shrink: 0;
  flex-wrap: nowrap;
}

.score-card__dropdown-wrap {
  position: relative;
  z-index: 1001;
}

.score-card__dropdown-wrap + .score-card__dropdown-wrap {
  margin-left: 14rpx;
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

.score-card__select--trigger {
  display: flex;
  align-items: center;
  justify-content: center;
  box-sizing: border-box;
  padding: 0 10rpx 0 14rpx;
  line-height: 44rpx;
}

.score-card__select-text {
  max-width: 88rpx;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-size: 22rpx;
  color: #6c4a24;
}

.score-card__select-arrow {
  width: 18rpx;
  height: 18rpx;
  flex-shrink: 0;
  margin-left: 6rpx;
  transition: transform 0.2s ease;
}

.score-card__select-arrow--up {
  transform: rotate(180deg);
}

.score-card__menu {
  position: absolute;
  top: 100%;
  left: 0;
  margin-top: 8rpx;
  min-width: 100%;
  padding: 8rpx 0;
  border-radius: 16rpx;
  background: #fffdf8;
  box-shadow: 0 12rpx 32rpx rgba(61, 45, 31, 0.18);
}

.score-card__menu-item {
  padding: 16rpx 24rpx;
  font-size: 24rpx;
  color: #5c4030;
  white-space: nowrap;
}

.score-card__menu-item--active {
  color: #c26a0a;
  font-weight: 600;
  background: rgba(255, 228, 188, 0.55);
}

.score-card__content {
  justify-content: space-between;
  align-items: flex-end;
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
  justify-content: space-between;
  min-width: 0;
  margin-left: 28rpx;
}

.score-card__metric {
  display: flex;
  flex-direction: column;
  align-items: center;
  min-width: 0;
  flex: 1;
}

.score-card__metric-label {
  display: block;
  margin-bottom: 6rpx;
  color: #9d7651;
  font-size: 18rpx;
  line-height: 1.2;
  text-align: center;
}

.score-card__metric-value {
  display: block;
  color: #344055;
  font-size: 28rpx;
  font-weight: 700;
  line-height: 1.1;
  text-align: center;
}

.score-card__bottom {
  justify-content: space-between;
  align-items: center;
  margin-top: 16rpx;
  padding-top: 4rpx;
}

.score-card__loc-pill {
  display: flex;
  flex-shrink: 0;
  align-items: center;
  box-sizing: border-box;
  padding: 8rpx 14rpx 8rpx 12rpx;
  border-radius: 999rpx;
  background: rgba(61, 45, 31, 0.28);
  color: rgba(255, 252, 248, 0.96);
  font-size: 20rpx;
  line-height: 1.2;
}

.score-card__loc-icon {
  margin-right: 4rpx;
  font-size: 18rpx;
  line-height: 1;
}

.score-card__loc-text {
  font-size: 20rpx;
  color: rgba(255, 252, 248, 0.96);
}

.score-card__loc-chev {
  margin-left: 2rpx;
  font-size: 18rpx;
  line-height: 1;
  opacity: 0.92;
}

.score-card__tip-wrap {
  display: flex;
  flex: 1;
  align-items: center;
  justify-content: flex-end;
  min-width: 0;
  margin-left: 12rpx;
}

.score-card__tip {
  flex: 1;
  min-width: 0;
  overflow: hidden;
  color: #c98c4a;
  font-size: 18rpx;
  line-height: 1.35;
  text-align: right;
  text-overflow: ellipsis;
  white-space: nowrap;
  word-break: keep-all;
}

.score-card__emoji {
  flex-shrink: 0;
  margin-left: 8rpx;
  font-size: 30rpx;
  line-height: 1;
}
</style>
