<template>
  <!-- 一键成片 · 地图选点（示意 UI）：确认后写 storage 回 create 页 -->
  <view class="location-page">
    <view class="map-area">
      <view class="status-row" :style="locationStatusRowStyle">
        <text>11:26</text>
        <text>5G  99</text>
      </view>
      <view class="map-actions" :style="locationMapActionsStyle">
        <text class="cancel" @tap="goBack">取消</text>
        <button class="send-btn" @tap="confirmLocation">发送</button>
      </view>

      <view class="mock-map">
        <view class="road vertical"></view>
        <view class="road horizontal"></view>
        <view class="road diagonal"></view>
        <view class="park park-left">市民公园广场</view>
        <view class="park park-right">公园</view>
        <view class="pin selected"></view>
        <view class="pin current"></view>
        <view class="locate">◎</view>
        <view class="map-logo">腾讯地图</view>
      </view>
    </view>

    <view class="search-panel">
      <view class="search-row">
        <view class="search-box">
          <text class="search-icon">⌕</text>
          <input
            v-model="keyword"
            class="search-input"
            placeholder="七公"
            placeholder-class="placeholder"
          />
          <text v-if="keyword" class="clear" @tap="keyword = ''">×</text>
        </view>
        <text class="cancel-search" @tap="goBack">取消</text>
      </view>

      <view class="poi-list">
        <view
          v-for="item in filteredPois"
          :key="item.id"
          class="poi-item"
          @tap="selectPoi(item)"
        >
          <view>
            <view class="poi-title">{{ item.name }}</view>
            <view class="poi-desc">{{ item.distance }} | {{ item.address }}</view>
          </view>
          <text v-if="selectedPoi?.id === item.id" class="check">✓</text>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup>
/**
 * 【一键成片 · 选点】Mock 地图与 POI 列表；与 create 页通过 create:selected-location 传递。
 */
import { computed, ref, onMounted, nextTick } from 'vue'
import { onReady } from '@dcloudio/uni-app'
import { getCreateSafeAreaTopPx } from '@/utils/create-nav-padding'

/**
 * 构建数据：buildLocationOverlayStyles
 */
function buildLocationOverlayStyles() {
  const safeTopPx = getCreateSafeAreaTopPx()
  const rowH =
    typeof uni !== 'undefined' && typeof uni.upx2px === 'function'
      ? uni.upx2px(56)
      : 28
  const mapActionsOffsetPx = safeTopPx + rowH
  return {
    statusRow: { top: `${safeTopPx}px` },
    mapActions: { top: `${mapActionsOffsetPx}px` }
  }
}

/**
 * 函数：refreshLocationOverlay
 */
function refreshLocationOverlay() {
  const s = buildLocationOverlayStyles()
  locationStatusRowStyle.value = s.statusRow
  locationMapActionsStyle.value = s.mapActions
}

const _locationOverlayInit = buildLocationOverlayStyles()
const locationStatusRowStyle = ref(_locationOverlayInit.statusRow)
const locationMapActionsStyle = ref(_locationOverlayInit.mapActions)

/**
 * 调度/延后执行：scheduleLocationOverlayRefresh
 */
function scheduleLocationOverlayRefresh() {
  refreshLocationOverlay()
  nextTick(refreshLocationOverlay)
  setTimeout(refreshLocationOverlay, 48)
  setTimeout(refreshLocationOverlay, 200)
}

onMounted(() => scheduleLocationOverlayRefresh())
onReady(() => scheduleLocationOverlayRefresh())

const keyword = ref('七公')
const pois = [
  {
    id: 'qigong-jiangbei',
    name: '七公串串香火锅（江北店）',
    distance: '121m',
    address: '广东省惠州市惠城区江北街道云山东路 4-16 号...'
  },
  {
    id: 'qigong-henan',
    name: '七公串串香火锅（河南岸旗舰店）',
    distance: '5.4km',
    address: '广东省惠州市惠城区河南岸岸路106号...'
  },
  {
    id: 'qigong-main',
    name: '七公主',
    distance: '7.2km',
    address: '广东省惠州市惠城区东征路北九龙百货'
  }
]
const selectedPoi = ref(pois[0])

const filteredPois = computed(() => {
  const value = keyword.value.trim()
  if (!value) return pois
  return pois.filter((item) => item.name.includes(value))
})

/**
 * 选择项：selectPoi
 */
function selectPoi(item) {
  selectedPoi.value = item
}

/**
 * 确认操作：confirmLocation
 */
function confirmLocation() {
  if (!selectedPoi.value) {
    uni.showToast({
      title: '请选择位置',
      icon: 'none'
    })
    return
  }

  uni.setStorageSync('create:selected-location', selectedPoi.value)
  uni.showToast({
    title: '已选择位置',
    icon: 'none'
  })

  setTimeout(() => {
    uni.navigateBack()
  }, 300)
}

/**
 * 返回上一页
 */
function goBack() {
  uni.navigateBack()
}
</script>

<style lang="scss" scoped>
.location-page {
  min-height: 100vh;
  background: #f5f5f5;
  color: #222222;
}

.map-area {
  position: relative;
  height: 690rpx;
  overflow: hidden;
  background: #cfd3d1;
}

.status-row {
  position: absolute;
  z-index: 2;
  left: 0;
  right: 0;
  height: 56rpx;
  padding: 0 34rpx;
  color: #ffffff;
  font-size: 28rpx;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.map-actions {
  position: absolute;
  z-index: 3;
  left: 0;
  right: 0;
  padding: 0 24rpx;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.cancel {
  color: #ffffff;
  font-size: 30rpx;
}

.send-btn {
  width: 88rpx;
  height: 64rpx;
  margin: 0;
  border-radius: 10rpx;
  background: #08c160;
  color: #ffffff;
  font-size: 28rpx;
  line-height: 64rpx;
}

.send-btn::after {
  border: 0;
}

.mock-map {
  position: relative;
  width: 100%;
  height: 100%;
  background:
    linear-gradient(90deg, rgba(255, 255, 255, 0.58) 0 18rpx, transparent 18rpx 100%),
    linear-gradient(0deg, rgba(255, 255, 255, 0.42) 0 16rpx, transparent 16rpx 100%),
    #d9ddd9;
  background-size: 180rpx 180rpx;
}

.road {
  position: absolute;
  border-radius: 999rpx;
  background: #f5f0df;
  box-shadow: 0 0 0 3rpx #e0d6bd inset;
}

.road.vertical {
  left: 318rpx;
  top: -80rpx;
  width: 44rpx;
  height: 850rpx;
  transform: rotate(8deg);
}

.road.horizontal {
  left: 0;
  right: 0;
  top: 352rpx;
  height: 38rpx;
}

.road.diagonal {
  right: 34rpx;
  top: 0;
  width: 34rpx;
  height: 740rpx;
  transform: rotate(24deg);
}

.park {
  position: absolute;
  padding: 8rpx 14rpx;
  border-radius: 10rpx;
  background: #bee7c6;
  color: #5d9d6b;
  font-size: 22rpx;
}

.park-left {
  left: 58rpx;
  bottom: 136rpx;
}

.park-right {
  right: 66rpx;
  top: 210rpx;
}

.pin {
  position: absolute;
  width: 42rpx;
  height: 42rpx;
  border-radius: 50%;
  border: 8rpx solid #ffffff;
}

.pin.selected {
  left: 348rpx;
  top: 340rpx;
  background: #07c160;
}

.pin.current {
  left: 420rpx;
  top: 422rpx;
  background: #1677ff;
}

.locate {
  position: absolute;
  left: 28rpx;
  bottom: 96rpx;
  width: 64rpx;
  height: 64rpx;
  border-radius: 50%;
  background: #ffffff;
  color: #333333;
  font-size: 42rpx;
  line-height: 64rpx;
  text-align: center;
  box-shadow: 0 4rpx 14rpx rgba(0, 0, 0, 0.12);
}

.map-logo {
  position: absolute;
  right: 24rpx;
  bottom: 70rpx;
  color: #56749a;
  font-size: 22rpx;
}

.search-panel {
  position: fixed;
  left: 0;
  right: 0;
  bottom: 0;
  min-height: 420rpx;
  padding: 18rpx 0 constant(safe-area-inset-bottom);
  padding: 18rpx 0 env(safe-area-inset-bottom);
  border-radius: 18rpx 18rpx 0 0;
  background: #ffffff;
}

.search-row {
  height: 70rpx;
  padding: 0 16rpx;
  display: flex;
  align-items: center;
}

.search-box {
  flex: 1;
  height: 58rpx;
  padding: 0 18rpx;
  border-radius: 8rpx;
  background: #f1f1f1;
  display: flex;
  align-items: center;
}

.search-icon {
  margin-right: 12rpx;
  color: #b3b3b3;
  font-size: 30rpx;
}

.search-input {
  flex: 1;
  color: #333333;
  font-size: 28rpx;
}

.clear {
  width: 28rpx;
  height: 28rpx;
  border-radius: 50%;
  background: #9a9a9a;
  color: #ffffff;
  font-size: 22rpx;
  line-height: 28rpx;
  text-align: center;
}

.cancel-search {
  padding-left: 18rpx;
  color: #5b6f92;
  font-size: 28rpx;
}

.poi-list {
  padding-left: 16rpx;
}

.poi-item {
  min-height: 112rpx;
  padding: 18rpx 20rpx 18rpx 0;
  border-bottom: 1rpx solid #eeeeee;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.poi-title {
  color: #19a647;
  font-size: 30rpx;
  font-weight: 700;
}

.poi-desc {
  overflow: hidden;
  width: 650rpx;
  margin-top: 8rpx;
  color: #9b9b9b;
  font-size: 22rpx;
  white-space: nowrap;
  text-overflow: ellipsis;
}

.check {
  color: #08c160;
  font-size: 34rpx;
}

.placeholder {
  color: #9d9d9d;
}
</style>
