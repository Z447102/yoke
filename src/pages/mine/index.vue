<template>
  <!-- 我的：设计稿 1:1（暖橙顶区、白卡叠压、点数/业务、VIP/充值、三入口、作品 Tab+条+宫格） -->
  <view class="mine-page">
    <view class="mine-hero">
      <view class="mine-hero__bg-wrap">
        <image class="mine-hero__bg" :src="mineHeaderBg" mode="aspectFill" />
      </view>
      <view class="mine-hero__shade" />
      <view class="mine-hero__inner" :style="heroPadStyle">
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
          <view class="mine-hero__meta">
            <view class="mine-name-row" @tap="onAccountTap">
              <text class="mine-name">{{ displayName }}</text>
              <text class="mine-name-arrow">›</text>
            </view>
            <text class="mine-member-line">{{ memberLine }}</text>
          </view>
          <view class="mine-exchange" @tap="onMemberExchange">
            <text class="mine-exchange-text">会员兑换</text>
          </view>
          <!-- 与微信右上角胶囊对齐留白，避免「会员兑换」被遮挡 -->
          <view class="mine-nav-gap" aria-hidden="true" />
        </view>
      </view>
    </view>

    <view class="mine-body">
      <view class="stats-card">
        <view class="stats-col" @tap="onPointsTap">
          <image class="stats-icon" :src="iconPoints" mode="aspectFit" />
          <view class="stats-mid">
            <text class="stats-title">我的点数</text>
            <text class="stats-value">{{ pointsDisplay }}</text>
          </view>
          <text class="stats-chev">›</text>
        </view>
        <view class="stats-divider" />
        <view class="stats-col" @tap="goBusiness">
          <image class="stats-icon" :src="iconBusiness" mode="aspectFit" />
          <view class="stats-mid">
            <text class="stats-title">主营业务</text>
            <text class="stats-placeholder"> </text>
          </view>
          <text class="stats-chev">›</text>
        </view>
      </view>

      <view class="promo-row">
        <view class="promo-card promo-card--vip" @tap="onVipTap">
          <view class="promo-card__text">
            <text class="promo-card__title">VIP 会员中心</text>
            <text class="promo-card__sub">当前立省 ¥99 送1000</text>
          </view>
          <view class="promo-card__circle">
            <text class="promo-card__arrow">›</text>
          </view>
        </view>
        <view class="promo-card promo-card--points" @tap="onRechargeTap">
          <view class="promo-card__text">
            <text class="promo-card__title">点数充值</text>
            <text class="promo-card__sub">首充8折 限时优惠</text>
          </view>
          <view class="promo-card__circle promo-card__circle--dark">
            <text class="promo-card__arrow">›</text>
          </view>
        </view>
      </view>

      <view class="tools-panel">
        <view class="tools-row">
          <view class="tools-item" @tap="toastSoon('学习中心')">
            <view class="tools-icon">▣</view>
            <text class="tools-label">学习中心</text>
          </view>
          <view class="tools-item" @tap="toastSoon('通知与反馈')">
            <view class="tools-icon">◇</view>
            <text class="tools-label">通知与反馈</text>
          </view>
          <view class="tools-item" @tap="toastSoon('联系客服')">
            <view class="tools-icon">◎</view>
            <text class="tools-label">联系客服</text>
          </view>
        </view>
      </view>

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
          </view>
        </view>
      </scroll-view>

      <view class="works-banner">
        <text class="works-banner__text">{{ worksSummary }}</text>
        <view class="works-manage" @tap="onManageWorks">
          <text class="works-manage__icon">▦</text>
          <text class="works-manage__text">管理</text>
        </view>
      </view>

      <view class="works-grid">
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
    </view>

    <HomeTabBar />
  </view>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'
import { onShow } from '@dcloudio/uni-app'
import { useUserStore } from '@/stores/user'
import HomeTabBar from '@/pages/home/components/HomeTabBar.vue'
import mineHeaderBg from '@/static/mine/mine-header-bg.png'
import iconPoints from '@/static/mine/icon-points.png'
import iconBusiness from '@/static/mine/icon-business.png'

const userStore = useUserStore()

const DEFAULT_CAT_AVATAR =
  'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=240&h=240&fit=crop'

/** 顶区：状态栏与安全区取大，再加与内容间距（对齐设计稿顶距） */
const topInsetPx = ref(48)

function syncTopSafeInset() {
  try {
    const si = uni.getSystemInfoSync()
    const sb = Number(si.statusBarHeight) || 0
    const st =
      si.safeAreaInsets && typeof si.safeAreaInsets.top === 'number'
        ? Number(si.safeAreaInsets.top)
        : 0
    topInsetPx.value = Math.max(sb, st, 24)
  } catch (_) {
    topInsetPx.value = 48
  }
}

onMounted(syncTopSafeInset)
onShow(syncTopSafeInset)

const heroPadStyle = computed(() => {
  let extra = 24
  try {
    extra = typeof uni !== 'undefined' && uni.upx2px ? uni.upx2px(28) : 24
  } catch (_) {
    extra = 24
  }
  return {
    paddingTop: `${topInsetPx.value + extra}px`
  }
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
  { key: 'digital', label: '数字人形象' },
  { key: 'image', label: '图片作品' },
  { key: 'copy', label: '文案作品' }
]

const activeWorkTab = ref('video')

const worksCountByTab = {
  video: 389,
  digital: 12,
  image: 56,
  copy: 128
}

const worksSummary = computed(() => {
  const n = worksCountByTab[activeWorkTab.value] ?? 0
  const label =
    activeWorkTab.value === 'video'
      ? '视频作品'
      : activeWorkTab.value === 'digital'
        ? '数字人形象'
        : activeWorkTab.value === 'image'
          ? '图片作品'
          : '文案作品'
  return `您已创作 ${n} 条${label}`
})

const mockCovers = [
  'https://images.unsplash.com/photo-1492691527719-9d1e07e534b4?w=400&h=300&fit=crop',
  'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=400&h=300&fit=crop',
  'https://images.unsplash.com/photo-1574717024653-61fd2cf4d44d?w=400&h=300&fit=crop',
  'https://images.unsplash.com/photo-1536240478700-b869070f9279?w=400&h=300&fit=crop',
  'https://images.unsplash.com/photo-1611162616475-46b635cb6868?w=400&h=300&fit=crop',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=300&fit=crop'
]

const worksList = computed(() =>
  Array.from({ length: 6 }, (_, i) => ({
    id: `${activeWorkTab.value}-${i}`,
    cover: mockCovers[i % mockCovers.length],
    duration: '时长: 30s',
    date: '26-4-20'
  }))
)

function toastSoon(name) {
  uni.showToast({ title: `${name}（待接入）`, icon: 'none' })
}

function onAccountTap() {
  toastSoon('个人资料')
}

function onMemberExchange() {
  toastSoon('会员兑换')
}

function onPointsTap() {
  uni.showToast({ title: `当前点数 ${pointsDisplay.value}`, icon: 'none' })
}

function goBusiness() {
  uni.navigateTo({
    url: '/pages/create/business/index',
    fail: () => {
      uni.showToast({ title: '页面打开失败', icon: 'none' })
    }
  })
}

function onVipTap() {
  toastSoon('VIP 会员中心')
}

function onRechargeTap() {
  toastSoon('点数充值')
}

function onManageWorks() {
  toastSoon('作品管理')
}

function onWorkTap(item) {
  uni.showToast({ title: `作品 ${item.id}`, icon: 'none' })
}
</script>

<style lang="scss" scoped>
.mine-page {
  min-height: 100vh;
  padding-bottom: calc(150rpx + env(safe-area-inset-bottom));
  background: #f8f8f8;
}

.mine-hero {
  position: relative;
  overflow: hidden;
  min-height: 408rpx;
  border-bottom-left-radius: 44rpx;
  border-bottom-right-radius: 44rpx;
  background-color: #ff9d34;
  box-shadow: 0 18rpx 40rpx rgba(255, 130, 40, 0.22);
}

.mine-hero__bg-wrap {
  position: absolute;
  left: 0;
  top: 0;
  right: 0;
  bottom: 0;
  z-index: 0;
  overflow: hidden;
  pointer-events: none;
}

.mine-hero__bg {
  position: absolute;
  left: 0;
  top: 0;
  width: 100%;
  height: 100%;
  transform: scale(1.1);
  transform-origin: 72% 42%;
}

.mine-hero__shade {
  position: absolute;
  left: 0;
  top: 0;
  right: 0;
  bottom: 0;
  z-index: 1;
  pointer-events: none;
  background: linear-gradient(
    180deg,
    rgba(255, 255, 255, 0.26) 0%,
    rgba(255, 255, 255, 0) 18%,
    rgba(255, 120, 48, 0.08) 42%,
    rgba(255, 100, 30, 0.22) 72%,
    rgba(248, 248, 248, 1) 100%
  );
}

.mine-hero__inner {
  position: relative;
  z-index: 2;
  padding-left: 30rpx;
  padding-right: calc(20rpx + constant(safe-area-inset-right));
  padding-right: calc(20rpx + env(safe-area-inset-right));
  padding-bottom: 72rpx;
  box-sizing: border-box;
}

.mine-hero__row {
  display: flex;
  flex-direction: row;
  align-items: center;
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
  width: 118rpx;
  height: 118rpx;
  border-radius: 50%;
  box-sizing: border-box;
}

.mine-avatar-fallback {
  background: linear-gradient(145deg, #fff7ed 0%, #ffe8d2 100%);
  color: #ff8e24;
  font-size: 46rpx;
  font-weight: 800;
  line-height: 118rpx;
  text-align: center;
}

.mine-hero__meta {
  flex: 1;
  min-width: 0;
  margin-left: 24rpx;
  margin-right: 12rpx;
  padding-top: 2rpx;
}

.mine-name-row {
  display: flex;
  flex-direction: row;
  align-items: center;
}

.mine-name {
  color: #ffffff;
  font-size: 34rpx;
  font-weight: 800;
  letter-spacing: 0.5rpx;
  max-width: 220rpx;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  text-shadow: 0 2rpx 10rpx rgba(0, 0, 0, 0.22);
}

.mine-name-arrow {
  margin-left: 4rpx;
  color: rgba(255, 255, 255, 0.88);
  font-size: 30rpx;
  line-height: 1;
  font-weight: 300;
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
  min-height: 56rpx;
  margin-right: 10rpx;
  padding: 0 22rpx;
  border-radius: 999rpx;
  background: #ffffff;
  border: 1rpx solid rgba(0, 0, 0, 0.06);
  box-shadow: 0 6rpx 16rpx rgba(0, 0, 0, 0.08);
  display: flex;
  align-items: center;
  justify-content: center;
}

.mine-exchange-text {
  font-size: 22rpx;
  color: #666666;
  font-weight: 600;
  line-height: 1.2;
}

.mine-nav-gap {
  flex-shrink: 0;
  width: 174rpx;
  height: 56rpx;
}

.mine-body {
  margin-top: -44rpx;
  padding: 0 30rpx 40rpx;
  position: relative;
  z-index: 3;
}

.stats-card {
  display: flex;
  flex-direction: row;
  align-items: stretch;
  padding: 24rpx 8rpx 24rpx 16rpx;
  border-radius: 26rpx;
  background: #ffffff;
  box-shadow: 0 12rpx 32rpx rgba(0, 0, 0, 0.07);
}

.stats-col {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: row;
  align-items: center;
}

.stats-icon {
  width: 48rpx;
  height: 48rpx;
  flex-shrink: 0;
}

.stats-mid {
  flex: 1;
  min-width: 0;
  margin-left: 14rpx;
  display: flex;
  flex-direction: column;
}

.stats-title {
  font-size: 24rpx;
  color: #666666;
  line-height: 1.2;
}

.stats-value {
  margin-top: 4rpx;
  font-size: 32rpx;
  font-weight: 800;
  color: #1a1a1a;
  line-height: 1.15;
}

.stats-placeholder {
  margin-top: 4rpx;
  font-size: 28rpx;
  color: transparent;
}

.stats-chev {
  flex-shrink: 0;
  margin-left: 6rpx;
  margin-right: 4rpx;
  font-size: 38rpx;
  color: #d8d8d8;
  line-height: 1;
}

.stats-divider {
  width: 1rpx;
  align-self: stretch;
  margin: 8rpx 4rpx;
  background: #eeeeee;
  flex-shrink: 0;
}

.promo-row {
  display: flex;
  flex-direction: row;
  align-items: stretch;
  margin-top: 22rpx;
}

.promo-card {
  flex: 1;
  min-width: 0;
  position: relative;
  min-height: 128rpx;
  padding: 20rpx 52rpx 20rpx 22rpx;
  border-radius: 24rpx;
  box-sizing: border-box;
  overflow: hidden;
}

.promo-card + .promo-card {
  margin-left: 18rpx;
}

.promo-card--vip {
  background: linear-gradient(135deg, #ffb04d 0%, #ff8e24 100%);
  box-shadow: 0 10rpx 24rpx rgba(255, 142, 36, 0.32);
}

.promo-card--points {
  background: linear-gradient(148deg, #4f4f4f 0%, #1c1c1c 100%);
  box-shadow: 0 10rpx 24rpx rgba(0, 0, 0, 0.2);
}

.promo-card__text {
  display: flex;
  flex-direction: column;
}

.promo-card__title {
  color: #ffffff;
  font-size: 28rpx;
  font-weight: 800;
  line-height: 1.25;
}

.promo-card__sub {
  margin-top: 8rpx;
  color: rgba(255, 255, 255, 0.9);
  font-size: 20rpx;
  line-height: 1.35;
}

.promo-card__circle {
  position: absolute;
  right: 14rpx;
  top: 50%;
  width: 44rpx;
  height: 44rpx;
  margin-top: -22rpx;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.28);
  display: flex;
  align-items: center;
  justify-content: center;
}

.promo-card__circle--dark {
  background: rgba(255, 255, 255, 0.14);
}

.promo-card__arrow {
  color: #ffffff;
  font-size: 26rpx;
  line-height: 1;
}

.tools-panel {
  margin-top: 24rpx;
  padding: 22rpx 12rpx 26rpx;
  border-radius: 24rpx;
  background: #f0f0f0;
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
}

.tools-icon {
  width: 76rpx;
  height: 76rpx;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 34rpx;
  color: #ff922f;
  background: rgba(255, 255, 255, 0.95);
  box-shadow: 0 4rpx 14rpx rgba(0, 0, 0, 0.05);
}

.tools-label {
  margin-top: 12rpx;
  font-size: 22rpx;
  color: #444444;
  text-align: center;
  line-height: 1.35;
}

.tabs-scroll {
  width: 100%;
  margin-top: 26rpx;
  white-space: nowrap;
}

.tabs-inner {
  display: flex;
  flex-direction: row;
  align-items: flex-end;
  padding-bottom: 2rpx;
}

.tab-item {
  flex-shrink: 0;
  margin-right: 36rpx;
  padding-bottom: 10rpx;
  border-bottom: 6rpx solid transparent;
}

.tab-label {
  font-size: 26rpx;
  color: #999999;
  font-weight: 500;
}

.tab-item--active {
  border-bottom-color: #ff8e24;
}

.tab-item--active .tab-label {
  color: #222222;
  font-weight: 800;
}

.works-banner {
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  margin-top: 18rpx;
  padding: 16rpx 20rpx;
  border-radius: 22rpx;
  border: 1rpx solid rgba(255, 255, 255, 1);
  background-color: rgba(255, 241, 226, 1);
  box-sizing: border-box;
}

.works-banner__text {
  flex: 1;
  min-width: 0;
  font-size: 24rpx;
  color: #7a5220;
  font-weight: 600;
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
}

.works-grid {
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  justify-content: space-between;
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
}
</style>
