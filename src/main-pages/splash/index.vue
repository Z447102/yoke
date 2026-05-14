<template>
  <view class="splash-page">
    <!-- 首帧品牌图：进入「登录」落地页后隐藏，避免叠色 -->
    <image
      v-if="!showLoginGate"
      class="splash-bg"
      :src="splashImg"
      mode="aspectFill"
    />

    <!-- 允许隐私后：静默 session 完成后的门闸（预登录则走微信手机号 / 验证码登录，已绑定则不进此层） -->
    <view v-if="showLoginGate" class="login-gate" @touchmove.stop.prevent>
      <image class="login-gate__bg" :src="splashImg" mode="aspectFill" />
      <view class="login-gate__dim" aria-hidden="true" />

      <!-- 微信小程序：预登录 uuid，点击下方按钮将调起微信原生手机号授权弹窗（外观由微信绘制） -->
      <!-- #ifdef MP-WEIXIN -->
      <view v-if="gateShowWechatPhoneSheet" class="phone-auth-sheet">
        <view class="phone-auth-sheet__panel" @tap.stop>
          <view class="phone-auth-sheet__head">
            <view class="phone-auth-sheet__brand">
              <text class="phone-auth-sheet__brand-dark">COMPO</text>
              <text class="phone-auth-sheet__brand-accent">Ai</text>
              <text class="phone-auth-sheet__brand-dark"> 创贸有客</text>
            </view>
            <text class="phone-auth-sheet__info" aria-hidden="true">ⓘ</text>
          </view>
          <text class="phone-auth-sheet__title">申请获取并验证你的手机号</text>
          <text class="phone-auth-sheet__sub">注册及登录小程序账户</text>

          <button
            class="phone-auth-sheet__card-btn"
            open-type="getPhoneNumber"
            :loading="loadingPhone"
            :disabled="loadingPhone"
            @getphonenumber="onSplashGetPhoneNumber"
          >
            <view class="phone-auth-sheet__card-inner">
              <text class="phone-auth-sheet__phone-line">{{ maskedHintPhone }}</text>
              <text class="phone-auth-sheet__green">{{ phoneTagLine }}</text>
            </view>
          </button>

          <view class="phone-auth-sheet__deny" @tap="goSmsLogin">不允许</view>

          <text class="phone-auth-sheet__link" @tap="goSmsLogin">使用其它号码</text>
        </view>
      </view>
      <!-- #endif -->

      <view v-if="gateShowFallback" class="login-gate__footer-block login-gate__footer-block--fallback">
        <text class="login-gate__fallback-tip">{{ fallbackTip }}</text>
        <view class="login-gate__btn login-gate__btn--primary" @tap="goSmsLogin">手机号验证码登录</view>
        <!-- #ifdef MP-WEIXIN -->
        <view class="login-gate__btn login-gate__btn--ghost" @tap="onRetrySilent">重试微信登录</view>
        <!-- #endif -->
      </view>
    </view>

    <!-- 未同意隐私：底部弹出弹窗（遮罩 + 上圆角面板 + 滑入动画） -->
    <view v-if="showPrivacySheet" class="privacy-mask" @touchmove.stop.prevent>
      <view class="privacy-sheet" @tap.stop>
        <view class="privacy-sheet__grab" aria-hidden="true" />
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
import { StaticPath } from '@/config'
import { ref, onMounted, computed } from 'vue'
const splashImg = `${StaticPath}splash/launch-screen.png`
import { getApiBaseUrl } from '@/config/env'
import { isApiEnabled } from '@/utils/request'
import { hasPrivacyAgreed, setPrivacyAgreed } from '@/utils/privacy'
import { silentLoginOnce, loginWithPhoneCode } from '@/hooks/use-login'
import { useUserStore } from '@/stores/user'

/** 已同意隐私用户：首图展示后再呈现门闸（与品牌节奏接近） */
const SPLASH_BEFORE_GATE_MS = 1200

const showPrivacySheet = ref(false)
const showLoginGate = ref(false)
const loadingPhone = ref(false)

const userStore = useUserStore()

/** 当前构建是否为微信小程序（用于预登录门闸与 getPhoneNumber） */
const IS_MP_WEIXIN = (() => {
  try {
    return uni.getSystemInfoSync().uniPlatform === 'mp-weixin'
  } catch {
    return false
  }
})()

const gateShowWechatPhoneSheet = computed(() => {
  if (!showLoginGate.value || !IS_MP_WEIXIN) return false
  return (
    Boolean(userStore.needBindPhone) &&
    Boolean(String(userStore.wxSessionUuid || '').trim())
  )
})

const gateShowFallback = computed(() => {
  if (!showLoginGate.value) return false
  return !gateShowWechatPhoneSheet.value
})

/** 预登录阶段脱敏展示；无号码时引导点击（点击后由微信原生弹窗接管） */
const maskedHintPhone = computed(() => {
  const raw = userStore.profile && userStore.profile.phone
  const p = String(raw || '').replace(/\D/g, '')
  if (p.length >= 7) {
    return `${p.slice(0, 3)}****${p.slice(-4)}`
  }
  return '使用微信绑定手机号'
})

const phoneTagLine = computed(() => {
  const raw = userStore.profile && userStore.profile.phone
  const p = String(raw || '').replace(/\D/g, '')
  if (p.length >= 7) return '上次提供'
  return '由微信安全验证'
})

const fallbackTip = computed(() => {
  if (!IS_MP_WEIXIN) {
    return '请使用微信小程序完成授权，或使用验证码登录'
  }
  if (userStore.needBindPhone && !String(userStore.wxSessionUuid || '').trim()) {
    return '微信登录态不完整，请重试或使用验证码登录'
  }
  return '无法完成微信登录时，可使用手机号验证码登录'
})

/** 使用 `reLaunch` 进入首页，失败时降级为 `redirectTo`。 */
function goHome() {
  uni.reLaunch({
    url: '/pages/home/index',
    fail: () => {
      uni.redirectTo({ url: '/pages/home/index' })
    }
  })
}

/**
 * 静默 session 之后的统一出口：已绑定会员则进首页；预登录则门闸内走微信手机号或验证码；非微信端预登录直接去登录页。
 * @param {number} delayMs 首图停留毫秒数，隐私「允许」后可传 0 尽快出门闸
 */
async function finishSplashAfterSilent(delayMs = SPLASH_BEFORE_GATE_MS) {
  try {
    await silentLoginOnce()
  } catch (_) {
    /* 静默失败：门闸内提供验证码 / 重试 */
  }

  const run = () => {
    if (userStore.token && !userStore.needBindPhone) {
      goHome()
      return
    }
    if (
      !IS_MP_WEIXIN &&
      userStore.needBindPhone &&
      String(userStore.wxSessionUuid || '').trim()
    ) {
      uni.redirectTo({
        url: `/pages/login/index?redirect=${encodeURIComponent('/pages/home/index')}`,
        fail: () => {
          uni.navigateTo({
            url: `/pages/login/index?redirect=${encodeURIComponent('/pages/home/index')}`
          })
        }
      })
      return
    }
    showLoginGate.value = true
  }

  if (delayMs > 0) {
    setTimeout(run, delayMs)
  } else {
    run()
  }
}

/**
 * 跳转验证码登录落地页，成功后由登录页回首页。
 */
function goSmsLogin() {
  const url = `/pages/login/index?redirect=${encodeURIComponent('/pages/home/index')}`
  uni.redirectTo({
    url,
    fail: () => {
      uni.navigateTo({ url })
    }
  })
}

/** 再执行一次静默登录（session） */
async function onRetrySilent() {
  try {
    await silentLoginOnce()
    if (userStore.token && !userStore.needBindPhone) {
      goHome()
      return
    }
    if (
      userStore.needBindPhone &&
      String(userStore.wxSessionUuid || '').trim()
    ) {
      uni.showToast({ title: '请完成手机号授权', icon: 'none' })
      return
    }
    uni.showToast({ title: '请稍后再试或使用验证码登录', icon: 'none' })
  } catch (e) {
    uni.showToast({
      title: (e && e.message) || '网络异常',
      icon: 'none'
    })
  }
}

/**
 * 开屏门闸内：微信 getPhoneNumber 回调 → mobile-login（uuid + phoneCode）→ 存 token → 首页
 * @param {{ detail?: { errMsg?: string, code?: string } }} e
 */
async function onSplashGetPhoneNumber(e) {
  const ok = e.detail && e.detail.errMsg === 'getPhoneNumber:ok'
  if (!ok) {
    if (e.detail?.errMsg && !e.detail.errMsg.includes('deny')) {
      uni.showToast({ title: e.detail.errMsg, icon: 'none' })
    }
    goSmsLogin()
    return
  }
  const code = e.detail.code
  if (!code) {
    uni.showToast({ title: '未获取到手机号凭证', icon: 'none' })
    goSmsLogin()
    return
  }
  loadingPhone.value = true
  try {
    await loginWithPhoneCode(code)
    uni.showToast({ title: '登录成功', icon: 'success' })
    goHome()
  } catch (err) {
    uni.showToast({
      title: (err && err.message) || '登录失败',
      icon: 'none'
    })
    goSmsLogin()
  } finally {
    loadingPhone.value = false
  }
}

/** 本地已同意隐私：静默 session 后按状态进首页或出门闸 */
async function bootAfterPrivacyOk() {
  await finishSplashAfterSilent(SPLASH_BEFORE_GATE_MS)
}

/** 用户点击隐私弹层「允许」 */
async function onPrivacyAllow() {
  setPrivacyAgreed()
  showPrivacySheet.value = false
  await finishSplashAfterSilent(0)
}

/**
 * 首屏挂载：打印接口开关诊断；按是否已同意隐私分支进入静默流程或展示隐私弹层。
 */
onMounted(() => {
  const apiOn = isApiEnabled()
  console.info(
    `[Yoke] 后端请求: ${apiOn ? `已开启 → ${getApiBaseUrl()}` : '未开启（未把 VITE_API_BASE_URL 打进当前构建，走 Mock，Network 无 session）'}`
  )
  if (apiOn && userStore.token) {
    console.info('[Yoke] 本地已有 token，silentLoginOnce 将跳过，不会发 session 请求')
  }
  if (hasPrivacyAgreed()) {
    bootAfterPrivacyOk()
  } else {
    showPrivacySheet.value = true
  }
})

/** 跳转《用户软件许可协议》页。 */
function openUserAgreement() {
  uni.navigateTo({
    url: '/pages/legal/user-agreement',
    fail: () => {
      uni.showToast({ title: '页面打开失败', icon: 'none' })
    }
  })
}

/** 跳转《隐私政策》页。 */
function openPrivacyPolicy() {
  uni.navigateTo({
    url: '/pages/legal/privacy',
    fail: () => {
      uni.showToast({ title: '页面打开失败', icon: 'none' })
    }
  })
}

/** 用户拒绝隐私：提示必须同意后才能继续使用。 */
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

/* 门闸：启动图 + 半透明遮罩 + 底部面板（真实 getPhoneNumber 调起微信原生授权窗） */
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
  padding: 0;
  box-sizing: border-box;
  overflow: hidden;
}

.login-gate__dim {
  position: absolute;
  left: 0;
  top: 0;
  width: 100%;
  height: 100%;
  z-index: 1;
  background: rgba(0, 0, 0, 0.5);
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
  z-index: 2;
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
}

.login-gate__footer-block--fallback {
  padding: 48rpx 48rpx calc(32rpx + constant(safe-area-inset-bottom));
  padding: 48rpx 48rpx calc(32rpx + env(safe-area-inset-bottom));
}

.login-gate__fallback-tip {
  display: block;
  width: 100%;
  text-align: center;
  font-size: 28rpx;
  color: rgba(255, 255, 255, 0.95);
  line-height: 1.55;
  margin-bottom: 28rpx;
  text-shadow: 0 1rpx 6rpx rgba(0, 0, 0, 0.35);
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
  box-shadow: 0 8rpx 28rpx rgba(0, 0, 0, 0.12);
}

.login-gate__btn--primary {
  color: #ffffff;
  background: linear-gradient(90deg, #ffb04d 0%, #ff8e24 100%);
  border: none;
}

.login-gate__btn--ghost {
  margin-top: 24rpx;
  color: #333333;
  background: rgba(255, 255, 255, 0.92);
  border: 2rpx solid rgba(255, 255, 255, 0.65);
}

.phone-auth-sheet {
  position: relative;
  z-index: 2;
  width: 100%;
  max-height: 62vh;
  animation: phone-sheet-up 0.28s cubic-bezier(0.32, 0.72, 0, 1) both;
}

@keyframes phone-sheet-up {
  from {
    transform: translateY(40rpx);
    opacity: 0.85;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}

.phone-auth-sheet__panel {
  background: #f7f7f7;
  border-radius: 40rpx 40rpx 0 0;
  padding: 36rpx 40rpx 24rpx;
  padding-bottom: calc(24rpx + constant(safe-area-inset-bottom));
  padding-bottom: calc(24rpx + env(safe-area-inset-bottom));
  box-sizing: border-box;
}

.phone-auth-sheet__head {
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 28rpx;
}

.phone-auth-sheet__brand {
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  align-items: baseline;
  max-width: 86%;
}

.phone-auth-sheet__brand-dark {
  font-size: 28rpx;
  font-weight: 600;
  color: #111111;
}

.phone-auth-sheet__brand-accent {
  font-size: 28rpx;
  font-weight: 700;
  color: #ff9a23;
}

.phone-auth-sheet__info {
  font-size: 28rpx;
  color: #c8c8c8;
  flex-shrink: 0;
}

.phone-auth-sheet__title {
  display: block;
  font-size: 36rpx;
  font-weight: 700;
  color: #111111;
  line-height: 1.35;
  margin-bottom: 12rpx;
}

.phone-auth-sheet__sub {
  display: block;
  font-size: 28rpx;
  color: #999999;
  margin-bottom: 36rpx;
}

.phone-auth-sheet__card-btn {
  width: 100%;
  margin: 0;
  padding: 0;
  border: none;
  background: #ffffff;
  border-radius: 16rpx;
  line-height: normal;
}

.phone-auth-sheet__card-btn::after {
  border: none;
}

.phone-auth-sheet__card-inner {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 120rpx;
  padding: 24rpx 16rpx;
  box-sizing: border-box;
}

.phone-auth-sheet__phone-line {
  font-size: 34rpx;
  font-weight: 700;
  color: #111111;
  margin-bottom: 8rpx;
}

.phone-auth-sheet__green {
  font-size: 24rpx;
  color: #07c160;
}

.phone-auth-sheet__deny {
  margin-top: 24rpx;
  width: 100%;
  min-height: 120rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #ffffff;
  border-radius: 16rpx;
  font-size: 32rpx;
  color: #111111;
}

.phone-auth-sheet__link {
  display: block;
  text-align: center;
  margin-top: 36rpx;
  margin-bottom: 4rpx;
  font-size: 28rpx;
  color: #576b95;
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
  opacity: 0;
  animation: privacy-mask-fade 0.22s ease forwards;
}

@keyframes privacy-mask-fade {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

.privacy-sheet {
  display: flex;
  flex-direction: column;
  background: #ffffff;
  border-radius: 28rpx 28rpx 0 0;
  box-shadow: 0 -12rpx 48rpx rgba(0, 0, 0, 0.12);
  padding: 24rpx 40rpx 32rpx;
  padding-bottom: calc(28rpx + constant(safe-area-inset-bottom));
  padding-bottom: calc(28rpx + env(safe-area-inset-bottom));
  max-height: 78vh;
  min-height: 420rpx;
  box-sizing: border-box;
  overflow: hidden;
  transform: translateY(100%);
  animation: privacy-sheet-up 0.32s cubic-bezier(0.32, 0.72, 0, 1) forwards;
}

@keyframes privacy-sheet-up {
  from {
    transform: translateY(100%);
  }
  to {
    transform: translateY(0);
  }
}

.privacy-sheet__grab {
  width: 64rpx;
  height: 8rpx;
  border-radius: 4rpx;
  background: rgba(0, 0, 0, 0.12);
  align-self: center;
  margin-bottom: 20rpx;
  flex-shrink: 0;
}

.privacy-sheet__title {
  display: block;
  text-align: center;
  font-size: 36rpx;
  color: #1a1a1a;
  margin-bottom: 32rpx;
  flex-shrink: 0;
}

.privacy-sheet__body {
  flex: 1;
  min-height: 0;
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
  flex-shrink: 0;
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
