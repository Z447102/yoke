<template>
  <!-- 一键成片 · 生成配置页 | docs §10：导航 → 筛选 → 模板/标签 → 照片/形象/文案 → 底栏 → 弹窗 -->
  <view class="generate-page">
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

    <!-- 筛选：主营业务、发布平台 -->
    <view class="filter-bar">
      <view class="filter-group">
        <text class="filter-label">主营业务</text>
        <view class="filter-pill" @tap="openBusinessPopup">
          <text>{{ currentBusiness.name }}</text>
          <text class="arrow">⌄</text>
        </view>
      </view>
      <view class="filter-group">
        <text class="filter-label">平台</text>
        <view class="filter-pill" @tap="openPlatformPopup">
          <text>{{ currentPlatform.name }}</text>
          <text class="arrow">⌄</text>
        </view>
      </view>
    </view>

    <!-- 业务标签（示意） -->
    <view class="tag-row">
      <view
        v-for="tag in businessTags"
        :key="tag"
        class="tag active"
      >
        {{ tag }}
      </view>
    </view>

    <!-- 视频模板 -->
    <view class="section">
      <view class="section-title">请选择视频模板</view>
      <scroll-view scroll-x class="template-scroll" :show-scrollbar="false">
        <view class="template-list">
          <view
            v-for="template in templates"
            :key="template.id"
            class="template-card"
            :class="{ active: selectedTemplate === template.id }"
            @tap="selectedTemplate = template.id"
          >
            <image class="template-image" :src="template.image" mode="aspectFill" />
            <view class="template-check">{{ selectedTemplate === template.id ? '✓' : '' }}</view>
            <view class="template-body">
              <text class="template-title">{{ template.title }}</text>
              <text class="template-desc">{{ template.desc }}</text>
              <view class="template-meta">
                <text class="template-tag">{{ template.tag }}</text>
                <text class="template-hot">❤ {{ template.hot }}</text>
              </view>
            </view>
          </view>
        </view>
      </scroll-view>
    </view>

    <!-- 素材：上传照片 -->
    <view class="section upload-section">
      <view class="section-header">
        <view class="section-title">请上传照片</view>
        <view class="tips">
          <text class="tips-icon">?</text>
          <text>拍摄技巧</text>
        </view>
      </view>

      <view class="photo-list">
        <view v-for="photo in photoSlots" :key="photo" class="photo-slot">
          <view class="photo-plus">+</view>
          <text>{{ photo }}</text>
        </view>
      </view>
    </view>

    <!-- 出镜形象 -->
    <view class="section">
      <view class="section-header">
        <view class="section-title">请选择出镜形象</view>
        <view class="segment">
          <text class="segment-item active">官方</text>
          <text class="segment-item">我的</text>
        </view>
      </view>

      <scroll-view scroll-x class="avatar-scroll" :show-scrollbar="false">
        <view class="avatar-list">
          <view
            v-for="avatar in avatars"
            :key="avatar.id"
            class="avatar-card"
            :class="{ active: selectedAvatar === avatar.id }"
            @tap="selectedAvatar = avatar.id"
          >
            <image class="avatar-image" :src="avatar.image" mode="aspectFill" />
            <view class="avatar-label">{{ avatar.name }}</view>
            <view class="avatar-check">{{ selectedAvatar === avatar.id ? '✓' : '' }}</view>
          </view>
        </view>
      </scroll-view>
    </view>

    <!-- 口播/展示文案 -->
    <view class="section copy-section">
      <view class="section-title">视频文案</view>
      <view class="copy-card">
        <textarea
          v-model="copywriting"
          class="copy-textarea"
          maxlength="500"
          placeholder="请输入视频文案"
          placeholder-class="placeholder"
        />
        <view class="copy-footer">
          <text>{{ copywriting.length }}/500字</text>
          <button class="clear-btn" size="mini" @tap="copywriting = ''">清空</button>
        </view>
      </view>
    </view>

    <!-- 底部：画质摘要 + 生成（消耗点数见 generateCostPoints） -->
    <view class="bottom-action">
      <view class="quality-select" @tap="openQualityPopup">
        <text class="quality-main">{{ currentResolution.label }}</text>
        <text class="quality-sub">{{ currentModel.label }}</text>
        <text class="quality-arrow">⌄</text>
      </view>
      <button class="generate-btn" @tap="generateVideo">
        <text>生成视频</text>
        <text class="cost">▰ {{ generateCostPoints }}点</text>
      </button>
      <text class="ai-tip">◎ 内容由AI生成，禁止利用功能从事违法活动</text>
    </view>

    <!-- 弹窗：主营业务 -->
    <view v-if="showBusinessPopup" class="popup-mask" @tap="closeBusinessPopup">
      <view class="business-popup" @tap.stop>
        <view class="popup-handle"></view>
        <view class="popup-title">选择主营业务</view>

        <view class="business-list">
          <view
            v-for="business in businessOptions"
            :key="business.id"
            class="business-option"
            :class="{ active: tempBusiness === business.id }"
            @tap="selectBusiness(business.id)"
          >
            <view class="business-info">
              <text class="business-name">{{ business.name }}</text>
              <text class="business-desc">{{ business.desc }}</text>
            </view>
            <view class="business-edit">
              <text>⌁</text>
              <text>编辑</text>
              <text>›</text>
            </view>
          </view>
        </view>

        <view class="business-add">＋ 新增主营业务</view>
        <button class="popup-confirm" @tap="confirmBusiness">确定</button>
      </view>
    </view>

    <!-- 弹窗：平台 -->
    <view v-if="showPlatformPopup" class="popup-mask" @tap="closePlatformPopup">
      <view class="platform-popup" @tap.stop>
        <view class="popup-handle"></view>
        <view class="popup-title">选择平台</view>

        <view class="platform-list">
          <view
            v-for="platform in platformOptions"
            :key="platform.id"
            class="platform-option"
            :class="{ active: tempPlatform === platform.id }"
            @tap="selectPlatform(platform.id)"
          >
            {{ platform.name }}
          </view>
        </view>

        <button class="popup-confirm" @tap="confirmPlatform">确定</button>
      </view>
    </view>

    <!-- 弹窗：分辨率与模型（组件） -->
    <QualitySettingsSheet
      :show="showQualityPopup"
      :cost-points="generateCostPoints"
      :resolution-options="resolutionOptions"
      :model-options="modelOptions"
      :selected-resolution="selectedResolution"
      :selected-model="selectedModel"
      @close="closeQualityPopup"
      @resolution-tap="onPickResolution"
      @model-tap="selectModel"
      @generate="confirmGenerateFromPopup"
    />

    <!-- 弹窗：VIP 套餐（点数不足等） -->
    <VipSubscribeModal :show="showVipModal" @close="closeVipModal" @confirm="submitVipSubscribe" />
  </view>
</template>

<script setup>
/**
 * 【一键成片 · 生成配置页】pages/create/generate/index.vue
 *
 * 功能块：筛选与模板、素材与文案、底部成片操作、业务/平台弹窗、画质与模型子组件、VIP 套餐。
 * 规范：docs/frontend-development.md §10；常量 @/constants/create；接口 @/api/create。
 */
import { computed, onMounted, ref } from 'vue'
import { useUserStore } from '@/stores/user'
import { getVideoGenerateCostPreview } from '@/api/create'
import {
  CREATE_MODEL_OPTIONS,
  CREATE_RESOLUTION_OPTIONS,
  HD_RESOLUTION_IDS,
  VIDEO_GENERATE_COST_POINTS
} from '@/constants/create'
import QualitySettingsSheet from '../components/QualitySettingsSheet.vue'
import VipSubscribeModal from '../components/VipSubscribeModal.vue'

// --- 页面静态配置：模板、标签、照片槽、数字人形象（Mock，后续接接口） ---
const businessTags = ['新派粤菜', '家宴', '客家菜', '活鲜', '粤菜', '融合菜']
const templates = [
  {
    id: 'store',
    title: '探店视频这样拍',
    desc: '吸引转化客户',
    tag: '探店',
    hot: '3.2w',
    image: 'https://images.unsplash.com/photo-1497366754035-f200968a6e72?w=300&h=220&fit=crop'
  },
  {
    id: 'dish',
    title: '招聘菜这样拍',
    desc: '让客人看了更有食欲',
    tag: '菜品展示',
    hot: '2.1w',
    image: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=300&h=220&fit=crop'
  },
  {
    id: 'coupon',
    title: '团购引流这样拍',
    desc: '让老人都爱买真特色',
    tag: '团购引流',
    hot: '2.1w',
    image: 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=300&h=220&fit=crop'
  }
]
const photoSlots = ['门头照片', '内部环境', '菜品照片', '其他照片']
const avatars = [
  {
    id: 'script',
    name: '编辑内容',
    image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=220&h=260&fit=crop'
  },
  {
    id: 'new',
    name: '新国主播',
    image: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=220&h=260&fit=crop'
  },
  {
    id: 'doctor',
    name: '医学科普',
    image: 'https://images.unsplash.com/photo-1537368910025-700350fe46c7?w=220&h=260&fit=crop'
  },
  {
    id: 'female',
    name: '电台主播',
    image: 'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=220&h=260&fit=crop'
  }
]

const selectedTemplate = ref('store')
const selectedAvatar = ref('script')
const businessOptions = [
  {
    id: 'business1',
    name: '主营业务1',
    path: '餐饮-火锅',
    desc: '餐饮-火锅'
  },
  {
    id: 'business2',
    name: '主营业务2',
    path: '餐饮-正餐(家常菜 / 酒楼)...',
    desc: '餐饮-正餐(家常菜 / 酒楼)...'
  }
]
const platformOptions = [
  { id: 'douyin', name: '抖音' },
  { id: 'kuaishou', name: '快手' },
  { id: 'shipinhao', name: '视频号' },
  { id: 'xiaohongshu', name: '小红书' }
]
const selectedBusiness = ref('business1')
const tempBusiness = ref('business1')
const showBusinessPopup = ref(false)
const selectedPlatform = ref('douyin')
const tempPlatform = ref('douyin')
const showPlatformPopup = ref(false)
const copywriting = ref('重庆老火锅，这味道太顶了！兄弟们，这家重庆老火锅我真的要安利一下。锅底一上来就开始翻滚，那个牛油香味直接冲上来。你看这个毛肚，七上八下，脆到不行。还有这个肥牛，一口下去全是香味。')

// --- 用户态：点数用于成片前校验（高清档位、主按钮） ---
const userStore = useUserStore()

// --- 成片参数：分辨率 / 模型（与常量表一致，二者独立） ---
const resolutionOptions = CREATE_RESOLUTION_OPTIONS
const modelOptions = CREATE_MODEL_OPTIONS

// --- 计费：单次消耗点数，进入页后尝试拉取接口预览，失败则沿用常量 ---
const generateCostPoints = ref(VIDEO_GENERATE_COST_POINTS)

const selectedResolution = ref('720p')
const selectedModel = ref('seedance2')
const showQualityPopup = ref(false)

// --- VIP 套餐弹窗（点数不足等） ---
const showVipModal = ref(false)

// --- 展示用 computed ---
const currentBusiness = computed(() => businessOptions.find((item) => item.id === selectedBusiness.value) || businessOptions[0])
const currentPlatform = computed(() => platformOptions.find((item) => item.id === selectedPlatform.value) || platformOptions[0])

const currentResolution = computed(
  () => resolutionOptions.find((item) => item.id === selectedResolution.value) || resolutionOptions[0]
)
const currentModel = computed(() => modelOptions.find((item) => item.id === selectedModel.value) || modelOptions[0])

// --- 成片计费预览（Mock API） ---
onMounted(async () => {
  try {
    const data = await getVideoGenerateCostPreview()
    if (data != null && typeof data.points === 'number' && data.points >= 0) {
      generateCostPoints.value = data.points
    }
  } catch {
    // 接口失败时沿用常量默认值
  }
})

function openVipPurchaseModal() {
  showVipModal.value = true
}

// --- 页面导航 ---
function goBack() {
  uni.navigateBack()
}

// --- 主营业务弹窗 ---
function openBusinessPopup() {
  tempBusiness.value = selectedBusiness.value
  showBusinessPopup.value = true
}

function closeBusinessPopup() {
  showBusinessPopup.value = false
}

function selectBusiness(id) {
  tempBusiness.value = id
}

function confirmBusiness() {
  selectedBusiness.value = tempBusiness.value
  closeBusinessPopup()
}

// --- 发布平台弹窗 ---
function openPlatformPopup() {
  tempPlatform.value = selectedPlatform.value
  showPlatformPopup.value = true
}

function closePlatformPopup() {
  showPlatformPopup.value = false
}

function selectPlatform(id) {
  tempPlatform.value = id
}

function confirmPlatform() {
  selectedPlatform.value = tempPlatform.value
  closePlatformPopup()
}

// --- 画质 / 模型底部弹窗 ---
function openQualityPopup() {
  showQualityPopup.value = true
}

function closeQualityPopup() {
  showQualityPopup.value = false
}

function selectResolution(id) {
  selectedResolution.value = id
}

/** 高清档位（1080p/4k）：点数不足则弹出 VIP、不切分辨率；详见 constants HD_RESOLUTION_IDS */
function onPickResolution(item) {
  const isHdResolution = HD_RESOLUTION_IDS.includes(item.id)
  if (isHdResolution && userStore.points < generateCostPoints.value) {
    openVipPurchaseModal()
    return
  }
  selectResolution(item.id)
}

// --- VIP 订阅（支付占位） ---
function closeVipModal() {
  showVipModal.value = false
}

/** @param {{ plan: 'month' | 'year' }} payload */
function submitVipSubscribe(payload) {
  uni.showToast({
    title: `请接入微信支付（${payload.plan === 'year' ? '包年' : '包月'}）`,
    icon: 'none'
  })
  // 下单成功：closeVipModal(); await refreshUserPoints(); userStore.setPoints(...)
}

function selectModel(id) {
  selectedModel.value = id
}

// --- 发起成片（弹窗内 / 主按钮均需点数充足） ---
function confirmGenerateFromPopup() {
  if (userStore.points < generateCostPoints.value) {
    openVipPurchaseModal()
    return
  }
  closeQualityPopup()
  generateVideo()
}

function generateVideo() {
  if (userStore.points < generateCostPoints.value) {
    openVipPurchaseModal()
    return
  }
  uni.showToast({
    title: '开始生成视频',
    icon: 'none'
  })
}
</script>

<style lang="scss" scoped>
/* 【一键成片 · 生成页】区块样式：导航 / 筛选 / 卡片 / 底栏 / 业务与平台弹窗 */

.generate-page {
  min-height: 100vh;
  padding-bottom: calc(178rpx + env(safe-area-inset-bottom));
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

.filter-bar {
  height: 82rpx;
  padding: 0 20rpx;
  border-bottom: 1rpx solid #eeeeee;
  display: flex;
  align-items: center;
  gap: 30rpx;
}

.filter-group,
.filter-pill,
.section-header,
.segment,
.bottom-action,
.quality-select,
.generate-btn {
  display: flex;
  align-items: center;
}

.filter-label {
  margin-right: 12rpx;
  color: #1f2933;
  font-size: 26rpx;
  font-weight: 700;
}

.filter-pill {
  height: 52rpx;
  padding: 0 24rpx;
  border-radius: 999rpx;
  background: #f1f1f1;
  color: #4d5560;
  font-size: 24rpx;
  gap: 14rpx;
}

.tag-row {
  padding: 10rpx 20rpx 24rpx;
  border-bottom: 1rpx solid #f1f1f1;
  display: flex;
  flex-wrap: wrap;
  gap: 14rpx;
}

.tag {
  height: 54rpx;
  padding: 0 22rpx;
  border: 1rpx solid #ff9a35;
  border-radius: 999rpx;
  color: #ff8e24;
  background: #fff3e6;
  font-size: 23rpx;
  line-height: 54rpx;
}

.section {
  padding: 26rpx 20rpx 18rpx;
  border-bottom: 1rpx solid #f1f1f1;
}

.section-title {
  color: #1f2933;
  font-size: 28rpx;
  font-weight: 700;
}

.section-header {
  justify-content: space-between;
}

.tips {
  color: #9ca3af;
  font-size: 24rpx;
}

.tips-icon {
  margin-right: 6rpx;
}

.template-scroll,
.avatar-scroll {
  margin-top: 20rpx;
  white-space: nowrap;
}

.template-list,
.avatar-list {
  display: inline-flex;
  gap: 14rpx;
}

.template-card {
  position: relative;
  overflow: hidden;
  width: 222rpx;
  border: 2rpx solid transparent;
  border-radius: 12rpx;
  background: #ffffff;
  box-shadow: 0 8rpx 20rpx rgba(255, 137, 30, 0.12);
}

.template-card.active {
  border-color: #ff982f;
}

.template-image {
  width: 222rpx;
  height: 138rpx;
}

.template-check,
.avatar-check {
  position: absolute;
  top: 8rpx;
  right: 8rpx;
  width: 34rpx;
  height: 34rpx;
  border-radius: 8rpx;
  background: #ffffff;
  color: #ff982f;
  font-size: 24rpx;
  line-height: 34rpx;
  text-align: center;
}

.template-body {
  padding: 10rpx;
}

.template-title,
.template-desc {
  display: block;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.template-title {
  color: #333333;
  font-size: 22rpx;
  font-weight: 700;
}

.template-desc {
  margin-top: 4rpx;
  color: #777777;
  font-size: 18rpx;
}

.template-meta {
  margin-top: 10rpx;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.template-tag {
  padding: 3rpx 8rpx;
  border-radius: 6rpx;
  background: #fff1dc;
  color: #ff8e24;
  font-size: 16rpx;
}

.template-hot {
  color: #ff9b36;
  font-size: 17rpx;
}

.photo-list {
  margin-top: 20rpx;
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 20rpx;
}

.photo-slot {
  height: 128rpx;
  border: 1rpx solid #ffe2e2;
  border-radius: 18rpx;
  background: #fff9f9;
  color: #c7a6a6;
  font-size: 21rpx;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.photo-plus {
  width: 42rpx;
  height: 42rpx;
  margin-bottom: 10rpx;
  border-radius: 50%;
  background: #ffffff;
  color: #c8b4b4;
  font-size: 32rpx;
  line-height: 42rpx;
  text-align: center;
}

.segment {
  height: 48rpx;
  padding: 4rpx;
  border-radius: 999rpx;
  background: #f4f4f4;
}

.segment-item {
  min-width: 82rpx;
  height: 40rpx;
  border-radius: 999rpx;
  color: #9ca3af;
  font-size: 23rpx;
  line-height: 40rpx;
  text-align: center;
}

.segment-item.active {
  background: #ff9b36;
  color: #ffffff;
}

.avatar-card {
  position: relative;
  overflow: hidden;
  width: 144rpx;
  height: 150rpx;
  border: 2rpx solid transparent;
  border-radius: 14rpx;
}

.avatar-card.active {
  border-color: #ff982f;
}

.avatar-image {
  width: 144rpx;
  height: 150rpx;
}

.avatar-label {
  position: absolute;
  left: 8rpx;
  top: 8rpx;
  padding: 4rpx 10rpx;
  border-radius: 999rpx;
  background: rgba(0, 0, 0, 0.35);
  color: #ffffff;
  font-size: 18rpx;
}

.copy-card {
  margin-top: 22rpx;
  padding: 22rpx;
  border-radius: 18rpx;
  background: #fff9f9;
}

.copy-textarea {
  width: 100%;
  height: 196rpx;
  color: #5d6672;
  font-size: 25rpx;
  line-height: 1.7;
}

.copy-footer {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 14rpx;
  color: #a4abb5;
  font-size: 22rpx;
}

.clear-btn {
  width: 70rpx;
  height: 38rpx;
  margin: 0;
  padding: 0;
  border-radius: 999rpx;
  background: #d7d9de;
  color: #ffffff;
  font-size: 20rpx;
  line-height: 38rpx;
}

.clear-btn::after,
.generate-btn::after {
  border: 0;
}

.bottom-action {
  position: fixed;
  left: 0;
  right: 0;
  bottom: 0;
  height: calc(178rpx + env(safe-area-inset-bottom));
  padding: 28rpx 30rpx env(safe-area-inset-bottom);
  background: #f4f4f4;
  gap: 18rpx;
  flex-wrap: wrap;
}

.quality-select {
  width: 190rpx;
  height: 88rpx;
  padding: 0 24rpx;
  border-radius: 999rpx;
  background: #d7d9de;
  color: #526070;
  flex-wrap: wrap;
  position: relative;
}

.quality-main {
  width: 100%;
  font-size: 30rpx;
  font-weight: 800;
}

.quality-sub {
  margin-top: -12rpx;
  font-size: 16rpx;
}

.quality-arrow {
  position: absolute;
  right: 22rpx;
  top: 28rpx;
  font-size: 28rpx;
}

.generate-btn {
  flex: 1;
  height: 88rpx;
  margin: 0;
  border-radius: 999rpx;
  background: linear-gradient(180deg, #ffc98f 0%, #ff9835 100%);
  color: #ffffff;
  font-size: 30rpx;
  line-height: 88rpx;
  justify-content: center;
  gap: 28rpx;
}

.cost {
  font-size: 23rpx;
}

.ai-tip {
  width: 100%;
  color: #a4abb5;
  font-size: 20rpx;
  text-align: center;
}

.popup-mask {
  position: fixed;
  inset: 0;
  z-index: 30;
  background: rgba(0, 0, 0, 0.45);
  display: flex;
  align-items: flex-end;
}

.business-popup {
  width: 100%;
  padding: 16rpx 22rpx calc(40rpx + env(safe-area-inset-bottom));
  border-radius: 26rpx 26rpx 0 0;
  background: #ffffff;
}

.popup-handle {
  width: 72rpx;
  height: 8rpx;
  margin: 0 auto 32rpx;
  border-radius: 999rpx;
  background: #eeeeee;
}

.popup-title {
  color: #1f2933;
  font-size: 30rpx;
  font-weight: 700;
  text-align: center;
}

.business-list {
  margin-top: 32rpx;
}

.business-option {
  height: 90rpx;
  margin-top: 18rpx;
  padding: 0 24rpx;
  border: 2rpx solid #f0f0f0;
  border-radius: 18rpx;
  background: #ffffff;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.business-option.active {
  border-color: #ff9a31;
  background: #fff2df;
}

.business-option.focused {
  border-color: #409eff;
}

.business-name {
  color: #ff8e24;
  font-size: 28rpx;
  font-weight: 700;
}

.business-desc {
  margin-left: 28rpx;
  color: #5d6672;
  font-size: 24rpx;
}

.business-edit {
  color: #1f2933;
  font-size: 26rpx;
}

.business-add {
  height: 90rpx;
  margin-top: 20rpx;
  border-radius: 18rpx;
  background: #f2f2f2;
  color: #1f2933;
  font-size: 28rpx;
  display: flex;
  align-items: center;
  justify-content: center;
}

.popup-confirm {
  width: 460rpx;
  height: 100rpx;
  margin: 58rpx auto 0;
  border-radius: 999rpx;
  background: linear-gradient(180deg, #ffc98f 0%, #ff9835 100%);
  color: #ffffff;
  font-size: 31rpx;
  line-height: 100rpx;
}

.popup-confirm::after {
  border: 0;
}

.platform-popup {
  width: 100%;
  padding: 16rpx 22rpx calc(40rpx + env(safe-area-inset-bottom));
  border-radius: 26rpx 26rpx 0 0;
  background: #ffffff;
}

.platform-list {
  margin-top: 32rpx;
}

.platform-option {
  height: 88rpx;
  margin-top: 16rpx;
  border-radius: 18rpx;
  background: #f6f6f6;
  color: #1f2933;
  font-size: 28rpx;
  font-weight: 600;
  display: flex;
  align-items: center;
  justify-content: center;
}

.platform-option.active {
  background: #fff2df;
  color: #ff8e24;
  border: 2rpx solid #ff9a31;
}
</style>
