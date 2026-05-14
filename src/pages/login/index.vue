<template>
  <view class="login-page">
    <!-- 顶部背景区：750rpx×318rpx + 设计图背景（真机用 image 铺满） -->
    <view class="login-hero">
      <image
        class="login-hero__bg"
        :src="loginHeroTopBg"
        mode="aspectFill"
      />
      <view class="login-hero__inner" :style="loginHeroInnerStyle">
        <text class="login-hero__brand-cn">创贸有客</text>
        <text class="login-hero__brand-en">COMPOAi</text>
      </view>
    </view>

    <view class="login-body">
      <text class="login-body__welcome">欢迎使用有客</text>
      <text class="login-body__sub">用户登录</text>

      <!-- 验证码区：下划线输入 + 获取验证码 -->
      <view class="sms-field sms-field--mobile">
        <input
          v-model="smsMobile"
          class="sms-field__input"
          type="digit"
          maxlength="11"
          placeholder="请输入手机号"
          placeholder-class="sms-field__ph"
          :disabled="loadingSms || loadingSmsSend"
        />
        <view class="sms-field__line" />
      </view>

      <view class="sms-field sms-field--code">
        <view class="sms-field__code-wrap">
          <input
            v-model="smsCode"
            class="sms-field__input sms-field__input--flex"
            type="number"
            maxlength="8"
            placeholder="请输入验证码"
            placeholder-class="sms-field__ph"
            :disabled="loadingSms || loadingSmsSend"
          />
          <button
            class="sms-get-code"
            :disabled="
              smsCooldownSec > 0 || loadingSmsSend || loadingSms
            "
            @tap="onSendSmsCode"
          >
            {{
              smsCooldownSec > 0
                ? `${smsCooldownSec}秒后重获`
                : '获取验证码'
            }}
          </button>
        </view>
        <view class="sms-field__line" />
      </view>

      <view class="sms-help" @tap="onSmsHelpTap">
        <image
          class="sms-help__icon"
          :src="smsHelpIcon"
          mode="aspectFit"
        />
        <text class="sms-help__text">收不到验证码 请点此解决</text>
      </view>

      <view class="sms-agree">
        <view class="sms-agree__check" @tap="toggleAgree">
          <view
            :class="['sms-agree__circle', { 'sms-agree__circle--on': agreedToTerms }]"
            @tap.stop="toggleAgree"
          >
            <view
              v-show="agreedToTerms"
              class="sms-agree__dot"
              @tap.stop="toggleAgree"
            />
          </view>
        </view>
        <view class="sms-agree__texts">
          <text class="sms-agree__plain" @tap="toggleAgree">我已阅读并同意</text>
          <text class="sms-agree__link" @tap.stop="openUserAgreement">《用户服务协议》</text>
          <text class="sms-agree__plain" @tap="toggleAgree">和</text>
          <text class="sms-agree__link" @tap.stop="openPrivacy">《隐私政策》</text>
        </view>
      </view>

      <button
        class="sms-submit"
        type="default"
        :loading="loadingSms"
        :disabled="loadingSmsSend"
        @tap="onSmsLogin"
      >
        登录
      </button>
    </view>
  </view>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { onLoad, onShow } from '@dcloudio/uni-app'
import { useUserStore } from '@/stores/user'
import { loginWithSmsCredentials } from '@/hooks/use-login'
import { sendSmsCode } from '@/api/auth'
import loginHeroTopBg from '@/static/login/login-hero-top-bg.png'
import smsHelpIcon from '@/static/login/sms-help-icon.png'

const userStore = useUserStore()

const loadingSms = ref(false)
const loadingSmsSend = ref(false)
const redirect = ref('')
/** 是否同意协议（设计稿勾选） */
const agreedToTerms = ref(false)

const smsMobile = ref('')
const smsCode = ref('')
const smsCooldownSec = ref(0)
/** @type {ReturnType<typeof setInterval> | null} */
let smsCooldownTimer = null

/** 头图内品牌区顶部留白（px）：安全区 + 与状态栏的间距 */
const heroInnerPaddingTopPx = ref(44)

const loginHeroInnerStyle = computed(() => ({
  paddingTop: `${heroInnerPaddingTopPx.value}px`
}))

onMounted(() => {
  let inset = 0
  try {
    if (typeof uni.getWindowInfo === 'function') {
      const w = uni.getWindowInfo()
      inset = Math.max(
        Number(w.safeAreaInsets?.top ?? 0),
        Number(w.statusBarHeight ?? 0)
      )
    } else {
      const si = uni.getSystemInfoSync()
      const fromSafe =
        si.safeAreaInsets != null && typeof si.safeAreaInsets.top === 'number'
          ? si.safeAreaInsets.top
          : 0
      const fromStatus =
        typeof si.statusBarHeight === 'number' ? si.statusBarHeight : 0
      inset = Math.max(fromSafe, fromStatus, 0)
    }
  } catch (_) {
    inset = 0
  }
  let extraPx = 14
  try {
    extraPx = uni.upx2px(28)
  } catch (_) {
    extraPx = 14
  }
  /** 无安全区信息时至少留出常见状态栏高度，避免内容与胶囊重叠 */
  const base = Math.max(Math.ceil(inset), 20)
  heroInnerPaddingTopPx.value = base + extraPx
})

/**
 * 切换状态：toggleAgree
 */
function toggleAgree() {
  agreedToTerms.value = !agreedToTerms.value
}

onLoad((query) => {
  redirect.value = query.redirect ? decodeURIComponent(query.redirect) : ''
})

onShow(() => {
  if (userStore.isLogin && !userStore.needBindPhone) {
    tryNavigateAfterLogin()
  }
})

onUnmounted(() => {
  if (smsCooldownTimer != null) {
    clearInterval(smsCooldownTimer)
    smsCooldownTimer = null
  }
})

/**
 * 清空状态：clearSmsCooldownTimer
 */
function clearSmsCooldownTimer() {
  if (smsCooldownTimer != null) {
    clearInterval(smsCooldownTimer)
    smsCooldownTimer = null
  }
}

/**
 * 函数：startSmsCooldown
 */
function startSmsCooldown() {
  clearSmsCooldownTimer()
  smsCooldownSec.value = 60
  smsCooldownTimer = setInterval(() => {
    smsCooldownSec.value -= 1
    if (smsCooldownSec.value <= 0) {
      smsCooldownSec.value = 0
      clearSmsCooldownTimer()
    }
  }, 1000)
}

/**
 * 事件处理：onSendSmsCode
 */
async function onSendSmsCode() {
  if (loadingSmsSend.value || loadingSms.value) return
  if (smsCooldownSec.value > 0) return
  const m = String(smsMobile.value || '').trim()
  if (!/^1\d{10}$/.test(m)) {
    uni.showToast({ title: '请输入正确手机号', icon: 'none' })
    return
  }
  loadingSmsSend.value = true
  try {
    await sendSmsCode({ mobile: m })
    uni.showToast({ title: '验证码已发送', icon: 'none' })
    startSmsCooldown()
  } catch (e) {
    uni.showToast({
      title: (e && e.message) || '发送失败',
      icon: 'none'
    })
  } finally {
    loadingSmsSend.value = false
  }
}

/**
 * 事件处理：onSmsHelpTap
 */
function onSmsHelpTap() {
  uni.showModal({
    title: '收不到验证码？',
    content:
      '请确认手机号填写正确、信号正常；若仍无法收到，可稍后再试或联系客服处理。',
    showCancel: false,
    confirmText: '我知道了'
  })
}

/**
 * 事件处理：onSmsLogin
 */
async function onSmsLogin() {
  if (!agreedToTerms.value) {
    uni.showToast({ title: '请先阅读并勾选同意协议', icon: 'none' })
    return
  }
  if (loadingSms.value) return
  loadingSms.value = true
  try {
    await loginWithSmsCredentials({
      mobile: smsMobile.value,
      code: smsCode.value
    })
    uni.showToast({ title: '登录成功', icon: 'success' })
    tryNavigateAfterLogin()
  } catch (e) {
    uni.showToast({
      title: (e && e.message) || '登录失败',
      icon: 'none'
    })
  } finally {
    loadingSms.value = false
  }
}

/**
 * 打开界面/弹层：openUserAgreement
 */
function openUserAgreement() {
  uni.navigateTo({ url: '/pages/legal/user-agreement' })
}

/**
 * 打开界面/弹层：openPrivacy
 */
function openPrivacy() {
  uni.navigateTo({ url: '/pages/legal/privacy' })
}

/**
 * 尝试流程：tryNavigateAfterLogin
 */
function tryNavigateAfterLogin() {
  const url = redirect.value
  if (url && url.startsWith('/')) {
    uni.redirectTo({
      url,
      fail: () => {
        uni.reLaunch({ url: url || '/pages/home/index' })
      }
    })
    return
  }
  const stack = getCurrentPages()
  if (stack.length > 1) {
    uni.navigateBack({ delta: 1 })
  } else {
    uni.reLaunch({ url: '/pages/home/index' })
  }
}
</script>

<style lang="scss" scoped>
.login-page {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background-color: #fff5e6;
  box-sizing: border-box;
}

/* 顶部头图容器：设计稿尺寸 + 铺底灰（加载前后一致） */
.login-hero {
  position: relative;
  width: 750rpx;
  max-width: 100%;
  margin: 0 auto;
  height: 318rpx;
  flex-shrink: 0;
  box-sizing: border-box;
  background-color: rgba(229, 229, 229, 1);
  overflow: hidden;
  border-radius: 0 0 36rpx 36rpx;
}

.login-hero__bg {
  position: absolute;
  left: 0;
  top: 0;
  width: 100%;
  height: 100%;
  z-index: 0;
  display: block;
  pointer-events: none;
}

.login-hero__inner {
  position: relative;
  z-index: 1;
  height: 100%;
  box-sizing: border-box;
  padding-left: 40rpx;
  padding-right: 40rpx;
  padding-bottom: 28rpx;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  justify-content: flex-start;
}

.login-hero__brand-cn {
  font-size: 48rpx;
  font-weight: 800;
  color: #ffffff;
  letter-spacing: 2rpx;
  font-style: italic;
  text-shadow: 0 2rpx 12rpx rgba(0, 0, 0, 0.12);
}

.login-hero__brand-en {
  margin-top: 8rpx;
  font-size: 26rpx;
  font-weight: 500;
  color: rgba(255, 255, 255, 0.95);
  letter-spacing: 1rpx;
}

/* 主内容区（独立一层，盖住头图与表单衔接处，避免被头图遮挡） */
.login-body {
  flex: 1;
  display: flex;
  flex-direction: column;
  margin-top: 0;
  padding: 40rpx 56rpx calc(32rpx + constant(safe-area-inset-bottom));
  padding: 40rpx 56rpx calc(32rpx + env(safe-area-inset-bottom));
  background-color: #fff5e6;
  position: relative;
  z-index: 1;
  box-sizing: border-box;
}

.login-body__welcome {
  display: block;
  font-size: 44rpx;
  font-weight: 800;
  color: #333333;
  letter-spacing: 1rpx;
}

.login-body__sub {
  display: block;
  margin-top: 12rpx;
  font-size: 28rpx;
  color: #999999;
}

/* 下划线输入 */
.sms-field {
  margin-top: 0;
}

/* 「用户登录」到手机号输入框：设计稿 220rpx */
.sms-field--mobile {
  margin-top: 220rpx;
}

.sms-field--code {
  margin-top: 74rpx;
}

.sms-field__code-wrap {
  display: flex;
  flex-direction: row;
  align-items: center;
  min-height: 96rpx;
}

.sms-field__input {
  width: 100%;
  height: 96rpx;
  padding: 0 4rpx;
  box-sizing: border-box;
  font-size: 32rpx;
  color: #333333;
  background: transparent;
  border: none;
}

.sms-field__input--flex {
  flex: 1;
  width: auto;
  min-width: 0;
}

.sms-field__ph {
  color: #bbbbbb;
  font-size: 30rpx;
}

.sms-field__line {
  height: 2rpx;
  background: #333333;
  opacity: 0.85;
}

.sms-get-code {
  flex-shrink: 0;
  margin: 0 0 0 16rpx;
  padding: 0 28rpx;
  height: 64rpx;
  line-height: 64rpx;
  font-size: 24rpx;
  font-weight: 500;
  color: #888888;
  background: #ffffff;
  border-radius: 999rpx;
  border: none;
  box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, 0.08);
}

.sms-get-code::after {
  border: none;
}

.sms-get-code[disabled] {
  opacity: 0.55;
}

/* 收不到验证码：设计图 icon + 灰色小字 */
.sms-help {
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: flex-end;
  margin-top: 20rpx;
  padding-right: 4rpx;
}

.sms-help__icon {
  width: 30rpx;
  height: 30rpx;
  margin-right: 8rpx;
  flex-shrink: 0;
  display: block;
}

.sms-help__text {
  font-size: 22rpx;
  color: #999999;
}

/* 协议勾选（与上方「收不到验证码」行间距设计稿 168rpx） */
.sms-agree {
  display: flex;
  flex-direction: row;
  align-items: flex-start;
  margin-top: 168rpx;
  padding-right: 8rpx;
}

.sms-agree__check {
  flex-shrink: 0;
  padding: 4rpx 16rpx 0 0;
}

.sms-agree__circle {
  width: 32rpx;
  height: 32rpx;
  border-radius: 50%;
  box-sizing: border-box;
  border: 2rpx solid #ff8e24;
  background-color: transparent;
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.sms-agree__circle--on {
  border-color: #ff8e24;
  background-color: transparent;
}

/** 勾选态：环内实心橙点（设计稿）；显式重置避免 view 默认行高造成视觉偏移 */
.sms-agree__dot {
  display: block;
  width: 14rpx;
  height: 14rpx;
  margin: 0;
  padding: 0;
  line-height: 0;
  border-radius: 50%;
  background-color: #ff8e24;
  flex-shrink: 0;
}

.sms-agree__texts {
  flex: 1;
  min-width: 0;
  font-size: 24rpx;
  line-height: 1.65;
  color: #999999;
}

.sms-agree__plain {
  color: #999999;
}

.sms-agree__link {
  color: #333333;
  font-weight: 600;
}

/* 登录主按钮 */
.sms-submit {
  margin: 48rpx 0 0;
  width: 100%;
  height: 100rpx;
  line-height: 100rpx;
  border-radius: 999rpx;
  font-size: 34rpx;
  font-weight: 700;
  color: #333333;
  border: none;
  background: linear-gradient(90deg, #ffc371 0%, #ff8e24 52%, #ff7a4a 100%);
  box-shadow: 0 12rpx 32rpx rgba(255, 142, 36, 0.35);
}

.sms-submit::after {
  border: none;
}

.sms-submit[disabled] {
  opacity: 0.55;
}
</style>
