<template>
  <view class="vip-page">
    <image class="page-bg" :src="vipBg" mode="aspectFill" />
    
    <!-- Custom Navigation Bar -->
    <Navbar 
      left-text="会员中心" 
      left-arrow 
      :custom-style="{ background: 'transparent' }"
      :border="false"
      @click-left="goBack" 
    />

    <view class="content-wrapper">
      <view class="table-header" :class="{ 'is-scrolled': isScrolled }">
        <view class="col-title font-medium">权益</view>
        <view class="col-vip-year">
          <image class="vip-icon" src="../static/vip/vip-year.png" mode="aspectFit" />
          <image class="vip-text" src="../static/vip/vip-text.png" mode="aspectFit" />
        </view>
        <view class="col-vip-month">
           <image class="vip-icon" src="../static/vip/vip-month.png" mode="aspectFit" />
           <image class="vip-text" src="../static/vip/vip-text.png" mode="aspectFit" />
        </view>
        <view class="col-normal font-medium">普通用户</view>
      </view>

      <!-- Top Scrollable Area -->
      <view class="scroll-wrapper">
        <scroll-view 
          class="top-scroll" 
          scroll-y 
          @scroll="onScroll"
        >
          <view class="benefits-table">
            <view class="year-highlight-bg"></view>
            <view class="table-body">
              <view class="table-row" v-for="(row, index) in benefits" :key="index">
                <view class="col-title font-bold">{{ row.title }}</view>
                <view class="col-vip-year" :class="{ 'is-infinite': row.year === '无限♾️' }">
                  <text class="font-bold">{{ row.year }}</text>
                </view>
                <view class="col-vip-month font-bold">{{ row.month }}</view>
                <view class="col-normal font-bold">{{ row.normal }}</view>
              </view>
            </view>
          </view>
        </scroll-view>
        
        <!-- Scroll indicator -->
        <view class="scroll-indicator" :class="{ 'is-up': isAtBottom }">
          <image class="indicator-icon-img" src="../static/vip/vip-arrow.png" mode="aspectFit" />
        </view>
      </view>

      <!-- Bottom Modal -->
      <view class="bottom-modal-wrapper">
        <VipSubscribeModal 
          :show="true" 
          :show-drag="false"
          :show-close="false"
          variant="continuous" 
          class="embedded-modal" 
          @close="goBack" 
        />
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref, onMounted, getCurrentInstance } from 'vue'
import vipBg from '@/pages/home/mine/static/vip-bg.png'
import VipSubscribeModal from '@/pages/create/components/VipSubscribeModal.vue'
import Navbar from '@/pages/components/Navbar.vue'

const isScrolled = ref(false)
const isAtBottom = ref(false)
const instance = getCurrentInstance()
let containerHeight = 0

const benefits = [
  { title: '视频清晰度', year: '1080P', month: '1080P', normal: '720P' },
  { title: '视频水印', year: '无', month: '无', normal: '有' },
  { title: '视频生成速度', year: '优先', month: '优先', normal: '普通' },
  { title: '视频模板库', year: '爆款视频', month: '爆款视频', normal: '普通视频' },
  { title: '视频模型', year: '高级模型', month: '高级模型', normal: '普通模型' },
  { title: '引流数据', year: '可查看', month: '可查看', normal: '—' },
  { title: '开通即送', year: '2000点', month: '—', normal: '—' },
  { title: '每月赠送', year: '200点/月', month: '—', normal: '—' },
  { title: '点数折扣', year: '8折', month: '9折', normal: '—' },
  { title: '数字人', year: '无限♾️', month: '3个', normal: '1个' },
  { title: '官方数字人', year: '全部可用', month: '全部可用', normal: '部分可用' },
]

onMounted(() => {
  setTimeout(() => {
    const query = uni.createSelectorQuery().in(instance.proxy)
    query.select('.top-scroll').boundingClientRect(data => {
      if (data) {
        containerHeight = data.height
      }
    }).exec()
  }, 100)
})

function goBack() {
  uni.navigateBack({
    fail: () => {
      uni.switchTab({ url: '/pages/home/index' })
    }
  })
}

function onScroll(e) {
  if (e.detail.scrollTop > 15) {
    isScrolled.value = true
  } else {
    isScrolled.value = false
  }

  if (containerHeight > 0) {
    // e.detail.scrollHeight is total scrollable height
    // e.detail.scrollTop is current scroll position
    if (e.detail.scrollHeight - e.detail.scrollTop - containerHeight <= 20) {
      isAtBottom.value = true
    } else {
      isAtBottom.value = false
    }
  }
}
</script>

<style lang="scss" scoped>
.vip-page {
  position: relative;
  width: 100vw;
  height: 100vh;
  display: flex;
  flex-direction: column;
  background-color: #fff;
}

.page-bg {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 0;
}

.content-wrapper {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-height: 0;
  position: relative;
  z-index: 1;
}

.scroll-wrapper {
  flex: 1;
  position: relative;
  min-height: 0;
}

.top-scroll {
  height: 100%;
}

.benefits-table {
  position: relative;
  // margin: 30rpx 24rpx 40rpx;
  margin: 0rpx 0rpx 40rpx;
  padding-top: 18rpx;
}

.year-highlight-bg {
  position: absolute;
  top: 0rpx;
  left: 170rpx;
  width: 192rpx;
  bottom: 0rpx;
  background-color: rgba(255,241,226,1);
  border-radius: 24rpx;
  border: 1pt solid rgba(255,255,255,1);
  z-index: 0;
}

.table-header {
  display: flex;
  flex-direction: row;
  align-items: center;
  height: 80rpx;
  position: relative;
  z-index: 10;
  margin-bottom: 2rpx;
  padding: 30rpx 24rpx 36rpx;
  box-shadow: 0 0 0 0 rgba(0, 0, 0, 0);
  transition: box-shadow 0.2s ease;
  font-size: 30rpx;
}

.table-header.is-scrolled {
  box-shadow: 0 12rpx 16rpx -12rpx rgba(0, 0, 0, 0.2);
}

.col-title {
  width: 144rpx;
  font-size: 30rpx;
  color: #333;
  padding-left: 10rpx;
}

.col-vip-year {
  width: 192rpx;
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: center;
}

.col-vip-month {
  width: 192rpx;
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: center;
}

.col-normal {
  width: 192rpx;
  text-align: center;
  font-size: 26rpx;
  color: #333;
  font-weight: 500;
}

.vip-badge {
  width: 32rpx;
  height: 32rpx;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20rpx;
  color: #fff;
  margin-right: 8rpx;
}

.year-badge {
  background: linear-gradient(135deg, #ffb366, #ff8c1a);
}

.month-badge {
  background: linear-gradient(135deg, #e6cba8, #d4a77e);
}

.vip-icon {
  width: 36rpx;
  height: 36rpx;
  margin-right: 8rpx;
}

.vip-text {
  width: 60rpx;
  height: 24rpx;
}

.vip-title {
  font-size: 30rpx;
  font-weight: 800;
  color: #333;
}

.table-body {
  position: relative;
  z-index: 1;
  padding: 0rpx 24rpx;
}

.table-row {
  display: flex;
  flex-direction: row;
  align-items: center;
  height: 72rpx;
}

.table-row .col-title {
  font-size: 24rpx;
  color: #666;
  font-weight: 400;
  padding-left: 10rpx;
}

.table-row .col-vip-year {
  font-size: 26rpx;
  color: #333;
  font-weight: 600;
}

.table-row .col-vip-month {
  font-size: 26rpx;
  color: #666;
  font-weight: 400;
}

.table-row .col-normal {
  font-size: 26rpx;
  color: #999;
  font-weight: 400;
}

.is-infinite {
  display: flex;
  align-items: center;
  justify-content: center;
}

.infinite-icon {
  font-size: 32rpx;
  color: #8a5df5;
  margin-left: 4rpx;
}

.scroll-indicator {
  position: absolute;
  left: 50%;
  transform: translateX(-50%);
  bottom: 20rpx;
  width: 48rpx;
  height: 48rpx;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  z-index: 10;
  transition: all 0.3s ease;
}

.scroll-indicator.is-up {
  bottom: auto;
  top: 20rpx;
}

.indicator-icon-img {
  width: 48rpx;
  height: 48rpx;
  transform: rotate(0deg);
  margin: -6rpx 0;
  animation: indicator-bounce 1.5s infinite ease-in-out;
}

.scroll-indicator.is-up .indicator-icon-img {
  transform: rotate(180deg);
  animation: indicator-bounce-up 1.5s infinite ease-in-out;
}

@keyframes indicator-bounce {
  0%, 100% {
    transform: rotate(0deg) translateY(0);
  }
  50% {
    transform: rotate(0deg) translateY(8rpx);
  }
}

@keyframes indicator-bounce-up {
  0%, 100% {
    transform: rotate(180deg) translateY(0);
  }
  50% {
    transform: rotate(180deg) translateY(8rpx);
  }
}

.bottom-modal-wrapper {
  flex-shrink: 0;
  position: relative;
  z-index: 10;
}

/* Override VipSubscribeModal styles to embed it */
:deep(.vip-mask) {
  position: relative !important;
  inset: auto !important;
  background: transparent !important;
  pointer-events: none !important;
  display: block !important;
}

:deep(.vip-modal) {
  position: relative !important;
  max-height: none !important;
  animation: none !important;
  pointer-events: auto !important;
}
</style>
