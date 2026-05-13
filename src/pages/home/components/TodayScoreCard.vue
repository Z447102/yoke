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
        <image
          class="score-card__fire-img"
          :src="scoreFlameIcon"
          mode="aspectFit"
        />
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
        <image
          class="score-card__loc-icon-img"
          :src="HOME_LOC_PIN_SRC"
          mode="aspectFit"
          :lazy-load="false"
        />
        <text class="score-card__loc-text">获取位置</text>
        <image
          class="score-card__loc-chev-img"
          :src="HOME_LOC_CHEVRON_SRC"
          mode="aspectFit"
          :lazy-load="false"
        />
      </view>
      <view class="score-card__tip-wrap">
        <view class="score-card__tip-bar">
          <view class="score-card__tip">{{ tipDisplay }}</view>
          <view class="score-card__tip-icon-wrap">
            <image
              class="score-card__tip-icon"
              :src="homeScoreTipEmoji"
              mode="aspectFit"
              :lazy-load="false"
            />
          </view>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup>
import { computed, ref } from 'vue'
import { useHomeStore } from '@/stores/home'
import arrowIcon from '@/static/home/icon-score-select-arrow.png'
import scoreFlameIcon from '@/static/home/icon-title-hot-flame.png'
import homeScoreTipEmoji from '@/static/home/home-score-tip-emoji.png'

/** 小程序端用根路径静态资源，避免组件内 import 在部分真机/分包下 src 异常 */
const HOME_LOC_PIN_SRC = '/static/home/home-loc-pin.png'
const HOME_LOC_CHEVRON_SRC = '/static/home/home-loc-chevron.png'

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
  width: 710rpx;
  min-height: 256rpx;
  height: auto;
  margin: 6rpx 0 0;
  /* 底栏小提示右侧 60rpx 图标纵向超出 46rpx 条，略加大底内边距减轻裁切 */
  padding: 20rpx 24rpx 22rpx 24rpx;
  overflow: hidden;
  border: 1rpx solid rgba(255, 255, 255, 0.09);
  border-radius: 44rpx;
  background-color: rgba(255, 241, 226, 0.3);
  display: flex;
  flex-direction: column;
}

/* 展开时允许菜单超出卡片圆角区域，并压过下方「今日爆款内容」等板块 */
.score-card--dropdown-open {
  z-index: 500;
  overflow: visible;
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
  flex-shrink: 0;
}

.score-card__title-wrap {
  flex-shrink: 0;
  max-width: 46%;
}

.score-card__title {
  color: #3d2d1f;
  font-size: 28rpx;
  font-weight: 600;
  line-height: 1.3;
  letter-spacing: 1rpx;
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
  box-sizing: border-box;
  width: 168rpx;
  height: 56rpx;
  border-radius: 30rpx;
  background-color: rgba(255, 255, 255, 0.22);
  line-height: 56rpx;
  text-align: center;
}

.score-card__select--trigger {
  display: flex;
  align-items: center;
  justify-content: center;
  box-sizing: border-box;
  padding: 0 12rpx 0 16rpx;
  line-height: 56rpx;
}

.score-card__select-text {
  max-width: 90rpx;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-size: 26rpx;
  color: #1f2937;
  font-family: OPPOSans-regular, OPPOSans, -apple-system, sans-serif;
}

.score-card__select-arrow {
  width: 28rpx;
  height: 28rpx;
  flex-shrink: 0;
  margin-left: 22rpx;
  transition: transform 0.2s ease;
}

.score-card__select-arrow--up {
  transform: rotate(180deg);
}

.score-card__menu {
  position: absolute;
  top: 100%;
  left: 0;
  z-index: 502;
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
  min-height: 0;
}

.score-card__score {
  display: flex;
  // align-items: center;
}

.score-card__number {
  display: block;
  text-align: left;
  font-size: 72rpx;
  line-height: 1;
  color: #1f2937;
  font-family: OPPOSans-black, OPPOSans, -apple-system, sans-serif;
  font-weight: 400;
}

.score-card__fire-img {
  width: 34rpx;
  height: 34rpx;
  flex-shrink: 0;
  margin-left: 4rpx;
  margin-top: 4rpx;
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
  flex-shrink: 0;
  margin-top: auto;
  padding-top: 4rpx;
  overflow: visible;
}

.score-card__loc-pill {
  display: flex;
  flex-direction: row;
  flex-shrink: 0;
  align-items: center;
  box-sizing: border-box;
  padding: 0;
  background: transparent;
  letter-spacing: 1rpx;
}

.score-card__loc-icon-img,
.score-card__loc-chev-img {
  width: 28rpx;
  height: 28rpx;
  min-width: 28rpx;
  min-height: 28rpx;
  flex-shrink: 0;
  display: block;
}

.score-card__loc-text {
  display: block;
  margin: 0 8rpx;
  font-size: 28rpx;
  line-height: 1.2;
  text-align: left;
  color: #ffffff;
  font-family: OPPOSans-regular, OPPOSans, -apple-system, sans-serif;
}

.score-card__tip-wrap {
  display: flex;
  flex: 1;
  align-items: center;
  justify-content: flex-end;
  min-width: 0;
  margin-left: 12rpx;
  overflow: visible;
}

.score-card__tip-bar {
  position: relative;
  box-sizing: border-box;
  width: 446rpx;
  max-width: 100%;
  height: 46rpx;
  border-radius: 22rpx;
  background-color: rgba(255, 255, 255, 0.22);
  display: flex;
  flex-direction: row;
  align-items: center;
  padding: 0 8rpx 0 14rpx;
  overflow: visible;
}

.score-card__tip {
  flex: 1;
  min-width: 0;
  overflow: hidden;
  font-size: 20rpx;
  line-height: 46rpx;
  height: 46rpx;
  color: rgba(31, 41, 55, 0.7);
  font-family: OPPOSans-regular, OPPOSans, -apple-system, sans-serif;
  text-align: right;
  text-overflow: ellipsis;
  white-space: nowrap;
  word-break: keep-all;
}

.score-card__tip-icon-wrap {
  position: relative;
  flex-shrink: 0;
  width: 60rpx;
  min-width: 60rpx;
  height: 46rpx;
  margin-left: 4rpx;
  overflow: visible;
}

/* 底边距小提示条底框 10rpx，60rpx 高图标主要向上超出条顶（46 - 10 - 60 = -24） */
.score-card__tip-icon {
  position: absolute;
  right: 0;
  bottom: 0rpx;
  width: 60rpx;
  height: 60rpx;
  min-width: 60rpx;
  min-height: 60rpx;
  display: block;
}
</style>
