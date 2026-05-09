<template>
  <!-- 查看成片：图一空列表 / 图二列表+进度+管理 / 图三多选删除 -->
  <view
    class="works-page"
    :class="{ 'works-page--delbar': showDelBar }"
  >
    <view class="nav-bar" :style="createNavBarStyle">
      <view class="nav-left" @tap="goBack">
        <image class="back-icon" :src="createBackIcon" mode="aspectFit" />
        <text>查看成片</text>
      </view>
      <view class="nav-bar__gap" aria-hidden="true" />
    </view>

    <!-- 图一：空态 -->
    <view
      v-if="!loading && list.length === 0"
      class="works-empty-page"
    >
      <view class="empty-circle" aria-hidden="true">
        <image
          class="empty-icon"
          :src="worksEmptyListIcon"
          mode="aspectFit"
        />
      </view>
      <text class="empty-title">暂无成片</text>
    </view>

    <!-- 图二 / 图三：有列表 -->
    <scroll-view
      v-else-if="list.length > 0"
      scroll-y
      class="works-scroll"
      :class="{ 'works-scroll--delbar': showDelBar }"
      :refresher-enabled="true"
      :refresher-triggered="refresherTriggered"
      @refresherrefresh="onRefresherRefresh"
      @scrolltolower="onScrollToLower"
    >
      <!-- 整体生成进度 -->
      <view
        v-if="summary.generatingCount > 0"
        class="progress-block"
      >
        <view class="progress-head">
          <image
            class="progress-flower"
            :src="flowerIcon"
            mode="aspectFit"
          />
          <view class="progress-topline">
            <view class="progress-label">
              <text class="progress-label__count">{{ summary.generatingCount }}</text>
              <text>个视频生成中</text>
              <view class="progress-dots" aria-hidden="true">
                <view class="progress-dot progress-dot--1" />
                <view class="progress-dot progress-dot--2" />
                <view class="progress-dot progress-dot--3" />
              </view>
            </view>
            <view class="progress-pct">
              <text class="progress-pct__num">{{ summary.generatingPercent }}</text>
              <text class="progress-pct__unit">%</text>
            </view>
          </view>
        </view>
        <view class="progress-track">
          <view
            class="progress-fill"
            :style="{ width: summary.generatingPercent + '%' }"
          />
        </view>
      </view>

      <!-- 徽章 + 通知 + 管理 -->
      <view class="toolbar-row">
        <view class="toolbar-badge">
          <text>已为您生成{{ summary.totalGeneratedBadge }}条推广视频</text>
        </view>
        <view class="toolbar-btns">
          <view class="tool-mini" @tap="onNotify">
            <image
              class="tool-mini__icon tool-mini__icon--notice"
              :src="worksToolbarNoticeIcon"
              mode="aspectFit"
            />
            <text>通知</text>
          </view>
          <view class="tool-mini" @tap="toggleManage">
            <image
              class="tool-mini__icon tool-mini__icon--manage"
              :src="worksToolbarManageIcon"
              mode="aspectFit"
            />
            <text>{{ manageMode ? '取消' : '管理' }}</text>
          </view>
        </view>
      </view>

      <!-- 三列宫格 -->
      <view class="grid3">
        <view
          v-for="item in list"
          :key="item.id"
          class="work-cell"
          :class="{
            'work-cell--sel': manageMode && isSelected(item.id)
          }"
          @tap="onCardTap(item)"
        >
          <view class="thumb-wrap">
            <image
              class="thumb-img"
              :src="item.cover"
              mode="aspectFill"
            />

            <!-- 生成中 -->
            <view
              v-if="item.status === 'processing'"
              class="thumb-mask"
            >
              <image
                class="mask-flower"
                :src="flowerIcon"
                mode="aspectFit"
              />
              <text class="mask-txt">生成中...</text>
              <view class="mini-track">
                <view
                  class="mini-fill"
                  :style="{ width: (item.progress ?? 0) + '%' }"
                />
              </view>
            </view>

            <!-- 已完成：信息条 + 播放（非管理态） -->
            <view
              v-if="item.status === 'completed'"
              class="thumb-foot"
              :class="{ 'thumb-foot--manage': manageMode }"
            >
              <text class="thumb-meta">{{ item.durationLabel }}</text>
              <text class="thumb-meta thumb-meta--time">{{ item.dateLabel }}</text>
            </view>
            <view
              v-if="!manageMode && item.status === 'completed'"
              class="btn-publish"
              @tap.stop="onPublish(item)"
            >
              <image
                class="btn-publish__icon"
                :src="worksPublishIcon"
                mode="aspectFit"
              />
              <view class="btn-publish__label">发布</view>
            </view>
            <view
              v-if="item.status === 'completed' && !manageMode"
              class="thumb-play"
            >
              <text>▶</text>
            </view>

            <!-- 管理：复选框（仅已完成可删） -->
            <view
              v-if="manageMode && item.status === 'completed'"
              class="thumb-chk"
              @tap.stop="toggleSelect(item.id)"
            >
              <view
                class="chk-sq"
                :class="{ 'chk-sq--on': isSelected(item.id) }"
              >
                <text v-if="isSelected(item.id)" class="chk-tick">✓</text>
              </view>
            </view>
          </view>

        </view>
      </view>

      <view v-if="loadingMore" class="works-footer">加载中…</view>
      <view
        v-else-if="!hasMore && list.length"
        class="works-footer"
      >
        没有更多了
      </view>
    </scroll-view>

    <!-- 图三：底部删除条 -->
    <view
      v-if="showDelBar"
      class="del-bar"
      @tap="onDeleteTap"
    >
      <image class="del-bar__icon" :src="worksDeleteIcon" mode="aspectFit" />
      <text class="del-bar__txt">删除</text>
    </view>

    <!-- 通知提示弹窗 -->
    <view
      v-if="notifyDialogVisible"
      class="notify-dialog-mask"
      @tap.stop="closeNotifyDialog"
    >
      <view class="notify-dialog" @tap.stop>
        <view class="notify-dialog__head">温馨提示</view>
        <view class="notify-dialog__body">
          <text class="notify-dialog__star">*</text>
          <text class="notify-dialog__desc">开启消息通知，视频生成后即时通知您</text>
        </view>
        <view class="notify-dialog__split" />
        <view class="notify-dialog__btn notify-dialog__btn--allow" @tap="onAllowNotify">
          允许通知
        </view>
        <view class="notify-dialog__split" />
        <view class="notify-dialog__btn notify-dialog__btn--later" @tap="closeNotifyDialog">
          以后再说
        </view>
      </view>
    </view>

    <!-- 删除确认弹窗 -->
    <view
      v-if="deleteDialogVisible"
      class="del-dialog-mask"
      @tap.stop="onDeleteCancel"
    >
      <view class="del-dialog" @tap.stop>
        <view class="del-dialog__head">
          <image class="del-dialog__warn-icon" :src="worksDeleteWarnIcon" mode="aspectFit" />
          <text class="del-dialog__title">是否要删除视频</text>
        </view>
        <view class="del-dialog__split" />
        <view class="del-dialog__desc">
          <text class="del-dialog__desc-star">*</text>
          <text> 删除后视频将无法恢复，请谨慎操作</text>
        </view>
        <view class="del-dialog__actions">
          <view class="del-dialog__btn del-dialog__btn--cancel" @tap="onDeleteCancel">
            取消
          </view>
          <view class="del-dialog__btn del-dialog__btn--confirm" @tap="onDeleteConfirm">
            确认
          </view>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'
import { onLoad, onReady } from '@dcloudio/uni-app'
import {
  getCreateNavBarInlineStyle,
  scheduleCreateNavBarStyleRefresh
} from '@/utils/create-nav-bar-style'
import {
  deleteFinishedVideos,
  getFinishedVideoList
} from '@/api/finished-videos'
import { hidePageLoading, showPageLoading } from '@/utils/page-loading'
import createBackIcon from '@/static/create/create-back-icon.png'
import flowerIcon from '@/static/create/works-icon-flower.png'
import worksEmptyListIcon from '@/static/create/works-empty-list-icon.png'
import worksPublishIcon from '@/static/create/works-btn-publish-icon.png'
import worksDeleteIcon from '@/static/create/works-icon-delete.png'
import worksDeleteWarnIcon from '@/static/create/works-icon-delete-warning.png'
/** 铃铛图，仅供「通知」 */
import worksToolbarNoticeIcon from '@/static/create/works-icon-notice-v2.png'
/** 宫格管理图，仅供「管理」 */
import worksToolbarManageIcon from '@/static/create/works-icon-manage-v3.png'

const createNavBarStyle = ref(getCreateNavBarInlineStyle())

/** 默认空列表；URL 加 `?mock=1` 可加载本地 Mock 数据（图二/图三） */
const useMockList = ref(false)
const list = ref([])
const page = ref(1)
const pageSize = ref(18)
const total = ref(0)
const loading = ref(true)
const loadingMore = ref(false)
const hasMore = ref(true)
const refresherTriggered = ref(false)

const summary = ref({
  generatingCount: 0,
  generatingPercent: 0,
  totalGeneratedBadge: 0
})

const manageMode = ref(false)
const selectedIds = ref([])
const deleteDialogVisible = ref(false)
const notifyDialogVisible = ref(false)

const showDelBar = computed(
  () => manageMode.value && selectedIds.value.length > 0
)

onLoad((query) => {
  useMockList.value = query?.mock === '1'
})

onMounted(() => {
  scheduleCreateNavBarStyleRefresh(createNavBarStyle)
  loadFirstPage()
})
onReady(() => scheduleCreateNavBarStyleRefresh(createNavBarStyle))

function goBack() {
  uni.navigateBack({ fail: () => uni.switchTab({ url: '/pages/home/index' }) })
}

function isSelected(id) {
  return selectedIds.value.includes(id)
}

function toggleSelect(id) {
  const i = selectedIds.value.indexOf(id)
  if (i >= 0) selectedIds.value.splice(i, 1)
  else selectedIds.value.push(id)
}

function toggleManage() {
  manageMode.value = !manageMode.value
  if (!manageMode.value) selectedIds.value = []
}

function onNotify() {
  notifyDialogVisible.value = true
}

function closeNotifyDialog() {
  notifyDialogVisible.value = false
}

function checkNotifyEnabled() {
  return new Promise((resolve) => {
    if (typeof wx === 'undefined' || typeof wx.getSetting !== 'function') {
      resolve(false)
      return
    }
    wx.getSetting({
      withSubscriptions: true,
      success: (res) => {
        const mainSwitch = res?.subscriptionsSetting?.mainSwitch
        resolve(mainSwitch === true)
      },
      fail: () => resolve(false)
    })
  })
}

function onAllowNotify() {
  if (typeof wx === 'undefined' || typeof wx.openSetting !== 'function') {
    closeNotifyDialog()
    uni.showToast({ title: '当前环境不支持通知设置', icon: 'none' })
    return
  }

  wx.openSetting({
    success: async () => {
      const enabled = await checkNotifyEnabled()
      closeNotifyDialog()
      uni.showToast({
        title: enabled ? '已开启消息通知' : '未开启消息通知',
        icon: 'none'
      })
    },
    fail: () => {
      closeNotifyDialog()
      uni.showToast({ title: '打开设置失败', icon: 'none' })
    }
  })
}

function onPublish(item) {
  uni.showToast({
    title: `发布「${item.durationLabel}」接入中`,
    icon: 'none'
  })
}

function onCardTap(item) {
  if (manageMode.value) {
    if (item.status === 'completed') toggleSelect(item.id)
    return
  }
  if (item.status === 'completed') openDetail(item)
}

function onDeleteTap() {
  if (!selectedIds.value.length) return
  deleteDialogVisible.value = true
}

function onDeleteCancel() {
  deleteDialogVisible.value = false
}

async function onDeleteConfirm() {
  const ids = selectedIds.value.slice()
  if (!ids.length) return
  deleteDialogVisible.value = false
  await deleteFinishedVideos(ids)
  list.value = list.value.filter((x) => !ids.includes(x.id))
  total.value = Math.max(0, total.value - ids.length)
  selectedIds.value = []
  manageMode.value = false
  uni.showToast({ title: `已删除 ${ids.length} 条`, icon: 'none' })
}

async function loadFirstPage() {
  page.value = 1
  hasMore.value = true
  showPageLoading()
  loading.value = true
  try {
    const res = await getFinishedVideoList({
      page: 1,
      pageSize: pageSize.value,
      mock: useMockList.value
    })
    list.value = res.list || []
    total.value = res.total || 0
    if (res.summary) {
      summary.value = { ...summary.value, ...res.summary }
    }
    hasMore.value = list.value.length < total.value
    page.value = 1
  } finally {
    loading.value = false
    hidePageLoading()
  }
}

async function loadNextPage() {
  if (!hasMore.value || loadingMore.value || loading.value) return
  if (!useMockList.value) return
  loadingMore.value = true
  try {
    const next = page.value + 1
    const res = await getFinishedVideoList({
      page: next,
      pageSize: pageSize.value,
      mock: true
    })
    const chunk = res.list || []
    if (chunk.length) {
      list.value = list.value.concat(chunk)
      page.value = next
    }
    hasMore.value = list.value.length < (res.total || total.value)
  } finally {
    loadingMore.value = false
  }
}

async function onRefresherRefresh() {
  refresherTriggered.value = true
  try {
    await loadFirstPage()
  } finally {
    refresherTriggered.value = false
  }
}

function onScrollToLower() {
  loadNextPage()
}

function openDetail(item) {
  uni.navigateTo({
    url: `/pages/create/works/detail?id=${encodeURIComponent(item.id)}`
  })
}
</script>

<style lang="scss" scoped>
.works-page {
  min-height: 100vh;
  background: #ffffff;
  display: flex;
  flex-direction: column;
  box-sizing: border-box;
}

.works-page--delbar {
  padding-bottom: calc(120rpx + constant(safe-area-inset-bottom));
  padding-bottom: calc(120rpx + env(safe-area-inset-bottom));
}

.nav-bar {
  box-sizing: border-box;
  position: relative;
  overflow: hidden;
  padding-right: calc(18rpx + constant(safe-area-inset-right));
  padding-right: calc(18rpx + env(safe-area-inset-right));
  padding-left: calc(18rpx + constant(safe-area-inset-left));
  padding-left: calc(18rpx + env(safe-area-inset-left));
  padding-bottom: 16rpx;
  display: flex;
  align-items: center;
  flex-shrink: 0;
}

.nav-left {
  flex: 1;
  min-width: 0;
  display: flex;
  align-items: center;
  color: #1f2933;
  font-size: 30rpx;
}

.back-icon {
  flex-shrink: 0;
  width: 36rpx;
  height: 36rpx;
  margin-right: 12rpx;
  display: block;
}

.nav-bar__gap {
  flex-shrink: 0;
  width: 174rpx;
  height: 32rpx;
}

/* —— 图一空态 —— */
.works-empty-page {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 80rpx 40rpx 160rpx;
  background: #ffffff;
}

.empty-circle {
  width: 160rpx;
  height: 160rpx;
  border-radius: 50%;
  background-color: rgba(244, 244, 244, 1);
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
}

.empty-icon {
  width: 96rpx;
  height: 96rpx;
}

.empty-title {
  margin-top: 30rpx;
  font-size: 28rpx;
  color: #929292;
}

/* —— 列表滚动区 —— */
.works-scroll {
  flex: 1;
  height: 0;
  min-height: 0;
  box-sizing: border-box;
  padding: 20rpx 20rpx 32rpx;
  background-color: rgba(255, 255, 255, 1);
}

.works-scroll--delbar {
  padding-bottom: 24rpx;
}

.progress-block {
  display: flex;
  flex-direction: column;
  gap: 16rpx;
  padding: 20rpx;
  margin-bottom: 16rpx;
  background: #ffffff;
  border-radius: 16rpx;
  box-sizing: border-box;
}

.progress-head {
  display: flex;
  flex-direction: row;
  align-items: flex-start;
  gap: 16rpx;
  width: 100%;
  min-width: 0;
}

.progress-flower {
  width: 48rpx;
  height: 48rpx;
  flex-shrink: 0;
  margin-top: 4rpx;
  -webkit-animation: works-spin 1.2s linear infinite;
  animation: works-spin 1.2s linear infinite;
  transform-origin: center center;
}

.progress-topline {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
}

.progress-label {
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 10rpx;
  font-size: 26rpx;
  color: #374151;
}

.progress-label__count {
  font-size: 48rpx;
  font-weight: bold;
  color: #1f2937;
  line-height: 1;
}

.progress-dots {
  display: flex;
  align-items: center;
  gap: 6rpx;
  margin-left: 2rpx;
}

.progress-dot {
  width: 8rpx;
  height: 8rpx;
  border-radius: 50%;
  background: #1f2937;
  opacity: 0;
  -webkit-animation: works-dot-1 2s linear infinite;
  animation: works-dot-1 2s linear infinite;
}

.progress-dot--2 {
  -webkit-animation-name: works-dot-2;
  animation-name: works-dot-2;
}

.progress-dot--3 {
  -webkit-animation-name: works-dot-3;
  animation-name: works-dot-3;
}

.progress-pct {
  display: flex;
  flex-direction: row;
  align-items: baseline;
  flex-shrink: 0;
}

.progress-pct__num {
  font-size: 48rpx;
  font-weight: 700;
  color: #ffa554;
  line-height: 1;
}

.progress-pct__unit {
  font-size: 24rpx;
  color: #1f2937;
  line-height: 1;
}

.progress-track {
  width: 100%;
  box-sizing: border-box;
  height: 12rpx;
  border-radius: 999rpx;
  background: #e5e7eb;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  border-radius: 999rpx;
  background: linear-gradient(90deg, #ffc98f 0%, #ff9835 100%);
}

.toolbar-row {
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  gap: 12rpx;
  margin-bottom: 20rpx;
}

.toolbar-badge {
  width: 356rpx;
  height: 54rpx;
  padding: 0 16rpx;
  border-radius: 12rpx;
  box-sizing: border-box;
  background-color: rgba(255, 231, 204, 1);
  display: flex;
  align-items: center;
}

.toolbar-badge text {
  font-size: 28rpx;
  color: #1f2937;
  line-height: 1;
  white-space: nowrap;
}

.toolbar-btns {
  flex-shrink: 0;
  display: flex;
  flex-direction: row;
  gap: 12rpx;
}

.tool-mini {
  box-sizing: border-box;
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  width: 130rpx;
  height: 54rpx;
  padding: 0 8rpx;
  gap: 6rpx;
  border-radius: 48rpx;
  background-color: rgba(244, 244, 244, 1);
  font-size: 24rpx;
  color: #808080;
}

.tool-mini text {
  color: #808080;
}

.tool-mini__icon {
  width: 28rpx;
  height: 28rpx;
  display: block;
  flex-shrink: 0;
}

.tool-mini__icon--manage {
  width: 30rpx;
  height: 30rpx;
}

.grid3 {
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  justify-content: space-between;
}

.work-cell {
  width: 224rpx;
  height: 308rpx;
  margin-bottom: 20rpx;
  border-radius: 24rpx;
  border: 3rpx solid transparent;
  box-sizing: border-box;
}

.work-cell--sel {
  border-color: #ff9835;
}

.thumb-wrap {
  position: relative;
  width: 224rpx;
  height: 308rpx;
  border-radius: 24rpx;
  overflow: hidden;
  background: #e5e7eb;
}

.thumb-img {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
}

.thumb-mask {
  position: absolute;
  inset: 0;
  background: rgba(0, 0, 0, 0.55);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding-bottom: 16rpx;
}

.mask-flower {
  width: 56rpx;
  height: 56rpx;
  -webkit-animation: works-spin 1.2s linear infinite;
  animation: works-spin 1.2s linear infinite;
  transform-origin: center center;
}

.mask-txt {
  margin-top: 12rpx;
  font-size: 24rpx;
  color: #ffffff;
}

.mini-track {
  position: absolute;
  left: 12rpx;
  right: 12rpx;
  bottom: 12rpx;
  height: 6rpx;
  border-radius: 999rpx;
  background: rgba(255, 255, 255, 0.35);
  overflow: hidden;
}

.mini-fill {
  height: 100%;
  border-radius: 999rpx;
  background: #ff9835;
}

.thumb-foot {
  position: absolute;
  left: 50%;
  bottom: 74rpx;
  transform: translateX(-50%);
  z-index: 3;
  box-sizing: border-box;
  width: 200rpx;
  height: 54rpx;
  padding: 0 12rpx;
  border-radius: 16rpx;
  background-color: rgba(0, 0, 0, 0.6);
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
}

.thumb-foot--manage {
  bottom: 12rpx;
}

.thumb-meta {
  font-size: 24rpx;
  color: rgba(255, 255, 255, 1);
  line-height: 1.2;
}

.thumb-meta--time {
  font-size: 20rpx;
  opacity: 1;
}

.thumb-play {
  position: absolute;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -58%);
  width: 52rpx;
  height: 52rpx;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.9);
  display: flex;
  align-items: center;
  justify-content: center;
  color: #1f2937;
  font-size: 26rpx;
  padding-left: 6rpx;
}

.thumb-chk {
  position: absolute;
  right: 8rpx;
  top: 8rpx;
  z-index: 2;
  padding: 4rpx;
}

.chk-sq {
  width: 36rpx;
  height: 36rpx;
  border-radius: 8rpx;
  border: 4rpx solid rgba(209, 209, 209, 1);
  background-color: rgba(255, 255, 255, 1);
  box-shadow: 0rpx 4rpx 8rpx 0rpx rgba(0, 0, 0, 0.4);
  box-sizing: border-box;
  display: flex;
  align-items: center;
  justify-content: center;
}

.chk-sq--on {
  border: 4rpx solid rgba(255, 165, 84, 1);
  background-color: rgba(255, 255, 255, 1);
}

.chk-tick {
  font-size: 22rpx;
  color: #fba549;
  font-weight: 800;
  line-height: 1;
}

.btn-publish {
  position: absolute;
  left: 50%;
  bottom: 8rpx;
  transform: translateX(-50%);
  z-index: 3;
  box-sizing: border-box;
  width: 200rpx;
  height: 54rpx;
  padding: 0;
  line-height: normal;
  border-radius: 16rpx;
  border: 1rpx solid #e5e7eb !important;
  background-color: rgba(255, 255, 255, 1) !important;
  display: flex;
  flex-direction: row;
  flex-wrap: nowrap;
  align-items: center;
  justify-content: center;
  gap: 8rpx;
}

.btn-publish::after {
  border: 0;
}

.btn-publish__icon {
  width: 28rpx;
  height: 28rpx;
  flex-shrink: 0;
  display: block;
}

.btn-publish__label {
  flex-shrink: 0;
  font-size: 24rpx;
  font-weight: 500;
  color: #1f2937;
  line-height: 1.2;
  white-space: nowrap;
}

.works-footer {
  text-align: center;
  padding: 24rpx;
  font-size: 24rpx;
  color: #9ca3af;
}

.del-bar {
  position: fixed;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 100;
  padding: 24rpx 0 calc(24rpx + constant(safe-area-inset-bottom));
  padding: 24rpx 0 calc(24rpx + env(safe-area-inset-bottom));
  background: #ef4444;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.del-bar__icon {
  width: 48rpx;
  height: 48rpx;
  display: block;
  flex-shrink: 0;
}

.del-bar__txt {
  margin-top: 10rpx;
  font-size: 28rpx;
  color: #ffffff;
  font-weight: 600;
}

.notify-dialog-mask {
  position: fixed;
  inset: 0;
  z-index: 102;
  background: rgba(0, 0, 0, 0.52);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0 44rpx;
  box-sizing: border-box;
}

.notify-dialog {
  width: 596rpx;
  height: 530rpx;
  border-radius: 44rpx;
  overflow: hidden;
  background-color: rgba(255, 255, 255, 1);
}

.notify-dialog__head {
  height: 106rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #ffffff;
  font-size: 36rpx;
  font-family: 'OPPOSans-medium';
  font-weight: 500;
  background: linear-gradient(180deg, #ffbe77 0%, #ff9c31 100%);
}

.notify-dialog__body {
  padding: 64rpx 26rpx 66rpx;
  display: flex;
  align-items: center;
  justify-content: center;
}

.notify-dialog__star {
  color: #fd5656;
  font-size: 30rpx;
  line-height: 1;
  margin-right: 8rpx;
}

.notify-dialog__desc {
  color: #1f2937;
  font-size: 30rpx;
  line-height: 1.4;
}

.notify-dialog__split {
  height: 1rpx;
  background: #f9f9f9;
}

.notify-dialog__btn {
  height: auto;
  padding: 32rpx 0;
  box-sizing: border-box;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 40rpx;
  font-weight: 700;
  line-height: 1;
}

.notify-dialog__btn--allow {
  color: #1f2937;
  font-size: 32rpx;
}

.notify-dialog__btn--later {
  color: #9ca3af;
  font-size: 32rpx;
}

.del-dialog-mask {
  position: fixed;
  inset: 0;
  z-index: 101;
  background: rgba(0, 0, 0, 0.52);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0 44rpx;
  box-sizing: border-box;
}

.del-dialog {
  width: 600rpx;
  height: 384rpx;
  background-color: rgba(255, 255, 255, 1);
  border-radius: 44rpx;
  padding: 26rpx 24rpx 30rpx;
  box-sizing: border-box;
}

.del-dialog__head {
  margin-top: 36rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12rpx;
}

.del-dialog__warn-icon {
  width: 40rpx;
  height: 40rpx;
  display: block;
  flex-shrink: 0;
}

.del-dialog__title {
  font-size: 32rpx;
  color: #fd5656;
  font-weight: 700;
}

.del-dialog__split {
  height: 1rpx;
  background: #f0f0f0;
  margin: 30rpx -24rpx 0;
}

.del-dialog__desc {
  display: flex;
  align-items: center;
  justify-content: center;
  margin-top: 48rpx;
  font-size: 30rpx;
  color: #1f2937;
}

.del-dialog__desc-star {
  color: #fd5656;
}

.del-dialog__actions {
  margin-top: 54rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 24rpx;
}

.del-dialog__btn {
  width: 200rpx;
  height: 80rpx;
  border-radius: 64rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 28rpx;
  font-weight: 700;
  box-sizing: border-box;
}

.del-dialog__btn--cancel {
  color: #bbbbbb;
  border: 2rpx solid rgba(187, 187, 187, 1);
  background: #ffffff;
}

.del-dialog__btn--confirm {
  color: #ffffff;
  background: #101010;
}

@-webkit-keyframes works-spin {
  from {
    -webkit-transform: rotate(0deg);
    transform: rotate(0deg);
  }
  to {
    -webkit-transform: rotate(360deg);
    transform: rotate(360deg);
  }
}

@keyframes works-spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

@-webkit-keyframes works-dot-1 {
  0% {
    opacity: 0;
  }
  24% {
    opacity: 0;
  }
  25% {
    opacity: 1;
  }
  94% {
    opacity: 1;
  }
  100% {
    opacity: 0;
  }
}

@keyframes works-dot-1 {
  0% {
    opacity: 0;
  }
  24% {
    opacity: 0;
  }
  25% {
    opacity: 1;
  }
  94% {
    opacity: 1;
  }
  100% {
    opacity: 0;
  }
}

@-webkit-keyframes works-dot-2 {
  0%,
  49% {
    opacity: 0;
  }
  50%,
  94% {
    opacity: 1;
  }
  100% {
    opacity: 0;
  }
}

@keyframes works-dot-2 {
  0%,
  49% {
    opacity: 0;
  }
  50%,
  94% {
    opacity: 1;
  }
  100% {
    opacity: 0;
  }
}

@-webkit-keyframes works-dot-3 {
  0%,
  74% {
    opacity: 0;
  }
  75%,
  94% {
    opacity: 1;
  }
  100% {
    opacity: 0;
  }
}

@keyframes works-dot-3 {
  0%,
  74% {
    opacity: 0;
  }
  75%,
  94% {
    opacity: 1;
  }
  100% {
    opacity: 0;
  }
}
</style>
