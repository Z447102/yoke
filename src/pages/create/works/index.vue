<template>
  <!-- 查看成片：图一空列表 / 图二列表+进度+管理 / 图三多选删除 -->
  <view
    class="works-page"
    :class="{ 'works-page--delbar': showDelBar }"
  >
    <CreateNavBar
      title="查看成片"
      title-class="nav-left__title"
      :icon-title-gap="12"
      @back="goBack"
    />

    <!-- 有列表：图二 / 图三 -->
    <scroll-view
      v-if="list.length > 0"
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
              <view class="progress-dots">
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

      <view v-if="manageMode" class="manage-multi-hint">
        <text>（可多选）</text>
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
              class="thumb-mask thumb-mask--processing"
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

            <!-- 生成失败 -->
            <view
              v-if="item.status === 'failed'"
              class="thumb-mask thumb-mask--failed"
            >
              <view class="thumb-failed__center">
                <image
                  class="thumb-failed__mascot"
                  :src="worksFailedMascotIcon"
                  mode="aspectFit"
                />
                <text class="thumb-failed__title">生成失败了</text>
              </view>
              <view class="thumb-failed__actions">
                <view
                  class="btn-failed btn-failed--retry"
                  @tap.stop="onRegenerateFailed(item)"
                >
                  <image
                    class="btn-failed__ico-img btn-failed__ico-img--retry"
                    :src="worksFailedRetryIcon"
                    mode="aspectFit"
                  />
                  <text class="btn-failed__txt">重新生成</text>
                </view>
                <view
                  class="btn-failed btn-failed--reason"
                  @tap.stop="onViewFailedReason(item)"
                >
                  <image
                    class="btn-failed__ico-img btn-failed__ico-img--reason"
                    :src="worksFailedReasonIcon"
                    mode="aspectFit"
                  />
                  <text class="btn-failed__txt">查看原因</text>
                </view>
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

    <!-- 首屏加载（无列表数据时） -->
    <view
      v-else-if="loading"
      class="works-loading-page"
    >
      <text class="works-loading-page__text">加载中…</text>
    </view>

    <!-- 图一：空态 -->
    <view
      v-else
      class="works-empty-page"
    >
      <view class="empty-circle">
        <image
          class="empty-icon"
          :src="worksEmptyListIcon"
          mode="aspectFit"
        />
      </view>
      <text class="empty-title">暂无成片</text>
      <text class="empty-sub">去一键成片生成您的第一条推广视频</text>
      <view class="empty-cta" @tap="goToCreate">
        <text>去创作</text>
      </view>
    </view>

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

    <!-- 生成失败 · 查看原因 -->
    <view
      v-if="failReasonDialogVisible"
      class="fail-reason-mask"
      @tap="closeFailReasonDialog"
    >
      <view class="fail-reason-panel" @tap.stop>
        <view class="fail-reason-panel__handle-wrap">
          <view class="fail-reason-panel__handle" />
        </view>

        <view class="fail-reason-panel__body">
          <image
            class="fail-reason-panel__hero"
            :src="worksFailDialogHeroIcon"
            mode="aspectFit"
          />
          <text class="fail-reason-panel__title">视频生成失败了</text>
          <text class="fail-reason-panel__sub">非常抱歉，未能成功生成视频</text>

          <view class="fail-reason-block fail-reason-block--reason">
            <text class="fail-reason-block__label">失败原因</text>
            <view class="fail-reason-block__lines">
              <block
                v-for="(line, i) in failReasonBulletLines"
                :key="'fr-' + i"
              >
                <view
                  v-if="i === 0"
                  class="fail-reason-block__reason-row"
                >
                  <view class="fail-reason-block__dot" />
                  <text class="fail-reason-block__line fail-reason-block__line--primary">{{
                    line
                  }}</text>
                </view>
                <text
                  v-else
                  class="fail-reason-block__line fail-reason-block__line--follow"
                  :class="
                    i === 1
                      ? 'fail-reason-block__line--muted'
                      : 'fail-reason-block__line--primary'
                  "
                >{{ line }}</text>
              </block>
            </view>
          </view>

          <view class="fail-reason-block fail-reason-block--points">
            <image
              class="fail-reason-block__check-icon"
              :src="worksFailDialogCheckIcon"
              mode="aspectFit"
            />
            <view class="fail-reason-block__points-inner">
              <view class="fail-reason-block__points-line">
                <text class="fail-reason-block__points-prefix">本次失败</text>
                <text class="fail-reason-block__points-highlight">不消耗算力点数，点数已自动返还</text>
              </view>
            </view>
          </view>

          <view class="fail-reason-panel__actions">
            <view
              class="fail-reason-panel__btn fail-reason-panel__btn--ghost"
              @tap="onFailReasonCancel"
            >
              <text>取消</text>
            </view>
            <view
              class="fail-reason-panel__btn fail-reason-panel__btn--primary"
              @tap="onFailReasonRegenerate"
            >
              <text>重新生成</text>
            </view>
          </view>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup>
import CreateNavBar from '@/pages/create/components/CreateNavBar.vue'
import { StaticPath } from '@/config'
import { computed, onMounted, ref } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
import {
  deleteFinishedVideos,
  getFinishedVideoList
} from '@/api/finished-videos'
import { CREATE_SELECTED_PLATFORM_STORAGE_KEY } from '@/constants/create-selected-platform'
const flowerIcon = `${StaticPath}create/works-icon-flower.png`
const worksEmptyListIcon = `${StaticPath}create/works-empty-list-icon.png`
const worksPublishIcon = `${StaticPath}create/works-btn-publish-icon.png`
const worksDeleteIcon = `${StaticPath}create/works-icon-delete.png`
const worksDeleteWarnIcon = `${StaticPath}create/works-icon-delete-warning.png`
/** 铃铛图，仅供「通知」 */
const worksToolbarNoticeIcon = `${StaticPath}create/works-icon-notice-v2.png`
/** 宫格管理图，仅供「管理」 */
const worksToolbarManageIcon = `${StaticPath}create/works-icon-manage-v3.png`
const worksFailedMascotIcon = `${StaticPath}create/works-failed-mascot.png`
const worksFailedRetryIcon = `${StaticPath}create/works-failed-retry.png`
const worksFailedReasonIcon = `${StaticPath}create/works-failed-reason.png`
const worksFailDialogHeroIcon = `${StaticPath}create/works-fail-dialog-hero.png`
const worksFailDialogCheckIcon = `${StaticPath}create/works-fail-dialog-check.png`

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
const failReasonDialogVisible = ref(false)
/** 当前查看原因弹窗对应的成片项 */
const failReasonTargetItem = ref(null)

const showDelBar = computed(
  () => manageMode.value && selectedIds.value.length > 0
)

/** 失败原因区：设计稿为带「•」的多行要点；支持接口换行或自动拆分 */
const failReasonBulletLines = computed(() => {
  const raw = String(failReasonTargetItem.value?.failReason || '').trim()
  const defaults = [
    '部分素材清晰度较低，影响了视频效果',
    '建议您更换清晰的素材后重试'
  ]
  if (!raw) return defaults

  const byNl = raw.split(/\r?\n+/).map((s) => s.trim()).filter(Boolean)
  if (byNl.length >= 2) return byNl

  const noEndPeriod = raw.replace(/[。．.]$/, '')
  const byPeriod = noEndPeriod.split(/[。．.]/).map((s) => s.trim()).filter(Boolean)
  if (byPeriod.length >= 2) {
    return byPeriod.map((s, idx) =>
      idx < byPeriod.length - 1 ? `${s}。` : s
    )
  }

  const j = raw.indexOf('建议您')
  if (j > 0) {
    return [raw.slice(0, j).trim(), raw.slice(j).trim()]
  }

  return [raw]
})

onLoad((query) => {
  // 成片列表：getFinishedVideoList 仅在 mock:true 时有数据（真实接口未接前）。
  // 真机常见问题：(1) 未带 ?mock=1 且非开发构建 → 始终空列表；(2) 根页无明确高度时 scroll-view 的 flex+height:0 可能高度为 0 → 见 .works-page。
  if (query?.mock === '1') {
    useMockList.value = true
  } else if (query?.mock === '0') {
    useMockList.value = false
  } else if (import.meta.env.DEV) {
    useMockList.value = true
  } else {
    useMockList.value = false
  }
})

onMounted(() => {
  loadFirstPage()
})

/**
 * 返回上一页
 */
function goBack() {
  uni.navigateBack({
    fail: () => {
      uni.switchTab({
        url: '/pages/home/index',
        fail: () => {
          uni.redirectTo({ url: '/pages/home/index' })
        }
      })
    }
  })
}

/**
 * 页面跳转：goToCreate
 */
function goToCreate() {
  uni.navigateTo({
    url: '/pages/create/index',
    fail: () => {
      uni.showToast({ title: '打开失败', icon: 'none' })
    }
  })
}

/**
 * 布尔判断：isSelected
 */
function isSelected(id) {
  return selectedIds.value.includes(id)
}

/**
 * 切换状态：toggleSelect
 */
function toggleSelect(id) {
  const i = selectedIds.value.indexOf(id)
  if (i >= 0) selectedIds.value.splice(i, 1)
  else selectedIds.value.push(id)
}

/**
 * 切换状态：toggleManage
 */
function toggleManage() {
  manageMode.value = !manageMode.value
  if (!manageMode.value) selectedIds.value = []
}

/**
 * 事件处理：onNotify
 */
function onNotify() {
  notifyDialogVisible.value = true
}

/**
 * 关闭界面/弹层：closeNotifyDialog
 */
function closeNotifyDialog() {
  notifyDialogVisible.value = false
}

/**
 * 函数：checkNotifyEnabled
 */
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

/**
 * 事件处理：onAllowNotify
 */
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

/**
 * 事件处理：onRegenerateFailed
 */
function onRegenerateFailed(_item) {
  uni.showToast({
    title: '重新生成（待接入）',
    icon: 'none'
  })
}

/**
 * 事件处理：onViewFailedReason
 */
function onViewFailedReason(item) {
  failReasonTargetItem.value = item
  failReasonDialogVisible.value = true
}

/**
 * 关闭界面/弹层：closeFailReasonDialog
 */
function closeFailReasonDialog() {
  failReasonDialogVisible.value = false
  failReasonTargetItem.value = null
}

/**
 * 事件处理：onFailReasonCancel
 */
function onFailReasonCancel() {
  closeFailReasonDialog()
}

/**
 * 事件处理：onFailReasonRegenerate
 */
function onFailReasonRegenerate() {
  const target = failReasonTargetItem.value
  closeFailReasonDialog()
  if (target) onRegenerateFailed(target)
}

/**
 * 事件处理：onPublish
 */
function onPublish(item) {
  let platformId = 'douyin'
  try {
    const s = uni.getStorageSync(CREATE_SELECTED_PLATFORM_STORAGE_KEY)
    if (s) platformId = String(s)
  } catch (_) {
    /* 忽略 */
  }
  const q = [
    `id=${encodeURIComponent(String(item.id || ''))}`,
    `cover=${encodeURIComponent(String(item.cover || ''))}`,
    `duration=${encodeURIComponent(String(item.durationLabel || '30s'))}`,
    `platform=${encodeURIComponent(platformId)}`
  ].join('&')
  uni.navigateTo({
    url: `/pages/create/works/publish?${q}`,
    fail: () => uni.showToast({ title: '页面打开失败', icon: 'none' })
  })
}

/**
 * 事件处理：onCardTap
 */
function onCardTap(item) {
  if (manageMode.value) {
    if (item.status === 'completed') toggleSelect(item.id)
    return
  }
  if (item.status === 'completed') openDetail(item)
}

/**
 * 事件处理：onDeleteTap
 */
function onDeleteTap() {
  if (!selectedIds.value.length) return
  deleteDialogVisible.value = true
}

/**
 * 事件处理：onDeleteCancel
 */
function onDeleteCancel() {
  deleteDialogVisible.value = false
}

/**
 * 事件处理：onDeleteConfirm
 */
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

/**
 * 加载数据：loadFirstPage
 */
async function loadFirstPage() {
  page.value = 1
  hasMore.value = true
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
  }
}

/**
 * 加载数据：loadNextPage
 */
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

/**
 * 事件处理：onRefresherRefresh
 */
async function onRefresherRefresh() {
  refresherTriggered.value = true
  try {
    await loadFirstPage()
  } finally {
    refresherTriggered.value = false
  }
}

/**
 * 事件处理：onScrollToLower
 */
function onScrollToLower() {
  loadNextPage()
}

/**
 * 打开界面/弹层：openDetail
 */
function openDetail(item) {
  uni.navigateTo({
    url: `/pages/create/works/detail?id=${encodeURIComponent(item.id)}`
  })
}
</script>

<style lang="scss" scoped>
.works-page {
  /* 真机：仅 min-height 时 flex 子项（scroll-view / 空态）可能算不出高度，列表区表现为空白 */
  min-height: 100vh;
  height: 100vh;
  background: #ffffff;
  display: flex;
  flex-direction: column;
  box-sizing: border-box;
}

.works-page--delbar {
  padding-bottom: calc(120rpx + constant(safe-area-inset-bottom));
  padding-bottom: calc(120rpx + env(safe-area-inset-bottom));
}

/* —— 首屏加载 —— */
.works-loading-page {
  flex: 1;
  min-height: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 80rpx 40rpx 160rpx;
  box-sizing: border-box;
}

.works-loading-page__text {
  font-size: 28rpx;
  color: #9ca3af;
  font-family: OPPOSans-regular, OPPOSans, -apple-system, sans-serif;
}

/* —— 图一空态 —— */
.works-empty-page {
  flex: 1;
  min-height: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 80rpx 40rpx 160rpx;
  background: #ffffff;
  box-sizing: border-box;
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
  font-size: 30rpx;
  color: #374151;
  font-family: OPPOSans-medium, OPPOSans, -apple-system, sans-serif;
  font-weight: 500;
}

.empty-sub {
  margin-top: 16rpx;
  padding: 0 48rpx;
  font-size: 26rpx;
  color: #9ca3af;
  text-align: center;
  line-height: 1.5;
  font-family: OPPOSans-regular, OPPOSans, -apple-system, sans-serif;
}

.empty-cta {
  margin-top: 40rpx;
  min-width: 280rpx;
  padding: 22rpx 48rpx;
  border-radius: 999rpx;
  background: linear-gradient(180deg, #ffbe77 0%, #ff9c31 100%);
  box-sizing: border-box;
}

.empty-cta text {
  font-size: 28rpx;
  color: #ffffff;
  font-weight: 600;
  font-family: OPPOSans-medium, OPPOSans, -apple-system, sans-serif;
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

.manage-multi-hint {
  margin: -12rpx 0 16rpx;
  padding-left: 4rpx;
}

.manage-multi-hint text {
  font-size: 22rpx;
  color: #9ca3af;
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

.thumb-mask--processing {
  padding-bottom: 20rpx;
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
  font-size: 28rpx;
  color: #ffffff;
  font-weight: 500;
  font-family: OPPOSans-medium, OPPOSans, -apple-system, sans-serif;
  line-height: 1.2;
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

.thumb-mask--processing .mini-track {
  position: relative;
  left: auto;
  right: auto;
  bottom: auto;
  width: 176rpx;
  height: 12rpx;
  margin-top: 26rpx;
  margin-left: auto;
  margin-right: auto;
  border-radius: 12rpx;
  background-color: rgba(235, 235, 235, 1);
}

.mini-fill {
  height: 100%;
  border-radius: 999rpx;
  background: #ff9835;
}

.thumb-mask--processing .mini-fill {
  border-radius: 12rpx;
}

.thumb-mask--failed {
  background: rgba(55, 15, 18, 0.72);
  justify-content: space-between;
  padding: 16rpx 8rpx 10rpx;
  box-sizing: border-box;
}

.thumb-failed__center {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 0;
}

.thumb-failed__mascot {
  width: 100rpx;
  height: 62rpx;
  flex-shrink: 0;
  display: block;
}

.thumb-failed__title {
  margin-top: 10rpx;
  font-size: 26rpx;
  font-weight: 700;
  color: #ffffff;
  line-height: 1.2;
}

.thumb-failed__actions {
  width: 100%;
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10rpx;
  padding-top: 8rpx;
}

.btn-failed {
  box-sizing: border-box;
  width: 200rpx;
  height: 54rpx;
  padding: 0;
  border-radius: 16rpx;
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: center;
  box-shadow: 0rpx 4rpx 12rpx 0rpx rgba(0, 0, 0, 0.4);
}

.btn-failed--retry {
  background-color: rgba(255, 255, 255, 1);
}

.btn-failed--retry .btn-failed__txt {
  color: #1f2937;
  font-size: 24rpx;
  font-weight: 400;
  font-family: OPPOSans-regular, OPPOSans, -apple-system, sans-serif;
}

.btn-failed--reason {
  background-color: rgba(253, 240, 240, 1);
  border: 1rpx solid rgba(255, 208, 201, 1);
}

.btn-failed--reason .btn-failed__txt {
  color: #ff4b30;
  font-size: 24rpx;
  font-weight: 400;
  font-family: OPPOSans-regular, OPPOSans, -apple-system, sans-serif;
}

.btn-failed__ico-img {
  flex-shrink: 0;
  display: block;
  margin-right: 10rpx;
}

.btn-failed__ico-img--retry {
  width: 28rpx;
  height: 28rpx;
}

.btn-failed__ico-img--reason {
  width: 28rpx;
  height: 28rpx;
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
  font-size: 18rpx;
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

/* 生成失败 · 查看原因（底部弹层，对齐设计稿布局） */
.fail-reason-mask {
  position: fixed;
  inset: 0;
  z-index: 104;
  background: rgba(0, 0, 0, 0.48);
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  align-items: stretch;
  box-sizing: border-box;
}

.fail-reason-panel {
  width: 100%;
  max-height: 92vh;
  background: #ffffff;
  border-radius: 32rpx 32rpx 0 0;
  box-sizing: border-box;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.fail-reason-panel__handle-wrap {
  flex-shrink: 0;
  padding-top: 16rpx;
  padding-bottom: 8rpx;
  display: flex;
  justify-content: center;
}

.fail-reason-panel__handle {
  width: 72rpx;
  height: 10rpx;
  border-radius: 5rpx;
  background: #e8e8e8;
}

.fail-reason-panel__body {
  flex: 1;
  min-height: 0;
  overflow-x: hidden;
  overflow-y: auto;
  padding: 8rpx 32rpx 24rpx;
  padding-bottom: calc(24rpx + constant(safe-area-inset-bottom));
  padding-bottom: calc(24rpx + env(safe-area-inset-bottom));
  box-sizing: border-box;
}

.fail-reason-panel__hero {
  display: block;
  width: 278rpx;
  height: 190rpx;
  margin: 4rpx auto 0;
  flex-shrink: 0;
}

.fail-reason-panel__title {
  display: block;
  text-align: center;
  margin-top: 20rpx;
  font-size: 36rpx;
  font-weight: 500;
  color: #1f2937;
  line-height: 1.3;
  font-family: OPPOSans-medium, OPPOSans, -apple-system, sans-serif;
}

.fail-reason-panel__sub {
  display: block;
  text-align: center;
  margin-top: 16rpx;
  font-size: 26rpx;
  color: #6b7280;
  line-height: 38rpx;
  font-family: OPPOSans-regular, OPPOSans, -apple-system, sans-serif;
}

.fail-reason-block--reason {
  width: 646rpx;
  height: 174rpx;
  margin: 32rpx auto 0;
  padding: 22rpx 20rpx 14rpx 38rpx;
  border-radius: 24rpx;
  box-sizing: border-box;
  background-color: rgba(253, 238, 219, 1);
  border: 1rpx solid rgba(255, 226, 184, 1);
  overflow-x: hidden;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
}

.fail-reason-block__label {
  display: block;
  width: 100%;
  text-align: left;
  font-size: 28rpx;
  font-weight: 500;
  color: #ff8d26;
  margin-bottom: 12rpx;
  line-height: 1.2;
  font-family: OPPOSans-medium, OPPOSans, -apple-system, sans-serif;
}

.fail-reason-block__lines {
  flex: 1;
  min-height: 0;
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  align-items: stretch;
  width: 100%;
  text-align: left;
}

.fail-reason-block__reason-row {
  display: flex;
  flex-direction: row;
  align-items: flex-start;
  width: 100%;
  text-align: left;
}

.fail-reason-block__dot {
  width: 12rpx;
  height: 12rpx;
  border-radius: 50%;
  background-color: rgba(31, 41, 55, 1);
  flex-shrink: 0;
  margin-right: 10rpx;
  margin-top: 14rpx;
}

.fail-reason-block__line {
  display: block;
  font-size: 24rpx;
  line-height: 40rpx;
  font-family: OPPOSans-regular, OPPOSans, -apple-system, sans-serif;
  text-align: left;
}

.fail-reason-block__reason-row .fail-reason-block__line {
  flex: 1;
  min-width: 0;
}

.fail-reason-block__line--follow {
  box-sizing: border-box;
  width: 100%;
  padding-left: 22rpx;
  margin-top: 8rpx;
}

.fail-reason-block__line--primary {
  color: #1f2937;
}

.fail-reason-block__line--muted {
  color: #6b7280;
}

.fail-reason-block--points {
  width: 646rpx;
  height: 92rpx;
  margin: 20rpx auto 0;
  padding: 0 20rpx 0 38rpx;
  border-radius: 24rpx;
  box-sizing: border-box;
  background-color: rgba(242, 255, 242, 1);
  border: 1rpx solid rgba(226, 246, 226, 1);
  display: flex;
  flex-direction: row;
  align-items: center;
}

.fail-reason-block__check-icon {
  width: 36rpx;
  height: 36rpx;
  flex-shrink: 0;
  margin-right: 14rpx;
  display: block;
}

.fail-reason-block__points-inner {
  flex: 1;
  min-width: 0;
}

.fail-reason-block__points-line {
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  align-items: center;
  line-height: 40rpx;
}

.fail-reason-block__points-prefix {
  font-size: 24rpx;
  color: #1f2937;
  font-family: OPPOSans-regular, OPPOSans, -apple-system, sans-serif;
}

.fail-reason-block__points-highlight {
  font-size: 24rpx;
  font-weight: 500;
  color: #2bb653;
  font-family: OPPOSans-medium, OPPOSans, -apple-system, sans-serif;
}

.fail-reason-panel__actions {
  margin-top: 20rpx;
  width: 646rpx;
  margin-left: auto;
  margin-right: auto;
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: flex-start;
  gap: 24rpx;
  box-sizing: border-box;
}

.fail-reason-panel__btn {
  display: flex;
  align-items: center;
  justify-content: center;
  box-sizing: border-box;
  flex-shrink: 0;
}

.fail-reason-panel__btn--ghost {
  width: 212rpx;
  height: 98rpx;
  border-radius: 24rpx;
  background-color: rgba(244, 244, 244, 1);
}

.fail-reason-panel__btn--ghost text {
  font-size: 32rpx;
  font-weight: 400;
  color: #1f2937;
  font-family: OPPOSans-regular, OPPOSans, -apple-system, sans-serif;
}

.fail-reason-panel__btn--primary {
  width: 410rpx;
  height: 98rpx;
  border-radius: 24rpx;
  background: linear-gradient(
    180deg,
    rgba(255, 197, 129, 1) 0%,
    rgba(255, 148, 50, 1) 100%
  );
}

.fail-reason-panel__btn--primary text {
  font-size: 32rpx;
  font-weight: 500;
  color: #1f2937;
  font-family: OPPOSans-medium, OPPOSans, -apple-system, sans-serif;
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
