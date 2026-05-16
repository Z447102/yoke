<template>
  <!-- 行业选择弹窗（底部抽屉）：四列网格 + 单选 + 确定 -->
  <view v-if="show" class="popup-mask" @tap="onMaskTap">
    <view class="industry-popup" @tap.stop>
      <view class="popup-handle"></view>
      <view class="popup-title">选择行业</view>

      <view class="industry-grid">
        <view
          v-for="industry in options"
          :key="industry"
          class="industry-item"
          :class="{ active: tempIndustry === industry }"
          @tap="onSelect(industry)"
        >
          {{ industry }}
        </view>
      </view>

      <button class="confirm-btn" @tap="onConfirm">确定</button>
    </view>
  </view>
</template>

<script setup>
/**
 * 行业选择弹窗（底部抽屉）。
 *
 * - 受控显示：`show` + `@close`；点击遮罩仅触发 `close`，确定由父级决定后续处理。
 * - 选项列表：`options`（行业名称字符串数组）。
 * - 当前选中：`selected-industry`（已确认的行业名称），弹窗每次打开时回显并初始化 `tempIndustry`。
 * - 确认：`@confirm(industry)`，参数为用户在本次弹窗内选中的行业名称。
 */
import { ref, watch } from 'vue'

const props = defineProps({
  show: { type: Boolean, default: false },
  options: { type: Array, default: () => [] },
  selectedIndustry: { type: String, default: '' }
})

/**
 * 事件契约：
 * - close：点击遮罩关闭弹窗
 * - confirm(industry)：点击底部"确定"，参数为本次弹窗选中的行业名称
 */
const emit = defineEmits(['close', 'confirm'])

/** 弹窗内的临时选中，确认前不回写父级 */
const tempIndustry = ref('')

/** 打开弹窗时按当前已选回显；当前选项不在列表则回落到第一项 */
watch(
  () => props.show,
  (val) => {
    if (!val) return
    const list = Array.isArray(props.options) ? props.options : []
    const cur = String(props.selectedIndustry || '').trim()
    tempIndustry.value = cur && list.includes(cur) ? cur : list[0] || ''
  },
  { immediate: true }
)

function onMaskTap() {
  emit('close')
}

function onSelect(industry) {
  tempIndustry.value = industry
}

function onConfirm() {
  emit('confirm', tempIndustry.value)
}
</script>

<style lang="scss" scoped>
.popup-mask {
  position: fixed;
  left: 0;
  right: 0;
  top: 0;
  bottom: 0;
  z-index: 50;
  box-sizing: border-box;
  padding-top: constant(safe-area-inset-top);
  padding-top: env(safe-area-inset-top);
  background: rgba(0, 0, 0, 0.54);
  display: flex;
  align-items: flex-end;
}

.industry-popup {
  width: 100%;
  padding: 18rpx 30rpx calc(46rpx + constant(safe-area-inset-bottom));
  padding: 18rpx 30rpx calc(46rpx + env(safe-area-inset-bottom));
  border-radius: 0;
  background: #ffffff;
}

.popup-handle {
  width: 52rpx;
  height: 8rpx;
  margin: 0 auto 30rpx;
  border-radius: 999rpx;
  background: #d8d8d8;
}

.popup-title {
  color: #1f2933;
  font-size: 30rpx;
  font-weight: 700;
  text-align: center;
}

/* 微信小程序对 grid/gap 支持不稳定，四列用 flex + 固定宽与 nth 去右边距 */
.industry-grid {
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  margin-top: 36rpx;
}

.industry-item {
  width: 157rpx;
  height: 68rpx;
  margin-right: 20rpx;
  margin-bottom: 24rpx;
  box-sizing: border-box;
  border: 1rpx solid #e3e5ea;
  border-radius: 14rpx;
  color: #a4abb5;
  font-size: 26rpx;
  line-height: 68rpx;
  text-align: center;
  background: #ffffff;
}

.industry-item:nth-child(4n) {
  margin-right: 0;
}

.industry-item.active {
  border-color: #ff8e24;
  color: #ff8e24;
  background: #fff6ed;
  font-weight: 700;
}

.confirm-btn {
  width: 510rpx;
  height: 108rpx;
  margin: 48rpx auto 0;
  border-radius: 999rpx;
  background: linear-gradient(180deg, #ffbd72 0%, #ff963a 100%);
  color: #ffffff;
  font-size: 32rpx;
  line-height: 108rpx;
}

.confirm-btn::after {
  border: 0;
}
</style>
