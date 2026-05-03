<template>
  <!-- 我的：用户摘要与设置/退出（docs §11 完整能力待接） -->
  <view class="mine-page">
    <view class="mine-top-bar">
      <view class="back-home" @tap="goHome">
        <text class="back-home-icon">‹</text>
        <text class="back-home-text">返回首页</text>
      </view>
    </view>

    <view class="mine-header">
      <view class="avatar">{{ avatarText }}</view>
      <view class="user-info">
        <text class="nickname">{{ userStore.profile?.nickname || '未登录用户' }}</text>
        <text class="member-status">{{ userStore.isLogin ? '已登录' : '未登录' }}</text>
      </view>
    </view>

    <view class="settings-card">
      <view class="settings-title">我的设置</view>
      <view class="settings-item">
        <view>
          <text class="settings-name">账号与安全</text>
          <text class="settings-desc">手机号、登录状态与账号资料</text>
        </view>
        <text class="settings-arrow">›</text>
      </view>
      <view class="settings-item logout" @tap="handleLogout">
        <view>
          <text class="settings-name">退出登录</text>
          <text class="settings-desc">退出当前账号并清理本地登录态</text>
        </view>
        <text class="settings-arrow">›</text>
      </view>
    </view>
  </view>
</template>

<script setup>
/** 【我的】个人中心轻量版：读 userStore，退出清状态 */
import { computed } from 'vue'
import { useUserStore } from '@/stores/user'

const userStore = useUserStore()

const avatarText = computed(() => {
  const nickname = userStore.profile?.nickname || 'Y'
  return nickname.slice(0, 1).toUpperCase()
})

/** 与 HomeTabBar 一致：关当前页并打开首页 */
function goHome() {
  const pages = getCurrentPages()
  const route = pages[pages.length - 1] ? `/${pages[pages.length - 1].route}` : ''
  if (route === '/pages/home/index') {
    return
  }

  uni.redirectTo({
    url: '/pages/home/index',
    fail: () => {
      uni.reLaunch({ url: '/pages/home/index' })
    }
  })
}

function handleLogout() {
  if (!userStore.isLogin) {
    uni.showToast({
      title: '当前未登录',
      icon: 'none'
    })
    return
  }

  uni.showModal({
    title: '退出登录',
    content: '确认退出当前账号吗？',
    confirmText: '退出',
    confirmColor: '#ff8e24',
    success: ({ confirm }) => {
      if (!confirm) return

      userStore.clearLoginState()
      uni.showToast({
        title: '已退出登录',
        icon: 'none'
      })
    }
  })
}
</script>

<style lang="scss" scoped>
.mine-page {
  min-height: 100vh;
  padding: 0 24rpx 48rpx;
  padding-top: calc(16rpx + env(safe-area-inset-top));
  background: #f7f7f7;
}

.mine-top-bar {
  margin-bottom: 20rpx;
}

.back-home {
  display: inline-flex;
  align-items: center;
  padding: 8rpx 12rpx 8rpx 4rpx;
}

.back-home-icon {
  margin-right: 4rpx;
  font-size: 44rpx;
  line-height: 1;
  color: #1f2933;
}

.back-home-text {
  font-size: 28rpx;
  font-weight: 600;
  color: #1f2933;
}

.mine-header {
  min-height: 192rpx;
  padding: 34rpx 28rpx;
  border-radius: 34rpx;
  background: linear-gradient(135deg, #ffb457 0%, #ff932f 100%);
  color: #ffffff;
  display: flex;
  align-items: center;
  box-shadow: 0 16rpx 38rpx rgba(255, 143, 31, 0.18);
}

.avatar {
  width: 104rpx;
  height: 104rpx;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.92);
  color: #ff8e24;
  font-size: 48rpx;
  font-weight: 800;
  line-height: 104rpx;
  text-align: center;
}

.user-info {
  margin-left: 24rpx;
  display: flex;
  flex-direction: column;
}

.nickname {
  font-size: 34rpx;
  font-weight: 800;
}

.member-status {
  margin-top: 14rpx;
  font-size: 24rpx;
  opacity: 0.86;
}

.settings-card {
  margin-top: 28rpx;
  padding: 28rpx 28rpx 8rpx;
  border-radius: 28rpx;
  background: #ffffff;
  box-shadow: 0 12rpx 32rpx rgba(20, 20, 20, 0.06);
}

.settings-title {
  margin-bottom: 8rpx;
  color: #222222;
  font-size: 30rpx;
  font-weight: 700;
}

.settings-item {
  min-height: 112rpx;
  border-bottom: 1rpx solid #f0f0f0;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.settings-item:last-child {
  border-bottom: 0;
}

.settings-name,
.settings-desc {
  display: block;
}

.settings-name {
  color: #333333;
  font-size: 28rpx;
  font-weight: 600;
}

.settings-desc {
  margin-top: 8rpx;
  color: #999999;
  font-size: 22rpx;
}

.settings-arrow {
  color: #c6c6c6;
  font-size: 42rpx;
}

.logout .settings-name {
  color: #ff7a1a;
}
</style>
