<template>
  <!-- 我的：顶区深色头图 + 白卡叠压、点数/业务、VIP/充值、四入口、作品 Tab+条+宫格 -->
  <view class="mine-page">
    <view class="mine-hero">
      <view class="mine-hero__tone" />
      <view class="mine-hero__bg-wrap" :style="mineHeroBgStyle" />
      <view class="mine-hero__inner">
        <!-- 顶距用占位块：确保整行（含会员兑换）整体在胶囊下缘以下，避免 padding-top 在部分端不生效 -->
        <view
          class="mine-hero__nav-placeholder"
          :style="{ height: `${heroLayout.navPlaceholderPx}px` }"
        />
        <view class="mine-hero__row">
          <view class="mine-avatar-ring">
            <image
              v-if="displayAvatarUrl"
              class="mine-avatar-img"
              :src="displayAvatarUrl"
              mode="aspectFill"
            />
            <view v-else class="mine-avatar-fallback">{{ avatarLetter }}</view>
          </view>
          <!-- 昵称区与会员兑换：右侧留白由样式 rpx + safe-area 控制，不再用 JS 计算 padding-right -->
          <view class="mine-hero__right">
            <view class="mine-hero__meta">
              <view class="mine-name-row" @tap="onAccountTap">
                <text class="mine-name">{{ displayName }}</text>
                <image
                  class="mine-name-arrow"
                  :src="mineNameChevron"
                  mode="aspectFit"
                />
              </view>
            </view>
            <view class="mine-hero__exchange-wrap">
              <view class="mine-exchange" @tap.stop="onMemberExchange">
                <text class="mine-exchange-text">会员兑换</text>
              </view>
            </view>
          </view>
        </view>
      </view>
    </view>

    <view class="mine-body">
      <view class="mine-top-surface">
        <view class="stats-card">
          <view class="stats-col" @tap="onPointsTap">
            <image class="stats-icon" :src="iconPoints" mode="aspectFit" />
            <view class="stats-mid">
              <text class="stats-title">我的点数</text>
              <text class="stats-value">{{ pointsDisplay }}</text>
            </view>
            <image class="stats-chev" :src="iconStatsChevronRight" mode="aspectFit" />
          </view>
          <view class="stats-divider" />
          <view class="stats-col right" @tap="goBusiness">
            <image class="stats-icon" :src="iconBusiness" mode="aspectFit" />
            <view class="stats-mid">
              <text class="stats-title">主营业务</text>
              <text class="stats-placeholder"> </text>
            </view>
            <image class="stats-chev" :src="iconStatsChevronRight" mode="aspectFit" />
          </view>
        </view>

        <view class="promo-row">
          <view
            class="promo-card promo-card--vip"
            :style="vipPromoBgStyle"
            @tap="onVipTap"
          >
            <view class="promo-card__text">
              <view class="promo-card__title-row">
                <image
                  class="promo-card__vip-badge"
                  :src="minePromoVipBadge"
                  mode="aspectFit"
                  :lazy-load="false"
                />
                <text class="promo-card__title">会员中心</text>
              </view>
              <view class="promo-card__sub-vip">
                <text class="promo-card__sub-vip-txt">当前立省 ¥</text>
                <text class="promo-card__sub-vip-txt promo-card__sub-vip-txt--bold">99</text>
                <text class="promo-card__sub-vip-txt"> 送</text>
                <text class="promo-card__sub-vip-txt promo-card__sub-vip-txt--bold">1000</text>
                <text class="promo-card__sub-vip-txt">点</text>
              </view>
            </view>
            <view class="promo-card__circle">
              <image
                class="promo-card__arrow"
                :src="iconPromoNext"
                mode="aspectFit"
              />
            </view>
          </view>
          <view
            class="promo-card promo-card--points"
            :style="pointsPromoBgStyle"
            @tap="onRechargeTap"
          >
            <view class="promo-card__text">
              <text class="promo-card__title">点数充值</text>
              <view class="promo-card__sub-points">
                <text class="promo-card__sub-points-txt">首充8折</text>
                <text class="promo-card__sub-points-txt">限时优惠</text>
              </view>
            </view>
            <view class="promo-card__circle promo-card__circle--dark">
              <image
                class="promo-card__arrow"
                :src="iconPromoNext"
                mode="aspectFit"
              />
            </view>
          </view>
        </view>
      </view>

      <view class="tools-panel">
        <view class="tools-row">
          <view
            v-for="item in mineQuickTools"
            :key="item.key"
            class="tools-item"
            @tap="toastSoon(item.label)"
          >
            <image
              class="tools-icon-img"
              :src="item.icon"
              mode="aspectFit"
              :lazy-load="false"
            />
            <text class="tools-label">{{ item.label }}</text>
          </view>
        </view>
      </view>

      <view class="works-block">
        <scroll-view
          class="tabs-scroll"
          scroll-x
          :show-scrollbar="false"
          :enable-flex="true"
        >
          <view class="tabs-inner">
            <view
              v-for="tab in workTabs"
              :key="tab.key"
              class="tab-item"
              :class="{ 'tab-item--active': activeWorkTab === tab.key }"
              @tap="activeWorkTab = tab.key"
            >
              <text class="tab-label">{{ tab.label }}</text>
              <view class="tab-item__mark-row">
                <view v-if="activeWorkTab === tab.key" class="tab-item__mark" />
              </view>
            </view>
          </view>
        </scroll-view>

        <view class="works-block__body">
          <view class="works-banner">
            <text class="works-banner__text">{{ worksSummary }}</text>
            <view class="works-manage" @tap="onManageWorks">
              <text class="works-manage__icon">▦</text>
              <text class="works-manage__text">管理</text>
            </view>
          </view>

          <view v-if="worksList.length" class="works-grid">
            <view
              v-for="item in worksList"
              :key="item.id"
              class="work-cell"
              @tap="onWorkTap(item)"
            >
              <view class="work-thumb">
                <image class="work-thumb__img" :src="item.cover" mode="aspectFill" />
                <view class="work-thumb__play">
                  <text class="work-thumb__play-tri">▶</text>
                </view>
                <view class="work-thumb__bar">
                  <text class="work-thumb__meta">{{ item.duration }} {{ item.date }}</text>
                </view>
              </view>
            </view>
          </view>
          <view v-else class="works-empty">
            <text class="works-empty__text">暂无作品，去创作页试试吧</text>
            <view class="works-empty__btn" @tap="goCreate">
              <text>去创作</text>
            </view>
          </view>
        </view>
      </view>

      <view class="mine-subnav">
        <text class="mine-subnav__link" @tap="goAccountSecurity">账号与安全</text>
        <text class="mine-subnav__sep">|</text>
        <text class="mine-subnav__link mine-subnav__link--warn" @tap="handleLogout">
          退出登录
        </text>
      </view>
    </view>

    <HomeTabBar />
  </view>
</template>

<script setup>
import { computed, nextTick, onMounted, ref, watch } from 'vue'
import { onPullDownRefresh, onReady, onShow } from '@dcloudio/uni-app'
import { useUserStore } from '@/stores/user'
import { performLogout } from '@/hooks/use-login'
import { getMinePageData } from '@/api/mine'
import { hidePageLoading, showPageLoading } from '@/utils/page-loading'
import HomeTabBar from '@/pages/home/components/HomeTabBar.vue'
import mineHeaderBg from '@/static/mine/mine-header-bg.png'
import iconPoints from '@/static/mine/icon-points.png'
import iconBusiness from '@/static/mine/icon-business.png'
import iconStatsChevronRight from '@/static/mine/mine-stats-chevron-right.png'
import mineNameChevron from '@/static/mine/mine-name-chevron.png'
import iconPromoNext from '@/static/mine/mine-promo-next-icon.png'
import minePromoVipBg from '@/static/mine/mine-promo-vip-bg.png'
import minePromoVipBadge from '@/static/mine/mine-promo-vip-badge.png'
import minePromoPointsBg from '@/static/mine/mine-promo-points-bg.png'
import mineToolDigitalHuman from '@/static/mine/mine-tool-digital-human.png'
import mineToolLearning from '@/static/mine/mine-tool-learning.png'
import mineToolNotice from '@/static/mine/mine-tool-notice.png'
import mineToolService from '@/static/mine/mine-tool-service.png'

const userStore = useUserStore()

const mineQuickTools = [
  { key: 'digital', label: '我的数字人', icon: mineToolDigitalHuman },
  { key: 'learning', label: '学习中心', icon: mineToolLearning },
  { key: 'notice', label: '通知与反馈', icon: mineToolNotice },
  { key: 'service', label: '联系客服', icon: mineToolService }
]

const DEFAULT_CAT_AVATAR =
  'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=240&h=240&fit=crop'

/** 顶区：仅胶囊下缘占位高度（px）；右侧 padding 见 .mine-hero__inner 样式 */
const heroLayout = ref({
  navPlaceholderPx: 128
})

/** 顶区头图：与资源 750×413 同比例，用 100% auto 避免 100%100% 纵向拉伸导致观感偏色 */
const mineHeroBgStyle = {
  backgroundImage: `url(${mineHeaderBg})`,
  backgroundRepeat: 'no-repeat',
  backgroundSize: '100% auto',
  backgroundPosition: 'center top'
}

/** VIP 会员中心：设计底图 + 灰色底（小程序用 import 保证背景图路径） */
const vipPromoBgStyle = {
  backgroundColor: 'rgba(229, 229, 229, 1)',
  backgroundImage: `url(${minePromoVipBg})`,
  backgroundSize: '100% 100%',
  backgroundRepeat: 'no-repeat',
  backgroundPosition: 'center'
}

/** 点数充值：深色底图（小程序用 import 保证背景图路径） */
const pointsPromoBgStyle = {
  backgroundColor: 'rgba(28, 28, 28, 1)',
  backgroundImage: `url(${minePromoPointsBg})`,
  backgroundSize: '100% 100%',
  backgroundRepeat: 'no-repeat',
  backgroundPosition: 'center'
}

/**
 * 读取：readMenuButtonRect
 */
function readMenuButtonRect() {
  try {
    if (typeof wx !== 'undefined' && typeof wx.getMenuButtonBoundingClientRect === 'function') {
      const mb = wx.getMenuButtonBoundingClientRect()
      if (mb && typeof mb.top === 'number' && mb.top > 0) return mb
    }
  } catch (_) {
    /* ignore */
  }
  try {
    if (typeof uni !== 'undefined' && typeof uni.getMenuButtonBoundingClientRect === 'function') {
      const mb = uni.getMenuButtonBoundingClientRect()
      if (mb && typeof mb.top === 'number' && mb.top > 0) return mb
    }
  } catch (_) {
    /* 非微信小程序等环境 */
  }
  return null
}

/** 胶囊下缘（px）：取 bottom 与 top+height，避免部分机型的 bottom 偏小；不再叠加对称公式以免顶区过高、与稿面比例不符 */
function navBarBottomPx(mb) {
  if (!mb || typeof mb.top !== 'number') return 0
  const h = typeof mb.height === 'number' && mb.height > 0 ? mb.height : 32
  const byBottom = typeof mb.bottom === 'number' && mb.bottom > 0 ? mb.bottom : 0
  const byTop = mb.top + h
  return Math.max(byBottom, byTop)
}

/**
 * 同步：syncHeroLayout
 */
function syncHeroLayout() {
  let navPlaceholderPx = 0
  try {
    const si = uni.getSystemInfoSync()
    const safeTop =
      si.safeAreaInsets && typeof si.safeAreaInsets.top === 'number'
        ? Number(si.safeAreaInsets.top)
        : 0
    const sb = Number(si.statusBarHeight) || 0

    const mb = readMenuButtonRect()
    const gapBelow = uni.upx2px ? uni.upx2px(12) : 10

    if (mb) {
      const navBottom = navBarBottomPx(mb)
      if (navBottom > 0) {
        navPlaceholderPx = navBottom + gapBelow
      }
    }

    if (navPlaceholderPx <= 0) {
      const merged = Math.max(sb, safeTop)
      const base = merged > 0 ? merged : 44
      const extra = uni.upx2px ? uni.upx2px(40) : 36
      navPlaceholderPx = base + extra + 8
    }

    const minPlaceholder =
      Math.max(sb, safeTop) + (uni.upx2px ? uni.upx2px(44) : 40)
    navPlaceholderPx = Math.max(navPlaceholderPx, minPlaceholder)

    heroLayout.value = {
      navPlaceholderPx: Math.round(navPlaceholderPx)
    }
  } catch (_) {
    heroLayout.value = { navPlaceholderPx: 128 }
  }
}

/**
 * 调度/延后执行：scheduleHeroLayoutSync
 */
function scheduleHeroLayoutSync() {
  syncHeroLayout()
  nextTick(() => {
    syncHeroLayout()
    setTimeout(syncHeroLayout, 50)
    setTimeout(syncHeroLayout, 200)
  })
}

onMounted(async () => {
  scheduleHeroLayoutSync()
  showPageLoading()
  try {
    await loadMineWorks()
  } finally {
    hidePageLoading()
  }
})

onReady(() => {
  scheduleHeroLayoutSync()
})

onShow(() => {
  scheduleHeroLayoutSync()
  loadMineWorks()
})

onPullDownRefresh(async () => {
  await loadMineWorks()
  uni.stopPullDownRefresh()
})

const displayName = computed(() => {
  if (!userStore.isLogin || !userStore.profile) return '未登录'
  return userStore.profile.nickname || 'Cat - 先生'
})

const displayAvatarUrl = computed(() => {
  if (!userStore.isLogin || !userStore.profile) return ''
  return userStore.profile.avatarUrl || DEFAULT_CAT_AVATAR
})

const avatarLetter = computed(() => {
  const n = displayName.value || 'Y'
  return String(n).slice(0, 1).toUpperCase()
})

const memberLine = computed(() =>
  userStore.isLogin ? '未开通会员' : '未登录'
)

const pointsDisplay = computed(() => userStore.points ?? 0)

const workTabs = [
  { key: 'video', label: '视频作品' },
  { key: 'image', label: '图片作品' },
  { key: 'copy', label: '文案作品' }
]

const activeWorkTab = ref('video')

const worksCountByTab = ref({
  video: 389,
  image: 56,
  copy: 128
})

const worksList = ref([])

/**
 * 加载数据：loadMineWorks
 */
async function loadMineWorks() {
  try {
    const data = await getMinePageData(activeWorkTab.value)
    worksCountByTab.value = data.counts || worksCountByTab.value
    worksList.value = data.works || []
  } catch (_) {
    worksList.value = []
  }
}

watch(activeWorkTab, () => {
  loadMineWorks()
})

const worksSummary = computed(() => {
  const n = worksCountByTab.value[activeWorkTab.value] ?? 0
  const tab = workTabs.find((t) => t.key === activeWorkTab.value)
  const label = tab?.label ?? '作品'
  return `您已创作 ${n} 条${label}`
})

/**
 * 函数：toastSoon
 */
function toastSoon(name) {
  uni.showToast({ title: `${name}（待接入）`, icon: 'none' })
}

/**
 * 函数：goAccountSecurity
 */
function goAccountSecurity() {
  if (!userStore.isLogin) {
    uni.navigateTo({
      url: `/pages/login/index?redirect=${encodeURIComponent('/pages/home/mine/index')}`,
      fail: () => {
        uni.showToast({ title: '打开登录页失败', icon: 'none' })
      }
    })
    return
  }
  toastSoon('账号与安全')
}

/**
 * 事件处理：onAccountTap
 */
function onAccountTap() {
  if (!userStore.isLogin) {
    goAccountSecurity()
    return
  }
  toastSoon('个人资料')
}

/**
 * 事件处理：onMemberExchange
 */
function onMemberExchange() {
  toastSoon('会员兑换')
}

/**
 * 事件处理：onPointsTap
 */
function onPointsTap() {
  uni.showToast({ title: `当前点数 ${pointsDisplay.value}`, icon: 'none' })
}

/**
 * 函数：goBusiness
 */
function goBusiness() {
  uni.navigateTo({
    url: '/pages/create/business/index',
    fail: () => {
      uni.showToast({ title: '页面打开失败', icon: 'none' })
    }
  })
}

/**
 * 函数：goCreate
 */
function goCreate() {
  uni.redirectTo({
    url: '/pages/create/index',
    fail: () => {
      uni.showToast({ title: '打开失败', icon: 'none' })
    }
  })
}

/**
 * 事件处理：onVipTap
 */
function onVipTap() {
  toastSoon('VIP 会员中心')
}

/**
 * 事件处理：onRechargeTap
 */
function onRechargeTap() {
  toastSoon('点数充值')
}

/**
 * 事件处理：onManageWorks
 */
function onManageWorks() {
  toastSoon('作品管理')
}

/**
 * 事件处理：onWorkTap
 */
function onWorkTap(item) {
  uni.showToast({ title: `作品 ${item.id}`, icon: 'none' })
}

/**
 * 处理：handleLogout
 */
function handleLogout() {
  if (!userStore.isLogin) {
    uni.showToast({ title: '当前未登录', icon: 'none' })
    return
  }
  uni.showModal({
    title: '退出登录',
    content: '确认退出当前账号吗？',
    confirmText: '退出',
    confirmColor: '#ff8e24',
    success: async ({ confirm }) => {
      if (!confirm) return
      try {
        await performLogout()
        uni.showToast({ title: '已退出登录', icon: 'none' })
      } catch (_) {
        uni.showToast({ title: '退出失败，请重试', icon: 'none' })
      }
    }
  })
}
</script>

<style lang="scss" scoped>
.mine-page {
  min-height: 100vh;
  /* 底部：TabBar + 横条安全区（constant 兼容 iOS 11.2，env 为现行标准） */
  padding-bottom: calc(150rpx + constant(safe-area-inset-bottom));
  padding-bottom: calc(150rpx + env(safe-area-inset-bottom));
  background-color: rgba(246, 246, 246, 1);
}

.mine-hero {
  position: relative;
  z-index: 1;
  overflow: hidden;
  width: 750rpx;
  height: 413rpx;
  box-sizing: border-box;
}

.mine-hero__tone {
  position: absolute;
  left: 0;
  top: 0;
  right: 0;
  bottom: 0;
  width: 750rpx;
  z-index: 0;
  pointer-events: none;
  background: linear-gradient(180deg, rgba(255, 170, 71, 1) 0%, rgba(255, 227, 194, 1) 100%);
}

.mine-hero__bg-wrap {
  position: absolute;
  left: 0;
  top: 0;
  right: 0;
  bottom: 0;
  z-index: 1;
  overflow: hidden;
  pointer-events: none;
}

.mine-hero__inner {
  position: relative;
  z-index: 2;
  display: flex;
  flex-direction: column;
  align-items: stretch;
  
  /* 顶距：mine-hero__nav-placeholder；左右与首页内容区一致 24rpx + 安全区 */
  padding-left: calc(24rpx + constant(safe-area-inset-left));
  padding-left: calc(24rpx + env(safe-area-inset-left));
  padding-right: 24rpx;
  padding-bottom: 40rpx;
  box-sizing: border-box;
}

.mine-hero__nav-placeholder {
  flex-shrink: 0;
  width: 100%;
  pointer-events: none;
}

.mine-hero__row {
  display: flex;
  flex-direction: row;
  align-items: flex-start;
}

.mine-hero__right {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: row;
  align-items: flex-start;
  justify-content: flex-start;
  margin-left: 24rpx;
}

.mine-hero__exchange-wrap {
  flex-shrink: 0;
  margin-left: auto;
  padding-top: 4rpx;
}

.mine-avatar-ring {
  flex-shrink: 0;
  padding: 5rpx;
  border-radius: 50%;
  overflow: hidden;
  background: linear-gradient(
    165deg,
    #ffffff 0%,
    rgba(255, 252, 248, 0.94) 100%
  );
  box-shadow: 0 10rpx 28rpx rgba(0, 0, 0, 0.14);
}

.mine-avatar-img,
.mine-avatar-fallback {
  display: block;
  width: 140rpx;
  height: 140rpx;
  border-radius: 50%;
  box-sizing: border-box;
}

.mine-avatar-fallback {
  background: linear-gradient(145deg, #fff7ed 0%, #ffe8d2 100%);
  color: #ff8e24;
  font-size: 46rpx;
  font-weight: 800;
  line-height: 140rpx;
  text-align: center;
}

.mine-hero__meta {
  flex: 1;
  min-width: 0;
  padding-top: 2rpx;
  /* 与按钮留极小缝；按钮靠右由 exchange-wrap 的 margin-left:auto 负责 */
  padding-right: 8rpx;
}

.mine-name-row {
  display: flex;
  flex-direction: row;
  align-items: center;
  min-width: 0;
}

.mine-name {
  color: #1f2937;
  font-size: 32rpx;
  font-weight: 500;
  font-family: OPPOSans-medium, OPPOSans, -apple-system, sans-serif;
  letter-spacing: 0.5rpx;
  max-width: 100%;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.mine-name-arrow {
  flex-shrink: 0;
  margin-left: 4rpx;
  width: 36rpx;
  height: 36rpx;
  display: block;
}

.mine-member-line {
  display: block;
  margin-top: 10rpx;
  color: rgba(255, 255, 255, 0.78);
  font-size: 22rpx;
  font-weight: 400;
  line-height: 1.35;
}

.mine-exchange {
  flex-shrink: 0;
  width: 146rpx;
  height: 54rpx;
  padding: 0;
  border-radius: 12rpx;
  background-color: rgba(255, 231, 204, 1);
  border: none;
  box-shadow: none;
  display: flex;
  align-items: center;
  justify-content: center;
  box-sizing: border-box;
}

.mine-exchange-text {
  font-size: 28rpx;
  color: rgba(31, 41, 55, 1);
  font-weight: 400;
  font-family: OPPOSans-light, OPPOSans, -apple-system, sans-serif;
  line-height: 1;
  text-align: center;
  white-space: nowrap;
}

.mine-body {
  /* 白底区不整体上移压头图；仅 .stats-card 用负 margin 叠在头图上 */
  margin-top: 0;
  padding-top: 0;
  padding-bottom: 40rpx;
  padding-left: calc(24rpx + constant(safe-area-inset-left));
  padding-left: calc(24rpx + env(safe-area-inset-left));
  padding-right: calc(24rpx + constant(safe-area-inset-right));
  padding-right: calc(24rpx + env(safe-area-inset-right));
  position: relative;
  z-index: 3;
  background-color: rgba(246, 246, 246, 1);
}

.mine-top-surface {
  box-sizing: border-box;
  width: 750rpx;
  background-color: #ffffff;
  display: flex;
  flex-direction: column;
  align-items: stretch;
  /* 与下方「我的数字人」区间距由 .tools-panel margin-top 控制 */
  padding-bottom: 0;
  /* 与 tools-panel 一致：抵消 .mine-body 左右 padding，白底区 750rpx 通栏 */
  margin-left: calc(-24rpx - constant(safe-area-inset-left));
  margin-left: calc(-24rpx - env(safe-area-inset-left));
  margin-right: calc(-24rpx - constant(safe-area-inset-right));
  margin-right: calc(-24rpx - env(safe-area-inset-right));
  overflow: visible;
}

.stats-card {
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  width: 688rpx;
  height: 92rpx;
  /* 约一半压在头图上：92rpx 高的一半 ≈ 46rpx */
  margin-top: -46rpx;
  margin-left: auto;
  margin-right: auto;
  box-sizing: border-box;
  padding: 0 52rpx 0 56rpx;
  border-radius: 24rpx;
  background-color: rgba(255, 255, 255, 1);
  box-shadow: 0rpx 4rpx 12rpx 0rpx rgba(0, 0, 0, 0.1);
  position: relative;
  z-index: 5;
}

.stats-col {
  min-width: 0;
  display: flex;
  flex-direction: row;
  align-items: center;
}

.stats-icon {
  width: 40rpx;
  height: 40rpx;
  flex-shrink: 0;
}

.stats-mid {
  min-width: 0;
  margin-left: 16rpx;
  display: flex;
  align-items: center;
}

.stats-title {
  font-size: 28rpx;
  color: rgba(31, 41, 55, 1);
  font-family: OPPOSans-regular, OPPOSans, -apple-system, sans-serif;
  line-height: 1.2;
}

.stats-value {
  // margin-top: 4rpx;
  font-size: 28rpx;
  font-weight: 800;
  font-family: OPPOSans-bold, OPPOSans, -apple-system, sans-serif;
  color: #1a1a1a;
  line-height: 1.15;
  margin-left: 16rpx;
}

.stats-placeholder {
  margin-top: 4rpx;
  font-size: 28rpx;
  color: transparent;
}

.stats-chev {
  flex-shrink: 0;
  width: 36rpx;
  height: 36rpx;
  display: block;
  margin-left: 2rpx;
}

.stats-divider {
  width: 1rpx;
  height: 48rpx;
  align-self: center;
  margin: 0 4rpx;
  background: #eeeeee;
  flex-shrink: 0;
}

.promo-row {
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: center;
  gap: 28rpx;
  margin-top: 22rpx;
  margin-bottom: 28rpx;
}

.promo-card {
  position: relative;
  box-sizing: border-box;
  overflow: hidden;
}

.promo-card + .promo-card {
  margin-left: 0;
}

.promo-card--vip {
  flex: 0 0 328rpx;
  width: 328rpx;
  height: 118rpx;
  min-height: 118rpx;
  padding: 24rpx 20rpx 24rpx 28rpx;
  border-radius: 26rpx;
  box-shadow: none;
}

.promo-card--points {
  flex: 0 0 328rpx;
  width: 328rpx;
  height: 118rpx;
  min-height: 118rpx;
  padding: 24rpx 20rpx 24rpx 28rpx;
  border-radius: 26rpx;
  box-shadow: none;
}

.promo-card__text {
  display: flex;
  flex-direction: column;
}

.promo-card__title-row {
  display: flex;
  flex-direction: row;
  align-items: center;
  min-width: 0;
}

.promo-card__vip-badge {
  width: 62rpx;
  height: 26rpx;
  margin-right: 6rpx;
  flex-shrink: 0;
  display: block;
}

.promo-card__title {
  color: #ffffff;
  font-size: 28rpx;
  font-weight: 800;
  font-family: OPPOSans-medium, OPPOSans, -apple-system, sans-serif;
  line-height: 1.25;
}

.promo-card--vip .promo-card__title {
  font-size: 30rpx;
  color: #654222;
  font-weight: 500;
  font-family: OPPOSans-medium, OPPOSans, -apple-system, sans-serif;
}

.promo-card--points .promo-card__title {
  font-size: 30rpx;
  color: #ffffff;
  font-weight: 500;
  font-family: OPPOSans-medium, OPPOSans, -apple-system, sans-serif;
}

.promo-card__sub-points {
  margin-top: 8rpx;
  display: flex;
  flex-direction: row;
  align-items: baseline;
}

.promo-card__sub-points-txt {
  font-size: 20rpx;
  color: rgba(255, 255, 255, 0.5);
  font-family: OPPOSans-regular, OPPOSans, -apple-system, sans-serif;
  line-height: 1.35;
}

.promo-card__sub-points-txt:first-child {
  margin-right: 10rpx;
}

.promo-card__sub-vip {
  margin-top: 8rpx;
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  align-items: baseline;
}

.promo-card__sub-vip-txt {
  font-size: 20rpx;
  color: #8c5d22;
  font-family: OPPOSans-regular, OPPOSans, -apple-system, sans-serif;
  line-height: 1.35;
}

.promo-card__sub-vip-txt--bold {
  font-weight: 700;
  font-family: OPPOSans-bold, OPPOSans, -apple-system, sans-serif;
}

.promo-card__circle {
  position: absolute;
  right: 14rpx;
  top: 50%;
  width: 36rpx;
  height: 36rpx;
  margin-top: -18rpx;
  border-radius: 50%;
  background: transparent;
  display: flex;
  align-items: center;
  justify-content: center;
}

.promo-card__circle--dark {
  background: transparent;
}

.promo-card__arrow {
  width: 36rpx;
  height: 36rpx;
  display: block;
}

.tools-panel {
  box-sizing: border-box;
  width: 750rpx;
  height: 210rpx;
  margin-top: 20rpx;
  /* 抵消 .mine-body 左右 padding，与最外层同宽 750rpx 平铺 */
  margin-left: calc(-24rpx - constant(safe-area-inset-left));
  margin-left: calc(-24rpx - env(safe-area-inset-left));
  margin-right: calc(-24rpx - constant(safe-area-inset-right));
  margin-right: calc(-24rpx - env(safe-area-inset-right));
  padding: 0;
  background: #ffffff;
  border-radius: 0;
  display: flex;
  flex-direction: column;
  align-items: stretch;
  justify-content: center;
}

.tools-row {
  display: flex;
  flex-direction: row;
  align-items: flex-start;
  justify-content: space-between;
}

.tools-item {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-start;
}

.tools-icon-img {
  width: 68rpx;
  height: 68rpx;
  flex-shrink: 0;
  display: block;
}

.tools-label {
  margin-top: 12rpx;
  font-size: 24rpx;
  color: #1f2937;
  font-family: OPPOSans-regular, OPPOSans, -apple-system, sans-serif;
  text-align: center;
  line-height: 1.35;
}

.works-block {
  box-sizing: border-box;
  width: 750rpx;
  margin-top: 20rpx;
  margin-left: calc(-24rpx - constant(safe-area-inset-left));
  margin-left: calc(-24rpx - env(safe-area-inset-left));
  margin-right: calc(-24rpx - constant(safe-area-inset-right));
  margin-right: calc(-24rpx - env(safe-area-inset-right));
  padding-top: 44rpx;
  padding-left: 0;
  padding-right: 0;
  background-color: #ffffff;
}

.tabs-scroll {
  width: 100%;
  margin-top: 0;
  white-space: nowrap;
}

.works-block__body {
  box-sizing: border-box;
  width: 100%;
  padding-left: calc(24rpx + constant(safe-area-inset-left));
  padding-left: calc(24rpx + env(safe-area-inset-left));
  padding-right: calc(24rpx + constant(safe-area-inset-right));
  padding-right: calc(24rpx + env(safe-area-inset-right));
}

.tabs-inner {
  display: flex;
  flex-direction: row;
  align-items: flex-end;
  padding-bottom: 2rpx;
  /* Tab 文案左右留白；白底仍由外层 .works-block 通栏铺满 */
  padding-left: calc(24rpx + constant(safe-area-inset-left));
  padding-left: calc(24rpx + env(safe-area-inset-left));
  padding-right: calc(24rpx + constant(safe-area-inset-right));
  padding-right: calc(24rpx + env(safe-area-inset-right));
}

.tab-item {
  flex-shrink: 0;
  margin-right: 36rpx;
  display: inline-flex;
  flex-direction: column;
  align-items: center;
  box-sizing: border-box;
}

.tab-item__mark-row {
  display: flex;
  flex-direction: row;
  justify-content: center;
  align-items: flex-start;
  width: 100%;
  min-height: 12rpx;
  margin-top: 8rpx;
}

.tab-item__mark {
  width: 40rpx;
  height: 12rpx;
  border-radius: 8rpx;
  background-color: rgba(255, 165, 84, 1);
  flex-shrink: 0;
}

.tab-label {
  font-size: 28rpx;
  font-weight: 400;
  color: #6b7280;
  font-family: OPPOSans-regular, OPPOSans, -apple-system, sans-serif;
}

.tab-item--active .tab-label {
  font-size: 32rpx;
  font-weight: 700;
  color: rgba(16, 16, 16, 1);
  font-family: OPPOSans-medium, OPPOSans, -apple-system, sans-serif;
}

.works-banner {
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  box-sizing: border-box;
  margin-top: 18rpx;
  padding: 16rpx 20rpx;
  border-radius: 22rpx;
  border: 1rpx solid rgba(255, 255, 255, 1);
  background-color: rgba(255, 241, 226, 1);
}

.works-banner__text {
  flex: 1;
  min-width: 0;
  font-size: 24rpx;
  color: #7a5220;
  font-weight: 600;
  font-family: OPPOSans-regular, OPPOSans, -apple-system, sans-serif;
}

.works-manage {
  flex-shrink: 0;
  display: flex;
  flex-direction: row;
  align-items: center;
  margin-left: 12rpx;
  padding: 6rpx 18rpx;
  border-radius: 999rpx;
  background: #ffffff;
  box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.04);
}

.works-manage__icon {
  margin-right: 6rpx;
  font-size: 22rpx;
  color: #666666;
}

.works-manage__text {
  font-size: 22rpx;
  color: #666666;
  font-weight: 600;
  font-family: OPPOSans-regular, OPPOSans, -apple-system, sans-serif;
}

.works-grid {
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  justify-content: space-between;
  width: 100%;
  box-sizing: border-box;
  margin-top: 14rpx;
}

.work-cell {
  width: 222rpx;
  margin-bottom: 14rpx;
  box-sizing: border-box;
}

.work-thumb {
  position: relative;
  width: 100%;
  padding-top: 132%;
  border-radius: 16rpx;
  overflow: hidden;
  background: #e8e8e8;
}

.work-thumb__img {
  position: absolute;
  left: 0;
  top: 0;
  width: 100%;
  height: 100%;
}

.work-thumb__play {
  position: absolute;
  left: 50%;
  top: 50%;
  width: 52rpx;
  height: 52rpx;
  margin-left: -26rpx;
  margin-top: -26rpx;
  border-radius: 50%;
  background: rgba(0, 0, 0, 0.38);
  border: 2rpx solid rgba(255, 255, 255, 0.92);
  display: flex;
  align-items: center;
  justify-content: center;
}

.work-thumb__play-tri {
  margin-left: 3rpx;
  font-size: 20rpx;
  color: #ffffff;
  line-height: 1;
}

.work-thumb__bar {
  position: absolute;
  left: 0;
  right: 0;
  bottom: 0;
  padding: 8rpx 10rpx;
  background: linear-gradient(180deg, transparent, rgba(0, 0, 0, 0.68));
}

.work-thumb__meta {
  font-size: 18rpx;
  color: rgba(255, 255, 255, 0.96);
  font-family: OPPOSans-regular, OPPOSans, -apple-system, sans-serif;
}

.works-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 100%;
  box-sizing: border-box;
  margin-top: 32rpx;
  padding: 48rpx 0;
  border-radius: 0;
  background: transparent;
  box-shadow: none;
}

.works-empty__text {
  font-size: 26rpx;
  color: #999999;
  font-family: OPPOSans-regular, OPPOSans, -apple-system, sans-serif;
  text-align: center;
  line-height: 1.5;
}

.works-empty__btn {
  margin-top: 24rpx;
  padding: 16rpx 48rpx;
  border-radius: 999rpx;
  background: linear-gradient(180deg, #ffbd72 0%, #ff963a 100%);
}

.works-empty__btn text {
  font-size: 26rpx;
  color: #ffffff;
  font-weight: 700;
  font-family: OPPOSans-medium, OPPOSans, -apple-system, sans-serif;
}

.mine-subnav {
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: center;
  margin-top: 28rpx;
  padding: 20rpx 0 8rpx;
}

.mine-subnav__link {
  font-size: 24rpx;
  color: #888888;
  font-weight: 500;
  font-family: OPPOSans-regular, OPPOSans, -apple-system, sans-serif;
}

.mine-subnav__link--warn {
  color: #ff7a1a;
}

.mine-subnav__sep {
  margin: 0 20rpx;
  font-size: 22rpx;
  color: #dddddd;
}
</style>
