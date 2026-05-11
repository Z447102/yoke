<template>
  <view class="digital-section">
    <SectionTitle
      icon="⟡"
      title="数字人视频"
      tag="60秒生成口播视频"
      more-text="全部形象"
    />

    <view class="digital-human">
      <view class="create-card" @tap="$emit('create')">
        <view class="plus">+</view>
        <text>创建数字形象</text>
      </view>

      <view
        v-for="item in list"
        :key="item.id"
        class="human-card"
        :style="{ backgroundImage: `url(${item.avatar})` }"
      >
        <view class="human-tag">{{ item.tag }}</view>
        <view v-if="item.playable" class="play">▶</view>
      </view>
    </view>
  </view>
</template>

<script setup>
import SectionTitle from './SectionTitle.vue'

defineProps({
  list: {
    type: Array,
    default: () => []
  }
})

defineEmits(['create'])
</script>

<style lang="scss" scoped>
.digital-section {
  padding-top: 10rpx;
}

.digital-human {
  display: flex;
  flex-direction: row;
  align-items: stretch;
  height: 202rpx;
  padding: 0 24rpx;
}

/* 微信小程序 WXSS 不支持 `.parent > * + *` 中的通配符，改用相邻兄弟选择器 */
.create-card + .human-card,
.human-card + .human-card {
  margin-left: 16rpx;
}

.create-card,
.human-card {
  overflow: hidden;
  border-radius: 24rpx;
}

.create-card {
  flex: 0 0 152rpx;
  width: 152rpx;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: #fff;
  background: #ffc06f;
}

.plus {
  width: 42rpx;
  height: 42rpx;
  margin-bottom: 24rpx;
  color: #ffa236;
  font-size: 34rpx;
  line-height: 42rpx;
  text-align: center;
  background: #fff;
  border-radius: 50%;
}

.human-card {
  position: relative;
  flex: 1;
  min-width: 0;
  background-repeat: no-repeat;
  background-position: center;
  background-size: cover;
}

.human-tag {
  position: absolute;
  top: 10rpx;
  left: 12rpx;
  padding: 4rpx 12rpx;
  color: #fff;
  font-size: 20rpx;
  background: rgba(0, 0, 0, 0.25);
  border-radius: 999rpx;
}

.play {
  position: absolute;
  right: 12rpx;
  top: 76rpx;
  width: 36rpx;
  height: 36rpx;
  color: #fff;
  font-size: 18rpx;
  line-height: 36rpx;
  text-align: center;
  background: rgba(0, 0, 0, 0.2);
  border: 1rpx solid rgba(255, 255, 255, 0.85);
  border-radius: 50%;
}
</style>
