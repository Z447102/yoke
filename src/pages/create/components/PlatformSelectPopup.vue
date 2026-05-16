<template>
  <!-- 发布平台选择弹窗（底部抽屉）：单行四列选项 + 确定 -->
  <view v-if="show" class="popup-mask" @tap="onMaskTap">
    <view class="platform-popup" @tap.stop>
      <view class="popup-handle"></view>
      <view class="popup-title">选择平台</view>

      <view class="platform-list">
        <view
          v-for="platform in options"
          :key="platform.id"
          class="platform-option"
          :class="{ active: tempId === platform.id }"
          @tap="onSelect(platform.id)"
        >
          {{ platform.name }}
        </view>
      </view>

      <button class="popup-confirm" @tap="onConfirm">确定</button>
    </view>
  </view>
</template>

<script setup>
/**
 * 发布平台选择弹窗（底部抽屉）。
 *
 * - 受控显示：`show` + `@close`；点击遮罩仅触发 `close`，确定由父级决定后续处理。
 * - 选项列表：`options`，形如 `{ id, name, ... }[]`（兼容 PLATFORM_OPTIONS）。
 * - 当前选中：`selected-id`（已确认平台 id），弹窗每次打开时回显并初始化 `tempId`。
 * - 确认：`@confirm(id)`，参数为本次弹窗内选中的平台 id。
 */
import { ref, watch } from 'vue'

const props = defineProps({
  show: { type: Boolean, default: false },
  options: { type: Array, default: () => [] },
  selectedId: { type: [String, Number], default: '' }
})

/**
 * 事件契约：
 * - close：点击遮罩关闭弹窗
 * - confirm(id)：点击底部"确定"，参数为本次弹窗选中的平台 id
 */
const emit = defineEmits(['close', 'confirm'])

/** 弹窗内的临时选中，确认前不回写父级 */
const tempId = ref('')

/** 打开弹窗时按当前已选回显；当前 id 不在列表则回落到第一项 */
watch(
  () => props.show,
  (val) => {
    if (!val) return
    const list = Array.isArray(props.options) ? props.options : []
    const cur = String(props.selectedId ?? '').trim()
    const hit = list.find((x) => x && String(x.id ?? '').trim() === cur)
    tempId.value = hit ? String(hit.id).trim() : String(list[0]?.id ?? '').trim()
  },
  { immediate: true }
)

function onMaskTap() {
  emit('close')
}

function onSelect(id) {
  tempId.value = String(id ?? '').trim()
}

function onConfirm() {
  emit('confirm', tempId.value)
}
</script>

<style lang="scss" scoped>
.popup-mask {
  position: fixed;
  left: 0;
  right: 0;
  top: 0;
  bottom: 0;
  z-index: 100;
  box-sizing: border-box;
  padding-top: constant(safe-area-inset-top);
  padding-top: env(safe-area-inset-top);
  background: rgba(0, 0, 0, 0.45);
  display: flex;
  align-items: flex-end;
}

.popup-handle {
  width: 72rpx;
  height: 8rpx;
  margin: 0 auto 32rpx;
  border-radius: 999rpx;
  background: #eeeeee;
}

.popup-title {
  color: #1f2933;
  font-size: 30rpx;
  font-weight: 700;
  text-align: center;
}

.platform-popup {
  box-sizing: border-box;
  width: 100%;
  padding: 16rpx 22rpx calc(40rpx + constant(safe-area-inset-bottom));
  padding: 16rpx 22rpx calc(40rpx + env(safe-area-inset-bottom));
  border-radius: 26rpx 26rpx 0 0;
  background: #ffffff;
}

/* 设计稿：四个平台同一行横排，未选中灰边白底，选中橙边浅橙底 */
.platform-list {
  box-sizing: border-box;
  margin-top: 36rpx;
  display: flex;
  flex-direction: row;
  flex-wrap: nowrap;
  align-items: stretch;
  justify-content: space-between;
  gap: 12rpx;
  padding: 0 4rpx;
}

.platform-option {
  box-sizing: border-box;
  flex: 1;
  min-width: 0;
  height: 76rpx;
  margin-top: 0;
  border-radius: 16rpx;
  border: 2rpx solid #e5e7eb;
  background: #ffffff;
  color: #1f2933;
  font-size: 24rpx;
  font-weight: 600;
  display: flex;
  align-items: center;
  justify-content: center;
  line-height: 1.2;
  text-align: center;
}

.platform-option.active {
  border-color: #ff9a31;
  background: #fff2df;
  color: #ff8e24;
}

.popup-confirm {
  display: block;
  width: 100%;
  max-width: 510rpx;
  height: 100rpx;
  margin: 48rpx auto 0;
  border-radius: 999rpx;
  background: linear-gradient(180deg, #ffc98f 0%, #ff9835 100%);
  color: #ffffff;
  font-size: 31rpx;
  line-height: 100rpx;
}

.popup-confirm::after {
  border: 0;
}
</style>
