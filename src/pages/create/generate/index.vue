<template>
  <view class="generate-page">
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

    <view class="filter-bar">
      <view class="filter-group">
        <text class="filter-label">主营业务</text>
        <view class="filter-pill">
          <text>主营业务1</text>
          <text class="arrow">⌄</text>
        </view>
      </view>
      <view class="filter-group">
        <text class="filter-label">平台</text>
        <view class="filter-pill">
          <text>抖音</text>
          <text class="arrow">⌄</text>
        </view>
      </view>
    </view>

    <view class="tag-row">
      <view
        v-for="tag in businessTags"
        :key="tag"
        class="tag active"
      >
        {{ tag }}
      </view>
    </view>

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

    <view class="bottom-action">
      <view class="quality-select">
        <text class="quality-main">720P</text>
        <text class="quality-sub">Seedance 2.0</text>
        <text class="quality-arrow">⌄</text>
      </view>
      <button class="generate-btn" @tap="generateVideo">
        <text>生成视频</text>
        <text class="cost">▰ 20点</text>
      </button>
      <text class="ai-tip">◎ 内容由AI生成，禁止利用功能从事违法活动</text>
    </view>
  </view>
</template>

<script setup>
import { ref } from 'vue'

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
const copywriting = ref('重庆老火锅，这味道太顶了！兄弟们，这家重庆老火锅我真的要安利一下。锅底一上来就开始翻滚，那个牛油香味直接冲上来。你看这个毛肚，七上八下，脆到不行。还有这个肥牛，一口下去全是香味。')

function goBack() {
  uni.navigateBack()
}

function generateVideo() {
  uni.showToast({
    title: '开始生成视频',
    icon: 'none'
  })
}
</script>

<style lang="scss" scoped>
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
</style>
