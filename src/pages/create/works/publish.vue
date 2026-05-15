<template>
  <view class="publish-page">
    <CreateNavBar
      title="发布成片"
      variant="plain"
      :icon-title-gap="12"
      @back="goBack"
    />

    <scroll-view scroll-y class="publish-scroll">
      <view class="hero-card">
        <view class="hero-cover-wrap">
          <image class="hero-cover" :src="cover" mode="aspectFill" />
          <view class="hero-cover-meta">
            <text>{{ durationLabel || '30s' }}</text>
            <text>720P</text>
          </view>
        </view>
        <view class="hero-info">
          <text class="hero-title">探店 | PARK MOOD</text>
          <text class="hero-sub">环境氛围感分的宝藏小馆</text>
          <view class="hero-meta">
            <view class="hero-meta__k">
              <image class="hero-meta__icon" :src="publishMetaIconSuggestTime" mode="aspectFit" />
              <text>生成时长</text>
            </view>
            <text>2026.5.5 23:59</text>
          </view>
          <view class="hero-meta">
            <view class="hero-meta__k">
              <image class="hero-meta__icon" :src="publishMetaIconDuration" mode="aspectFit" />
              <text>视频时长</text>
            </view>
            <text>{{ durationLabel || '30s' }}</text>
          </view>
          <view class="hero-meta">
            <view class="hero-meta__k">
              <image class="hero-meta__icon" :src="publishMetaIconHd" mode="aspectFit" />
              <text>清晰度</text>
            </view>
            <text>720P</text>
          </view>
          <view class="hero-meta">
            <view class="hero-meta__k">
              <image class="hero-meta__icon" :src="publishMetaIconAd" mode="aspectFit" />
              <text>广告类型</text>
            </view>
            <text>探店</text>
          </view>
          <view class="hero-meta">
            <view class="hero-meta__k">
              <image class="hero-meta__icon" :src="publishMetaIconTime" mode="aspectFit" />
              <text>建议发布时间</text>
            </view>
            <text>15:00-17:00</text>
          </view>
        </view>
      </view>

      <view class="card card--yellow">
        <view class="card-head">
          <text class="card-title">AI效果预估</text>
          <text class="card-tag">基于历史大数据预估</text>
        </view>
        <view class="kpi-row">
          <view class="kpi-item">
            <text class="kpi-name">预测光量</text>
            <view class="kpi-value">
              <text class="kpi-value__main">1.3</text>
              <text class="kpi-value__unit">万</text>
            </view>
            <view class="kpi-tip">
              <text class="kpi-tip__label">超同类视频</text>
              <text class="kpi-tip__value">62%</text>
            </view>
          </view>
          <view class="kpi-item">
            <text class="kpi-name">预转化率</text>
            <view class="kpi-value">
              <text class="kpi-value__main">2.1</text>
              <text class="kpi-value__unit">%</text>
            </view>
            <view class="kpi-tip">
              <text class="kpi-tip__label">超同类视频</text>
              <text class="kpi-tip__value">25%</text>
            </view>
          </view>
          <view class="kpi-item">
            <text class="kpi-name">推荐人群</text>
            <text class="kpi-value kpi-value--text">附近5km用户</text>
            <view class="kpi-tip">
              <text class="kpi-tip__value">20-50</text>
              <text class="kpi-tip__label">岁为主</text>
            </view>
          </view>
        </view>
      </view>

      <view class="card card--pink">
        <view class="card-head">
          <text class="card-title">发布建议</text>
          <text class="card-tag card-tag--pink">AI智能推荐</text>
        </view>
        <view class="suggest-row">
          <view class="suggest-item">
            <view class="suggest-item__main">
              <view class="suggest-platform">
                <image
                  class="suggest-platform__ico"
                  :src="currentPublishActionIcon"
                  mode="aspectFit"
                />
                <view class="suggest-platform__txt">
                  <text class="suggest-t">推荐平台</text>
                  <text class="suggest-v suggest-v--platform">{{
                    currentPublishPlatform.name
                  }}</text>
                </view>
              </view>
            </view>
            <text class="suggest-tip">与一键成片所选平台一致</text>
          </view>
          <view class="suggest-item">
            <view class="suggest-item__main">
              <text class="suggest-t">最佳发布时间</text>
              <text class="suggest-v">15:00-17:00</text>
            </view>
            <text class="suggest-tip">平台流量高峰期</text>
          </view>
          <view class="suggest-item">
            <view class="suggest-item__main">
              <text class="suggest-t">当前发布成功率</text>
              <view class="suggest-success">
                <image class="suggest-icon-trend" :src="publishSuggestIconTrend" mode="aspectFit" />
                <text class="suggest-v">较高</text>
              </view>
            </view>
            <text class="suggest-tip">建议您尽快发布</text>
          </view>
        </view>
      </view>

      <view class="card card--blue">
        <view class="card-head">
          <text class="card-title">发布内容</text>
          <text class="card-tag card-tag--blue">可直接复制</text>
        </view>
        <view class="publish-content-box">
          <view class="publish-content-sheet publish-content-sheet--title">
            <view class="publish-content-sheet__main publish-content-col publish-content-col--split-inner">
              <text class="publish-content-label">标题</text>
              <view class="publish-content-split-v" />
              <text class="publish-content-main">{{ publishTitleText }}</text>
            </view>
            <view class="publish-content-copy-icon" @tap.stop="onCopyPublishTitle">
              <image
                class="publish-content-copy-icon__img"
                :src="publishContentIconCopy"
                mode="aspectFit"
              />
            </view>
          </view>
          <view class="publish-content-divider" />
          <view class="publish-content-sheet publish-content-sheet--copy">
            <view class="publish-content-sheet__main publish-content-col publish-content-col--split-inner">
              <view class="publish-content-label publish-content-label--duplex">
                <text class="publish-content-label__seg">文案</text>
                <text class="publish-content-label__seg">标签</text>
              </view>
              <view class="publish-content-split-v" />
              <view class="publish-content-copy-scroll">
                <view class="publish-content-copy-inner">
                  <view class="publish-content-copy-stack">
                    <text class="publish-content-desc">{{ publishCaptionText }}</text>
                    <text class="publish-content-tags">{{ publishTagsText }}</text>
                  </view>
                </view>
              </view>
            </view>
            <view class="publish-content-copy-icon" @tap.stop="onCopyPublishCaption">
              <image
                class="publish-content-copy-icon__img"
                :src="publishContentIconCopy"
                mode="aspectFit"
              />
            </view>
          </view>
        </view>
      </view>

      <view class="card card--visit-tips">
        <view class="card-title">提升到店率建议</view>
        <view class="suggest-row">
          <view class="suggest-item suggest-item--visit">
            <image
              class="visit-tip-item__icon"
              :src="publishVisitTipIconLocation"
              mode="aspectFit"
            />
            <view class="visit-tip-item__content">
              <text class="suggest-v visit-tip-item__title">记得添加位置</text>
              <text class="suggest-tip">方便用户找到店铺</text>
            </view>
          </view>
          <view class="suggest-item suggest-item--visit">
            <image class="visit-tip-item__icon" :src="publishVisitTipIconChat" mode="aspectFit" />
            <view class="visit-tip-item__content">
              <text class="suggest-v visit-tip-item__title">评论区引导</text>
              <text class="suggest-tip">“位置已发”，提高转化</text>
            </view>
          </view>
        </view>
      </view>

      <view class="card card--peach">
        <view class="card-head">
          <text class="card-title">发布步骤</text>
          <text class="card-tag publish-step-tag">简单3步搞定</text>
        </view>
        <view class="step-row">
          <view class="step-item">
            <view class="step-head">
              <image class="step-num-icon" :src="publishStepIcon1" mode="aspectFit" />
              <text class="step-v">保存视频</text>
            </view>
            <text class="suggest-tip">点击下载或保存</text>
          </view>
          <view class="step-item">
            <view class="step-head">
              <image class="step-num-icon" :src="publishStepIcon2" mode="aspectFit" />
              <text class="step-v">复制内容</text>
            </view>
            <text class="suggest-tip">复制标题/文案/标签</text>
          </view>
          <view class="step-item">
            <view class="step-head">
              <image class="step-num-icon" :src="publishStepIcon3" mode="aspectFit" />
              <text class="step-v">打开{{ currentPublishPlatform.name }}</text>
            </view>
            <text class="suggest-tip">点击“+”开始发布</text>
          </view>
        </view>
      </view>
      <text class="footer-hint">* 内容仅AI生成，需上传前确认无违法违规内容</text>
      <view class="bottom-gap" />
    </scroll-view>

    <view class="publish-actions">
      <view class="publish-actions__row">
        <view class="act act--save" @tap="onSave">
          <image class="act-save__icon" :src="publishActionIconSave" mode="aspectFit" />
          <text>保存视频</text>
        </view>
        <view class="act act--dark" @tap="onPublishToPlatform">
          <view class="act-dy">
            <image
              class="act-dy__icon"
              :src="currentPublishActionIcon"
              mode="aspectFit"
            />
            <view class="act-dy__split" />
            <view class="act-dy__txt">
              <text class="act-dy__main">去{{ currentPublishPlatform.name }}发布</text>
              <text class="act-dy__sub">发布前建议复制文案</text>
            </view>
          </view>
        </view>
      </view>
      <view class="publish-actions__hint">
        <text class="publish-actions__hint-icon">!</text>
        <text class="publish-actions__hint-text">内容由AI生成，需上传前确认无违法违规内容</text>
      </view>
    </view>
  </view>
</template>

<script setup>
import CreateNavBar from '@/pages/create/components/CreateNavBar.vue'
import { StaticPath } from '@/config'
import { computed, ref } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
import {
  CREATE_SELECTED_PLATFORM_STORAGE_KEY,
  PLATFORM_OPTIONS
} from '@/constants/create-selected-platform'
const publishMetaIconTime = `${StaticPath}create/publish-meta-icon-time.png`
const publishMetaIconDuration = `${StaticPath}create/publish-meta-icon-duration.png`
const publishMetaIconHd = `${StaticPath}create/publish-meta-icon-hd.png`
const publishMetaIconAd = `${StaticPath}create/publish-meta-icon-ad.png`
const publishMetaIconSuggestTime = `${StaticPath}create/publish-meta-icon-suggest-time.png`
const publishSuggestIconTrend = `${StaticPath}create/publish-suggest-icon-trend.png`
const publishPlatformDouyin = `${StaticPath}create/publish-platform-douyin.png`
const publishPlatformKuaishou = `${StaticPath}create/publish-platform-kuaishou.png`
const publishPlatformShipinhao = `${StaticPath}create/publish-platform-shipinhao.png`
const publishPlatformXiaohongshu = `${StaticPath}create/publish-platform-xiaohongshu.png`
const publishContentIconCopy = `${StaticPath}create/publish-content-icon-copy.png`
const publishVisitTipIconLocation = `${StaticPath}create/publish-visit-tip-icon-location.png`
const publishVisitTipIconChat = `${StaticPath}create/publish-visit-tip-icon-chat.png`
const publishStepIcon1 = `${StaticPath}create/publish-step-icon-1.png`
const publishActionIconSave = `${StaticPath}create/publish-action-icon-save.png`
const publishStepIcon2 = `${StaticPath}create/publish-step-icon-2.png`
const publishStepIcon3 = `${StaticPath}create/publish-step-icon-3.png`

const platformOptions = PLATFORM_OPTIONS

const platformIconById = {
  douyin: publishPlatformDouyin,
  kuaishou: publishPlatformKuaishou,
  shipinhao: publishPlatformShipinhao,
  xiaohongshu: publishPlatformXiaohongshu
}

const selectedPlatformId = ref('douyin')

const currentPublishPlatform = computed(() => {
  const hit = platformOptions.find((p) => p.id === selectedPlatformId.value)
  return hit || platformOptions[0]
})

const currentPublishActionIcon = computed(
  () => platformIconById[currentPublishPlatform.value.id] || publishPlatformDouyin
)

const cover = ref('https://images.unsplash.com/photo-1497366754035-f200968a6e72?w=400&h=300&fit=crop')
const durationLabel = ref('30s')
/** 文案标签区：上文案描述（可接接口） */
const publishCaptionText = ref('下午阳光刚好，氛围直接拉满！重点是现在有优惠活动，快来打卡！')
/** 文案标签区：下带 # 的快捷标签（可接接口） */
const publishTagsText = ref(
  '#咖啡 #探店 #氛围感 #拍照打卡 #城市生活 #下午茶 #约会圣地'
)
/** 标题区正文（可接接口） */
const publishTitleText = ref('藏在巷子里的神仙咖啡，终于被我找到了！')

onLoad((query = {}) => {
  if (query.cover) cover.value = decodeURIComponent(query.cover)
  if (query.duration) durationLabel.value = decodeURIComponent(query.duration)
  if (query.platform) {
    const pid = decodeURIComponent(String(query.platform))
    if (platformOptions.some((p) => p.id === pid)) {
      selectedPlatformId.value = pid
    }
  } else {
    try {
      const saved = uni.getStorageSync(CREATE_SELECTED_PLATFORM_STORAGE_KEY)
      if (saved && platformOptions.some((p) => p.id === saved)) {
        selectedPlatformId.value = saved
      }
    } catch (_) {
      /* 忽略 */
    }
  }
})

/**
 * 返回上一页
 */
function goBack() {
  uni.navigateBack({ fail: () => uni.switchTab({ url: '/pages/home/index' }) })
}
/**
 * 事件处理：onSave
 */
function onSave() {
  uni.showToast({ title: '视频已保存', icon: 'none' })
}
/**
 * 事件处理：onPublishToPlatform
 */
function onPublishToPlatform() {
  const name = currentPublishPlatform.value?.name || '平台'
  uni.showToast({ title: `即将打开${name}发布`, icon: 'none' })
}

/**
 * 事件处理：onCopyPublishTitle
 */
function onCopyPublishTitle() {
  uni.setClipboardData({
    data: String(publishTitleText.value || ''),
    success: () => uni.showToast({ title: '已复制', icon: 'none' })
  })
}

/**
 * 事件处理：onCopyPublishCaption
 */
function onCopyPublishCaption() {
  const caption = String(publishCaptionText.value || '').trim()
  const tags = String(publishTagsText.value || '').trim()
  uni.setClipboardData({
    data: [caption, tags].filter(Boolean).join('\n'),
    success: () => uni.showToast({ title: '已复制', icon: 'none' })
  })
}
</script>

<style lang="scss" scoped>
.publish-page { min-height: 100vh; background: #fffaf3; display: flex; flex-direction: column; }
.publish-scroll { flex: 1; padding: 16rpx 16rpx 0; box-sizing: border-box; }
.hero-card { display:flex; gap:26rpx; padding-right:48rpx; box-sizing:border-box; }
.hero-cover-wrap { position: relative; width: 244rpx; height: 336rpx; flex-shrink: 0; }
.hero-cover { width: 244rpx; height: 336rpx; border-radius: 24rpx; background:#eee; box-shadow: 0 8rpx 20rpx rgba(0,0,0,0.08); }
.hero-cover-meta {
  position: absolute;
  left: 12rpx;
  bottom: 12rpx;
  display: flex;
  align-items: center;
  gap: 10rpx;
}

.hero-cover-meta text {
  box-sizing: border-box;
  height: 40rpx;
  line-height: 40rpx;
  padding: 0 12rpx;
  border-radius: 12rpx;
  background-color: rgba(0, 0, 0, 1);
  color: #ffffff;
  font-size: 22rpx;
  font-weight: 600;
}
.hero-info { flex:1; min-width:0; }
.hero-title { font-size:32rpx; color:#1f2937; font-family:'OPPOSans-medium'; font-weight:500; display:block; line-height:1.1; }
.hero-sub { font-size:28rpx; color:#4b5563; display:block; margin-top:14rpx; margin-bottom:48rpx; }
.hero-meta { display:flex; justify-content:space-between; color:#7b8190; font-size:24rpx; margin-top:12rpx; }
.hero-meta__k { color:#8f95a3; display:flex; align-items:center; gap:6rpx; }
.hero-meta__icon { width: 28rpx; height: 28rpx; display:block; flex-shrink:0; }
.card { margin-top:16rpx; border-radius:20rpx; padding:16rpx; background:#fff7f0; box-shadow: 0 4rpx 16rpx rgba(0,0,0,0.03); }
.card--yellow {
  margin-top: 34rpx;
  width: 710rpx;
  height: 254rpx;
  border-radius: 28rpx;
  background-color: rgba(255, 241, 219, 1);
  border: 1rpx solid rgba(255, 236, 215, 1);
  box-sizing: border-box;
}
.card--pink {
  width: 710rpx;
  height: 254rpx;
  border-radius: 28rpx;
  background-color: rgba(255, 233, 229, 1);
  border: 1rpx solid rgba(255, 230, 230, 1);
  box-sizing: border-box;
}
.card--blue { background:#e9f7ff; }
.card.card--peach {
  margin-top: 20rpx;
  background: #fff3eb;
  margin-bottom: 104rpx;
}
.card.card--visit-tips {
  margin-top: 20rpx;
  width: 710rpx;
  height: 192rpx;
  border-radius: 28rpx;
  background-color: rgba(255, 241, 219, 1);
  border: 2rpx solid rgba(255, 236, 215, 1);
  box-sizing: border-box;
  box-shadow: none;
  padding: 12rpx 16rpx;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}
.card--visit-tips .card-title {
  flex-shrink: 0;
  margin-bottom: 8rpx;
}
.card--visit-tips .suggest-row {
  flex: 1;
  min-height: 0;
  align-items: center;
}
.card--visit-tips .suggest-item {
  flex: 0 0 334rpx;
  width: 334rpx;
  height: 102rpx;
  border-radius: 16rpx;
  background-color: rgba(255, 255, 255, 1);
  box-shadow: 0rpx 4rpx 12rpx 0rpx rgba(0, 0, 0, 0.07);
  box-sizing: border-box;
  padding: 10rpx 12rpx;
  align-self: center;
}
.card--visit-tips .suggest-item--visit {
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 18rpx;
}
.card--visit-tips .visit-tip-item__icon {
  width: 60rpx;
  height: 60rpx;
  flex-shrink: 0;
  display: block;
}
.card--visit-tips .visit-tip-item__content {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
}
.card--visit-tips .visit-tip-item__title {
  margin-top: 0;
  font-size: 26rpx;
  line-height: 32rpx;
  color: #1f2937;
  font-family: OPPOSans-regular;
  font-weight: 400;
}
.card--visit-tips .visit-tip-item__content .suggest-tip {
  margin-top: 4rpx;
  width: auto;
  height: auto;
  min-height: 0;
  border-radius: 0;
  background-color: transparent;
  color: #6b7280;
  font-size: 20rpx;
  line-height: 32rpx;
  font-family: OPPOSans-regular;
  text-align: left;
  padding: 0;
}
.card-head { display:flex; align-items:center; gap:10rpx; margin-bottom:12rpx; }
.card-title { font-size:30rpx; font-weight:700; color:#1f2937; }
.card-tag { font-size:20rpx; color:#f59e0b; background:#ffe8c8; border-radius:8rpx; padding:2rpx 8rpx; }
.card-tag--pink { color:#ff6a6a; background:#ffe2e2; }
.card-tag--blue { color:#53a0de; background:#d8efff; }

/* 发布步骤：标题右侧标签（覆盖通用 .card-tag） */
.card.card--peach .publish-step-tag {
  box-sizing: border-box;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: auto;
  min-width: 112rpx;
  height: 32rpx;
  padding: 0 12rpx;
  line-height: 26rpx;
  border-radius: 8rpx;
  background-color: rgba(255, 215, 215, 1);
  color: rgba(244, 99, 99, 1);
  font-size: 18rpx;
  text-align: center;
  font-family: PingFangSC-regular, PingFang SC, -apple-system, sans-serif;
}
.kpi-row, .suggest-row, .step-row { display:flex; gap:10rpx; }
.kpi-row {
  width: 682rpx;
  height: 166rpx;
  border-radius: 16rpx;
  background-color: rgba(255, 255, 255, 1);
  box-shadow: 0rpx 2rpx 6rpx 0rpx rgba(0, 0, 0, 0.07);
  box-sizing: border-box;
  gap: 0;
  justify-content: space-between;
  padding: 0 38rpx;
}
.kpi-item {
  position: relative;
  flex: 0 0 auto;
  min-width: 0;
  padding: 12rpx 14rpx;
  font-size: 22rpx;
  color: #374151;
  min-height: 108rpx;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  justify-content: center;
}
.kpi-item:nth-child(1) { width: 192rpx; }
.kpi-item:nth-child(2) { width: 192rpx; }
.kpi-item:nth-child(3) { width: 280rpx; }

/* 预转化率、推荐人群：与左侧竖向分隔线间距 34rpx */
.kpi-item:nth-child(2),
.kpi-item:nth-child(3) {
  padding-left: 34rpx;
}
.kpi-item:not(:last-child) {
  border-right: none;
}
.kpi-item:not(:last-child)::after {
  content: '';
  position: absolute;
  right: 0;
  top: 50%;
  transform: translateY(-50%);
  width: 2rpx;
  height: 106rpx;
  background: #fff1db;
}
.suggest-item, .step-item { background:#fff; border-radius:14rpx; padding:12rpx; font-size:22rpx; color:#374151; min-height:108rpx; box-sizing:border-box; }
.step-item { flex:1; }
.suggest-item {
  width: 218rpx;
  height: 166rpx;
  border-radius: 16rpx;
  background-color: rgba(255, 255, 255, 1);
  box-shadow: 0rpx 4rpx 12rpx 0rpx rgba(0, 0, 0, 0.07);
  flex: 0 0 auto;
  padding: 14rpx;
}

/* 发布建议：三列模块顶部内边距；上区垂直居中、左对齐，底标签单行省略 */
.card--pink .suggest-item {
  padding-top: 26rpx;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  align-items: stretch;
}

/* 发布建议·第一列：平台区整体距列左 30rpx（列本身仍为 14rpx 内边距，底标签左距与其它列一致） */
.card--pink .suggest-item:first-child .suggest-platform {
  margin-left: 16rpx; /* 14 + 16 = 30 */
}

.card--pink .suggest-item__main {
  flex: 1;
  min-height: 0;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: flex-start;
  width: 100%;
  box-sizing: border-box;
  text-align: left;
}

.card--pink .suggest-item__main .suggest-t,
.card--pink .suggest-item__main .suggest-v {
  text-align: left;
  width: 100%;
}

.suggest-platform {
  display: flex;
  align-items: center;
  gap: 14rpx;
  margin-top: 6rpx;
}

.suggest-platform__txt {
  display: flex;
  flex-direction: column;
}

.suggest-v--platform {
  margin-top: 4rpx;
}

.suggest-platform__ico {
  width: 56rpx;
  height: 56rpx;
  flex-shrink: 0;
  display: block;
}
.kpi-name { display:block; font-size: 18rpx; color: #1f2937; }
.kpi-value { display:flex; align-items:flex-end; gap:2rpx; margin-top:12rpx; color:#1f2937;margin-bottom: 14rpx; }
.kpi-value__main { font-size:32rpx; font-weight:700; color:#1f2937; line-height:1; }
.kpi-value__unit { font-size:24rpx; font-weight:400; color:#1f2937; line-height:1; }
.kpi-value--text { display:block; font-size:32rpx; font-weight:700; color:#1f2937; line-height:1.1; }
.kpi-tip { display:flex; align-items:center; gap:2rpx; margin-top:4rpx; }
.kpi-tip__label { font-size:18rpx; color:#9ca3af; line-height:1; }
.kpi-tip__value { font-size:18rpx; color:#ed903c; line-height:1; }
.suggest-t { display:block; color:#6b7280; font-size:20rpx; }
.suggest-v { display:block; margin-top:6rpx; color:#1f2937; font-size:30rpx; font-weight:700; line-height:1.1; }
.suggest-success { display: flex; align-items: center; gap: 8rpx; margin-top: 6rpx; }
.suggest-icon-trend { width: 34rpx; height: 34rpx; display: block; flex-shrink: 0; }
.suggest-success .suggest-v { margin-top: 0; }
/* 发布建议·最佳发布时间下方时段：行高 40rpx，与上文案间距 6rpx */
.card--pink .suggest-item:nth-child(2) .suggest-item__main > .suggest-v {
  line-height: 40rpx;
  margin-top: 6rpx;
}
.suggest-tip {
  margin-top: 8rpx;
  width: 190rpx;
  height: 32rpx;
  border-radius: 8rpx;
  background-color: rgba(255, 230, 230, 1);
  color: rgba(244, 99, 99, 1);
  font-size: 18rpx;
  line-height: 32rpx;
  text-align: center;
  display: block;
  box-sizing: border-box;
}

/* 发布建议：底标签左对齐、单行省略；宽度随卡片内边距占满 */
.card--pink .suggest-tip {
  width: 100%;
  max-width: 100%;
  padding: 0 8rpx;
  text-align: left;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

/* 发布建议：底部标签与上方主内容间距 */
.card--pink .suggest-item > .suggest-tip {
  flex-shrink: 0;
  margin-top: 20rpx;
}
/* 发布步骤：说明文案无标签底，纯文本 */
.card--peach .step-item .suggest-tip {
  display: block;
  width: auto;
  height: auto;
  min-height: 0;
  border-radius: 0;
  background-color: transparent;
  color: rgba(107, 114, 128, 1);
  font-size: 20rpx;
  line-height: 32rpx;
  font-family: OPPOSans-regular;
  font-weight: 400;
  text-align: left;
  padding: 0;
  box-sizing: border-box;
}
.card--peach .step-item {
  padding: 20rpx;
  box-sizing: border-box;
}
.card--peach .step-head {
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 8rpx;
}
.card--peach .step-num-icon {
  width: 32rpx;
  height: 32rpx;
  flex-shrink: 0;
  display: block;
}
.card--peach .step-head .step-v {
  margin-top: 0;
  display: block;
  line-height: 32rpx;
  color: rgba(31, 41, 55, 1);
  font-size: 26rpx;
  font-family: OPPOSans-regular;
  font-weight: 400;
}
.step-v { display:block; color:#1f2937; font-size:26rpx; font-weight:700; }
.publish-content-box {
  margin-top: 10rpx;
  display: flex;
  flex-direction: column;
  align-items: stretch;
  background: transparent;
  padding: 0;
  box-sizing: border-box;
}
.publish-content-col {
  width: 100%;
  min-width: 0;
  display: flex;
  flex-direction: row;
  align-items: flex-start;
  gap: 12rpx;
}
.publish-content-col--split-inner {
  gap: 0;
}
.publish-content-sheet {
  align-self: center;
  box-sizing: border-box;
  width: 682rpx;
  display: flex;
  flex-direction: row;
  align-items: stretch;
  border-radius: 16rpx;
  overflow: hidden;
  box-shadow: 0rpx 2rpx 6rpx 0rpx rgba(0, 0, 0, 0.07);
}

.publish-content-sheet--title {
  height: 76rpx;
}

.publish-content-sheet__main {
  flex: 1;
  min-width: 0;
  background-color: rgba(255, 255, 255, 1);
}

.publish-content-sheet--title .publish-content-sheet__main {
  align-items: center;
  padding-left: 20rpx;
}

.publish-content-sheet--copy {
  height: 262rpx;
}

.publish-content-sheet--copy .publish-content-sheet__main {
  align-items: stretch;
  padding-left: 20rpx;
  /* 与复制区间的 36rpx 留在白底内，避免 flex gap 透出卡片底色 */
  padding-right: 36rpx;
}

.publish-content-copy-icon {
  flex-shrink: 0;
  width: 78rpx;
  background-color: rgba(137, 137, 137, 1);
  border-radius: 0rpx 16rpx 16rpx 0rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  box-sizing: border-box;
}

.publish-content-sheet--title .publish-content-copy-icon {
  height: 76rpx;
}

.publish-content-sheet--copy .publish-content-copy-icon {
  align-self: stretch;
}

.publish-content-copy-icon__img {
  width: 44rpx;
  height: 44rpx;
  display: block;
  flex-shrink: 0;
}

.publish-content-sheet--title .publish-content-split-v {
  align-self: center;
  width: 2rpx;
  height: 32rpx;
  background-color: #ebebeb;
}

.publish-content-sheet--title .publish-content-label {
  align-self: center;
  line-height: 76rpx;
}

.publish-content-sheet--title .publish-content-main {
  flex: 0 0 476rpx;
  width: 476rpx;
  max-width: 476rpx;
  min-width: 0;
  box-sizing: border-box;
  align-self: center;
  line-height: 76rpx;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.publish-content-sheet--copy .publish-content-label--duplex {
  align-self: center;
}

.publish-content-sheet--copy .publish-content-split-v {
  align-self: center;
  width: 2rpx;
  height: 218rpx;
  background-color: #ebebeb;
}
/* 内高 = 262(card) - 14*2(pad)，与微信小程序 flex 子项 height:100% 未展开时配合 margin:auto 垂直居中 */
.publish-content-copy-scroll {
  flex: 1 1 0;
  width: 0;
  min-width: 0;
  min-height: 0;
  height: 234rpx;
  max-height: 234rpx;
  box-sizing: border-box;
  overflow-y: auto;
  align-self: stretch;
  display: flex;
  flex-direction: column;
}
.publish-content-copy-inner {
  margin-top: auto;
  margin-bottom: auto;
  width: 100%;
  flex-shrink: 0;
  box-sizing: border-box;
}
.publish-content-copy-stack {
  display: flex;
  flex-direction: column;
  gap: 22rpx;
  width: 100%;
  box-sizing: border-box;
}
.publish-content-desc {
  display: block;
  width: 100%;
  box-sizing: border-box;
  color: #4b5563;
  font-size: 24rpx;
  line-height: 1.5;
}
.publish-content-tags {
  display: block;
  width: 100%;
  box-sizing: border-box;
  font-size: 24rpx;
  line-height: 1.5;
  color: rgba(28, 75, 140, 1);
}
.publish-content-split-v {
  flex-shrink: 0;
  width: 1rpx;
  align-self: stretch;
  margin: 0 12rpx;
  background: #ebebeb;
}
.publish-content-divider {
  flex-shrink: 0;
  height: 1rpx;
  margin: 14rpx 0;
  width: 100%;
  align-self: stretch;
  background: #ebebeb;
}
.publish-content-label {
  flex-shrink: 0;
  flex-grow: 0;
  box-sizing: border-box;
  width: 84rpx;
  display: block;
  color: #374151;
  font-size: 24rpx;
  font-weight: 600;
  line-height: 1.35;
}
.publish-content-label--duplex {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
}
.publish-content-label__seg {
  display: block;
  color: #374151;
  font-size: 24rpx;
  font-weight: 600;
  line-height: 1.35;
}
.publish-content-main {
  flex: 1;
  min-width: 0;
  display: block;
  color: #4b5563;
  font-size: 24rpx;
  line-height: 1.5;
}
.footer-hint { margin-top: 18rpx; display:block; text-align:center; font-size:20rpx; color:#9ca3af; }
.publish-actions { position: fixed; left:0; right:0; bottom:0; padding:32rpx 16rpx calc(10rpx + env(safe-area-inset-bottom)); background:#fff; box-shadow: 0 -8rpx 24rpx rgba(0,0,0,0.06); }
.publish-actions__row { display:flex; align-items:center; justify-content:center; gap:30rpx; }
.publish-actions__hint { margin-top:22rpx; display:flex; align-items:center; justify-content:center; gap:8rpx; }
.publish-actions__hint-icon { width:22rpx; height:22rpx; border-radius:11rpx; border:1rpx solid #c4c9d1; color:#a5acb8; font-size:16rpx; line-height:22rpx; text-align:center; box-sizing:border-box; }
.publish-actions__hint-text { font-size:20rpx; color:#9ca3af; line-height:1; }
.act { flex:1; height:88rpx; border-radius:44rpx; display:flex; align-items:center; justify-content:center; font-size:32rpx; font-weight:700; }
.act--save {
  flex: 0 0 284rpx;
  width: 284rpx;
  height: 98rpx;
  border-radius: 76rpx;
  background-color: rgba(212, 212, 212, 1);
  color: rgba(31, 41, 55, 1);
  font-size: 32rpx;
  font-family: OPPOSans-medium, OPPOSans, -apple-system, sans-serif;
  font-weight: 500;
  gap: 12rpx;
}
.act-save__icon {
  width: 36rpx;
  height: 36rpx;
  flex-shrink: 0;
  display: block;
}
.act--dark {
  flex: 0 0 372rpx;
  width: 372rpx;
  height: 98rpx;
  border-radius: 50rpx;
  background: linear-gradient(180deg, rgba(255, 197, 129, 1) 0%, rgba(255, 148, 50, 1) 100%);
  color: #fff;
}
.act-dy { display:flex; align-items:center; gap: 0; }
.act-dy__icon {
  width: 56rpx;
  height: 56rpx;
  flex-shrink: 0;
  display: block;
}
.act-dy__split {
  width: 2rpx;
  height: 40rpx;
  margin-left: 30rpx;
  margin-right: 30rpx;
  flex-shrink: 0;
  box-sizing: border-box;
  background-color: rgba(255, 255, 255, 0.5);
}
.act-dy__txt { display:flex; flex-direction:column; line-height:1; }
.act-dy__main {
  line-height: 46rpx;
  color: rgba(31, 41, 55, 1);
  font-size: 32rpx;
  font-family: OPPOSans-medium, OPPOSans, -apple-system, sans-serif;
  font-weight: 500;
}
.act-dy__sub {
  margin-top: 4rpx;
  line-height: 32rpx;
  color: rgba(255, 255, 255, 0.69);
  font-size: 18rpx;
  font-family: OPPOSans-regular, OPPOSans, -apple-system, sans-serif;
  font-weight: 400;
}
.bottom-gap { height: 154rpx; }
</style>
