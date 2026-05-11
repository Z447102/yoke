<template>
  <view class="home-header" :style="headerPadStyle">
    <view class="brand">
      <image
        class="brand-name-img"
        :src="homeBrandYokeZh"
        mode="aspectFit"
      />
      <image
        class="brand-en-img"
        :src="homeBrandYokeEn"
        mode="aspectFit"
      />
    </view>
    <view class="date">
      <view class="date-md">
        <text class="date-month">{{ dateMonth }}</text>
        <text class="date-dot">.</text>
        <text class="date-num">{{ dateDay }}</text>
      </view>
      <text class="date-week">{{ dateWeekLabel }}</text>
    </view>
    <!-- 占位：避免内容与微信原生右上角胶囊重叠（非模拟系统按钮） -->
    <view class="home-header__nav-gap" />
  </view>
</template>

<script setup>
import { computed, ref, onMounted } from 'vue'
import homeBrandYokeZh from '@/static/home/home-brand-yoke-zh.png'
import homeBrandYokeEn from '@/static/home/home-brand-yoke-en.png'

const WEEKDAYS = ['星期日', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六']

const dateMonth = computed(() => `${new Date().getMonth() + 1}`)
const dateDay = computed(() => `${new Date().getDate()}`)

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
  padding-right: constant(safe-area-inset-right);
  padding-right: env(safe-area-inset-right);
  /* 首页向下滚动时顶栏固定；底色与 home-top-skin 橙区一致，避免下方内容上滑透出 */
  position: sticky;
  top: 0;
  z-index: 30;
  // background-color: #ff9d34;
}

.brand {
  display: flex;
  flex-direction: row;
  align-items: center;
  min-width: 0;
}

.brand-name-img {
  width: 100rpx;
  height: 46rpx;
  flex-shrink: 0;
  display: block;
}

.brand-en-img {
  width: 78rpx;
  height: 22rpx;
  margin-left: 8rpx;
  flex-shrink: 0;
  display: block;
}

.date {
  flex: 1;
  display: flex;
  flex-direction: row;
  align-items: baseline;
  justify-content: center;
  min-width: 0;
}

.date-md {
  display: flex;
  flex-direction: row;
  align-items: baseline;
}

/* 月份 */
.date-month {
  font-size: 24rpx;
  font-family: OPPOSans-bold, OPPOSans, 'PingFang SC', 'Microsoft YaHei',
    sans-serif;
  color: rgba(255, 255, 255, 1);
}

/* 分隔点，与月份同档字号以免错位 */
.date-dot {
  font-size: 24rpx;
  font-family: OPPOSans-bold, OPPOSans, 'PingFang SC', 'Microsoft YaHei',
    sans-serif;
  color: rgba(255, 255, 255, 1);
}

/* 日期数字 */
.date-num {
  font-size: 32rpx;
  font-family: OPPOSans-bold, OPPOSans, 'PingFang SC', 'Microsoft YaHei',
    sans-serif;
  color: rgba(255, 255, 255, 1);
}

/* 星期 */
.date-week {
  margin-left: 8rpx;
  font-size: 24rpx;
  font-family: OPPOSans-regular, OPPOSans, 'PingFang SC', 'Microsoft YaHei',
    sans-serif;
  color: rgba(255, 255, 255, 1);
}

/* 约等于微信胶囊宽度 + 间距，防止标题与系统按钮叠盖 */
.home-header__nav-gap {
  flex-shrink: 0;
  width: 174rpx;
  height: 32rpx;
}
</style>
