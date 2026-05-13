<template>
  <view class="tool-section">
    <SectionTitle :title="title" :icon-src="titleIconSrc" />

    <swiper
      class="tool-swiper"
      :current="currentSlide"
      @change="onSwiperChange"
      @transition="onSwiperTransition"
      :indicator-dots="false"
    >
      <!-- Slide 1: 3 large cards + CTA -->
      <swiper-item>
        <view class="slide-content">
          <view v-if="displayedTools.length" class="tool-track">
            <view class="tool-row">
              <view
                v-for="(tool, index) in displayedTools"
                :key="tool.key"
                class="tool-item"
                @tap="$emit('select', tool)"
              >
                <view class="tool-item__text">
                  <text class="tool-name">{{ tool.name }}</text>
                  <text class="tool-desc">{{ tool.desc }}</text>
                </view>
                <view class="tool-icon">
                  <image
                    v-if="moduleIconAt(index)"
                    class="tool-icon__img"
                    :src="moduleIconAt(index)"
                    mode="aspectFit"
                    :lazy-load="false"
                  />
                  <text v-else class="tool-icon__emoji">{{ tool.icon }}</text>
                  <view v-if="tool.badge" class="tool-badge">{{ tool.badge }}</view>
                </view>
              </view>
            </view>
          </view>

          <view class="custom-dots">
            <view class="dot" :class="{ active: currentSlide === 0 }"></view>
            <view class="dot" :class="{ active: currentSlide === 1 }"></view>
          </view>

          <view class="tool-cta" :style="{ opacity: ctaTextOpacity }">
            <image
              class="tool-cta__bg"
              :src="toolGridCtaBg"
              mode="aspectFill"
              :lazy-load="false"
            />
            <text class="tool-cta__lead">‹‹</text>
            <text class="tool-cta__text">{{ ctaText }}</text>
            <view class="tool-cta__tray">
              <image
                class="tool-cta__arrow-img"
                :src="toolGridCtaArrow"
                mode="aspectFit"
                :lazy-load="false"
              />
            </view>
          </view>
        </view>
      </swiper-item>

      <!-- Slide 2: 4x2 Grid -->
      <swiper-item>
        <view class="slide-content">
          <view class="tool-grid">
            <view
              v-for="(tool, index) in tools"
              :key="tool.key"
              class="grid-item"
              @tap="$emit('select', tool)"
            >
              <view class="grid-icon-wrap">
                <image
                  v-if="moduleIconAt(index)"
                  class="grid-icon__img"
                  :src="moduleIconAt(index)"
                  mode="aspectFit"
                />
                <text v-else class="grid-icon__emoji">{{ tool.icon }}</text>
              </view>
              <text class="grid-name">{{ tool.name }}</text>
            </view>
          </view>

          <view class="custom-dots">
            <view class="dot" :class="{ active: currentSlide === 0 }"></view>
            <view class="dot" :class="{ active: currentSlide === 1 }"></view>
          </view>
        </view>
      </swiper-item>
    </swiper>
  </view>
</template>

<script setup>
import { ref, computed } from 'vue'
import SectionTitle from './SectionTitle.vue'
import toolGridCtaBg from '@/static/home/home-tool-grid-cta-bg.png'
import toolGridCtaArrow from '@/static/home/home-tool-grid-cta-arrow.png'

const props = defineProps({
  title: {
    type: String,
    required: true
  },
  titleIconSrc: {
    type: String,
    default: ''
  },
  /** 各区块前三项模块图（智能工具库 / 文案工作站等），与 `tools` 前 3 条顺序一致 */
  moduleIconSrcs: {
    type: Array,
    default: () => []
  },
  tools: {
    type: Array,
    default: () => []
  },
  ctaText: {
    type: String,
    default: ''
  }
})

defineEmits(['select'])

const currentSlide = ref(0)
const ctaTextOpacity = ref(1)

const displayedTools = computed(() => (props.tools || []).slice(0, 3))

function moduleIconAt(index) {
  const list = props.moduleIconSrcs || []
  return list[index] || ''
}

function onSwiperTransition(e) {
  const dx = e.detail.dx
  if (currentSlide.value === 0 && dx > 0) {
    // 向左滑，逐渐消失
    let opacity = 1 - (dx / 100)
    ctaTextOpacity.value = Math.max(0, Math.min(1, opacity))
  } else if (currentSlide.value === 1 && dx < 0) {
    // 向右滑，逐渐出现
    let opacity = Math.abs(dx) / 100
    ctaTextOpacity.value = Math.max(0, Math.min(1, opacity))
  }
}

function onSwiperChange(e) {
  currentSlide.value = e.detail.current
  ctaTextOpacity.value = currentSlide.value === 0 ? 1 : 0
}

function goToSlide(index) {
  currentSlide.value = index
  ctaTextOpacity.value = index === 0 ? 1 : 0
}
</script>

<style lang="scss" scoped>
$tool-side-pad: 24rpx;
$tool-gap: 15rpx;
$tool-cell-w: 224rpx;
$tool-cell-h: 248rpx;

.tool-section {
  margin-top: 40rpx;
  padding-bottom: 24rpx;
}

.tool-swiper {
  width: 100%;
  height: 440rpx;
}

.slide-content {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
}

.tool-track {
  width: 100%;
  padding-top: 10rpx;
}

.tool-row {
  display: flex;
  flex-direction: row;
  align-items: stretch;
  justify-content: center;
  padding: 0 $tool-side-pad;
  box-sizing: border-box;
  gap: $tool-gap;
}

.tool-item {
  position: relative;
  flex: 0 0 $tool-cell-w;
  width: $tool-cell-w;
  height: $tool-cell-h;
  box-sizing: border-box;
  padding: 0;
  border-radius: 44rpx;
  background: linear-gradient(
    136.53deg,
    rgba(247, 247, 247, 1) 2.39%,
    rgba(237, 237, 237, 0) 50.27%,
    rgba(247, 247, 247, 1) 96.26%
  );
}

.tool-item__text {
  position: absolute;
  top: 26rpx;
  left: 30rpx;
  max-width: 124rpx;
  text-align: left;
}

.tool-icon {
  position: absolute;
  right: 32rpx;
  bottom: 30rpx;
  width: 84rpx;
  height: 84rpx;
  display: flex;
  align-items: center;
  justify-content: center;
}

.tool-icon__img {
  width: 84rpx;
  height: 84rpx;
  display: block;
}

.tool-icon__emoji {
  font-size: 44rpx;
  line-height: 1;
  color: #ff922f;
}

.tool-badge {
  position: absolute;
  top: -6rpx;
  right: -10rpx;
  padding: 2rpx 8rpx;
  border-radius: 999rpx;
  background: #ff8e24;
  color: #ffffff;
  font-size: 15rpx;
  line-height: 1.2;
}

.tool-name {
  display: block;
  color: #3a3a3a;
  font-size: 20rpx;
  font-weight: 600;
  line-height: 1.3;
}

.tool-desc {
  display: block;
  margin-top: 8rpx;
  color: #b0b0b0;
  font-size: 14rpx;
  line-height: 1.25;
}

/* Dots */
.custom-dots {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 8rpx;
  margin-top: 24rpx;
  margin-bottom: 16rpx;
}

.dot {
  width: 8rpx;
  height: 8rpx;
  border-radius: 4rpx;
  background-color: #d8d8d8;
  transition: all 0.3s;
}

.dot.active {
  width: 24rpx;
  background-color: #ff9d34;
}

/* CTA */
.tool-cta {
  position: relative;
  width: 520rpx;
  height: 88rpx;
  margin: 0 auto;
  padding: 0 32rpx;
  box-sizing: border-box;
  border-radius: 44rpx;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.tool-cta__bg {
  position: absolute;
  left: 0;
  top: 0;
  width: 100%;
  height: 100%;
  z-index: 0;
  pointer-events: none;
}

.tool-cta__lead {
  position: relative;
  z-index: 1;
  color: #ffffff;
  font-size: 26rpx;
  line-height: 1;
}

.tool-cta__text {
  position: relative;
  z-index: 1;
  font-size: 26rpx;
  color: #ffffff;
  font-family: OPPOSans-regular, OPPOSans, -apple-system, sans-serif;
}

.tool-cta__tray {
  position: relative;
  z-index: 1;
  width: 60rpx;
  height: 60rpx;
  border-radius: 50%;
  background-color: rgba(255, 255, 255, 0.3);
  box-shadow: 0rpx 4rpx 12rpx 0rpx rgba(0, 0, 0, 0.4);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.tool-cta__arrow-img {
  width: 40rpx;
  height: 40rpx;
  display: block;
}

/* Grid */
.tool-grid {
  display: flex;
  flex-wrap: wrap;
  padding: 10rpx 24rpx 0;
  box-sizing: border-box;
}

.grid-item {
  width: 25%;
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: 32rpx;
}

.grid-icon-wrap {
  width: 84rpx;
  height: 84rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 12rpx;
}

.grid-icon__img {
  width: 84rpx;
  height: 84rpx;
  display: block;
}

.grid-icon__emoji {
  font-size: 50rpx;
  line-height: 1;
  color: #ff922f;
}

.grid-name {
  font-size: 22rpx;
  color: #3a3a3a;
  line-height: 1.3;
}
</style>
