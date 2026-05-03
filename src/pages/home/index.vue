<template>
  <!-- 首页工作台：评分与爆款、快捷入口、数字人、创作、工具宫格、自定义 tabBar -->
  <view class="home-page">
    <view class="hero">
      <HomeHeader />
      <TodayScoreCard
        :summary="homeStore.scoreSummary"
        :filters="homeStore.scoreFilters"
      />
      <HotContentList :list="homeStore.hotContents" @refresh="homeStore.refreshHotContents" />
    </view>

    <HomeQuickActions />

    <view class="section-divider">
      <view class="section-divider__bar"></view>
    </view>

    <DigitalHumanSection :list="homeStore.digitalHumans" />

    <VideoCreationSection :stats="homeStore.creationStats" />

    <ToolGrid
      title="智能工具库"
      :tools="homeStore.smartTools"
      cta-text="左滑查看更多工具"
    />

    <ToolGrid
      title="文案工作站"
      :tools="homeStore.copywritingTools"
      cta-text="左滑进入工作站"
    />

    <HomeTabBar />
  </view>
</template>

<script setup>
/**
 * 【首页】登录后工作台：数据由 homeStore 拉取（api/home Mock），下拉刷新见 onPullDownRefresh。
 */
import { onLoad, onPullDownRefresh } from '@dcloudio/uni-app'
import { useHomeStore } from '@/stores/home'
import HomeHeader from './components/HomeHeader.vue'
import TodayScoreCard from './components/TodayScoreCard.vue'
import HotContentList from './components/HotContentList.vue'
import HomeQuickActions from './components/HomeQuickActions.vue'
import DigitalHumanSection from './components/DigitalHumanSection.vue'
import VideoCreationSection from './components/VideoCreationSection.vue'
import ToolGrid from './components/ToolGrid.vue'
import HomeTabBar from './components/HomeTabBar.vue'

const homeStore = useHomeStore()

onLoad(() => {
  homeStore.fetchDashboard()
})

onPullDownRefresh(async () => {
  await homeStore.fetchDashboard()
  uni.stopPullDownRefresh()
})
</script>

<style lang="scss" scoped>
.home-page {
  min-height: 100vh;
  padding-bottom: calc(150rpx + env(safe-area-inset-bottom));
  background: linear-gradient(180deg, #ff9d34 0, #ff9d34 560rpx, #f7f7f7 562rpx, #f7f7f7 100%);
}

.hero {
  padding: 0 18rpx 20rpx;
}

.section-divider {
  height: 34rpx;
  background: #f7f7f7;
  display: flex;
  align-items: center;
  justify-content: center;
}

.section-divider__bar {
  width: 54rpx;
  height: 8rpx;
  border-radius: 999rpx;
  background: #e0e0e0;
}
</style>
