<template>
  <view v-if="renderDOM" class="queue-mask" :class="{ 'queue-mask--visible': isVisible }" @tap="emit('close')">
    <view class="queue-popup" :class="{ 'queue-popup--visible': isVisible }" @tap.stop>
      <view class="popup-handle"></view>

      <view class="queue-content">
        <!-- 排队等待动画/图标 -->
        <view class="queue-icon-wrap">
          <image
            class="queue-icon"
            src="../static/create-icon-queue-loading.png"
            mode="aspectFit"
          />
          <!-- 没有图片时的 CSS 兜底四叶草形状 -->
          <!-- <view class="css-clover-fallback" v-else>
            <view class="petal petal-1"></view>
            <view class="petal petal-2"></view>
            <view class="petal petal-3"></view>
            <view class="petal petal-4"></view>
            <view class="sparkle"></view>
          </view> -->
        </view>

        <text class="queue-title">当前排队中，还需2分钟</text>
        <text class="queue-subtitle">点击【查看成片】查看已生成的作品</text>
      </view>

      <view class="vip-upsell">
        <text class="vip-upsell-text">开通</text>
        <view class="vip-badge-wrap">
          <image
            class="vip-badge-bg"
            src="../static/create-badge-vip-bg.png"
            mode="aspectFit"
          />
          <image
            class="vip-badge-text"
            src="../static/create-badge-vip-text.png"
            mode="aspectFit"
          />
        </view>
        <!-- <view class="vip-badge">
          <text class="vip-badge-text">VIP</text>
        </view> -->
        <text class="vip-upsell-text">享更快成片速度</text>
      </view>

      <button class="vip-btn">立即开通 首年立省¥99</button>
    </view>
  </view>
</template>

<script setup>
import { ref, watch } from 'vue'

const props = defineProps({
  show: { type: Boolean, default: false }
})

const emit = defineEmits(['close'])

const renderDOM = ref(props.show)
const isVisible = ref(props.show)
let timer = null

watch(
  () => props.show,
  (newVal) => {
    if (timer) clearTimeout(timer)
    if (newVal) {
      renderDOM.value = true
      timer = setTimeout(() => {
        isVisible.value = true
      }, 50)
    } else {
      isVisible.value = false
      timer = setTimeout(() => {
        renderDOM.value = false
      }, 300)
    }
  },
  { immediate: true }
)
</script>

<style lang="scss" scoped>
.queue-mask {
  position: fixed;
  inset: 0;
  z-index: 999; /* 与其他底部弹窗一致 */
  box-sizing: border-box;
  padding-top: constant(safe-area-inset-top);
  padding-top: env(safe-area-inset-top);
  background: rgba(0, 0, 0, 0);
  display: flex;
  align-items: flex-end;
  transition: background 0.3s ease;
  pointer-events: none;
}

.queue-mask--visible {
  background: rgba(0, 0, 0, 0.45);
  pointer-events: auto;
}

.queue-popup {
  width: 100%;
  padding: 24rpx 32rpx calc(48rpx + constant(safe-area-inset-bottom));
  padding: 24rpx 32rpx calc(48rpx + env(safe-area-inset-bottom));
  border-radius: 32rpx 32rpx 0 0;
  background: #ffffff;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  align-items: center;
  transform: translateY(100%);
  transition: transform 0.3s ease;
}

.queue-popup--visible {
  transform: translateY(0);
}

.popup-handle {
  width: 64rpx;
  height: 8rpx;
  margin: 0 auto 52rpx;
  border-radius: 999rpx;
  background: #f0f0f0;
}

.queue-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
}

.queue-icon-wrap {
  position: relative;
  width: 120rpx;
  height: 120rpx;
  margin-bottom: 40rpx;
  display: flex;
  align-items: center;
  justify-content: center;
}

.queue-icon {
  width: 100%;
  height: 100%;
  animation: spin 2s linear infinite;
}

/* CSS 兜底四叶草图标 */
.css-clover-fallback {
  position: relative;
  width: 96rpx;
  height: 96rpx;
  animation: spin 8s linear infinite;
}

.petal {
  position: absolute;
  width: 44rpx;
  height: 44rpx;
  background: #ffbc71;
  opacity: 0.9;
}

/* 根据图片调整四个花瓣的圆角，形成四叶草 */
.petal-1 { top: 0; left: 26rpx; border-radius: 50% 50% 0 50%; }
.petal-2 { top: 26rpx; right: 0; border-radius: 50% 50% 50% 0; }
.petal-3 { bottom: 0; left: 26rpx; border-radius: 0 50% 50% 50%; }
.petal-4 { top: 26rpx; left: 0; border-radius: 50% 0 50% 50%; }

/* 蓝色的闪闪发光小图标 */
.sparkle {
  position: absolute;
  top: -8rpx;
  right: -8rpx;
  width: 20rpx;
  height: 20rpx;
  background: #4facfe;
  clip-path: polygon(50% 0%, 60% 40%, 100% 50%, 60% 60%, 50% 100%, 40% 60%, 0% 50%, 40% 40%);
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.queue-title {
  color: #1F2937;
  font-size: 32rpx;
  font-weight: 500;
  text-align: center;
  margin-bottom: 12rpx;
}

.queue-subtitle {
  color: #6B7280;
  font-size: 28rpx;
  text-align: center;
  margin-bottom: 118rpx;
}

.vip-upsell {
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: center;
  gap: 8rpx;
  font-size: 32rpx;
  margin-bottom: 30rpx;
}

.vip-upsell-text {
  font-size: 30rpx;
  color: #1f2933;
}

.vip-badge-wrap {
  width: 80rpx;
  height: 34rpx;
  position: relative;
  .vip-badge-bg {
    width: 100%;
    height: 100%;
  }
  .vip-badge-text {
    width: 44rpx;
    height: 18rpx;
    position: absolute;
    top: 8rpx;
    left: 50%;
    transform: translateX(-50%);
  }
}

.vip-btn {
  box-sizing: border-box;
  width: 670rpx;
  height: 104rpx;
  border-radius: 36rpx;
  border: 0;
  background: linear-gradient(180deg, rgba(255,197,129,1) 0%,rgba(255,148,50,1) 100%);
  color: #1F2937;
  font-size: 30rpx;
  display: flex;
  align-items: center;
  justify-content: center;
}

.vip-btn::after {
  border: 0;
}

.queue-hand {
  width: 144rpx;
  height: 178rpx;
  position: absolute;
  top: 200rpx;
  right: 0;
}
</style>