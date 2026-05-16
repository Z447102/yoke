<template>
  <view class="home-tab-bar">
    <view class="tab-item" @tap="goTo('/pages/home/index')">
      <image
        class="tab-icon-img"
        :src="homeTabSrc"
        mode="aspectFit"
      />
    </view>
    <view class="tab-main" @tap="navigateTo('/pages/create/index')">
      <image class="tab-main-img" :src="tabCenter" mode="aspectFill" />
    </view>
    <view class="tab-item" @tap="goTo('/pages/home/mine/index')">
      <image
        class="tab-icon-img"
        :src="mineTabSrc"
        mode="aspectFit"
      />
    </view>
  </view>
</template>

<script setup>
import { StaticPath } from '@/config'
import { ref, computed, onMounted } from 'vue'
import { onShow } from '@dcloudio/uni-app'
const tabHome = `${StaticPath}home/tabbar-home.png`
const tabHomeActive = `${StaticPath}home/tabbar-home-active.png`
const tabMine = `${StaticPath}home/tabbar-mine.png`
const tabMineActive = `${StaticPath}home/tabbar-mine-active.png`
const tabCenter = `${StaticPath}home/tabbar-center.png`

/** home | mine | create — 中间「创作」不高亮左右 icon */
const activeKey = ref('home')

/**
 * 同步：syncRoute
 */
function syncRoute() {
  try {
    const pages = getCurrentPages()
    const route = pages[pages.length - 1]?.route || ''
    if (route.includes('pages/home/mine/index')) activeKey.value = 'mine'
    else if (route.includes('pages/create')) activeKey.value = 'create'
    else activeKey.value = 'home'
  } catch (_) {
    activeKey.value = 'home'
  }
}

onMounted(syncRoute)
onShow(syncRoute)

const homeTabSrc = computed(() =>
  activeKey.value === 'home' ? tabHomeActive : tabHome
)

const mineTabSrc = computed(() =>
  activeKey.value === 'mine' ? tabMineActive : tabMine
)

/**
 * 页面跳转：goTo
 */
function goTo(url) {
  const pages = getCurrentPages()
  const currentPage = pages[pages.length - 1]
  const currentRoute = currentPage ? `/${currentPage.route}` : ''

  if (currentRoute === url) {
    return
  }

  uni.redirectTo({ url })
}

function navigateTo(url) {
  uni.navigateTo({ url })
}
</script>

<style lang="scss" scoped>
.home-tab-bar {
  position: fixed;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 20;
  height: 160rpx;
  padding-bottom: constant(safe-area-inset-bottom);
  padding-bottom: env(safe-area-inset-bottom);
  padding-left: 112rpx;
  padding-right: 112rpx;
  background-color: rgba(244, 244, 244, 1);
  display: flex;
  align-items: center;
  justify-content: space-between;
  box-shadow: 0 -8rpx 24rpx rgba(0, 0, 0, 0.04);
}

.tab-item {
  width: 90rpx;
  height: 90rpx;
  display: flex;
  align-items: center;
  justify-content: center;
}

.tab-icon-img {
  width: 52rpx;
  height: 52rpx;
}

.tab-main {
  width: 134rpx;
  height: 134rpx;
  margin-top: -28rpx;
  border: 8rpx solid white;
  border-radius: 50%;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 10rpx 24rpx rgba(255, 148, 48, 0.28);
}

.tab-main-img {
  width: 105%;
  height: 105%;
  border-radius: 50%;
}
</style>
