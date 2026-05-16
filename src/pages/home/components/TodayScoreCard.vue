<template>
  <view class="score-card">
    <view class="score-card__filters">
      <view class="score-card__title-wrap">
        <text class="score-card__title">今日爆款评分</text>
      </view>
      <view class="score-card__selects">
        <view class="score-card__dropdown-wrap">
          <view
            class="score-card__select score-card__select--trigger"
            @tap.stop="onTriggerPlatform"
          >
            <text class="score-card__select-text">{{ platformLabel }}</text>
            <image
              class="score-card__select-arrow"
              :class="{ 'score-card__select-arrow--up': platformOpen }"
              :src="arrowIcon"
              mode="aspectFit"
            />
          </view>
        </view>

        <view class="score-card__dropdown-wrap">
          <view
            class="score-card__select score-card__select--trigger"
            @tap.stop="onTriggerIndustry"
          >
            <text class="score-card__select-text">{{
              filters.industry || '行业'
            }}</text>
            <image
              class="score-card__select-arrow"
              :class="{ 'score-card__select-arrow--up': industryOpen }"
              :src="arrowIcon"
              mode="aspectFit"
            />
          </view>
        </view>
      </view>
    </view>

    <view class="score-card__content">
      <view class="score-card__score">
        <text class="score-card__number">{{ summary?.score ?? '—' }}</text>
        <image
          class="score-card__fire-img"
          :src="scoreFlameIcon"
          mode="aspectFit"
        />
      </view>
      <view class="score-card__metrics">
        <view class="score-card__metric">
          <text class="score-card__metric-label">线索下单</text>
          <text class="score-card__metric-value">{{
            summary?.clueCount ?? '—'
          }}</text>
        </view>
        <view class="score-card__metric">
          <text class="score-card__metric-label">视频发布</text>
          <text class="score-card__metric-value">{{
            summary?.viewCount ?? '—'
          }}</text>
        </view>
        <view class="score-card__metric">
          <text class="score-card__metric-label">转化率</text>
          <text class="score-card__metric-value">{{
            summary?.conversionRate ?? '—'
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
        <text class="score-card__loc-text">{{ locationText }}</text>
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
import { StaticPath } from '@/config'
import { computed, ref } from 'vue'
import { useHomeStore } from '@/stores/home'
import {
  pickTencentLocationLabel,
  reverseGeocodeByTencent
} from '@/utils/tencent-map'
const arrowIcon = `${StaticPath}home/icon-score-select-arrow.png`
const scoreFlameIcon = `${StaticPath}home/icon-title-hot-flame.png`
const homeScoreTipEmoji = `${StaticPath}home/home-score-tip-emoji.png`

const HOME_LOC_PIN_SRC = `${StaticPath}home/home-loc-pin.png`
const HOME_LOC_CHEVRON_SRC = `${StaticPath}home/home-loc-chevron.png`

const props = defineProps({
  summary: {
    type: Object,
    default: () => ({})
  },
  filters: {
    type: Object,
    default: () => ({})
  },
  /**
   * 平台选项列表（与 generate 页一致的 `PLATFORM_OPTIONS`：`{ id, name, ... }[]`），
   * 用于把 `filters.platform`（id，如 `'douyin'`）回显为对应中文名。
   */
  platformOptions: {
    type: Array,
    default: () => []
  },
  /** 行业弹窗是否处于打开态（由父级托管，用于箭头转向回显） */
  industryOpen: {
    type: Boolean,
    default: false
  },
  /** 平台弹窗是否处于打开态（由父级托管，用于箭头转向回显） */
  platformOpen: {
    type: Boolean,
    default: false
  }
})

/**
 * 事件契约：弹窗本体由 home/index.vue 在页面根节点渲染，避免被 .score-card 的
 * overflow: hidden 与外层 .home-top-skin 的滚动/局部层叠上下文裁剪、或被 HomeTabBar 遮挡。
 *
 * - open-platform-picker：用户点击「平台」筛选触发
 * - open-industry-picker：用户点击「行业」筛选触发
 */
const emit = defineEmits(['open-platform-picker', 'open-industry-picker'])

const homeStore = useHomeStore()
const currentLocationLabel = ref('')

const tipDisplay = computed(
  () =>
    props.summary?.scoreTip ||
    '小提示：紧跟视频，客户会越来越多'
)

const locationText = computed(() => currentLocationLabel.value || '获取位置')

/** 触发按钮的平台展示文案：用 id 反查 `platformOptions` 取 name；找不到则回落到 '平台' */
const platformLabel = computed(() => {
  const cur = String(props.filters?.platform ?? '').trim()
  if (!cur) return '平台'
  const hit = props.platformOptions.find(
    (p) => p && String(p.id ?? '').trim() === cur
  )
  return hit?.name || '平台'
})

/**
 * 事件处理：onRequestLocation
 */
function onRequestLocation() {
  uni.getLocation({
    type: 'gcj02',
    async success(res) {
      try {
        const location = await reverseGeocodeByTencent(res)
        const label = pickTencentLocationLabel(location.ad_info)
        if (label) currentLocationLabel.value = label
        uni.showToast({ title: label || '定位成功', icon: 'none' })
        homeStore.fetchDashboard().catch(() => {})
      } catch (err) {
        console.log(err)
        uni.showToast({
          title: err?.message || '位置解析失败',
          icon: 'none'
        })
      }
    },
    fail(err) {
      console.log(err)
      uni.showToast({
        title: '请开启位置权限',
        icon: 'none'
      })
    }
  })
}

/** 触发平台筛选：由父级（home/index.vue）托管 PlatformSelectPopup 的渲染与状态 */
function onTriggerPlatform() {
  emit('open-platform-picker')
}

/** 触发行业筛选：由父级（home/index.vue）托管 IndustrySelectPopup 的渲染与状态 */
function onTriggerIndustry() {
  emit('open-industry-picker')
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
  margin-bottom: 4rpx;
  color: rgba(61, 45, 31, 0.7);
  font-size: 20rpx;
  text-align: center;
}

.score-card__metric-value {
  display: block;
  color: #1F2937;
  font-size: 32rpx;
  font-weight: 700;
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
