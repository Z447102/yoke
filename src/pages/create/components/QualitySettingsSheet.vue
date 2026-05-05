<template>
  <!-- 【一键成片】画质与模型底部弹窗：分辨率/模型独立；高清点数逻辑在父页 -->
  <view v-if="show" class="qss-mask" @tap="emit('close')">
    <view class="quality-popup" @tap.stop>
      <view class="popup-handle"></view>

      <view class="quality-section-title">选择视频分辨率</view>
      <view class="resolution-row">
        <view
          v-for="item in resolutionOptions"
          :key="item.id"
          class="resolution-card"
          :class="{ active: selectedResolution === item.id }"
          @tap="emit('resolution-tap', item)"
        >
          <view v-if="item.vip" class="resolution-vip">VIP</view>
          <text class="resolution-label">{{ item.label }}</text>
          <text class="resolution-hint">{{ item.hint }}</text>
        </view>
      </view>

      <view class="quality-section-title quality-section-title--spaced">选择模型</view>
      <scroll-view scroll-x class="model-scroll" :show-scrollbar="false">
        <view class="model-row">
          <view
            v-for="item in modelOptions"
            :key="item.id"
            class="model-card"
            :class="{ active: selectedModel === item.id }"
            @tap="emit('model-tap', item.id)"
          >
            <text class="model-label">{{ item.label }}</text>
            <text class="model-hint">{{ item.hint }}</text>
          </view>
        </view>
      </scroll-view>

      <button class="quality-popup-generate" @tap="emit('generate')">
        <text>生成视频</text>
        <text class="quality-popup-divider"></text>
        <text class="quality-popup-cost">▰ {{ costPoints }}点</text>
      </button>
    </view>
  </view>
</template>

<script setup>
/**
 * 事件：close | resolution-tap(item) | model-tap(id) | generate
 */
defineProps({
  show: { type: Boolean, default: false },
  costPoints: { type: Number, default: 20 },
  resolutionOptions: { type: Array, default: () => [] },
  modelOptions: { type: Array, default: () => [] },
  selectedResolution: { type: String, default: '720p' },
  selectedModel: { type: String, default: 'seedance2' }
})

const emit = defineEmits(['close', 'resolution-tap', 'model-tap', 'generate'])
</script>

<style lang="scss" scoped>
/* 底部弹层：遮罩 + 分辨率行 + 模型横滑 + 主按钮 */

.qss-mask {
  position: fixed;
  inset: 0;
  z-index: 30;
  box-sizing: border-box;
  padding-top: constant(safe-area-inset-top);
  padding-top: env(safe-area-inset-top);
  background: rgba(0, 0, 0, 0.45);
  display: flex;
  align-items: flex-end;
}

.quality-popup {
  width: 100%;
  max-height: 85vh;
  padding: 16rpx 24rpx calc(28rpx + constant(safe-area-inset-bottom));
  padding: 16rpx 24rpx calc(28rpx + env(safe-area-inset-bottom));
  border-radius: 26rpx 26rpx 0 0;
  background: #ffffff;
  box-sizing: border-box;
}

.popup-handle {
  width: 72rpx;
  height: 8rpx;
  margin: 0 auto 32rpx;
  border-radius: 999rpx;
  background: #eeeeee;
}

.quality-section-title {
  color: #1f2933;
  font-size: 28rpx;
  font-weight: 700;
  text-align: center;
  margin-bottom: 24rpx;
}

.quality-section-title--spaced {
  margin-top: 40rpx;
}

.resolution-row {
  display: flex;
  gap: 12rpx;
}

.resolution-card {
  position: relative;
  flex: 1;
  min-width: 0;
  padding: 26rpx 14rpx 22rpx;
  border-radius: 16rpx;
  background: #faf6f0;
  color: #4d5560;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  box-sizing: border-box;
}

.resolution-card.active {
  background: linear-gradient(160deg, #ffc98f 0%, #ff9835 100%);
  color: #ffffff;
}

.resolution-card.active .resolution-hint {
  color: rgba(255, 255, 255, 0.92);
}

.resolution-vip {
  position: absolute;
  top: 12rpx;
  right: 12rpx;
  padding: 4rpx 12rpx;
  border-radius: 8rpx;
  background: #111111;
  color: #ffffff;
  font-size: 18rpx;
  font-weight: 700;
}

.resolution-label {
  font-size: 32rpx;
  font-weight: 800;
  line-height: 1.2;
}

.resolution-hint {
  margin-top: 10rpx;
  font-size: 20rpx;
  color: #7a8490;
}

.model-scroll {
  width: 100%;
  margin-bottom: 36rpx;
  white-space: nowrap;
}

.model-row {
  display: inline-flex;
  gap: 16rpx;
  padding-bottom: 8rpx;
}

.model-card {
  display: inline-flex;
  flex-direction: column;
  align-items: flex-start;
  width: 200rpx;
  flex-shrink: 0;
  padding: 22rpx 16rpx 20rpx;
  border-radius: 14rpx;
  background: #ebebeb;
  color: #4d5560;
  box-sizing: border-box;
}

.model-card.active {
  background: linear-gradient(165deg, #3d4f63 0%, #1e2a36 100%);
  color: #ffffff;
}

.model-card.active .model-hint {
  color: rgba(255, 255, 255, 0.88);
}

.model-label {
  font-size: 26rpx;
  font-weight: 700;
  line-height: 1.3;
}

.model-hint {
  margin-top: 10rpx;
  font-size: 20rpx;
  color: #7a8490;
}

.quality-popup-generate {
  width: 100%;
  height: 96rpx;
  margin: 0;
  padding: 0 32rpx;
  border-radius: 999rpx;
  border: 0;
  background: linear-gradient(90deg, #ffc98f 0%, #ff9835 100%);
  color: #ffffff;
  font-size: 30rpx;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 24rpx;
}

.quality-popup-generate::after {
  border: 0;
}

.quality-popup-divider {
  width: 2rpx;
  height: 36rpx;
  background: rgba(255, 255, 255, 0.65);
}

.quality-popup-cost {
  font-size: 26rpx;
  font-weight: 600;
}
</style>
