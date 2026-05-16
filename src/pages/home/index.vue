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
            :platform-options="platformOptions"
            :industry-open="showIndustryPopup"
            :platform-open="showPlatformPopup"
            @open-industry-picker="onOpenIndustryPicker"
            @open-platform-picker="onOpenPlatformPicker"
          />
        </view>
        <HotContentList
          :list="homeStore.hotContents"
          @refresh="homeStore.refreshHotContents"
        />
        <HomeQuickActions />
      </view>
    </view>
    <!-- 暂时隐藏 -->
<!-- 
    <view class="section-divider">
      <view class="section-divider__bar"></view>
    </view>

    <DigitalHumanSection :list="homeStore.digitalHumans" />

    <VideoCreationSection :stats="homeStore.creationStats" />

    <ToolGrid
      title="智能工具库"
      :title-icon-src="homeToolGridSmartIcon"
      :module-icon-srcs="smartToolModuleIcons"
      :tools="homeStore.smartTools"
      cta-text="左滑查看全部工具"
    />

    <ToolGrid
      title="文案工作站"
      :title-icon-src="homeToolGridCopywritingIcon"
      :module-icon-srcs="copywritingModuleIcons"
      :tools="homeStore.copywritingTools"
      cta-text="左滑进入工作站"
    /> -->
    <HomeTabBar />

    <!-- 行业筛选弹窗：放在页面根节点，避开 .home-top-skin 的滚动/层叠上下文与 HomeTabBar 遮挡 -->
    <IndustrySelectPopup
      :show="showIndustryPopup"
      :options="industryOptions"
      :selected-industry="homeStore.scoreFilters.industry || ''"
      @close="onCloseIndustryPopup"
      @confirm="onConfirmIndustry"
    />

    <!-- 平台筛选弹窗：同上，避免被卡片裁剪或 HomeTabBar 盖住 -->
    <PlatformSelectPopup
      :show="showPlatformPopup"
      :options="platformOptions"
      :selected-id="homeStore.scoreFilters.platform || ''"
      @close="onClosePlatformPopup"
      @confirm="onConfirmPlatform"
    />
  </view>
</template>

<script setup>
import { StaticPath } from '@/config'
/**
 * 【首页】登录后工作台：数据由 homeStore 拉取（api/home Mock），下拉刷新见 onPullDownRefresh。
 * 水平边距：顶区 hero / 快捷入口 / 分区标题与卡片统一 24rpx；安全区同时写 constant + env。
 */
import { ref } from 'vue'
import { onLoad, onPullDownRefresh } from '@dcloudio/uni-app'
import { useHomeStore } from '@/stores/home'
import { hidePageLoading, showPageLoading } from '@/utils/page-loading'
import { isApiEnabled } from '@/utils/request'
import { fetchIndustryOptionNames } from '@/api/metadata'
import { CREATE_INDUSTRY_OPTIONS } from '@/constants/create'
import HomeHeader from './components/HomeHeader.vue'
import TodayScoreCard from './components/TodayScoreCard.vue'
import HotContentList from './components/HotContentList.vue'
import HomeQuickActions from './components/HomeQuickActions.vue'
// import DigitalHumanSection from './components/DigitalHumanSection.vue'
// import VideoCreationSection from './components/VideoCreationSection.vue'
// import ToolGrid from './components/ToolGrid.vue'
import HomeTabBar from './components/HomeTabBar.vue'
import IndustrySelectPopup from '@/pages/create/components/IndustrySelectPopup.vue'
import PlatformSelectPopup from '@/pages/create/components/PlatformSelectPopup.vue'
import { PLATFORM_OPTIONS } from '@/constants/create-selected-platform'

/**
 * 首页评分卡的行业筛选列表：默认本地枚举兜底；
 * 已配置 API 基址时，打开弹窗前会请求 `/api/industries` 并按 sort 升序回填名称。
 */
const industryOptions = ref([...CREATE_INDUSTRY_OPTIONS])

/** 首页评分卡的平台筛选枚举：与 generate 页共用同一份 `PLATFORM_OPTIONS`（id 为 'douyin' 等） */
const platformOptions = PLATFORM_OPTIONS
const heroTopSkinBg = `${StaticPath}home/home-top-skin-bg.png`
// const homeToolGridSmartIcon = `${StaticPath}home/home-tool-grid-smart-icon.png`
// const homeToolGridCopywritingIcon = `${StaticPath}home/home-tool-grid-copywriting-icon.png`
const homeToolModuleChat = `${StaticPath}home/home-tool-module-chat.png`
const homeToolModuleDress = `${StaticPath}home/home-tool-module-dress.png`
const homeToolModuleHd = `${StaticPath}home/home-tool-module-hd.png`
const homeToolModuleVoice = `${StaticPath}home/home-tool-module-voice.png`
const homeToolModuleFace = `${StaticPath}home/home-tool-module-face.png`
const homeToolModulePhoto = `${StaticPath}home/home-tool-module-photo.png`
const homeToolModuleGoods = `${StaticPath}home/home-tool-module-goods.png`
const homeToolModuleHair = `${StaticPath}home/home-tool-module-hairstyle.png`


const homeCopywritingModule1 = `${StaticPath}home/home-copywriting-module-1.png`
const homeCopywritingModule2 = `${StaticPath}home/home-copywriting-module-2.png`
const homeCopywritingModule3 = `${StaticPath}home/home-copywriting-module-3.png`

const homeStore = useHomeStore()

/** 与 Mock 前三项对应：文字生图 / 人物换装 / 图片高清化 */
const smartToolModuleIcons = [
  homeToolModuleChat,
  homeToolModuleDress,
  homeToolModuleHd,
  homeToolModuleVoice,
  homeToolModuleFace,
  homeToolModuleGoods,
  homeToolModulePhoto,
  homeToolModuleHair
]

/** 与 Mock 前三项对应：企业宣传 / 文案仿写 / 电商带货 */
const copywritingModuleIcons = [
  homeCopywritingModule1,
  homeCopywritingModule2,
  homeCopywritingModule3
]

onLoad(async () => {
  showPageLoading()
  try {
    await homeStore.fetchDashboard()
  } finally {
    hidePageLoading()
  }
})

onPullDownRefresh(async () => {
  await homeStore.fetchDashboard()
  uni.stopPullDownRefresh()
})

// --- 行业筛选弹窗（由 TodayScoreCard 触发，本页托管渲染） ---
const showIndustryPopup = ref(false)

/**
 * 触发打开行业弹窗：
 * - 已配置接口：先 page-loading 拉取 `/api/industries`，成功覆盖 `industryOptions`；
 *   失败时回落到本地 `CREATE_INDUSTRY_OPTIONS` 并 toast 提示，但仍打开弹窗
 * - 未配置接口：直接打开弹窗使用本地枚举
 */
async function onOpenIndustryPicker() {
  if (isApiEnabled()) {
    showPageLoading()
    try {
      const names = await fetchIndustryOptionNames()
      if (Array.isArray(names) && names.length) {
        industryOptions.value = names
      }
    } catch (e) {
      industryOptions.value = [...CREATE_INDUSTRY_OPTIONS]
      uni.showToast({
        title: e?.message ? String(e.message) : '行业列表加载失败',
        icon: 'none'
      })
    } finally {
      hidePageLoading()
    }
  }
  showIndustryPopup.value = true
}

function onCloseIndustryPopup() {
  showIndustryPopup.value = false
}

/**
 * @param {string} val IndustrySelectPopup 回传的行业名
 * 同值短路；不同值则写入 homeStore 并刷新看板（与原下拉版一致）
 */
async function onConfirmIndustry(val) {
  showIndustryPopup.value = false
  if (!val || val === homeStore.scoreFilters.industry) return
  homeStore.setScoreFilter('industry', val)
  await homeStore.fetchDashboard()
}

// --- 平台筛选弹窗（由 TodayScoreCard 触发，本页托管渲染） ---
const showPlatformPopup = ref(false)

function onOpenPlatformPicker() {
  showPlatformPopup.value = true
}

function onClosePlatformPopup() {
  showPlatformPopup.value = false
}

/**
 * @param {string} val PlatformSelectPopup 回传的平台 id（与 `PLATFORM_OPTIONS` 一致，如 `'douyin'`）
 * 同值短路；不同值则写入 homeStore 并刷新看板（与原下拉版一致）
 */
async function onConfirmPlatform(val) {
  showPlatformPopup.value = false
  if (!val || val === homeStore.scoreFilters.platform) return
  homeStore.setScoreFilter('platform', val)
  await homeStore.fetchDashboard()
}
</script>

<style lang="scss" scoped>
.home-page {
  height: 100vh;
  // background: #f7f7f7;
  // background-color: #ff9d34;
  box-sizing: border-box;
}

/* 最顶部 → AI一键成片 / 引流数据：整段共用顶图，左下圆角 */
.home-top-skin {
  position: relative;
  overflow-y: scroll;
  overflow-x: hidden;
  scrollbar-width: none;
  -ms-overflow-style: none;
  // border-bottom-left-radius: 40rpx;
  // background-color: #ff9d34;
  height: 100%;
  padding-bottom: calc(150rpx + constant(safe-area-inset-bottom));
  padding-bottom: calc(150rpx + env(safe-area-inset-bottom));
}

.home-top-skin::-webkit-scrollbar {
  display: none;
  width: 0;
  height: 0;
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
  // transform: scale(1.08);
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
  padding-right: calc(24rpx + constant(safe-area-inset-right));
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
