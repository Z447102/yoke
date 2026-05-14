<template>
  <view class="van-nav-bar-wrapper">
    <!-- 占位元素 -->
    <view v-if="fixed && placeholder" :style="placeholderStyle"></view>
    
    <!-- 导航栏主体 -->
    <view
      class="van-nav-bar"
      :class="{
        'van-nav-bar--fixed': fixed,
        'van-hairline--bottom': border
      }"
      :style="[baseStyle, customStyle]"
    >
      <view class="van-nav-bar__content">
        <!-- 左侧区域 -->
        <view class="van-nav-bar__left" hover-class="van-nav-bar__active" hover-stay-time="70" @tap="onClickLeft">
          <slot name="left">
            <view v-if="leftArrow" class="van-nav-bar__arrow"></view>
            <text v-if="leftText" class="van-nav-bar__text">{{ leftText }}</text>
          </slot>
        </view>
        
        <!-- 标题区域 -->
        <view class="van-nav-bar__title van-ellipsis">
          <slot name="title">{{ title }}</slot>
        </view>
        
        <!-- 右侧区域 -->
        <view class="van-nav-bar__right" hover-class="van-nav-bar__active" hover-stay-time="70" @tap="onClickRight">
          <slot name="right">
            <text v-if="rightText" class="van-nav-bar__text">{{ rightText }}</text>
          </slot>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref, computed } from 'vue';

const props = defineProps({
  title: {
    type: String,
    default: ''
  },
  leftText: {
    type: String,
    default: ''
  },
  rightText: {
    type: String,
    default: ''
  },
  leftArrow: {
    type: Boolean,
    default: false
  },
  fixed: {
    type: Boolean,
    default: false
  },
  placeholder: {
    type: Boolean,
    default: false
  },
  border: {
    type: Boolean,
    default: true
  },
  zIndex: {
    type: [Number, String],
    default: 1
  },
  safeAreaInsetTop: {
    type: Boolean,
    default: true
  },
  customStyle: {
    type: [Object, String],
    default: () => ({})
  }
});

const emit = defineEmits(['click-left', 'click-right']);

// 获取系统状态栏高度
const systemInfo = uni.getSystemInfoSync();
const statusBarHeight = ref(systemInfo.statusBarHeight || 0);
const navBarHeight = 46; // 默认导航栏高度 46px

// 基础样式（包含安全区和 z-index）
const baseStyle = computed(() => {
  const style = {
    zIndex: props.zIndex
  };
  
  if (props.safeAreaInsetTop) {
    style.paddingTop = `${statusBarHeight.value}px`;
  }
  
  return style;
});

// 占位元素样式
const placeholderStyle = computed(() => {
  const top = props.safeAreaInsetTop ? statusBarHeight.value : 0;
  return {
    height: `${navBarHeight + top}px`
  };
});

// 点击左侧
const onClickLeft = () => {
  // emit('click-left');
  uni.navigateBack();
};

// 点击右侧
const onClickRight = () => {
  emit('click-right');
};
</script>

<style lang="scss" scoped>
.van-nav-bar {
  position: relative;
  text-align: center;
  user-select: none;
  height: 46px;
  line-height: 46px;
  background-color: #fff;
  box-sizing: content-box;

  &--fixed {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
  }

  &__content {
    position: relative;
    display: flex;
    align-items: center;
    height: 100%;
  }

  &__left,
  &__right {
    position: absolute;
    top: 0;
    bottom: 0;
    display: flex;
    align-items: center;
    padding: 0 16px;
    font-size: 14px;
    cursor: pointer;
  }

  &__left {
    left: 0;
  }

  &__right {
    right: 0;
  }

  &__active {
    opacity: 0.7;
  }

  &__text {
    color: #1F2937;
  }

  &__title {
    max-width: 60%;
    margin: 0 auto;
    color: #323233;
    font-weight: 500;
    font-size: 16px;
  }

  &__arrow {
    display: inline-block;
    width: 10px;
    height: 10px;
    border-top: 2px solid #1F2937;
    border-left: 2px solid #1F2937;
    transform: rotate(-45deg);
    margin-right: 4px;
    position: relative;
    top: 1px;
  }
}

.van-ellipsis {
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
}

.van-hairline--bottom {
  &::after {
    position: absolute;
    box-sizing: border-box;
    content: ' ';
    pointer-events: none;
    top: -50%;
    right: -50%;
    bottom: -50%;
    left: -50%;
    border: 0 solid #ebedf0;
    transform: scale(0.5);
    border-bottom-width: 1px;
  }
}
</style>
