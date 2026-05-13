<template>
  <view class="home-tab-bar">
    <view class="tab-item" @tap="goTo('/pages/home/index')">
      <image
        class="tab-icon-img"
        :src="homeTabSrc"
        mode="aspectFit"
      />
    </view>
    <view class="tab-main" @tap="goTo('/pages/create/index')">
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
import { ref, computed, onMounted } from 'vue'
import { onShow } from '@dcloudio/uni-app'
import tabHome from '@/static/home/tabbar-home.png'
import tabHomeActive from '@/static/home/tabbar-home-active.png'
import tabMine from '@/static/home/tabbar-mine.png'
import tabMineActive from '@/static/home/tabbar-mine-active.png'
import tabCenter from '@/static/home/tabbar-center.png'

/** home | mine | create — 中间「创作」不高亮左右 icon */
const activeKey = ref('home')

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

function goTo(url) {
  const pages = getCurrentPages()
  const currentPage = pages[pages.length - 1]
  const currentRoute = currentPage ? `/${currentPage.route}` : ''

  if (currentRoute === url) {
    return
  }

  uni.redirectTo({ url })
}
</script>

<style lang="scss" scoped>
.home-tab-bar {
  position: fixed;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 20;
  height: calc(108rpx + constant(safe-area-inset-bottom));
  height: calc(108rpx + env(safe-area-inset-bottom));
  padding: 0 76rpx constant(safe-area-inset-bottom);
  padding: 0 76rpx env(safe-area-inset-bottom);
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
  width: 96rpx;
  height: 96rpx;
  margin-top: -42rpx;
  border: 8rpx solid #fff0d5;
  border-radius: 50%;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 10rpx 24rpx rgba(255, 148, 48, 0.28);
}

.tab-main-img {
  width: 100%;
  height: 100%;
  border-radius: 50%;
}
</style>
