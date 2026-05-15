<template>
  <view class="mb-page">
    <CreateNavBar
      title="主营业务"
      variant="solid"
      :icon-title-gap="12"
      @back="goBack"
    />

    <view class="mb-body">
      <view v-if="loading" class="mb-loading">
        <text>加载中…</text>
      </view>

      <template v-else-if="!rows.length">
        <view class="mb-empty">
          <view class="mb-empty__icon-wrap">
            <image
              class="mb-empty__icon"
              :src="emptyIllustration"
              mode="aspectFit"
            />
          </view>
          <text class="mb-empty__text">暂无主营业务</text>
        </view>
      </template>

      <view v-else class="mb-body__list-host">
        <scroll-view
          scroll-y
          enable-flex
          class="business-list-scroll mb-list-scroll-view"
          :show-scrollbar="false"
        >
        <view
          v-for="item in rows"
          :key="item.id"
          class="business-option"
          :class="{ active: selectedId === item.id }"
          @tap="selectedId = item.id"
        >
          <view class="business-info">
            <text class="business-name">{{ item.title }}</text>
            <view class="business-popup-summary">
              <text class="business-popup-summary__prefix">{{
                item.summaryPrefix
              }}</text>
              <view
                v-if="item.summaryParenBlock"
                class="business-popup-summary__others"
              >
                <text class="business-popup-summary__paren">（</text>
                <text class="business-popup-summary__others-inner">{{
                  item.summaryParenBlock.inner
                }}</text>
                <text class="business-popup-summary__paren">）</text>
                <text
                  v-if="item.summaryParenBlock.dots"
                  class="business-popup-summary__dots"
                  >...</text>
              </view>
            </view>
          </view>
          <view class="business-edit" @tap.stop="onEdit(item)">
            <image
              class="business-edit__icon business-edit__icon--write"
              :src="createIconBusinessEdit"
              mode="aspectFit"
            />
            <text class="business-edit__label">编辑</text>
            <image
              class="business-edit__icon business-edit__icon--chevron"
              :src="createIconBusinessEditChevron"
              mode="aspectFit"
            />
          </view>
        </view>
        </scroll-view>
      </view>
    </view>

    <view class="mb-footer">
      <view class="business-actions-row">
        <view class="business-add" @tap.stop="onAdd">
          <view class="business-add__icon-plus" aria-hidden="true">
            <view class="business-add__icon-bar business-add__icon-bar--v" />
            <view class="business-add__icon-bar business-add__icon-bar--h" />
          </view>
          <text>新增主营业务</text>
        </view>
        <view class="business-add" @tap.stop="openDeleteConfirm">
          <view class="business-add__icon-trash" aria-hidden="true">
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
    </view>

    <view
      v-if="showDeleteMainBusinessConfirm"
      class="delete-main-business-mask"
      @tap="closeDeleteMainBusinessConfirm"
    >
      <view class="delete-main-business-dialog" @tap.stop>
        <view class="delete-main-business-dialog__title">
          <image
            class="delete-main-business-dialog__title-icon-img"
            :src="deleteMainBusinessInfoIcon"
            mode="aspectFit"
          />
          <text class="delete-main-business-dialog__title-text">
            是否要删除{{ deleteMainBusinessConfirmSlotTitle }}
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
            @tap="closeDeleteMainBusinessConfirm"
          >
            取消
          </view>
          <view
            class="delete-main-business-dialog__btn delete-main-business-dialog__btn--confirm"
            @tap="confirmDeleteMainBusiness"
          >
            确认
          </view>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup>
import { computed, ref } from 'vue'
import { onShow } from '@dcloudio/uni-app'
import { useUserStore } from '@/stores/user'
import { isApiEnabled } from '@/utils/request'
import {
  getMemberMainBusinessDetail,
  listMemberMainBusinesses,
  deleteMemberMainBusiness
} from '@/api/create'
import { listIndustries } from '@/api/metadata'
import { StaticPath } from '@/config'
import CreateNavBar from '@/pages/create/components/CreateNavBar.vue'
const createIconBusinessEdit = `${StaticPath}create/create-icon-business-edit.png`
const createIconBusinessEditChevron = `${StaticPath}create/create-icon-business-edit-chevron.png`
const emptyIllustration = `${StaticPath}mine/mine-main-business-empty.png`
const deleteMainBusinessInfoIcon = `${StaticPath}create/delete-main-business-info-icon.png`

/** 与一键成片生成页编辑回显一致 */
const STORAGE_EDIT_MAIN_BUSINESS_DETAIL = 'create:edit-main-business-detail'

const PRIMARY_BUSINESS_ID = 'primary'

const userStore = useUserStore()
const loading = ref(true)
/**
 * @typedef {{ inner: string, dots: boolean }} MainBusinessParenBlock
 * @typedef {{ id: string, title: string, subtitle: string, summaryPrefix: string, summaryParenBlock: MainBusinessParenBlock | null }} MainBusinessRow
 */
/** @type {import('vue').Ref<MainBusinessRow[]>} */
const rows = ref([])
const selectedId = ref('')
const showDeleteMainBusinessConfirm = ref(false)
const deleteMainBusinessTargetId = ref('')

const deleteMainBusinessConfirmSlotTitle = computed(() => {
  const id = String(deleteMainBusinessTargetId.value ?? '').trim()
  if (!id) return '该项主营业务'
  const hit = rows.value.find((r) => String(r.id) === id)
  return hit ? hit.title : '该项主营业务'
})

/**
 * @param {unknown} id
 * @returns {boolean}
 */
function isDeletableMainBusinessId(id) {
  const s = String(id ?? '').trim()
  if (!s || s === PRIMARY_BUSINESS_ID) return false
  if (s.startsWith('biz_')) return false
  if (/^business\d+$/i.test(s)) return false
  return true
}

/**
 * @param {Record<string, unknown> | null} p
 * @returns {string}
 */
function pickEnterpriseName(p) {
  if (!p || typeof p !== 'object') return ''
  const o = /** @type {Record<string, unknown>} */ (p)
  return String(
    o.enterpriseName ?? o.shopName ?? o.companyName ?? o.storeName ?? ''
  ).trim()
}

/**
 * @returns {Promise<string>}
 */
async function resolveIndustryId() {
  const p = userStore.profile
  if (p && typeof p === 'object') {
    const raw = /** @type {Record<string, unknown>} */ (p)
    const id0 = String(raw.industryId ?? '').trim()
    if (id0 && Number.isFinite(Number(id0))) return id0
  }
  const name = String(
    (p && typeof p === 'object' && /** @type {Record<string, unknown>} */ (p).industryName) ||
      ''
  ).trim()
  if (!name || !isApiEnabled()) return ''
  try {
    const list = await listIndustries()
    const hit = Array.isArray(list)
      ? list.find((x) => String(x.industryName ?? '').trim() === name)
      : null
    return hit ? String(hit.industryId ?? '').trim() : ''
  } catch (_) {
    return ''
  }
}

const PAREN_INNER_MAX_LEN = 14

/**
 * @param {string[]} parts
 * @returns {MainBusinessParenBlock | null}
 */
function formatParenBlockFromParts(parts) {
  const clean = parts.map((s) => String(s).trim()).filter(Boolean)
  if (!clean.length) return null
  const full = clean.join('、')
  if (full.length <= PAREN_INNER_MAX_LEN) {
    return { inner: full, dots: false }
  }
  let acc = ''
  for (let i = 0; i < clean.length; i += 1) {
    const t = clean[i]
    const next = acc ? `${acc}、${t}` : t
    if (next.length > PAREN_INNER_MAX_LEN) {
      if (acc) return { inner: acc, dots: true }
      return {
        inner:
          t.length > PAREN_INNER_MAX_LEN
            ? t.slice(0, PAREN_INNER_MAX_LEN)
            : t,
        dots: true
      }
    }
    acc = next
  }
  return { inner: acc, dots: false }
}

/**
 * 列表行 → 与生成页弹窗 `business-option` 展示字段一致。
 * @param {unknown} row
 * @param {number} index
 * @returns {MainBusinessRow | null}
 */
function mapRowToCard(row, index) {
  if (!row || typeof row !== 'object') return null
  const r = /** @type {Record<string, unknown>} */ (row)
  const id = String(r.id ?? '').trim()
  if (!id) return null
  const industryName = String(r.industryName ?? '').trim()
  const tagName = String(r.industryTagName ?? '').trim()
  const enterpriseName = String(r.enterpriseName ?? '').trim()
  const locationName = String(r.locationName ?? '').trim()
  const address = String(r.address ?? '').trim()

  let summaryPrefix = ''
  if (industryName && tagName) summaryPrefix = `${industryName} - ${tagName}`
  else if (industryName || tagName) {
    summaryPrefix = industryName || tagName
  } else if (enterpriseName) summaryPrefix = enterpriseName
  else if (locationName) summaryPrefix = locationName
  else if (address) summaryPrefix = address
  else summaryPrefix = '—'

  let subtitle = [industryName, tagName].filter(Boolean).join('-')
  if (!subtitle && enterpriseName) subtitle = enterpriseName
  if (!subtitle && (locationName || address)) {
    subtitle = [locationName, address].filter(Boolean).join(' ')
  }
  if (!subtitle) subtitle = '—'

  const parenParts = []
  const notInPrefix = (/** @type {string} */ s) => {
    const p = summaryPrefix
    return s && s !== p && !p.includes(s)
  }
  if (notInPrefix(enterpriseName)) parenParts.push(enterpriseName)
  if (notInPrefix(locationName)) parenParts.push(locationName)
  else if (!locationName && notInPrefix(address)) parenParts.push(address)

  const summaryParenBlock = formatParenBlockFromParts(parenParts)

  return {
    id,
    title: `主营业务${index + 1}`,
    subtitle,
    summaryPrefix,
    summaryParenBlock
  }
}

async function loadList() {
  if (!userStore.isLogin) {
    rows.value = []
    selectedId.value = ''
    loading.value = false
    return
  }
  if (!isApiEnabled()) {
    rows.value = []
    selectedId.value = ''
    loading.value = false
    return
  }
  loading.value = true
  try {
    const industryId = await resolveIndustryId()
    const enterpriseName = pickEnterpriseName(userStore.profile)
    const data = await listMemberMainBusinesses({
      ...(industryId ? { industryId } : {}),
      ...(enterpriseName ? { enterpriseName } : {}),
      pageNum: 1,
      pageSize: 100
    })
    const raw = Array.isArray(data?.rows) ? data.rows : []
    const mapped = raw
      .map((row, i) => mapRowToCard(row, i))
      .filter(Boolean)
    rows.value = /** @type {typeof rows.value} */ (mapped)
    selectedId.value = mapped[0]?.id ? String(mapped[0].id) : ''
  } catch (_) {
    rows.value = []
    selectedId.value = ''
  } finally {
    loading.value = false
  }
}

function goBack() {
  uni.navigateBack({
    fail: () => {
      uni.redirectTo({
        url: '/pages/home/mine/index',
        fail: () => uni.reLaunch({ url: '/pages/home/mine/index' })
      })
    }
  })
}

function onAdd() {
  if (!userStore.isLogin) {
    uni.navigateTo({
      url: `/pages/login/index?redirect=${encodeURIComponent('/pages/home/mine/main-business/index')}`,
      fail: () => uni.showToast({ title: '请先登录', icon: 'none' })
    })
    return
  }
  uni.navigateTo({
    url: '/pages/create/business/index?intent=add&from=mine-add',
    fail: () => uni.showToast({ title: '页面打开失败', icon: 'none' })
  })
}

/**
 * @param {{ id: string }} item
 */
async function onEdit(item) {
  const id = String(item.id ?? '').trim()
  if (!id) return
  if (!isApiEnabled()) {
    uni.showToast({ title: '当前为离线演示', icon: 'none' })
    return
  }
  try {
    uni.showLoading({ title: '加载中', mask: true })
    const detail = await getMemberMainBusinessDetail(id)
    uni.setStorageSync(STORAGE_EDIT_MAIN_BUSINESS_DETAIL, detail || null)
    const d = detail && typeof detail === 'object' ? detail : {}
    const industry = String(d.industryName ?? d.industry ?? '').trim() || '餐饮'
    uni.navigateTo({
      url: `/pages/create/business/index?industry=${encodeURIComponent(industry)}&intent=edit`,
      fail: () => uni.showToast({ title: '页面打开失败', icon: 'none' })
    })
  } catch (e) {
    uni.showToast({
      title: e?.message ? String(e.message) : '加载失败',
      icon: 'none'
    })
  } finally {
    uni.hideLoading()
  }
}

function closeDeleteMainBusinessConfirm() {
  showDeleteMainBusinessConfirm.value = false
  deleteMainBusinessTargetId.value = ''
}

function openDeleteConfirm() {
  if (!rows.value.length) {
    uni.showToast({ title: '暂无主营业务可删除', icon: 'none' })
    return
  }
  const id = String(selectedId.value ?? '').trim()
  if (!id) {
    uni.showToast({ title: '请先选择要删除的主营业务', icon: 'none' })
    return
  }
  if (!isApiEnabled()) {
    uni.showToast({ title: '当前环境不支持删除', icon: 'none' })
    return
  }
  if (!isDeletableMainBusinessId(id)) {
    uni.showToast({ title: '该主营业务无法删除', icon: 'none' })
    return
  }
  deleteMainBusinessTargetId.value = id
  showDeleteMainBusinessConfirm.value = true
}

async function confirmDeleteMainBusiness() {
  const id = String(deleteMainBusinessTargetId.value ?? '').trim()
  if (!id) {
    closeDeleteMainBusinessConfirm()
    return
  }
  try {
    uni.showLoading({ title: '删除中', mask: true })
    await deleteMemberMainBusiness(id)
    closeDeleteMainBusinessConfirm()
    await loadList()
    uni.showToast({ title: '已删除', icon: 'none' })
  } catch (e) {
    uni.showToast({
      title: e?.message ? String(e.message) : '删除失败',
      icon: 'none'
    })
  } finally {
    uni.hideLoading()
  }
}

onShow(() => {
  loadList()
})
</script>

<style lang="scss" scoped>
.mb-page {
  height: 100vh;
  min-height: 100vh;
  background: #ffffff;
  color: #1f2937;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
}

.mb-body {
  flex: 1;
  min-height: 0;
  padding: 0 32rpx;
  /* 列表区域与底部按钮之间留白 */
  padding-bottom: 100rpx;
  display: flex;
  flex-direction: column;
  box-sizing: border-box;
}

.mb-body__list-host {
  flex: 1;
  min-height: 0;
  width: 100%;
  display: flex;
  flex-direction: column;
}

.mb-loading {
  padding: 120rpx 0;
  text-align: center;
  font-size: 28rpx;
  color: #999999;
}

.mb-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding-top: 120rpx;
  padding-bottom: 80rpx;
}

.mb-empty__icon-wrap {
  width: 160rpx;
  height: 160rpx;
  border-radius: 50%;
  background-color: rgba(244, 244, 244, 1);
  display: flex;
  align-items: center;
  justify-content: center;
  box-sizing: border-box;
}

.mb-empty__icon {
  width: 120rpx;
  height: 120rpx;
}

.mb-empty__text {
  margin-top: 30rpx;
  font-size: 28rpx;
  color: #929292;
  font-family: OPPOSans-regular, OPPOSans, -apple-system, sans-serif;
}

/* 与一键成片生成页「选择主营业务」弹窗列表项一致 */
.business-list-scroll {
  margin-top: 32rpx;
  width: 100%;
  box-sizing: border-box;
}

.mb-list-scroll-view {
  flex: 1;
  min-height: 0;
  height: 100%;
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

.mb-footer {
  flex-shrink: 0;
  padding: 24rpx 22rpx calc(16rpx + constant(safe-area-inset-bottom));
  padding: 24rpx 22rpx calc(16rpx + env(safe-area-inset-bottom));
  box-sizing: border-box;
}

/* 与一键成片「选择主营业务」弹窗底部新增/删除按钮一致 */
.business-actions-row {
  display: flex;
  flex-direction: column;
  align-items: stretch;
  gap: 24rpx;
  margin-top: 0;
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

/* 与一键成片删除主营业务确认弹窗一致 */
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
