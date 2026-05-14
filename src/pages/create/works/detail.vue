<template>
  <view class="detail-page">
    <view class="nav-bar" :style="createNavBarStyle">
      <view class="nav-left" @tap="goBack">
        <image class="back-icon" :src="createBackIcon" mode="aspectFit" />
        <text>成片详情</text>
      </view>
      <view class="nav-bar__gap" aria-hidden="true" />
    </view>

    <view v-if="detail" class="detail-body">
      <view v-if="detail.videoUrl" class="video-wrap">
        <video
          class="video"
          :src="detail.videoUrl"
          controls
          :poster="detail.cover"
          object-fit="contain"
        />
      </view>
      <view v-else class="poster-fallback">
        <image class="poster-fallback__img" :src="detail.cover" mode="aspectFit" />
        <text class="poster-fallback__hint">
          {{ fallbackHint }}
        </text>
      </view>

      <view class="meta-card">
        <text class="meta-title">{{ detail.title }}</text>
        <view class="meta-row">
          <text class="meta-label">时长</text>
          <text class="meta-val">{{ detail.durationLabel }}</text>
        </view>
        <view class="meta-row">
          <text class="meta-label">创建</text>
          <text class="meta-val">{{ detail.dateLabel }}</text>
        </view>
        <view class="meta-row">
          <text class="meta-label">状态</text>
          <text class="meta-val">{{ statusText }}</text>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup>
import { StaticPath } from '@/config'
/**
 * 【成片详情】联调后可播 videoUrl；当前 Mock 为空时展示封面与说明。
 */
import { computed, onMounted, ref } from 'vue'
import { onLoad, onReady } from '@dcloudio/uni-app'
import {
  getCreateNavBarInlineStyle,
  scheduleCreateNavBarStyleRefresh
} from '@/utils/create-nav-bar-style'
import { showPageLoading, hidePageLoading } from '@/utils/page-loading'
import { getFinishedVideoDetail } from '@/api/finished-videos'
const createBackIcon = `${StaticPath}create/create-back-icon.png`

const createNavBarStyle = ref(getCreateNavBarInlineStyle())
const detail = ref(null)
const videoId = ref('')

onLoad(async (query) => {
  videoId.value = query?.id ? decodeURIComponent(String(query.id)) : ''
  showPageLoading()
  try {
    detail.value = await getFinishedVideoDetail(videoId.value)
  } finally {
    hidePageLoading()
  }
})

onMounted(() => scheduleCreateNavBarStyleRefresh(createNavBarStyle))
onReady(() => scheduleCreateNavBarStyleRefresh(createNavBarStyle))

const statusText = computed(() => {
  const s = detail.value?.status
  if (s === 'processing') return '生成中'
  if (s === 'failed') return '生成失败'
  return '已完成'
})

const fallbackHint = computed(() => {
  const s = detail.value?.status
  if (s === 'processing') return '生成完成后可在此处预览成片'
  if (s === 'failed') return '生成失败，请重新生成或联系客服'
  return '播放器地址待接口返回（videoUrl）；当前展示封面预览'
})

/**
 * 返回上一页
 */
function goBack() {
  uni.navigateBack()
}
</script>

<style lang="scss" scoped>
.detail-page {
  min-height: 100vh;
  background: #f7f7f7;
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
  background: #ffffff;
  border-bottom: 1rpx solid #f1f1f1;
}

.nav-left {
  flex: 1;
  display: flex;
  align-items: center;
  color: #1f2933;
  font-size: 30rpx;
}

.back-icon {
  width: 36rpx;
  height: 36rpx;
  margin-right: 12rpx;
}

.nav-bar__gap {
  flex-shrink: 0;
  width: 174rpx;
  height: 32rpx;
}

.detail-body {
  padding: 20rpx;
}

.video-wrap {
  border-radius: 16rpx;
  overflow: hidden;
  background: #000000;
}

.video {
  width: 100%;
  height: 420rpx;
}

.poster-fallback {
  border-radius: 16rpx;
  overflow: hidden;
  background: #e5e7eb;
  padding: 40rpx 24rpx 32rpx;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.poster-fallback__img {
  width: 100%;
  height: 360rpx;
  border-radius: 12rpx;
}

.poster-fallback__hint {
  margin-top: 24rpx;
  font-size: 26rpx;
  color: #6b7280;
  text-align: center;
  line-height: 1.5;
}

.meta-card {
  margin-top: 24rpx;
  padding: 28rpx;
  border-radius: 16rpx;
  background: #ffffff;
}

.meta-title {
  font-size: 32rpx;
  font-weight: 700;
  color: #1f2937;
}

.meta-row {
  margin-top: 20rpx;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.meta-label {
  font-size: 26rpx;
  color: #9ca3af;
}

.meta-val {
  font-size: 26rpx;
  color: #374151;
}
</style>
