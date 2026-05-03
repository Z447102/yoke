<template>
  <!-- 首页工作台：顶区背景图至快捷入口，下接分区与宫格、自定义 tabBar -->
  <view class="home-page">
    <view class="home-top-skin">
      <image class="home-top-skin__bg" :src="heroTopSkinBg" mode="aspectFill" />
      <view class="home-top-skin__inner">
        <view class="hero">
          <HomeHeader />
          <TodayScoreCard
            :summary="homeStore.scoreSummary"
            :filters="homeStore.scoreFilters"
          />
          <HotContentList
            :list="homeStore.hotContents"
            @refresh="homeStore.refreshHotContents"
          />
        </view>
        <HomeQuickActions />
      </view>
    </view>

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
import heroTopSkinBg from '@/static/home/home-top-skin-bg.png'

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
  background: #f7f7f7;
}

/* 最顶部 → AI一键成片 / 引流数据：整段共用顶图，左下圆角 */
.home-top-skin {
  position: relative;
  overflow: hidden;
  border-bottom-left-radius: 40rpx;
  background-color: #ff9d34;
}

.home-top-skin__bg {
  position: absolute;
  left: 0;
  top: 0;
  right: 0;
  bottom: 0;
  width: 100%;
  height: 100%;
  z-index: 0;
  pointer-events: none;
  transform: scale(1.08);
  transform-origin: center top;
}

.home-top-skin__inner {
  position: relative;
  z-index: 1;
}

.hero {
  /* 与头部、评分、爆款内容统一左边距 24rpx；右侧含安全区 */
  padding-top: 0;
  padding-bottom: 20rpx;
  padding-left: 24rpx;
  padding-right: calc(24rpx + env(safe-area-inset-right));
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
