<template>
  <!-- 一键成片 · 商户信息表单页：行业 → 主营业务 → 店铺与位置 → 下一步进入生成配置 -->
  <view class="create-page">
    <!-- 顶部导航 -->
    <view class="nav-bar" :style="createNavBarStyle">
      <view class="nav-left" @tap="goBack">
        <image class="back-icon" :src="createBackIcon" mode="aspectFit" />
        <text class="back-text">一键成片</text>
      </view>
      <!-- 避让微信原生右上角菜单区，非模拟胶囊 -->
      <view class="nav-bar__gap" aria-hidden="true" />
    </view>

    <!-- 引导文案 -->
    <view class="intro">
      <view class="intro-title">
        <image class="wave-icon" :src="createIconWaveHand" mode="aspectFill"></image>
        <text class="wave-text">欢迎您使用有客一键成片</text>
      </view>
      <text class="intro-desc">请先完善您的商业信息，以便为您精准成片</text>
    </view>

    <!-- 表单：行业、主营业务、范围、店名、位置 -->
    <view class="form">
      <view class="form-row">
        <text class="label">请选择您的行业</text>
        <text class="required">*</text>
        <view
          class="select-pill"
          :class="{ 'form-control--error': errorIndustry }"
          @tap="openIndustryPopup"
        >
          <text>{{ selectedIndustry || '行业' }}</text>
          <image :src="createIconArrowDown" mode="aspectFill"></image>
        </view>
      </view>

      <view class="form-row">
        <text class="label">请选择您的主营业务</text>
        <text class="required">*</text>
        <view
          class="select-pill wide"
          :class="{ 'form-control--error': errorBusiness }"
          @tap="goToBusiness"
        >
          <text>主营业务</text>
          <image :src="createIconArrowDown" mode="aspectFill"></image>
        </view>
      </view>

      <!-- 选择主营业务后：路径节点以标签展示在设计稿的大卡片内（可删标签 / 清空） -->
      <view class="textarea-card">
        <view class="business-tags">
          <view
            v-for="(item, index) in businessPath"
            :key="`${item.id}-${index}`"
            class="business-tag"
          >
            <text class="business-tag__text">{{ item.name }}</text>
            <view class="business-tag__remove" @tap.stop="removeBusinessTag(index)">
              <text class="business-tag__minus">−</text>
            </view>
          </view>
          <view v-if="!businessPath.length" class="business-tags-placeholder">
            <text>请选择您的主营业务范围</text>
          </view>
        </view>
        <text class="clear-btn" @tap.stop="clearAllBusinessTags">清空</text>
      </view>

      <view class="field-block">
        <view class="field-title">
          <text>请输入您的店铺/公司名称</text>
          <text class="required">*</text>
        </view>
        <input
          v-model="shopName"
          class="input"
          :class="{ 'form-control--error': errorShop }"
          placeholder="请输入您的店铺名称"
          placeholder-class="placeholder"
        />
      </view>

      <view class="field-block">
        <view class="field-title location-title-row">
          <view>
            <text>请确认您的位置信息</text>
            <text class="required">*</text>
          </view>
          <view
            class="location-btn"
            :class="{ 'form-control--error': errorLocation }"
            @tap="goToLocation"
          >
            <image :src="createIconMapPin" mode="aspectFill" />
            <text class="location-btn__text">地图选点</text>
          </view>
        </view>
        <view v-if="locationPick" class="location-display">
          <text class="location-display__name">{{ locationPick.name }}</text>
          <text v-if="locationPick.address" class="location-display__addr">{{
            locationPick.address
          }}</text>
          <text v-if="locationPick.distance" class="location-display__meta">{{
            locationPick.distance
          }}</text>
        </view>
        <view v-else class="location-display--empty" @tap="goToLocation">
          <text>暂无位置信息</text>
        </view>
      </view>
    </view>

    <!-- 底部：进入生成配置页 -->
    <view class="bottom-action">
      <button
        class="next-btn"
        :class="{ 'next-btn--ready': canProceedNext }"
        @tap="goToGenerate"
      >
        下一步
      </button>
	  <view class="tips">
		<image class="tips-icon" :src="createIconAttention" mode="aspectFill"></image>
	  	<text class="tips-text"> 后续可在【我的 - 主营业务】内修改</text>
	  </view>
      
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
import { ref, onMounted, watch, computed } from 'vue'
import { onShow, onReady } from '@dcloudio/uni-app'
import {
  getCreateNavBarInlineStyle,
  scheduleCreateNavBarStyleRefresh
} from '@/utils/create-nav-bar-style'
import createBackIcon from '@/static/create/create-back-icon.png'
import createIconWaveHand from '@/static/create/create-icon-wave-hand.png'
import createIconArrowDown from '@/static/create/create-icon-arrow-down.png'
import createIconMapPin from '@/static/create/create-icon-map-pin.png'
import createIconAttention from '@/static/create/create-icon-attention.png'
import { CREATE_INDUSTRY_OPTIONS } from '@/constants/create'

const createNavBarStyle = ref(getCreateNavBarInlineStyle())
onMounted(() => scheduleCreateNavBarStyleRefresh(createNavBarStyle))
onReady(() => scheduleCreateNavBarStyleRefresh(createNavBarStyle))

const industryOptions = CREATE_INDUSTRY_OPTIONS

const selectedIndustry = ref('')
const tempIndustry = ref('')
const showIndustryPopup = ref(false)
/** 地图选点回传的展示数据（只读，不再用手输文本框） */
const locationPick = ref(null)
/** 主营业务路径节点（与选点页写入的 path 一致，用于标签展示） */
const businessPath = ref([])
/** 店铺 / 公司名称 */
const shopName = ref('')

function nodeDisplayName(p) {
  if (!p || typeof p !== 'object') return ''
  const raw = p.name ?? p.label ?? p.title ?? p.categoryName
  return String(raw ?? '').trim()
}

/** 读缓存：部分运行环境下 storage 可能为 JSON 字符串 */
function readSelectedBusinessPayload() {
  let raw = uni.getStorageSync('create:selected-business')
  if (raw == null || raw === '') return null
  if (typeof raw === 'string') {
    try {
      raw = JSON.parse(raw)
    } catch {
      return null
    }
  }
  if (!raw || typeof raw !== 'object') return null
  if (!Array.isArray(raw.path)) return null
  return raw
}

/** 删除对应标签（仅移除该项，不影响其余已选标签） */
function removeBusinessTag(index) {
  businessPath.value = businessPath.value.filter((_, i) => i !== index)
}

function clearAllBusinessTags() {
  businessPath.value = []
}

/** 校验失败时仅高亮：行业下拉、主营业务下拉、店铺名输入、地图选点（其余样式不变） */
const errorIndustry = ref(false)
const errorBusiness = ref(false)
const errorShop = ref(false)
const errorLocation = ref(false)

function isIndustryValid() {
  return Boolean(String(selectedIndustry.value || '').trim())
}

function isBusinessValid() {
  return businessPath.value.length > 0
}

function isShopValid() {
  return Boolean(String(shopName.value || '').trim())
}

function isLocationValid() {
  const loc = locationPick.value
  if (!loc || typeof loc !== 'object') return false
  return (
    Boolean(String(loc.name || '').trim()) &&
    Boolean(String(loc.address || '').trim())
  )
}

/** 四项必填齐：按钮深色 #FF9432；否则浅色 #FFC581 */
const canProceedNext = computed(
  () =>
    isIndustryValid() &&
    isBusinessValid() &&
    isShopValid() &&
    isLocationValid()
)

function clearErrorsWhenFixed() {
  if (isIndustryValid()) errorIndustry.value = false
  if (isBusinessValid()) errorBusiness.value = false
  if (isShopValid()) errorShop.value = false
  if (isLocationValid()) errorLocation.value = false
}

watch(selectedIndustry, clearErrorsWhenFixed)
watch(
  () => businessPath.value,
  () => clearErrorsWhenFixed(),
  { deep: true }
)
watch(shopName, clearErrorsWhenFixed)
watch(locationPick, clearErrorsWhenFixed, { deep: true })

/** 读缓存：部分运行环境下 storage 可能为 JSON 字符串 */
function readSelectedLocationPayload() {
  let raw = uni.getStorageSync('create:selected-location')
  if (raw == null || raw === '') return null
  if (typeof raw === 'string') {
    try {
      raw = JSON.parse(raw)
    } catch {
      return null
    }
  }
  if (!raw || typeof raw !== 'object') return null
  return raw
}

// --- 从子页返回时读取地图选点 / 主营业务 ---
onShow(() => {
  // const raw = readSelectedLocationPayload()
  // if (raw) {
  //   locationPick.value = {
  //     id: raw.id != null ? String(raw.id) : '',
  //     name: raw.name != null ? String(raw.name) : '',
  //     address: raw.address != null ? String(raw.address) : '',
  //     distance: raw.distance != null ? String(raw.distance) : ''
  //   }
  //   uni.removeStorageSync('create:selected-location')
  // }

  const selectedBusiness = readSelectedBusinessPayload()
  if (selectedBusiness) {
    businessPath.value = selectedBusiness.path.map((p) => ({
      id: p.id != null ? String(p.id) : '',
      name: nodeDisplayName(p)
    }))
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
  if (!String(selectedIndustry.value || '').trim()) {
    uni.showToast({ title: '请选择行业', icon: 'none' })
    return
  }
  uni.navigateTo({
    url: `/pages/create/business/index?industry=${encodeURIComponent(selectedIndustry.value)}`
  })
}

function goToLocation() {
  uni.chooseLocation({
    success: (res) => {
      console.log(res)
      locationPick.value = {
        name: res.name,
        address: res.address
      }
      // if (raw) {
  //   locationPick.value = {
  //     id: raw.id != null ? String(raw.id) : '',
  //     name: raw.name != null ? String(raw.name) : '',
  //     address: raw.address != null ? String(raw.address) : '',
  //     distance: raw.distance != null ? String(raw.distance) : ''
  //   }
  //   uni.removeStorageSync('create:selected-location')
  // }
    },
    fail: (err) => {
      console.log(err)
    }
  })
  // uni.navigateTo({
  //   url: '/pages/create/location/index'
  // })
}

function goToGenerate() {
  errorIndustry.value = !isIndustryValid()
  errorBusiness.value = !isBusinessValid()
  errorShop.value = !isShopValid()
  errorLocation.value = !isLocationValid()

  if (
    errorIndustry.value ||
    errorBusiness.value ||
    errorShop.value ||
    errorLocation.value
  ) {
    uni.showToast({ title: '请完善信息后进行下一步', icon: 'none' })
    return
  }

  uni.setStorageSync('create:merchant-draft', {
    industry: String(selectedIndustry.value || '').trim(),
    businessPath: businessPath.value.map((p) => ({
      id: p.id != null ? String(p.id) : '',
      name: String(p.name || '').trim()
    })),
    shopName: String(shopName.value || '').trim(),
    location: locationPick.value
      ? {
          id: locationPick.value.id != null ? String(locationPick.value.id) : '',
          name: String(locationPick.value.name || '').trim(),
          address: String(locationPick.value.address || '').trim(),
          distance:
            locationPick.value.distance != null
              ? String(locationPick.value.distance)
              : ''
        }
      : null
  })

  uni.navigateTo({
    url: '/pages/create/generate/index'
  })
}
</script>

<style lang="scss" scoped>
.create-page {
  min-height: 100vh;
  padding-bottom: calc(172rpx + constant(safe-area-inset-bottom));
  padding-bottom: calc(172rpx + env(safe-area-inset-bottom));
  background: #ffffff;
  color: #202633;
}

.nav-bar {
  box-sizing: border-box;
  position: relative;
  overflow: hidden;
  padding-right: calc(18rpx + constant(safe-area-inset-right));
  padding-right: calc(18rpx + env(safe-area-inset-right));
  padding-left: calc(18rpx + constant(safe-area-inset-left));
  padding-left: calc(18rpx + env(safe-area-inset-left));
  padding-bottom: 16rpx;
  display: flex;
  align-items: center;
  justify-content: flex-start;
}

.nav-left {
  flex: 1;
  min-width: 0;
  display: flex;
  align-items: center;
  color: #1f2933;
  font-size: 30rpx;
}

.back-icon {
  flex-shrink: 0;
  width: 36rpx;
  height: 36rpx;
  margin-right: 8rpx;
  display: block;
}
.back-text{
	font-size: 30rpx;
	color: #1F2937 ;
}
/* 与首页 HomeHeader 一致：约等于微信胶囊宽度，避免标题与系统按钮叠盖 */
.nav-bar__gap {
  flex-shrink: 0;
  width: 174rpx;
  height: 32rpx;
}

.intro {
  padding: 24rpx 22rpx 30rpx;
  border-bottom: 1rpx solid #f5f5f5;
}

.intro-title {
  display: flex;
  align-items: center;
  color: #1f2630;
  font-size: 36rpx;
  font-weight: 800;
}

.wave-icon {
  margin-right: 10rpx;
  width: 64rpx;
  height: 64rpx;
}
.wave-text{
	font-size: 40rpx;
	color: #1F2937;
	font-family: OPPOSans-medium;
  letter-spacing: 1rpx;
}
.intro-desc {
  display: block;
  margin-top: 6rpx;
  color: #6B7280;
  font-size: 28rpx;
  letter-spacing: 1rpx;
	font-family: OPPOSans-regular;
}

.form {
  background: #ffffff;
	font-family: OPPOSans-regular;
}

.form-row {
  height: 108rpx;
  padding: 0 20rpx;
  border-bottom: 1rpx solid #f5f5f5;
  display: flex;
  align-items: center;
}

.label,
.field-title {
  color: #1F2937;
  font-size: 28rpx;
  font-weight: 600;
	font-family: OPPOSans-medium;
}

.required {
  color: #ff5656;
  font-size: 28rpx;
}

.form-control--error {
  background-color: rgba(255, 218, 218, 1) !important;
  border: 1rpx solid rgba(255, 112, 90, 1) !important;
}

.select-pill {
  box-sizing: border-box;
  border: 1rpx solid transparent;
  width: 200rpx;
  height: 56rpx;
  margin-left: 34rpx;
  border-radius: 999rpx;
  background: #f0f0f0;
  color: #696f78;
  font-size: 25rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 18rpx;
  image {
    width: 28rpx;
    height: 28rpx;
    margin-left: 18rpx;
  }
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
  min-height: 260rpx;
  margin: 22rpx 20rpx 48rpx;
  padding: 24rpx;
  padding-bottom: 56rpx;
  box-sizing: border-box;
  border: 1rpx solid #ffe2e2;
  border-radius: 22rpx;
  background-color: rgba(254, 249, 249, 1);
}

/* 提高优先级，避免被 .textarea-card 的背景规则盖住 */
.business-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 16rpx 14rpx;
  align-content: flex-start;
  align-items: flex-start;
  min-height: 168rpx;
}

.business-tag {
  position: relative;
  display: inline-flex;
  align-items: center;
  padding: 12rpx 28rpx 12rpx 20rpx;
  border-radius: 999rpx;
  border: 1rpx solid #ffb366;
  background: rgba(255, 247, 237, 1);
  max-width: 100%;
  box-sizing: border-box;
}

.business-tag__text {
  font-size: 24rpx;
  color: #ff8e24;
  line-height: 1.3;
}

.business-tag__remove {
  position: absolute;
  top: -10rpx;
  right: -10rpx;
  z-index: 2;
  width: 30rpx;
  height: 30rpx;
  border-radius: 50%;
  background: #b8bcc4;
  display: flex;
  align-items: center;
  justify-content: center;
}

.business-tag__minus {
  color: #ffffff;
  font-size: 22rpx;
  font-weight: 700;
  line-height: 1;
}

/* 与设计稿一致：大卡片内占位说明左上对齐，不作为整块居中 */
.business-tags-placeholder {
  flex: 1 1 100%;
  width: 100%;
  box-sizing: border-box;
  padding: 4rpx 0 0;
  text-align: left;
  color: #b3bbc7;
  font-size: 24rpx;
  line-height: 1.5;
}

.clear-btn {
  position: absolute;
  right: 14rpx;
  bottom: 14rpx;
  width: 72rpx;
  height: 40rpx;
  border-radius: 999rpx;
  background: #d7d9de;
  color: #ffffff;
  font-size: 20rpx;
  line-height: 40rpx;
  text-align: center;
}

.field-block {
  padding: 0 20rpx 36rpx;
  border-top: 1rpx solid #f5f5f5;
  margin-bottom: 66rpx;
}

.field-title {
  min-height: 88rpx;
  display: flex;
  align-items: center;
}

.input {
  box-sizing: border-box;
  height: 78rpx;
  padding: 0 24rpx;
  border: 1rpx solid #ffe2e2;
  border-radius: 22rpx;
  background-color: rgba(254,249,249,1);
  color: #333333;
  font-size: 25rpx;
}

.field-title.location-title-row {
  // justify-content: space-between;
  width: 100%;
  box-sizing: border-box;
}


.location-display__name {
  display: block;
  color: #1f2933;
  font-size: 28rpx;
  font-weight: 700;
  line-height: 1.4;
}

.location-display__addr {
  display: block;
  margin-top: 10rpx;
  color: #6b7280;
  font-size: 24rpx;
  line-height: 1.45;
}

.location-display__meta {
  display: block;
  margin-top: 8rpx;
  color: #9ca3af;
  font-size: 22rpx;
}

/* 已选点后的展示块（卡片样式） */
.location-display {
  margin-top: 16rpx;
}

/* 未选点：仅一行灰色提示，不占整块输入框样式 */
.location-display--empty {
  margin-top: 12rpx;
  color: #9ca3af;
  font-size: 25rpx;
  line-height: 1.5;
}

.location-btn {
  box-sizing: border-box;
  border: 1rpx solid transparent;
  min-width: 146rpx;
  width: 200rpx;
  height: 52rpx;
  border-radius: 999rpx;
  background: #f0f0f0;
  color: #666d78;
  font-size: 24rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-left: 20rpx;
  gap: 8rpx;
  image{
	width: 28rpx;
	height: 28rpx;
  }
  .location-btn__text {
    font-size: 24rpx;
  }
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
  height: calc(240rpx + constant(safe-area-inset-bottom));
  height: calc(240rpx + env(safe-area-inset-bottom));
  padding-top: 32rpx;
  padding-bottom: constant(safe-area-inset-bottom);
  padding-bottom: env(safe-area-inset-bottom);
  background: #f4f4f4;
  text-align: center;
}

.next-btn {
  width: 510rpx;
  height: 108rpx;
  border-radius: 999rpx;
  background: #ffc581;
  color: #ffffff;
  font-size: 32rpx;
  line-height: 108rpx;
}

.next-btn--ready {
  background: #ff9432;
}

.tips{
	margin-top: 12rpx;
	display: flex;
	align-items: center;
	justify-content: center;
	.tips-icon{
		width: 20rpx;
		height: 20rpx;
	}
	.tips-text{
		font-size: 20rpx;
		color: #9CA3AF ;
		margin-left: 4rpx;
	}
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
  box-sizing: border-box;
  padding-top: constant(safe-area-inset-top);
  padding-top: env(safe-area-inset-top);
  background: rgba(0, 0, 0, 0.54);
  display: flex;
  align-items: flex-end;
}

.industry-popup {
  width: 100%;
  padding: 18rpx 30rpx calc(46rpx + constant(safe-area-inset-bottom));
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
