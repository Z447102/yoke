<template>
  <view class="points-detail-page">
    <view class="page-bg-top" :style="{ height: bgHeight }"></view>
    <MineVipNavBar
      left-text="点数明细"
      left-arrow
      :custom-style="{ background: 'transparent' }"
      :border="false"
      @click-left="goBack"
    />

    <view class="content">
      <!-- Top Card -->
      <view class="top-card">
        <view class="card-top">
          <view class="total-points">
            <view class="coin-icon">
              <image src="../static/recharge/recharge-icon-coin.png" mode="aspectFit"></image>
            </view>
            <text class="points-value">
              {{ totalPointsInteger }}<text class="points-decimal">.{{ totalPointsDecimal }}</text>
            </text>
          </view>
          <!-- 占位，保持与充值页一致的结构 -->
          <view class="details-btn" style="visibility: hidden;">明细</view>
        </view>
        <view class="card-bottom">
          <view class="stat-item">
            <text class="stat-val">{{ vipPoints }}</text>
            <text class="stat-label">会员点数</text>
          </view>
          <view class="stat-divider"></view>
          <view class="stat-item">
            <text class="stat-val">{{ rechargePoints }}</text>
            <text class="stat-label">充值点数</text>
          </view>
          <view class="stat-divider"></view>
          <view class="stat-item">
            <text class="stat-val">{{ giftPoints }}</text>
            <text class="stat-label">赠送点数</text>
          </view>
        </view>
      </view>

      <!-- List Container -->
      <scroll-view class="list-container" scroll-y @scrolltolower="loadMore">
        <!-- Global Empty State -->
        <view class="global-empty" v-if="list.length === 0 && !loading && finished">
          <text class="global-empty-text">暂无明细</text>
        </view>

        <view v-for="(group, index) in groupedList" :key="index" class="month-group">
          <view class="month-header" :style="group.items.length === 0 ? 'margin-bottom: 0;' : ''">
            <text class="month-num">{{ group.month }}</text>
            <text class="month-text">月</text>
            <text v-if="group.items.length === 0" class="empty-text">暂无明细</text>
          </view>
          
          <view class="record-list" v-if="group.items.length > 0">
            <view v-for="item in group.items" :key="item.id" class="record-item">
              <view class="record-main">
                <view class="record-info">
                  <view class="record-title-row">
                    <text class="record-title">{{ item.title }}</text>
                    <view class="record-tag" :class="item.type === 'consume' ? 'tag-consume' : 'tag-add'">
                      {{ item.type === 'consume' ? '消耗' : '增加' }}
                    </view>
                  </view>
                  <view class="record-time">{{ formatTime(item.createTime) }}</view>
                  <view v-if="item.expireTime" class="record-expire">
                    有效至({{ item.expireDays || 30 }}天): {{ item.expireTime }}
                  </view>
                </view>
                <view class="record-amount" :class="item.type === 'consume' ? 'amount-consume' : 'amount-add'">
                  <!-- {{ item.amount > 0 ? '+' : '' }}{{ Number(item.amount || 0).toFixed(2) }} -->
                  {{ item.changePoints > 0 ? '+' : '-' }}{{ item.changePoints }}
                </view>
              </view>
              <view class="record-divider" v-if="item !== group.items[group.items.length - 1]"></view>
            </view>
          </view>
        </view>
        
        <!-- Load More Status -->
        <view class="loading-status" v-if="loading">加载中...</view>
        <view class="loading-status" v-else-if="finished && groupedList.length > 0">没有更多了</view>
      </scroll-view>
    </view>
  </view>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import MineVipNavBar from '@/pages/components/MineVipNavBar.vue'
import { useUserStore } from '@/stores/user'
import { getPointsDetailsList, getCurrentUserPoints } from '@/api/points'

const userStore = useUserStore()

const list = ref([])
const loading = ref(false)
const finished = ref(false)
const page = ref(1)

const systemInfo = uni.getSystemInfoSync()
const statusBarHeight = systemInfo.statusBarHeight || 0
const bgHeight = computed(() => {
  // 46px(nav) + 20rpx(padding) + 268rpx(card) + 30rpx(margin)
  // 318rpx 转换为 px: 318 / (750 / windowWidth)
  const rpxToPx = 330 * (systemInfo.windowWidth / 750)
  return `${statusBarHeight + 46 + rpxToPx}px`
})

const currentPoints = computed(() => Math.max(0, Number(userStore.points) || 0))
const totalPointsText = computed(() => currentPoints.value.toFixed(2))
const totalPointsInteger = computed(() => totalPointsText.value.split('.')[0] || '0')
const totalPointsDecimal = computed(() => totalPointsText.value.split('.')[1] || '00')
const vipPoints = computed(() => pointNumber(userStore.profile?.vipAvailablePoints))
const rechargePoints = computed(() => pointNumber(userStore.profile?.rechargeAvailablePoints))
const giftPoints = computed(() => pointNumber(userStore.profile?.giftAvailablePoints))

const groupedList = computed(() => {
  const groups = {}
  list.value.forEach(item => {
    const date = parseTime(item.createTime) || new Date()
    const year = date.getFullYear()
    const month = date.getMonth() + 1
    const yearMonth = `${year}-${month}`
    
    if (!groups[yearMonth]) {
      groups[yearMonth] = {
        month: month,
        year: year,
        yearMonth: yearMonth,
        items: []
      }
    }
    groups[yearMonth].items.push(item)
  })
  
  // Convert to array and sort by year-month descending
  const result = Object.values(groups).sort((a, b) => {
    if (b.year !== a.year) return b.year - a.year
    return b.month - a.month
  })
  
  // Add an empty month if needed (like the image showing 4月 暂无明细)
  // Just for demonstration if there's only one month
  if (result.length > 0) {
    const lastGroup = result[result.length - 1]
    let prevMonth = lastGroup.month - 1
    if (prevMonth === 0) prevMonth = 12
    
    // Only add if we don't have many records
    if (result.length === 1) {
      result.push({
        month: prevMonth,
        yearMonth: `prev-${prevMonth}`,
        items: []
      })
    }
  }
  
  return result
})

onMounted(() => {
  refreshCurrentUserPoints()
  fetchList()
})

async function refreshCurrentUserPoints() {
  try {
    const data = await getCurrentUserPoints()
    if (!data || typeof data !== 'object') return
    userStore.setPoints(data.availablePoints)
    userStore.mergeProfile({
      availablePoints: pointNumber(data.availablePoints),
      vipAvailablePoints: pointNumber(data.vipAvailablePoints),
      rechargeAvailablePoints: pointNumber(data.rechargeAvailablePoints),
      giftAvailablePoints: pointNumber(data.giftAvailablePoints)
    })
  } catch (e) {
    console.error(e)
  }
}

async function fetchList() {
  if (loading.value || finished.value) return
  
  loading.value = true
  try {
    const res = await getPointsDetailsList({ page: page.value, size: 20 })
    if (res) {
      const records = res.list || res.records || res.rows || []
      const total = res.total || 0
      
      if (page.value === 1) {
        list.value = records
      } else {
        list.value = [...list.value, ...records]
      }
      
      if (list.value.length >= total || records.length === 0) {
        finished.value = true
      } else {
        page.value++
      }
    }
  } catch (e) {
    console.error(e)
  } finally {
    loading.value = false
  }
}

function loadMore() {
  fetchList()
}

function pointNumber(value) {
  const n = Number(value)
  return Number.isFinite(n) ? Math.max(0, Math.floor(n)) : 0
}

function parseTime(timeStr) {
  if (!timeStr) return null
  // 兼容 "2026-05-16T17:09:18" / "2026-05-16 17:09:18" / "2026-05-16T17:09:18.000Z" 等格式
  // 直接按字符串拆分，避免 iOS / 小程序对 ISO 格式解析不一致以及 UTC 时区偏移问题
  const str = String(timeStr)
  const match = str.match(/^(\d{4})-(\d{1,2})-(\d{1,2})[T\s](\d{1,2}):(\d{1,2})(?::(\d{1,2}))?/)
  if (match) {
    const [, y, mo, d, h, mi, s] = match
    return new Date(Number(y), Number(mo) - 1, Number(d), Number(h), Number(mi), Number(s || 0))
  }
  const fallback = new Date(str.replace(/-/g, '/'))
  return isNaN(fallback.getTime()) ? null : fallback
}

function formatTime(timeStr) {
  if (!timeStr) return ''
  const date = parseTime(timeStr)
  if (!date) return timeStr
  
  const yy = String(date.getFullYear()).slice(2)
  const mm = String(date.getMonth() + 1).padStart(2, '0')
  const dd = String(date.getDate()).padStart(2, '0')
  const hh = String(date.getHours()).padStart(2, '0')
  const min = String(date.getMinutes()).padStart(2, '0')
  
  return `${yy}-${mm}-${dd} ${hh}:${min}`
}

function goBack() {
  uni.navigateBack({
    fail: () => {
      uni.switchTab({
        url: '/pages/home/index',
        fail: () => {
          uni.redirectTo({ url: '/pages/home/index' })
        }
      })
    }
  })
}
</script>

<style lang="scss" scoped>
.points-detail-page {
  height: 100vh;
  background-color: rgba(244,244,244,1);
  display: flex;
  flex-direction: column;
  position: relative;
  display: flex;
  flex-direction: column;
}

.page-bg-top {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  background: linear-gradient(180deg, rgba(255,148,50,1) 0%,rgba(255,192,119,1) 100%);
  z-index: 0;
}

.content {
  position: relative;
  z-index: 1;
  flex: 1;
  // padding: 20rpx;
  display: flex;
  flex-direction: column;
  flex: 1;
  height: 0; // for scroll-view
}

/* Top Card */
.top-card {
  border-radius: 44rpx;
  overflow: hidden;
  margin-bottom: 30rpx;
  flex-shrink: 0;
  height: 268rpx;
  margin: 32rpx 20rpx 56rpx;
  border: 1rpx solid rgba(255,255,255,0.4);
}

.card-top {
  background: linear-gradient(69.58deg, rgba(255,241,226,1) 16.31%,rgba(255,241,241,0) 94.96%);
  height: 134rpx;
  padding: 0 40rpx;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.total-points {
  display: flex;
  align-items: flex-end;
}

.coin-icon {
  margin-right: 16rpx;
  image {
    width: 40rpx;
    height: 40rpx;
  }
}

.points-value {
  font-size: 64rpx;
  font-weight: bold;
  color: #333;
  line-height: 1;
}

.points-decimal {
  font-size: 40rpx;
}

.details-btn {
  background-color: rgba(255,255,255,0.8);
  border-radius: 40rpx;
  padding: 10rpx 40rpx;
  font-size: 26rpx;
  color: #666;
  font-weight: 500;
}

.card-bottom {
  // background-color: #FEB661;
  padding: 24rpx 0;
  display: flex;
  align-items: center;
}

.stat-item {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.stat-val {
  font-size: 32rpx;
  font-weight: bold;
  color: #fff;
  margin-bottom: 4rpx;
}

.stat-label {
  font-size: 22rpx;
  color: rgba(255, 255, 255, 0.8);
}

.stat-divider {
  width: 2rpx;
  height: 40rpx;
  background-color: rgba(255, 255, 255, 0.4);
}

/* List Container */
.list-container {
  flex: 1;
  height: 0;
  padding-bottom: calc(20rpx + env(safe-area-inset-bottom));
  padding-bottom: calc(20rpx + constant(safe-area-inset-bottom));
  padding-left: 20rpx;
  padding-right: 20rpx;
}

.global-empty {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 100rpx 0;
}

.global-empty-text {
  font-size: 28rpx;
  color: #999;
}

.month-group {
  background-color: #FFFFFF;
  border-radius: 32rpx;
  padding: 30rpx 40rpx;
  margin-bottom: 24rpx;
}

.month-header {
  display: flex;
  align-items: baseline;
  margin-bottom: 30rpx;
  position: relative;
}

.month-num {
  font-size: 40rpx;
  font-weight: bold;
  color: #333;
}

.month-text {
  font-size: 24rpx;
  color: #333;
  margin-left: 4rpx;
}

.empty-text {
  font-size: 28rpx;
  color: #999;
  position: absolute;
  left: 50%;
  transform: translateX(-50%);
}

.record-list {
  display: flex;
  flex-direction: column;
}

.record-item {
  display: flex;
  flex-direction: column;
}

.record-main {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  padding: 24rpx 0;
}

.record-info {
  flex: 1;
  padding-right: 20rpx;
}

.record-title-row {
  display: flex;
  align-items: center;
  margin-bottom: 12rpx;
}

.record-title {
  font-size: 30rpx;
  color: #333;
  font-weight: 500;
  margin-right: 16rpx;
}

.record-tag {
  font-size: 20rpx;
  padding: 2rpx 12rpx;
  border-radius: 8rpx;
}

.tag-consume {
  background-color: #FFA94D;
  color: #FFFFFF;
}

.tag-add {
  background-color: #34C759;
  color: #FFFFFF;
}

.record-time {
  font-size: 24rpx;
  color: #999;
  margin-bottom: 8rpx;
}

.record-expire {
  font-size: 24rpx;
  color: #999;
}

.record-amount {
  font-size: 36rpx;
  font-weight: bold;
  margin-top: 4rpx;
}

.amount-consume {
  color: #333;
}

.amount-add {
  color: #333;
}

.record-divider {
  height: 1rpx;
  background-color: #F0F0F0;
  width: 100%;
}

.loading-status {
  text-align: center;
  font-size: 24rpx;
  color: #999;
  padding: 30rpx 0;
}
</style>
