<template>
  <view v-if="show" class="gwt-mask" @tap.stop>
    <view class="gwt-dialog" @tap.stop>
      <view class="gwt-title-bar">
        <text class="gwt-title">温馨提示</text>
      </view>
      <view class="gwt-body">
        <image
          class="gwt-icon"
          :src="tipIcon"
          mode="aspectFit"
          aria-hidden="true"
        />
        <text class="gwt-line-main">正在为您生成视频 ...</text>
        <text class="gwt-line-sub">
          点击【查看成片】，可查看生成进度
        </text>
        <view class="gwt-check-row" @tap="skipNext = !skipNext">
          <view class="gwt-check" :class="{ 'gwt-check--on': skipNext }">
            <text v-if="skipNext" class="gwt-check-tick">✓</text>
          </view>
          <text class="gwt-check-label">下次不再提示</text>
        </view>
        <button class="gwt-btn" @tap="onConfirm">我知道了</button>
      </view>
    </view>
  </view>
</template>

<script setup>
/**
 * 生成视频前「温馨提示」：引导用户通过「查看成片」跟进进度；支持「下次不再提示」。
 */
import { ref, watch } from 'vue'
import tipIcon from '@/static/create/create-icon-wave-hand.png'

const props = defineProps({
  show: { type: Boolean, default: false }
})

const emit = defineEmits(['confirm'])

const skipNext = ref(false)

watch(
  () => props.show,
  (v) => {
    if (v) skipNext.value = false
  }
)

function onConfirm() {
  emit('confirm', { skipNextTime: skipNext.value })
}
</script>

<style lang="scss" scoped>
.gwt-mask {
  position: fixed;
  inset: 0;
  z-index: 120;
  background: rgba(0, 0, 0, 0.45);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 40rpx;
  box-sizing: border-box;
}

.gwt-dialog {
  width: 100%;
  max-width: 620rpx;
  border-radius: 24rpx;
  overflow: hidden;
  background: #ffffff;
}

.gwt-title-bar {
  padding: 28rpx 24rpx;
  background: linear-gradient(180deg, #ffc98f 0%, #ff9835 100%);
}

.gwt-title {
  display: block;
  text-align: center;
  color: #ffffff;
  font-size: 32rpx;
  font-weight: 800;
}

.gwt-body {
  padding: 36rpx 32rpx 40rpx;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.gwt-icon {
  width: 88rpx;
  height: 88rpx;
  margin-bottom: 24rpx;
}

.gwt-line-main {
  color: #1f2937;
  font-size: 30rpx;
  font-weight: 700;
  text-align: center;
  line-height: 1.4;
}

.gwt-line-sub {
  margin-top: 16rpx;
  color: #6b7280;
  font-size: 26rpx;
  text-align: center;
  line-height: 1.5;
  padding: 0 8rpx;
}

.gwt-check-row {
  margin-top: 32rpx;
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: center;
  gap: 12rpx;
}

.gwt-check {
  width: 32rpx;
  height: 32rpx;
  border-radius: 6rpx;
  border: 2rpx solid #d1d5db;
  box-sizing: border-box;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #ffffff;
  flex-shrink: 0;
}

.gwt-check--on {
  border-color: #ff9835;
  background: rgba(255, 152, 53, 0.12);
}

.gwt-check-tick {
  color: #ff9835;
  font-size: 20rpx;
  font-weight: 800;
  line-height: 1;
}

.gwt-check-label {
  color: #4b5563;
  font-size: 26rpx;
}

.gwt-btn {
  margin-top: 36rpx;
  width: 100%;
  height: 88rpx;
  line-height: 88rpx;
  padding: 0;
  border-radius: 44rpx;
  border: 2rpx solid #e5e7eb;
  background: #ffffff;
  color: #1f2937;
  font-size: 30rpx;
  font-weight: 700;
}

.gwt-btn::after {
  border: 0;
}
</style>
