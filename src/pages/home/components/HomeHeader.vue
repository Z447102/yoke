<template>
  <view class="home-header" :style="headerPadStyle">
    <view class="brand">
      <text class="brand-name">有客</text>
      <text class="brand-en">YOKE</text>
    </view>
    <view class="date">
      <text class="date-md">{{ dateMonthDay }}</text>
      <text class="date-week">{{ dateWeekLabel }}</text>
    </view>
    <!-- 占位：避免内容与微信原生右上角胶囊重叠（非模拟系统按钮） -->
    <view class="home-header__nav-gap" aria-hidden="true" />
  </view>
</template>

<script setup>
import { computed, ref, onMounted } from 'vue'

const WEEKDAYS = ['星期日', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六']

const dateMonthDay = computed(() => {
  const d = new Date()
  return `${d.getMonth() + 1}.${d.getDate()}`
})

const dateWeekLabel = computed(() => WEEKDAYS[new Date().getDay()])

/** 真机状态栏高度（px）；部分机型仅写 env(safe-area-inset-top) 仍为 0 会盖住系统时间 */
const statusBarPx = ref(44)

onMounted(() => {
  try {
    const si = uni.getSystemInfoSync()
    const h = si.statusBarHeight
    if (h != null && h > 0) {
      statusBarPx.value = h
    }
  } catch (_) {
    // 保持默认 44
  }
})

/** 状态栏 + 设计留白（20rpx 转 px）+ 额外 6px 与状态栏文字拉开 */
const headerPadStyle = computed(() => {
  const extra = typeof uni !== 'undefined' && uni.upx2px ? uni.upx2px(20) : 20
  const topPx = statusBarPx.value + extra + 6
  return { paddingTop: `${topPx}px` }
})
</script>

<style lang="scss" scoped>
.home-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  /* padding-top 由内联 style 注入：状态栏 + 留白 */
  padding-bottom: 16rpx;
  padding-left: 0;
  padding-right: env(safe-area-inset-right);
  /* 首页向下滚动时顶栏固定；底色与 home-top-skin 橙区一致，避免下方内容上滑透出 */
  position: sticky;
  top: 0;
  z-index: 30;
  background-color: #ff9d34;
}

.brand {
  display: flex;
  align-items: baseline;
  min-width: 0;
}

/* 设计图：Logo 粗黑 */
.brand-name {
  font-size: 36rpx;
  font-weight: 800;
  color: #1a1a1a;
  letter-spacing: 0.5rpx;
}

.brand-en {
  margin-left: 8rpx;
  font-size: 22rpx;
  font-weight: 700;
  color: #1a1a1a;
  letter-spacing: 1rpx;
}

.date {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  min-width: 0;
}

/* 月份与日期：白、16rpx、粗体 */
.date-md {
  font-family: OPPOSans-bold, 'PingFang SC', 'Microsoft YaHei', sans-serif;
  font-size: 16rpx;
  font-weight: 700;
  color: rgba(255, 255, 255, 1);
}

/* 星期 */
.date-week {
  margin-left: 8rpx;
  font-family: OPPOSans-regular, 'PingFang SC', 'Microsoft YaHei', sans-serif;
  font-size: 16rpx;
  font-weight: 400;
  color: rgba(255, 255, 255, 1);
}

/* 约等于微信胶囊宽度 + 间距，防止标题与系统按钮叠盖 */
.home-header__nav-gap {
  flex-shrink: 0;
  width: 174rpx;
  height: 32rpx;
}
</style>
