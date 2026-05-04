<template>
  <view class="login-page">
    <view class="login-brand">
      <text class="login-brand__name">有客</text>
      <text class="login-brand__en">YOKE</text>
    </view>
    <text class="login-hint">使用微信账号登录，体验创作与会员服务</text>
    <text
      v-if="userStore.isLogin && userStore.needBindPhone"
      class="login-hint login-hint--sub"
    >
      已完成微信侧登录，请再点击下方授权手机号
    </text>

    <view class="login-actions">
      <button
        class="login-btn login-btn--primary"
        type="primary"
        :loading="loadingWx"
        :disabled="loadingWx || loadingPhone"
        @tap="onWechatLogin"
      >
        {{ userStore.isLogin && userStore.needBindPhone ? '刷新微信登录态' : '微信一键登录' }}
      </button>

      <!-- #ifdef MP-WEIXIN -->
      <button
        v-if="showPhoneBind"
        class="login-btn login-btn--ghost"
        open-type="getPhoneNumber"
        :loading="loadingPhone"
        :disabled="loadingWx || loadingPhone"
        @getphonenumber="onGetPhoneNumber"
      >
        授权手机号（完善资料）
      </button>
      <!-- #endif -->

      <!-- #ifndef MP-WEIXIN -->
      <text class="login-tip">请在微信小程序中打开以完成登录</text>
      <!-- #endif -->
    </view>

    <view class="login-footer">
      <text class="login-footer__text">登录即表示同意</text>
      <text class="login-footer__link" @tap="openUserAgreement">《用户软件许可协议》</text>
      <text class="login-footer__text">与</text>
      <text class="login-footer__link" @tap="openPrivacy">《隐私政策》</text>
    </view>
  </view>
</template>

<script setup>
import { ref, computed } from 'vue'
import { onLoad, onShow } from '@dcloudio/uni-app'
import { useUserStore } from '@/stores/user'
import { loginWithWechatExplicit, loginWithPhoneCode } from '@/hooks/use-login'

const userStore = useUserStore()

const loadingWx = ref(false)
const loadingPhone = ref(false)
const redirect = ref('')

const showPhoneBind = computed(
  () => userStore.isLogin && userStore.needBindPhone
)

onLoad((query) => {
  redirect.value = query.redirect ? decodeURIComponent(query.redirect) : ''
})

onShow(() => {
  if (userStore.isLogin && !userStore.needBindPhone) {
    tryNavigateAfterLogin()
  }
})

async function onWechatLogin() {
  if (loadingWx.value) return
  loadingWx.value = true
  try {
    await loginWithWechatExplicit()
    uni.showToast({ title: '登录成功', icon: 'success' })
    if (!userStore.needBindPhone) {
      tryNavigateAfterLogin()
    }
  } catch (e) {
    const msg =
      (e && (e.message || e.errMsg)) || '登录失败，请稍后重试'
    uni.showToast({ title: String(msg), icon: 'none' })
  } finally {
    loadingWx.value = false
  }
}

async function onGetPhoneNumber(e) {
  const ok = e.detail && e.detail.errMsg === 'getPhoneNumber:ok'
  if (!ok) {
    if (e.detail?.errMsg && !e.detail.errMsg.includes('deny')) {
      uni.showToast({ title: e.detail.errMsg, icon: 'none' })
    }
    return
  }
  const code = e.detail.code
  if (!code) {
    uni.showToast({ title: '未获取到手机号凭证', icon: 'none' })
    return
  }
  loadingPhone.value = true
  try {
    await loginWithPhoneCode(code)
    uni.showToast({ title: '绑定成功', icon: 'success' })
    tryNavigateAfterLogin()
  } catch (err) {
    uni.showToast({
      title: (err && err.message) || '绑定失败',
      icon: 'none'
    })
  } finally {
    loadingPhone.value = false
  }
}

function openUserAgreement() {
  uni.navigateTo({ url: '/pages/legal/user-agreement' })
}

function openPrivacy() {
  uni.navigateTo({ url: '/pages/legal/privacy' })
}

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
  padding: 120rpx 48rpx 80rpx;
  background: linear-gradient(180deg, #fff7ed 0%, #f7f7f7 42%, #f7f7f7 100%);
  box-sizing: border-box;
}

.login-brand {
  display: flex;
  flex-direction: row;
  align-items: baseline;
  justify-content: center;
}

.login-brand__name {
  font-size: 52rpx;
  font-weight: 800;
  color: #1a1a1a;
  letter-spacing: 2rpx;
}

.login-brand__en {
  margin-left: 12rpx;
  font-size: 26rpx;
  font-weight: 700;
  color: #ff8e24;
  letter-spacing: 4rpx;
}

.login-hint {
  display: block;
  margin-top: 36rpx;
  text-align: center;
  font-size: 28rpx;
  color: #666666;
  line-height: 1.55;
}

.login-hint--sub {
  margin-top: 16rpx;
  font-size: 24rpx;
  color: #ff8e24;
}

.login-actions {
  margin-top: 80rpx;
  display: flex;
  flex-direction: column;
  align-items: stretch;
}

.login-btn {
  margin: 0;
  border-radius: 999rpx;
  font-size: 32rpx;
  font-weight: 700;
}

.login-btn--primary {
  background: linear-gradient(90deg, #ffb04d 0%, #ff8e24 100%);
  border: none;
  color: #ffffff;
}

.login-btn--ghost {
  margin-top: 28rpx;
  background: #ffffff;
  color: #ff8e24;
  border: 2rpx solid rgba(255, 142, 36, 0.45);
}

.login-tip {
  margin-top: 32rpx;
  text-align: center;
  font-size: 26rpx;
  color: #999999;
}

.login-footer {
  margin-top: auto;
  padding-top: 120rpx;
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  justify-content: center;
  align-items: center;
  gap: 0 4rpx;
}

.login-footer__text {
  font-size: 22rpx;
  color: #bbbbbb;
  line-height: 1.5;
}

.login-footer__link {
  font-size: 22rpx;
  color: #ff8e24;
  line-height: 1.5;
}
</style>
