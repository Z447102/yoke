<template>
  <!-- 选择主营业务弹窗：列表 + 编辑/新增/删除 + 确定（内含删除二次确认） -->
  <view v-if="show" class="popup-mask" @tap="onMaskTap">
    <view class="business-popup" @tap.stop>
      <view class="popup-handle"></view>
      <view class="popup-title">选择主营业务</view>

      <scroll-view
        scroll-y
        class="business-list-scroll"
        :style="{ height: listScrollHeightRpx + 'rpx' }"
      >
        <view
          v-for="(business, businessIndex) in options"
          :key="business.id"
          class="business-option"
          :class="{ active: String(selectedId) === String(business.id) }"
          @tap="onSelect(business.id)"
        >
          <view class="business-info">
            <text class="business-name">{{ slotTitle(businessIndex) }}</text>
            <view class="business-popup-summary">
              <text class="business-popup-summary__prefix">{{
                industryCoreLine(business)
              }}</text>
              <view
                v-if="parenBlock(business)"
                class="business-popup-summary__others"
              >
                <text class="business-popup-summary__paren">（</text>
                <text class="business-popup-summary__others-inner">{{
                  parenBlock(business).inner
                }}</text>
                <text class="business-popup-summary__paren">）</text>
                <text
                  v-if="parenBlock(business).dots"
                  class="business-popup-summary__dots"
                  >...</text>
              </view>
            </view>
          </view>
          <view class="business-edit" @tap.stop="onEdit(business)">
            <image
              class="business-edit__icon business-edit__icon--write"
              :src="iconEdit"
              mode="aspectFit"
            />
            <text class="business-edit__label">编辑</text>
            <image
              class="business-edit__icon business-edit__icon--chevron"
              :src="iconChevron"
              mode="aspectFit"
            />
          </view>
        </view>
      </scroll-view>

      <view class="business-actions-row">
        <view class="business-add" @tap.stop="onAdd">
          <!-- 小程序 <image> 对 SVG 兼容性差，改用 view 绘制 + 保证必显 -->
          <view class="business-add__icon-plus">
            <view class="business-add__icon-bar business-add__icon-bar--v" />
            <view class="business-add__icon-bar business-add__icon-bar--h" />
          </view>
          <text>新增主营业务</text>
        </view>
        <view class="business-add" @tap.stop="onDelete">
          <!-- 与「+」一致用线条绘制；避免 image 在浅灰按钮上发黑块 -->
          <view class="business-add__icon-trash">
            <view class="business-add__icon-trash-handle" />
            <view class="business-add__icon-trash-lid" />
            <view class="business-add__icon-trash-body">
              <view class="business-add__icon-trash-slots">
                <view class="business-add__icon-trash-slot" />
                <view class="business-add__icon-trash-slot" />
                <view class="business-add__icon-trash-slot" />
              </view>
            </view>
          </view>
          <text>删除主营业务</text>
        </view>
      </view>
      <button class="popup-confirm" @tap="onConfirm">确定</button>
    </view>
  </view>

  <!-- 删除主营业务确认（叠在选择弹窗之上） -->
  <view
    v-if="showDeleteConfirm"
    class="delete-main-business-mask"
    @tap="closeDeleteConfirm"
  >
    <view class="delete-main-business-dialog" @tap.stop>
      <view class="delete-main-business-dialog__title">
        <image
          class="delete-main-business-dialog__title-icon-img"
          :src="deleteInfoIcon"
          mode="aspectFit"
        />
        <text class="delete-main-business-dialog__title-text">
          是否要删除{{ deleteConfirmSlotTitle }}
        </text>
      </view>
      <view class="delete-main-business-dialog__hint">
        <text class="delete-main-business-dialog__hint-star">*</text>
        <text class="delete-main-business-dialog__hint-text">
          删除后将无法恢复，请谨慎操作
        </text>
      </view>
      <view class="delete-main-business-dialog__footer">
        <view
          class="delete-main-business-dialog__btn delete-main-business-dialog__btn--cancel"
          @tap="closeDeleteConfirm"
        >
          取消
        </view>
        <view
          class="delete-main-business-dialog__btn delete-main-business-dialog__btn--confirm"
          @tap="onConfirmDelete"
        >
          确认
        </view>
      </view>
    </view>
  </view>
</template>

<script setup>
/**
 * 主营业务选择弹窗（底部抽屉）。
 *
 * - 受控显示：`show` + `@close`；内部仅在点击遮罩时触发 `close`，确定/编辑/新增/删除由父级决定是否关闭。
 * - 当前选中：`selected-id` + `@select`（用户点击某行触发，参数为业务 id）。
 * - 编辑：`@edit`（参数为业务对象）；新增：`@add`；删除：`@delete`；确定：`@confirm`。
 * - `industry` 用于在每行标题前拼出「行业 - 核心品类」前缀。
 */
import { computed, ref, watch } from 'vue'
import { StaticPath } from '@/config'
import { isApiEnabled } from '@/utils/request'

const iconEdit = `${StaticPath}create/create-icon-business-edit.png`
const iconChevron = `${StaticPath}create/create-icon-business-edit-chevron.png`
const deleteInfoIcon = `${StaticPath}create/delete-main-business-info-icon.png`

/** 受保护、不可删除的本地占位 id（与父页 `applyMerchantDraft` 写入的 PRIMARY_BUSINESS_ID 对齐） */
const PRIMARY_BUSINESS_ID = 'primary'

const props = defineProps({
  show: { type: Boolean, default: false },
  options: { type: Array, default: () => [] },
  selectedId: { type: [String, Number], default: '' },
  industry: { type: String, default: '' }
})

/**
 * 事件契约：
 * - close：点击遮罩关闭弹窗
 * - select(id)：点击列表项切换选中
 * - edit(business)：点击行内"编辑"
 * - add：点击"新增主营业务"
 * - delete(id)：用户在内部确认对话框点击"确认"后触发，参数为被删除的 id
 * - confirm：点击底部"确定"
 */
const emit = defineEmits(['close', 'select', 'edit', 'add', 'delete', 'confirm'])

/** 列表单行 90rpx + 上边距 18rpx，可视区默认 4 条，超出纵向滚动 */
const ROW_HEIGHT_RPX = 108
const VISIBLE_ROWS = 4

const listScrollHeightRpx = computed(() => {
  const n = props.options?.length ?? 0
  const rows = Math.min(Math.max(n, 0), VISIBLE_ROWS)
  return rows * ROW_HEIGHT_RPX
})

/** 弹窗与筛选项统一：按顺序展示「主营业务1 / 2 / 3…」 */
function slotTitle(index) {
  const n = Number(index) + 1
  return Number.isFinite(n) && n > 0 ? `主营业务${n}` : '主营业务'
}

/** 头部标签行与每条主营业务绑定；无上送 tagLabels 时从 desc/path 推导 */
function tagLabelsForBusiness(business) {
  if (!business || typeof business !== 'object') return []
  const preset = business.tagLabels
  if (Array.isArray(preset) && preset.length > 0) {
    return preset.map((t) => String(t).trim()).filter(Boolean)
  }
  const raw = String(business.desc || business.path || '').trim()
  if (!raw) return []
  if (raw.includes(' - ')) {
    return raw.split(' - ').map((s) => s.trim()).filter(Boolean)
  }
  const pieces = raw
    .split(/[-–—]/)
    .map((s) => s.trim())
    .filter(Boolean)
  return pieces.length > 1 ? pieces : [raw]
}

/** 弹窗列表：`行业 - 核心品类`（核心取 tagLabels[0]；行业优先行内 popupIndustryName，否则当前成片行业） */
function industryCoreLine(business) {
  const ind =
    String(business?.popupIndustryName ?? '').trim() ||
    String(props.industry || '').trim() ||
    '—'
  const tags = tagLabelsForBusiness(business || {})
  const core = String(tags[0] ?? '').trim()
  if (core) return `${ind} - ${core}`
  return ind
}

/**
 * 弹窗列表：括号内为二级类目 + 维度/自定义等（tagLabels 从第 2 项起）；省略号仅在「）」后。
 * @returns {{ inner: string, dots: boolean } | null}
 */
function parenBlock(business) {
  const tags = tagLabelsForBusiness(business || {})
    .map((t) => String(t).trim())
    .filter(Boolean)
  const innerTags = tags.slice(1)
  if (!innerTags.length) return null
  const full = innerTags.join('、')
  const MAX_INNER = 14
  if (full.length <= MAX_INNER) {
    return { inner: full, dots: false }
  }
  let acc = ''
  for (let i = 0; i < innerTags.length; i += 1) {
    const t = innerTags[i]
    const next = acc ? `${acc}、${t}` : t
    if (next.length > MAX_INNER) {
      if (acc) return { inner: acc, dots: true }
      return {
        inner: t.length > MAX_INNER ? t.slice(0, MAX_INNER) : t,
        dots: true
      }
    }
    acc = next
  }
  return { inner: acc, dots: false }
}

// --- 内部删除确认对话框 ---
const showDeleteConfirm = ref(false)
const deleteTargetId = ref('')

const deleteConfirmSlotTitle = computed(() => {
  const id = String(deleteTargetId.value ?? '').trim()
  if (!id) return '该项主营业务'
  const idx = props.options.findIndex((b) => String(b.id) === id)
  return idx >= 0 ? slotTitle(idx) : '该项主营业务'
})

/** 是否允许调用删除接口：排除本地占位 id；其余交由接口校验 */
function isDeletableId(id) {
  const s = String(id ?? '').trim()
  if (!s || s === PRIMARY_BUSINESS_ID) return false
  if (s.startsWith('biz_')) return false
  if (/^business\d+$/i.test(s)) return false
  return true
}

function closeDeleteConfirm() {
  showDeleteConfirm.value = false
  deleteTargetId.value = ''
}

/** 外层弹窗关闭时联动收起内部确认对话框，避免遗留 */
watch(
  () => props.show,
  (v) => {
    if (!v) closeDeleteConfirm()
  }
)

function onMaskTap() {
  emit('close')
}

function onSelect(id) {
  emit('select', id)
}

function onEdit(business) {
  emit('edit', business)
}

function onAdd() {
  emit('add')
}

/** 点击"删除主营业务"：仅做前置校验并打开内部确认；真正的删除由父级 `@delete(id)` 处理 */
function onDelete() {
  const id = String(props.selectedId ?? '').trim()
  if (!id) {
    uni.showToast({ title: '请先选择要删除的主营业务', icon: 'none' })
    return
  }
  if (!isApiEnabled()) {
    uni.showToast({ title: '当前环境不支持删除', icon: 'none' })
    return
  }
  if (!isDeletableId(id)) {
    uni.showToast({ title: '该主营业务无法删除', icon: 'none' })
    return
  }
  deleteTargetId.value = id
  showDeleteConfirm.value = true
}

function onConfirmDelete() {
  const id = String(deleteTargetId.value ?? '').trim()
  closeDeleteConfirm()
  if (!id) return
  emit('delete', id)
}

function onConfirm() {
  emit('confirm')
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

.business-popup {
  width: 100%;
  padding: 16rpx 22rpx calc(40rpx + constant(safe-area-inset-bottom));
  padding: 16rpx 22rpx calc(40rpx + env(safe-area-inset-bottom));
  border-radius: 26rpx 26rpx 0 0;
  background: #ffffff;
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

.business-list-scroll {
  margin-top: 32rpx;
  width: 100%;
  box-sizing: border-box;
}

.business-option {
  height: 90rpx;
  margin-top: 18rpx;
  padding: 0 24rpx;
  border: 2rpx solid #f0f0f0;
  border-radius: 18rpx;
  background: #ffffff;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.business-option.active {
  border-color: #ff9a31;
  background: #fff2df;
}

.business-info {
  display: flex;
  flex-direction: row;
  align-items: center;
  min-width: 0;
  flex: 1;
}

.business-name {
  flex-shrink: 0;
  color: #ff8e24;
  font-size: 28rpx;
  font-weight: 700;
}

/* 选择主营业务弹窗：整段说明宽 300rpx；核心/二级不缩略，其余在（）内省略 */
.business-popup-summary {
  box-sizing: border-box;
  display: flex;
  flex-direction: row;
  align-items: center;
  max-width: 300rpx;
  min-width: 0;
  margin-left: 16rpx;
  color: #5d6672;
  font-size: 24rpx;
}

.business-popup-summary__prefix {
  flex-shrink: 0;
  white-space: nowrap;
}

.business-popup-summary__others {
  display: flex;
  flex-direction: row;
  align-items: center;
  flex: 1 1 0%;
  min-width: 0;
}

.business-popup-summary__paren {
  flex-shrink: 0;
}

.business-popup-summary__others-inner {
  flex: 0 1 auto;
  min-width: 0;
  max-width: 100%;
  overflow: hidden;
  white-space: nowrap;
  text-overflow: clip;
}

.business-popup-summary__dots {
  flex-shrink: 0;
}

.business-edit {
  display: flex;
  align-items: center;
  gap: 10rpx;
  color: #1f2933;
  font-size: 26rpx;
}

.business-edit__label {
  flex-shrink: 0;
}

.business-edit__icon {
  flex-shrink: 0;
  display: block;
}

.business-edit__icon--write {
  width: 28rpx;
  height: 28rpx;
}

.business-edit__icon--chevron {
  width: 32rpx;
  height: 32rpx;
}

.business-actions-row {
  display: flex;
  flex-direction: column;
  align-items: stretch;
  gap: 24rpx;
  margin-top: 20rpx;
}

.business-actions-row .business-add {
  width: 100%;
  box-sizing: border-box;
  margin-top: 0;
}

.business-add {
  height: 90rpx;
  border-radius: 18rpx;
  background: #f2f2f2;
  color: #1f2933;
  font-size: 28rpx;
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: center;
  gap: 10rpx;
}

/* 垃圾桶：与 business-add__icon-bar 同色，30rpx 视口内 */
.business-add__icon-trash {
  position: relative;
  width: 30rpx;
  height: 30rpx;
  flex-shrink: 0;
}

.business-add__icon-trash-handle {
  position: absolute;
  left: 50%;
  top: 2rpx;
  width: 8rpx;
  height: 3rpx;
  margin-left: -4rpx;
  background: #4b5563;
  border-radius: 2rpx;
}

.business-add__icon-trash-lid {
  position: absolute;
  left: 50%;
  top: 6rpx;
  width: 20rpx;
  height: 3rpx;
  margin-left: -10rpx;
  background: #4b5563;
  border-radius: 2rpx;
}

.business-add__icon-trash-body {
  position: absolute;
  left: 50%;
  top: 10rpx;
  width: 18rpx;
  height: 16rpx;
  margin-left: -9rpx;
  box-sizing: border-box;
  border: 2rpx solid #4b5563;
  border-top-width: 0;
  border-radius: 0 0 4rpx 4rpx;
}

.business-add__icon-trash-slots {
  position: absolute;
  left: 2rpx;
  right: 2rpx;
  top: 4rpx;
  bottom: 3rpx;
  display: flex;
  flex-direction: row;
  align-items: flex-end;
  justify-content: space-between;
}

.business-add__icon-trash-slot {
  width: 2rpx;
  height: 7rpx;
  background: #4b5563;
  border-radius: 1rpx;
  flex-shrink: 0;
}

/* 32rpx 圆角「+」，与 #f2f2f2 底对比足够（非 SVG，避免微信小程序 image 不显） */
.business-add__icon-plus {
  position: relative;
  width: 32rpx;
  height: 32rpx;
  flex-shrink: 0;
}

.business-add__icon-bar {
  position: absolute;
  left: 50%;
  top: 50%;
  background: #4b5563;
  border-radius: 3rpx;
  transform: translate(-50%, -50%);
}

.business-add__icon-bar--v {
  width: 4rpx;
  height: 20rpx;
}

.business-add__icon-bar--h {
  width: 20rpx;
  height: 4rpx;
}

.popup-confirm {
  width: 460rpx;
  height: 100rpx;
  margin: 58rpx auto 0;
  border-radius: 999rpx;
  background: linear-gradient(180deg, #ffc98f 0%, #ff9835 100%);
  color: #ffffff;
  font-size: 31rpx;
  line-height: 100rpx;
}

.popup-confirm::after {
  border: 0;
}

/* --- 内部"删除主营业务"确认对话框 --- */
.delete-main-business-mask {
  position: fixed;
  left: 0;
  right: 0;
  top: 0;
  bottom: 0;
  z-index: 120;
  box-sizing: border-box;
  padding: 40rpx;
  padding-top: calc(40rpx + constant(safe-area-inset-top));
  padding-top: calc(40rpx + env(safe-area-inset-top));
  background: rgba(0, 0, 0, 0.45);
  display: flex;
  align-items: center;
  justify-content: center;
}

.delete-main-business-dialog {
  width: 600rpx;
  max-width: 100%;
  height: 384rpx;
  border-radius: 44rpx;
  background-color: rgba(255, 255, 255, 1);
  box-sizing: border-box;
  padding: 0 40rpx 32rpx;
  display: flex;
  flex-direction: column;
}

.delete-main-business-dialog__title {
  box-sizing: border-box;
  width: calc(100% + 80rpx);
  max-width: calc(100% + 80rpx);
  margin-left: -40rpx;
  margin-right: -40rpx;
  padding: 36rpx 40rpx 30rpx;
  display: flex;
  flex-direction: row;
  align-items: flex-start;
  justify-content: center;
  border-bottom: 2rpx solid #bbbbbb;
}

.delete-main-business-dialog__title-icon-img {
  flex-shrink: 0;
  width: 40rpx;
  height: 40rpx;
  margin-right: 12rpx;
}

.delete-main-business-dialog__title-text {
  flex: 0 1 auto;
  max-width: 100%;
  font-size: 32rpx;
  line-height: 1.35;
  color: #fd5656;
  font-family: OPPOSans-medium, OPPOSans, -apple-system, sans-serif;
}

.delete-main-business-dialog__hint {
  margin-top: 48rpx;
  margin-bottom: 54rpx;
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: center;
  flex-wrap: wrap;
  gap: 4rpx;
  width: 100%;
  box-sizing: border-box;
}

.delete-main-business-dialog__hint-star {
  flex-shrink: 0;
  font-size: 28rpx;
  line-height: 1.45;
  color: #fd5656;
  font-family: OPPOSans-regular, OPPOSans, -apple-system, sans-serif;
}

.delete-main-business-dialog__hint-text {
  flex: 0 1 auto;
  max-width: 100%;
  font-size: 28rpx;
  line-height: 1.45;
  color: #1f2937;
  font-family: OPPOSans-regular, OPPOSans, -apple-system, sans-serif;
  text-align: center;
}

.delete-main-business-dialog__footer {
  margin-top: 0;
  padding-top: 0;
  display: flex;
  flex-direction: row;
  justify-content: center;
  align-items: center;
}

.delete-main-business-dialog__footer .delete-main-business-dialog__btn + .delete-main-business-dialog__btn {
  margin-left: 40rpx;
}

.delete-main-business-dialog__btn {
  flex-shrink: 0;
  width: 200rpx;
  height: 80rpx;
  border-radius: 64rpx;
  box-sizing: border-box;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 28rpx;
  text-align: center;
  font-family: OPPOSans-regular, OPPOSans, -apple-system, sans-serif;
}

.delete-main-business-dialog__btn--cancel {
  background-color: rgba(255, 255, 255, 1);
  color: rgba(128, 128, 128, 1);
  border: 2rpx solid rgba(187, 187, 187, 1);
}

.delete-main-business-dialog__btn--confirm {
  background-color: rgba(16, 16, 16, 1);
  color: rgba(255, 255, 255, 1);
  border: none;
}
</style>
