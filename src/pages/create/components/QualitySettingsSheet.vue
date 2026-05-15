<template>
  <!-- 【一键成片】画质与模型底部弹窗：模型在上、分辨率在下（与模型联动） -->
  <view v-if="show" class="qss-mask" @tap="emit('close')">
    <view class="quality-popup" @tap.stop>
      <view class="popup-handle"></view>

      <view class="quality-section-title">选择模型</view>
      <view class="model-row">
        <view
          v-for="item in modelOptions"
          :key="item.id"
          class="model-card"
          :class="{
            active: selectedModel === item.id,
            'model-card--vip': item.vip
          }"
          @tap="emit('model-tap', item.id)"
        >
          <view v-if="item.vip" class="model-vip" aria-hidden="true">
            <image
              class="model-vip__bg"
              :src="createVipBadgeBg"
              mode="aspectFill"
            />
            <image
              class="model-vip__label"
              :src="createVipBadgeLabel"
              mode="aspectFit"
            />
          </view>
          <view class="model-card__body">
            <view class="model-card__main">
              <view class="model-card__brand-row">
                <image
                  class="model-card__icon"
                  :src="modelIconSrc(item.id)"
                  mode="aspectFit"
                />
                <text class="model-brand">{{ item.label }}</text>
              </view>
              <view
                v-if="isModelRecommendedForResolution(item.id, selectedResolution)"
                class="model-recommend"
                aria-hidden="true"
              >
                <view class="model-recommend__tag">
                  <image
                    class="model-recommend__tag-img"
                    :src="modelRecommendTagImg"
                    mode="aspectFit"
                  />
                </view>
                <text class="model-recommend__best">最适合</text>
              </view>
            </view>
          </view>
        </view>
      </view>

      <view class="quality-section-title quality-section-title--spaced">选择分辨率</view>
      <view class="resolution-row">
        <view
          v-for="item in resolutionOptions"
          :key="item.id"
          class="resolution-card"
          :class="{
            active:
              selectedResolution === item.id &&
              isResolutionSupportedByModel(selectedModel, item.id),
            'resolution-card--vip': item.vip,
            'resolution-card--disabled': !isResolutionSupportedByModel(
              selectedModel,
              item.id
            )
          }"
          @tap="onResolutionTap(item)"
        >
          <view
            v-if="item.vip"
            class="resolution-vip"
            aria-hidden="true"
          >
            <image
              class="resolution-vip__bg"
              :src="createVipBadgeBg"
              mode="aspectFill"
            />
            <image
              class="resolution-vip__label"
              :src="createVipBadgeLabel"
              mode="aspectFit"
            />
          </view>
          <view class="resolution-card__body">
            <text class="resolution-label">{{ item.label }}</text>
            <text class="resolution-hint">{{
              getResolutionHintForModel(selectedModel, item)
            }}</text>
          </view>
        </view>
      </view>

      <view class="quality-duration">该视频时长为 {{ videoDurationSec }}秒</view>

      <button class="quality-popup-generate" @tap="emit('generate')">
        <text class="quality-popup-generate__label">生成视频</text>
        <view class="quality-popup-generate__divider" aria-hidden="true" />
        <image
          class="quality-popup-generate__stack"
          :src="createIconStack"
          mode="aspectFit"
        />
        <text class="quality-popup-generate__cost">{{ costPoints }}点</text>
      </button>

      <view class="quality-footnote">
        <image
          class="quality-footnote__icon"
          :src="createIconAttention"
          mode="aspectFill"
          aria-hidden="true"
        />
        <text class="quality-footnote__text">内容由AI生成，禁止利用功能从事违法活动</text>
      </view>
    </view>
  </view>
</template>

<script setup>
import { StaticPath } from '@/config'
import {
  getResolutionHintForModel,
  isModelRecommendedForResolution,
  isResolutionSupportedByModel
} from '@/constants/create'
import modelIconVidu from '../static/create-model-icon-vidu.png'
import modelIconPixverse from '../static/create-model-icon-pixverse.png'
import modelIconSeedance from '../static/create-model-icon-seedance.png'
import modelRecommendTagImg from '../static/create-model-recommend-tag.png'

/**
 * 事件：close | resolution-tap(item) | model-tap(id) | generate
 */
const createVipBadgeBg = `${StaticPath}create/create-vip-badge-bg.png`
const createVipBadgeLabel = `${StaticPath}create/create-vip-badge-label.png`
const createIconStack = `${StaticPath}create/create-icon-stack.png`
const createIconAttention = `${StaticPath}create/create-icon-attention.png`
/** 模型图标走分包本地资源（CDN 未上传前也可用） */
const modelIconById = {
  vidu: modelIconVidu,
  pixverse: modelIconPixverse,
  seedance: modelIconSeedance
}

/**
 * @param {string} id
 * @returns {string}
 */
function modelIconSrc(id) {
  return modelIconById[id] || ''
}

const props = defineProps({
  show: { type: Boolean, default: false },
  costPoints: { type: Number, default: 20 },
  resolutionOptions: { type: Array, default: () => [] },
  modelOptions: { type: Array, default: () => [] },
  selectedResolution: { type: String, default: '720p' },
  selectedModel: { type: String, default: 'vidu' },
  /** 设计稿「该视频时长为 N秒」；后续可接模板/接口 */
  videoDurationSec: { type: Number, default: 30 }
})

const emit = defineEmits(['close', 'resolution-tap', 'model-tap', 'generate'])

/**
 * @param {{ id: string }} item
 */
function onResolutionTap(item) {
  if (!isResolutionSupportedByModel(props.selectedModel, item.id)) return
  emit('resolution-tap', item)
}
</script>

<style lang="scss" scoped>
.qss-mask {
  position: fixed;
  inset: 0;
  z-index: 100;
  box-sizing: border-box;
  padding-top: constant(safe-area-inset-top);
  padding-top: env(safe-area-inset-top);
  background: rgba(0, 0, 0, 0.45);
  display: flex;
  align-items: flex-end;
}

.quality-popup {
  width: 100%;
  max-height: 88vh;
  padding: 16rpx 24rpx calc(24rpx + constant(safe-area-inset-bottom));
  padding: 16rpx 24rpx calc(24rpx + env(safe-area-inset-bottom));
  border-radius: 60rpx 60rpx 0rpx 0rpx;
  background: #ffffff;
  box-sizing: border-box;
}

.popup-handle {
  width: 72rpx;
  height: 8rpx;
  margin: 0 auto 28rpx;
  border-radius: 999rpx;
  background: #eeeeee;
}

.quality-section-title {
  color: #1f2933;
  font-size: 28rpx;
  font-weight: 700;
  text-align: center;
  margin-bottom: 22rpx;
}

.quality-section-title--spaced {
  margin-top: 36rpx;
}

.resolution-row,
.model-row {
  display: flex;
  flex-direction: row;
  flex-wrap: nowrap;
  justify-content: center;
  gap: 12rpx;
  align-items: stretch;
}

.resolution-card {
  position: relative;
  flex: 0 0 224rpx;
  width: 224rpx;
  height: 140rpx;
  min-width: 0;
  box-sizing: border-box;
  overflow: hidden;
}

.model-card {
  position: relative;
  flex: 0 0 224rpx;
  width: 224rpx;
  height: 150rpx;
  min-width: 0;
  box-sizing: border-box;
  overflow: hidden;
  border-radius: 24rpx;
  background-color: rgba(244, 244, 244, 1);
  border: 1rpx solid rgba(238, 240, 243, 1);
}

.model-card.active {
  border: none;
  background: linear-gradient(
    156.23deg,
    rgba(147, 170, 199, 1) 12.77%,
    rgba(13, 23, 37, 1) 85.54%
  );
}

.model-recommend {
  flex-shrink: 0;
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: center;
  gap: 4rpx;
  margin-top: 8rpx;
}

.model-recommend__tag {
  flex-shrink: 0;
  width: 52rpx;
  height: 28rpx;
  border-radius: 8rpx;
  background: linear-gradient(
    180deg,
    rgba(255, 197, 129, 1) 0%,
    rgba(255, 148, 50, 1) 100%
  );
  display: flex;
  align-items: center;
  justify-content: center;
  box-sizing: border-box;
}

.model-recommend__tag-img {
  width: 32rpx;
  height: 16rpx;
  display: block;
}

.model-recommend__best {
  font-size: 20rpx;
  font-weight: 400;
  color: rgba(255, 255, 255, 0.75);
  font-family: OPPOSans-regular, OPPOSans, -apple-system, sans-serif;
  line-height: 1.3;
}

.model-card__body {
  position: absolute;
  left: 0;
  top: 0;
  right: 0;
  bottom: 0;
  box-sizing: border-box;
  padding: 12rpx;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  z-index: 1;
}

.model-card__main {
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.model-card__brand-row {
  width: 100%;
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: center;
}

.model-card__icon {
  flex-shrink: 0;
  width: 48rpx;
  height: 48rpx;
  margin-right: 8rpx;
  display: block;
}

.model-brand {
  font-size: 28rpx;
  font-weight: 700;
  line-height: 1.2;
  text-align: left;
  color: #1f2937;
  font-family: OPPOSans-bold, OPPOSans, -apple-system, sans-serif;
}

.model-card.active .model-brand {
  color: #ffffff;
}

.resolution-card__body {
  position: absolute;
  left: 0;
  top: 0;
  right: 0;
  bottom: 0;
  box-sizing: border-box;
  padding: 14rpx;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  z-index: 1;
}

.resolution-card {
  border-radius: 16rpx;
  background-color: rgba(253, 238, 219, 1);
  color: #4d5560;
}

.resolution-card.active {
  background: linear-gradient(
    156.23deg,
    rgba(255, 197, 129, 1) 8.94%,
    rgba(255, 148, 50, 1) 85.54%
  );
  color: #ffffff;
}

.resolution-card.active .resolution-hint {
  color: rgba(255, 255, 255, 0.92);
}

.resolution-card--disabled {
  opacity: 0.55;
  background-color: #f3f4f6;
  color: #9ca3af;
}

.resolution-card--disabled .resolution-hint {
  color: #9ca3af;
  font-size: 18rpx;
}

.resolution-vip,
.model-vip {
  position: absolute;
  z-index: 2;
  top: 0;
  right: 0;
  width: 72rpx;
  height: 34rpx;
  box-sizing: border-box;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
}

.resolution-vip__bg,
.model-vip__bg {
  position: absolute;
  left: 0;
  top: 0;
  width: 100%;
  height: 100%;
  z-index: 0;
}

.resolution-vip__label,
.model-vip__label {
  position: relative;
  z-index: 1;
  width: 40rpx;
  height: 20rpx;
  display: block;
  flex-shrink: 0;
}

.resolution-label {
  width: 100%;
  box-sizing: border-box;
  font-size: 32rpx;
  font-weight: 800;
  line-height: 1.2;
  text-align: center;
}

.resolution-hint {
  width: 100%;
  box-sizing: border-box;
  margin-top: 6rpx;
  font-size: 20rpx;
  color: #7a8490;
  text-align: center;
}

.quality-duration {
  margin-top: 28rpx;
  margin-bottom: 28rpx;
  text-align: center;
  color: #6b7280;
  font-size: 24rpx;
  font-weight: 600;
}

.quality-popup-generate {
  box-sizing: border-box;
  width: 508rpx;
  height: 96rpx;
  margin: 0 auto;
  padding: 0 32rpx;
  border-radius: 999rpx;
  border: 0;
  background: linear-gradient(90deg, #ffc98f 0%, #ff9835 100%);
  color: #ffffff;
  font-size: 30rpx;
  font-weight: 700;
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: center;
  gap: 0;
}

.quality-popup-generate::after {
  border: 0;
}

.quality-popup-generate__label {
  flex-shrink: 0;
  margin-right: 56rpx;
}

.quality-popup-generate__divider {
  flex-shrink: 0;
  width: 2rpx;
  height: 36rpx;
  border-radius: 1rpx;
  background: rgba(255, 255, 255, 0.65);
  margin-right: 28rpx;
}

.quality-popup-generate__stack {
  flex-shrink: 0;
  width: 30rpx;
  height: 30rpx;
  margin-right: 12rpx;
}

.quality-popup-generate__cost {
  font-size: 26rpx;
  font-weight: 600;
}

.quality-footnote {
  margin-top: 18rpx;
  padding: 0 8rpx 4rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-wrap: wrap;
  gap: 4rpx;
}

.quality-footnote__icon {
  flex-shrink: 0;
  width: 20rpx;
  height: 20rpx;
}

.quality-footnote__text {
  font-size: 20rpx;
  line-height: 1.45;
  color: #9ca3af;
}
</style>
