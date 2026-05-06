<template>
  <!-- 【一键成片】画质与模型底部弹窗：布局对齐设计稿（分辨率三卡 + 模型三卡 + 时长 + 生成 + 声明） -->
  <view v-if="show" class="qss-mask" @tap="emit('close')">
    <view class="quality-popup" @tap.stop>
      <view class="popup-handle"></view>

      <view class="quality-section-title">选择视频分辨率</view>
      <view class="resolution-row">
        <view
          v-for="item in resolutionOptions"
          :key="item.id"
          class="resolution-card"
          :class="{
            active: selectedResolution === item.id,
            'resolution-card--vip': item.vip
          }"
          @tap="emit('resolution-tap', item)"
        >
          <view v-if="item.vip" class="resolution-vip" aria-hidden="true">
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
          <text class="resolution-label">{{ item.label }}</text>
          <text class="resolution-hint">{{ item.hint }}</text>
        </view>
      </view>

      <view class="quality-section-title quality-section-title--spaced">选择模型</view>
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
          <text class="model-label">{{ item.label }}</text>
          <text class="model-hint">{{ item.hint }}</text>
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
/**
 * 事件：close | resolution-tap(item) | model-tap(id) | generate
 */
import createVipBadgeBg from '@/static/create/create-vip-badge-bg.png'
import createVipBadgeLabel from '@/static/create/create-vip-badge-label.png'
import createIconStack from '@/static/create/create-icon-stack.png'
import createIconAttention from '@/static/create/create-icon-attention.png'

defineProps({
  show: { type: Boolean, default: false },
  costPoints: { type: Number, default: 20 },
  resolutionOptions: { type: Array, default: () => [] },
  modelOptions: { type: Array, default: () => [] },
  selectedResolution: { type: String, default: '720p' },
  selectedModel: { type: String, default: 'seedance2' },
  /** 设计稿「该视频时长为 N秒」；后续可接模板/接口 */
  videoDurationSec: { type: Number, default: 30 }
})

const emit = defineEmits(['close', 'resolution-tap', 'model-tap', 'generate'])
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
  border-radius: 26rpx 26rpx 0 0;
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

.resolution-card,
.model-card {
  position: relative;
  flex: 0 0 224rpx;
  width: 224rpx;
  height: 140rpx;
  min-width: 0;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  justify-content: center;
  overflow: hidden;
}

.resolution-card {
  padding: 14rpx 14rpx 14rpx 14rpx;
  border-radius: 16rpx;
  background: #faf6f0;
  color: #4d5560;
}

/* 有 VIP：右上角预留区；固定 140rpx 高，内边距略收紧 */
.resolution-card--vip {
  padding: 44rpx 88rpx 10rpx 12rpx;
}

.resolution-card.active {
  background: linear-gradient(160deg, #ffc98f 0%, #ff9835 100%);
  color: #ffffff;
}

.resolution-card.active .resolution-hint {
  color: rgba(255, 255, 255, 0.92);
}

/* 底图 + 「VIP」字图；贴卡片右上角，与 --vip 内边距配合不压文案 */
.resolution-vip,
.model-vip {
  position: absolute;
  z-index: 2;
  top: 0;
  right: 0;
  width: 72rpx;
  height: 34rpx;
  // border-radius: 999rpx;
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
  font-size: 32rpx;
  font-weight: 800;
  line-height: 1.2;
}

.resolution-hint {
  margin-top: 6rpx;
  font-size: 20rpx;
  color: #7a8490;
}

.model-card {
  padding: 14rpx 14rpx 14rpx 14rpx;
  border-radius: 16rpx;
  background: #ebebeb;
  color: #4d5560;
}

.model-card--vip {
  padding: 44rpx 88rpx 10rpx 12rpx;
}

.model-card.active {
  background: linear-gradient(165deg, #5a6b7c 0%, #2c3844 100%);
  color: #ffffff;
}

.model-card.active .model-hint {
  color: rgba(255, 255, 255, 0.88);
}

.model-label {
  font-size: 26rpx;
  font-weight: 700;
  line-height: 1.3;
  max-width: 100%;
  box-sizing: border-box;
}

.model-hint {
  margin-top: 6rpx;
  font-size: 20rpx;
  color: #7a8490;
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
