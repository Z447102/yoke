<template>
  <!-- 一键成片 · 商户信息表单页：行业 → 主营业务 → 店铺与位置 → 下一步进入生成配置 -->
  <view class="create-page">
    <!-- 顶部导航 -->
    <view class="nav-bar">
      <view class="nav-left" @tap="goBack">
        <text class="back-icon">‹</text>
        <text>一键成片</text>
      </view>
      <view class="capsule">
        <text class="dot">•••</text>
        <view class="circle"></view>
      </view>
    </view>

    <!-- 引导文案 -->
    <view class="intro">
      <view class="intro-title">
        <text class="wave">👋</text>
        <text>欢迎您使用有客一键成片</text>
      </view>
      <text class="intro-desc">请先完善您的商业信息，以便为您精准成片</text>
    </view>

    <!-- 表单：行业、主营业务、范围、店名、位置 -->
    <view class="form">
      <view class="form-row">
        <text class="label">请选择您的行业</text>
        <text class="required">*</text>
        <view class="select-pill" @tap="openIndustryPopup">
          <text>{{ selectedIndustry || '行业' }}</text>
          <text class="select-arrow">⌄</text>
        </view>
      </view>

      <view class="form-row">
        <text class="label">请选择您的主营业务</text>
        <text class="required">*</text>
        <view class="select-pill wide" @tap="goToBusiness">
          <text>{{ businessText || '主营业务' }}</text>
          <text class="select-arrow">⌄</text>
        </view>
      </view>

      <view class="textarea-card">
        <textarea
          class="business-textarea"
          placeholder="请选择您的主营业务范围"
          placeholder-class="placeholder"
          maxlength="200"
        />
        <button class="clear-btn" size="mini">清空</button>
      </view>

      <view class="field-block">
        <view class="field-title">
          <text>请输入您的店铺/公司名称</text>
          <text class="required">*</text>
        </view>
        <input
          class="input"
          placeholder="请输入您的店铺名称"
          placeholder-class="placeholder"
        />
      </view>

      <view class="field-block">
        <view class="field-title location-title">
          <view>
            <text>请输入您的店铺/公司位置</text>
            <text class="required">*</text>
          </view>
          <view class="location-btn" @tap="goToLocation">
            <text class="location-icon">⌖</text>
            <text>地图选点</text>
          </view>
        </view>
        <input
          v-model="locationText"
          class="input"
          placeholder="请输入您的店铺/公司位置"
          placeholder-class="placeholder"
        />
      </view>
    </view>

    <!-- 底部：进入生成配置页 -->
    <view class="bottom-action">
      <button class="next-btn" @tap="goToGenerate">下一步</button>
      <text class="tip">◎ 后续可在【我的 - 主营业务】内修改</text>
    </view>

    <!-- 行业选择 -->
    <view v-if="showIndustryPopup" class="popup-mask" @tap="closeIndustryPopup">
      <view class="industry-popup" @tap.stop>
        <view class="popup-handle"></view>
        <view class="popup-title">选择行业</view>

        <view class="industry-grid">
          <view
            v-for="industry in industryOptions"
            :key="industry"
            class="industry-item"
            :class="{ active: tempIndustry === industry }"
            @tap="selectIndustry(industry)"
          >
            {{ industry }}
          </view>
        </view>

        <button class="confirm-btn" @tap="confirmIndustry">确定</button>
      </view>
    </view>
  </view>
</template>

<script setup>
/**
 * 【一键成片 · 商户信息】pages/create/index.vue
 * 收集行业与店铺信息，跳转 generate；地图/主营业务回传见 onShow + storage。
 */
import { ref } from 'vue'
import { onShow } from '@dcloudio/uni-app'

// --- 行业列表（本地枚举；后续可接口下发） ---
const industryOptions = [
  '餐饮',
  '美业',
  '健身',
  '医疗',
  '医美',
  '大健康',
  '教育',
  '宠物',
  '母婴',
  '设计',
  '零售',
  '娱乐',
  '酒店',
  '旅游',
  '摄影',
  '策划',
  '创意',
  '自媒体',
  '金融',
  '保险',
  '装修业',
  '家居',
  '建材',
  '地产',
  '制造业',
  '互联网',
  '服务类',
  '生活类'
]

const selectedIndustry = ref('')
const tempIndustry = ref('')
const showIndustryPopup = ref(false)
const locationText = ref('')
const businessText = ref('')

// --- 从子页返回时读取地图选点 / 主营业务 ---
onShow(() => {
  const selectedLocation = uni.getStorageSync('create:selected-location')
  if (selectedLocation) {
    locationText.value = selectedLocation.name || selectedLocation.address || ''
    uni.removeStorageSync('create:selected-location')
  }

  const selectedBusiness = uni.getStorageSync('create:selected-business')
  if (selectedBusiness) {
    businessText.value = selectedBusiness.displayName || ''
    uni.removeStorageSync('create:selected-business')
  }
})

function goBack() {
  const pages = getCurrentPages()

  if (pages.length > 1) {
    uni.navigateBack()
    return
  }

  uni.switchTab?.({
    url: '/pages/home/index',
    fail: () => {
      uni.redirectTo({
        url: '/pages/home/index'
      })
    }
  })
}

function openIndustryPopup() {
  tempIndustry.value = selectedIndustry.value || '餐饮'
  showIndustryPopup.value = true
}

function closeIndustryPopup() {
  showIndustryPopup.value = false
}

function selectIndustry(industry) {
  tempIndustry.value = industry
}

function confirmIndustry() {
  selectedIndustry.value = tempIndustry.value
  closeIndustryPopup()
}

function goToBusiness() {
  uni.navigateTo({
    url: `/pages/create/business/index?industry=${encodeURIComponent(selectedIndustry.value || '餐饮')}`
  })
}

function goToLocation() {
  uni.navigateTo({
    url: '/pages/create/location/index'
  })
}

function goToGenerate() {
  uni.navigateTo({
    url: '/pages/create/generate/index'
  })
}
</script>

<style lang="scss" scoped>
.create-page {
  min-height: 100vh;
  padding-bottom: calc(172rpx + env(safe-area-inset-bottom));
  background: #ffffff;
  color: #202633;
}

.nav-bar {
  height: calc(112rpx + env(safe-area-inset-top));
  padding: calc(30rpx + env(safe-area-inset-top)) 18rpx 16rpx;
  background: linear-gradient(180deg, #ffd29f 0%, #ffffff 100%);
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.nav-left {
  display: flex;
  align-items: center;
  color: #1f2933;
  font-size: 30rpx;
}

.back-icon {
  margin-right: 8rpx;
  font-size: 52rpx;
  line-height: 1;
}

.capsule {
  width: 172rpx;
  height: 58rpx;
  border-radius: 999rpx;
  background: rgba(255, 255, 255, 0.86);
  display: flex;
  align-items: center;
  justify-content: space-around;
}

.dot {
  margin-top: -8rpx;
  color: #111111;
  font-size: 28rpx;
  font-weight: 800;
}

.circle {
  width: 24rpx;
  height: 24rpx;
  border: 4rpx solid #111111;
  border-radius: 50%;
}

.intro {
  padding: 24rpx 22rpx 30rpx;
  border-bottom: 1rpx solid #f0f0f0;
}

.intro-title {
  display: flex;
  align-items: center;
  color: #1f2630;
  font-size: 36rpx;
  font-weight: 800;
}

.wave {
  margin-right: 8rpx;
  font-size: 44rpx;
}

.intro-desc {
  display: block;
  margin-top: 10rpx;
  color: #8d96a3;
  font-size: 26rpx;
}

.form {
  background: #ffffff;
}

.form-row {
  height: 108rpx;
  padding: 0 20rpx;
  border-bottom: 1rpx solid #f2f2f2;
  display: flex;
  align-items: center;
}

.label,
.field-title {
  color: #1f2933;
  font-size: 27rpx;
  font-weight: 600;
}

.required {
  color: #ff5656;
  font-size: 28rpx;
}

.select-pill {
  min-width: 138rpx;
  height: 56rpx;
  margin-left: 34rpx;
  padding: 0 28rpx;
  border-radius: 999rpx;
  background: #f0f0f0;
  color: #696f78;
  font-size: 25rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 18rpx;
}

.select-pill.wide {
  min-width: 176rpx;
  margin-left: 20rpx;
}

.select-arrow {
  color: #222222;
  font-size: 28rpx;
}

.textarea-card {
  position: relative;
  height: 260rpx;
  margin: 22rpx 20rpx 48rpx;
  padding: 24rpx;
  border: 1rpx solid #ffe2e2;
  border-radius: 22rpx;
  background: #fff9f9;
}

.business-textarea {
  width: 100%;
  height: 190rpx;
  color: #333333;
  font-size: 25rpx;
}

.clear-btn {
  position: absolute;
  right: 14rpx;
  bottom: 14rpx;
  width: 72rpx;
  height: 40rpx;
  padding: 0;
  border-radius: 999rpx;
  background: #d7d9de;
  color: #ffffff;
  font-size: 20rpx;
  line-height: 40rpx;
}

.clear-btn::after {
  border: 0;
}

.field-block {
  padding: 0 20rpx 36rpx;
  border-top: 1rpx solid #f5f5f5;
}

.field-title {
  min-height: 88rpx;
  display: flex;
  align-items: center;
}

.input {
  height: 78rpx;
  padding: 0 24rpx;
  border: 1rpx solid #ffe2e2;
  border-radius: 22rpx;
  background: #fff9f9;
  color: #333333;
  font-size: 25rpx;
}

.location-title {
  justify-content: space-between;
}

.location-btn {
  min-width: 146rpx;
  height: 52rpx;
  border-radius: 999rpx;
  background: #f0f0f0;
  color: #666d78;
  font-size: 24rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8rpx;
}

.location-icon {
  color: #9ca3af;
}

.placeholder {
  color: #b3bbc7;
}

.bottom-action {
  position: fixed;
  left: 0;
  right: 0;
  bottom: 0;
  height: calc(172rpx + env(safe-area-inset-bottom));
  padding-top: 30rpx;
  padding-bottom: env(safe-area-inset-bottom);
  background: #f4f4f4;
  text-align: center;
}

.next-btn {
  width: 510rpx;
  height: 108rpx;
  border-radius: 999rpx;
  background: #ffc58d;
  color: #ffffff;
  font-size: 32rpx;
  line-height: 108rpx;
}

.next-btn::after {
  border: 0;
}

.tip {
  display: block;
  margin-top: 14rpx;
  color: #a4abb5;
  font-size: 22rpx;
}

.popup-mask {
  position: fixed;
  left: 0;
  right: 0;
  top: 0;
  bottom: 0;
  z-index: 50;
  background: rgba(0, 0, 0, 0.54);
  display: flex;
  align-items: flex-end;
}

.industry-popup {
  width: 100%;
  padding: 18rpx 30rpx calc(46rpx + env(safe-area-inset-bottom));
  border-radius: 0;
  background: #ffffff;
}

.popup-handle {
  width: 52rpx;
  height: 8rpx;
  margin: 0 auto 30rpx;
  border-radius: 999rpx;
  background: #d8d8d8;
}

.popup-title {
  color: #1f2933;
  font-size: 30rpx;
  font-weight: 700;
  text-align: center;
}

/* 微信小程序对 grid/gap 支持不稳定，四列用 flex + 固定宽与 nth 去右边距 */
.industry-grid {
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  margin-top: 36rpx;
}

.industry-item {
  width: 157rpx;
  height: 68rpx;
  margin-right: 20rpx;
  margin-bottom: 24rpx;
  box-sizing: border-box;
  border: 1rpx solid #e3e5ea;
  border-radius: 14rpx;
  color: #a4abb5;
  font-size: 26rpx;
  line-height: 68rpx;
  text-align: center;
  background: #ffffff;
}

.industry-item:nth-child(4n) {
  margin-right: 0;
}

.industry-item.active {
  border-color: #ff8e24;
  color: #ff8e24;
  background: #fff6ed;
  font-weight: 700;
}

.confirm-btn {
  width: 510rpx;
  height: 108rpx;
  margin: 48rpx auto 0;
  border-radius: 999rpx;
  background: linear-gradient(180deg, #ffbd72 0%, #ff963a 100%);
  color: #ffffff;
  font-size: 32rpx;
  line-height: 108rpx;
}

.confirm-btn::after {
  border: 0;
}
</style>
