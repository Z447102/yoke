<template>
  <view class="digital-human">
    <view class="create-card" @tap="$emit('create')">
      <view class="plus">+</view>
      <text>创建数字形象</text>
    </view>

    <view
      v-for="item in items"
      :key="item.id"
      class="human-card"
      :style="{ backgroundImage: `url(${item.avatar})` }"
    >
      <view class="human-tag">{{ item.tag }}</view>
      <view v-if="item.playable" class="play">▶</view>
    </view>
  </view>
</template>

<script setup>
defineProps({
  items: {
    type: Array,
    default: () => []
  }
})

defineEmits(['create'])
</script>

<style lang="scss" scoped>
.digital-human {
  display: grid;
  grid-template-columns: 152rpx 1fr 1fr;
  gap: 16rpx;
  height: 202rpx;
  padding: 0 20rpx;
}

.create-card,
.human-card {
  overflow: hidden;
  border-radius: 24rpx;
}

.create-card {
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
