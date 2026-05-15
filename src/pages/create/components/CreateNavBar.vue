<template>
  <view
    class="nav-bar create-nav-bar"
    :class="{
      'create-nav-bar--plain': variant === 'plain',
      'create-nav-bar--solid': variant === 'solid',
      'create-nav-bar--bordered': bottomBorder
    }"
    :style="outerStyle"
  >
    <view class="create-nav-bar__row" :style="rowStyle">
      <view class="create-nav-bar__left" @tap="onBack">
        <image
          class="create-nav-bar__back"
          :style="{ marginRight: `${iconTitleGap}rpx` }"
          :src="backIconSrc"
          mode="aspectFit"
        />
        <text class="create-nav-bar__title" :class="titleClass">{{ title }}</text>
      </view>
      <view v-if="showGap" class="create-nav-bar__gap" aria-hidden="true" />
    </view>
  </view>
</template>

<script setup>
/**
 * 一键成片顶栏：状态栏留白 + 与胶囊同高的内容行，返回图标与标题垂直居中对齐胶囊。
 */
import { StaticPath } from '@/config'
import { ref, computed, onMounted, nextTick } from 'vue'
import { onReady } from '@dcloudio/uni-app'
import {
  getCreateNavBarOuterStyle,
  getCreateNavBarRowStyle
} from '@/utils/create-nav-bar-style'

const props = defineProps({
  title: { type: String, required: true },
  /** 追加在标题 text 上的 class（如 back-text、nav-title、nav-left__title） */
  titleClass: { type: String, default: '' },
  showGap: { type: Boolean, default: true },
  /** banner | plain | solid（白底，如我的-主营业务） */
  variant: { type: String, default: 'banner' },
  backIcon: { type: String, default: '' },
  /** 返回图与标题间距（rpx） */
  iconTitleGap: { type: Number, default: 8 },
  /** 底部分割线（成片详情等） */
  bottomBorder: { type: Boolean, default: false }
})

const emit = defineEmits(['back'])

const backIconSrc = computed(() =>
  props.backIcon ? props.backIcon : `${StaticPath}create/create-back-icon.png`
)

const outerStyle = ref({})
const rowStyle = ref({})

function applyStyles() {
  outerStyle.value = getCreateNavBarOuterStyle(props.variant)
  rowStyle.value = getCreateNavBarRowStyle()
}

function scheduleRefresh() {
  applyStyles()
  nextTick(applyStyles)
  setTimeout(applyStyles, 48)
  setTimeout(applyStyles, 200)
}

function onBack() {
  emit('back')
}

onMounted(scheduleRefresh)
onReady(scheduleRefresh)
</script>

<style lang="scss" scoped>
.create-nav-bar {
  box-sizing: border-box;
  position: relative;
  overflow: hidden;
  flex-shrink: 0;
  padding-right: calc(18rpx + constant(safe-area-inset-right));
  padding-right: calc(18rpx + env(safe-area-inset-right));
  padding-left: calc(18rpx + constant(safe-area-inset-left));
  padding-left: calc(18rpx + env(safe-area-inset-left));
  padding-bottom: 16rpx;
}

.create-nav-bar--plain {
  background-color: #fffaf3 !important;
}

.create-nav-bar--solid {
  background-color: #ffffff !important;
}

.create-nav-bar--solid .create-nav-bar__title {
  font-size: 30rpx;
  font-family: OPPOSans-regular, OPPOSans, -apple-system, sans-serif;
  color: #1f2933;
}

.create-nav-bar--bordered {
  border-bottom: 1rpx solid #f1f1f1;
}

.create-nav-bar__row {
  width: 100%;
}

.create-nav-bar__left {
  flex: 1;
  min-width: 0;
  display: flex;
  align-items: center;
  color: #1f2933;
  font-size: 30rpx;
}

.create-nav-bar__back {
  flex-shrink: 0;
  width: 36rpx;
  height: 36rpx;
  display: block;
}

.create-nav-bar__title {
  flex: 1;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

/* 各页沿用原 class 名时的标题样式（scoped 写在父页无法作用到子组件内部） */
.create-nav-bar__title.back-text {
  font-size: 30rpx;
  color: #1f2937;
  font-family: OPPOSans-regular, OPPOSans, -apple-system, sans-serif;
}

.create-nav-bar__title.nav-title {
  font-size: 34rpx;
  font-weight: 600;
  color: #1f2937;
}

.create-nav-bar__title.nav-left__title {
  font-family: OPPOSans-medium, OPPOSans, -apple-system, sans-serif;
  font-weight: 500;
}

.create-nav-bar--plain .create-nav-bar__left {
  font-size: 34rpx;
  color: #1f2937;
  font-weight: 600;
}

.create-nav-bar--plain .create-nav-bar__back {
  margin-right: 12rpx;
}

/* 与首页 HomeHeader 一致：约等于微信胶囊宽度 */
.create-nav-bar__gap {
  flex-shrink: 0;
  width: 174rpx;
  height: 32rpx;
}
</style>
