<template>
  <view class="splash-page">
    <!-- 首帧品牌图：进入「登录」落地页后隐藏，避免叠色 -->
    <image
      v-if="!showLoginGate"
      class="splash-bg"
      :src="splashImg"
      mode="aspectFill"
    />

    <!-- 允许隐私后：仅全屏启动图 +「登录」进首页 -->
    <view v-if="showLoginGate" class="login-gate" @touchmove.stop.prevent>
      <image class="login-gate__bg" :src="splashImg" mode="aspectFill" />
      <view class="login-gate__footer-block">
        <view class="login-gate__btn" @tap="onLoginEnter">登录</view>
      </view>
    </view>

    <!-- 未同意隐私：底部弹层 -->
    <view v-if="showPrivacySheet" class="privacy-mask" @touchmove.stop.prevent>
      <view class="privacy-sheet" @tap.stop>
        <text class="privacy-sheet__title">温馨提示</text>
        <view class="privacy-sheet__body">
          <text class="privacy-sheet__lead">感谢您对创贸有客的认可与信任！</text>
          <text class="privacy-sheet__text">请点击阅读</text>
          <text class="privacy-sheet__link" @tap.stop="openUserAgreement">《用户软件许可协议》</text>
          <text class="privacy-sheet__text">和</text>
          <text class="privacy-sheet__link" @tap.stop="openPrivacyPolicy">《隐私政策》</text>
          <text class="privacy-sheet__text">
            ，帮助您充分了解创贸有客向您提供的产品和服务，以及您在使用创贸有客的产品和服务时，我们如何收集、使用您的个人信息。同时，我们将以行业领先的安全措施，保障您的信息安全。
          </text>
        </view>
        <view class="privacy-sheet__actions">
          <text class="privacy-btn privacy-btn--deny" @tap="onPrivacyDeny">不允许</text>
          <text class="privacy-btn privacy-btn--allow" @tap="onPrivacyAllow">允许</text>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import splashImg from '@/static/splash/launch-screen.png'
import { hasPrivacyAgreed, setPrivacyAgreed } from '@/utils/privacy'
import { silentLoginOnce } from '@/hooks/use-login'

/** 已同意隐私用户：首图展示时长后再出「登录」按钮（与设计节奏接近，可改 0 立即出） */
const SPLASH_BEFORE_GATE_MS = 1200

const showPrivacySheet = ref(false)
const showLoginGate = ref(false)

function goHome() {
  uni.reLaunch({
    url: '/pages/home/index',
    fail: () => {
      uni.redirectTo({ url: '/pages/home/index' })
    }
  })
}

function openLoginGate() {
  showLoginGate.value = true
}

function onLoginEnter() {
  goHome()
}

/** 已同意隐私：静默登录 + 首图短暂展示后出现「登录」落地页 */
async function bootAfterPrivacyOk() {
  try {
    await silentLoginOnce()
  } catch (_) {
    /* 静默失败仍可进首页（游客态） */
  }
  setTimeout(openLoginGate, SPLASH_BEFORE_GATE_MS)
}

async function onPrivacyAllow() {
  setPrivacyAgreed()
  showPrivacySheet.value = false
  try {
    await silentLoginOnce()
  } catch (_) {
    /* ignore */
  }
  openLoginGate()
}

onMounted(() => {
  if (hasPrivacyAgreed()) {
    bootAfterPrivacyOk()
  } else {
    showPrivacySheet.value = true
  }
})

function openUserAgreement() {
  uni.navigateTo({
    url: '/pages/legal/user-agreement',
    fail: () => {
      uni.showToast({ title: '页面打开失败', icon: 'none' })
    }
  })
}

function openPrivacyPolicy() {
  uni.navigateTo({
    url: '/pages/legal/privacy',
    fail: () => {
      uni.showToast({ title: '页面打开失败', icon: 'none' })
    }
  })
}

function onPrivacyDeny() {
  uni.showModal({
    title: '提示',
    content: '需同意《用户软件许可协议》和《隐私政策》后，才能继续使用本小程序。',
    showCancel: false,
    confirmText: '我知道了'
  })
}
</script>

<style lang="scss" scoped>
.splash-page {
  position: fixed;
  left: 0;
  top: 0;
  right: 0;
  bottom: 0;
  width: 100%;
  height: 100%;
  overflow: hidden;
  background-color: #ffb347;
}

.splash-bg {
  display: block;
  width: 100%;
  height: 100%;
}

/* 登录落地页：全屏启动图；「登录」按钮位置对齐设计稿（偏上、约占屏宽 76%） */
.login-gate {
  position: fixed;
  left: 0;
  top: 0;
  right: 0;
  bottom: 0;
  z-index: 10;
  display: flex;
  flex-direction: column;
  align-items: stretch;
  justify-content: flex-end;
  /* 约 20vh + 固定留白 + 安全区，使按钮落在下四分区内、高于 Home 条一段距离 */
  padding: 0 48rpx calc(20vh + 80rpx + constant(safe-area-inset-bottom));
  padding: 0 48rpx calc(20vh + 80rpx + env(safe-area-inset-bottom));
  box-sizing: border-box;
  overflow: hidden;
}

.login-gate__bg {
  position: absolute;
  left: 0;
  top: 0;
  width: 100%;
  height: 100%;
  z-index: 0;
}

.login-gate__footer-block {
  position: relative;
  z-index: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
}

.login-gate__btn {
  width: 76%;
  max-width: 560rpx;
  align-self: center;
  height: 100rpx;
  line-height: 100rpx;
  text-align: center;
  border-radius: 50rpx;
  font-size: 34rpx;
  font-weight: 700;
  color: #333333;
  background: rgba(255, 255, 255, 0.32);
  border: 2rpx solid rgba(255, 255, 255, 0.5);
  box-shadow: 0 8rpx 28rpx rgba(0, 0, 0, 0.06);
}

.privacy-mask {
  position: fixed;
  left: 0;
  right: 0;
  top: 0;
  bottom: 0;
  z-index: 20;
  background: rgba(0, 0, 0, 0.35);
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  align-items: stretch;
}

.privacy-sheet {
  background: #ffffff;
  padding: 94rpx 40rpx 106rpx 40rpx;
  padding-bottom: calc(28rpx + env(safe-area-inset-bottom));
  height: 720rpx;
}

.privacy-sheet__title {
  display: block;
  text-align: center;
  font-size: 36rpx;
  color: #1a1a1a;
  margin-bottom: 46rpx;
}

.privacy-sheet__body {
  max-height: 38vh;
  overflow-y: auto;
  margin-bottom: 28rpx;
}

.privacy-sheet__lead {
  display: block;
  font-size: 28rpx;
  color: #444444;
  line-height: 1.65;
}

.privacy-sheet__text {
  font-size: 28rpx;
  color: #444444;
  line-height: 1.65;
}

.privacy-sheet__link {
  font-size: 28rpx;
  color: #ff8e24;
  font-weight: 600;
  line-height: 1.65;
}

.privacy-sheet__actions {
  display: flex;
  flex-direction: row;
  align-items: stretch;
}

.privacy-btn {
  width: 280rpx;
  text-align: center;
  height: 102rpx;
  line-height: 102rpx;
  border-radius: 80rpx;
  font-size: 32rpx;
}

.privacy-btn--deny {
  margin-right: 66rpx;
  background-color: rgba(245, 245, 245, 1);
  color: rgba(16, 16, 16, 1);
}

.privacy-btn--allow {
  background: linear-gradient(
    180deg,
    rgba(255, 197, 129, 1) 0%,
    rgba(255, 148, 50, 1) 100%
  );
  color: rgb(255, 255, 255);
}
</style>
