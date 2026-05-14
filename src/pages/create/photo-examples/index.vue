<template>
  <view class="photo-ex-page">
    <view class="nav-bar" :style="createNavBarStyle">
      <view class="nav-left" @tap="goBack">
        <image class="back-icon" :src="createBackIcon" mode="aspectFit" />
        <text class="nav-title">照片示例</text>
      </view>
      <view class="nav-bar__gap" aria-hidden="true" />
    </view>

    <!-- 分类 Tab：横向滚动，选中粗体 + 底部橙色条 -->
    <view class="pe-tabs-wrap">
      <scroll-view
        scroll-x
        class="pe-tabs-scroll"
        :show-scrollbar="false"
        enable-flex
        :scroll-left="tabStripBindScrollLeft ? tabsScrollLeft : undefined"
        :scroll-into-view="tabsScrollIntoView"
        scroll-with-animation
        @scroll="onTabsScroll"
      >
        <view class="pe-tabs-inner">
          <view
            v-for="(cat, idx) in categories"
            :key="cat.key"
            :id="'peTab' + idx"
            class="pe-tab"
            :class="{ 'pe-tab--active': activeIndex === idx }"
            @tap="onTabTap(idx)"
          >
            <text class="pe-tab__label">{{ cat.label }}</text>
            <view v-if="activeIndex === idx" class="pe-tab__underline" />
          </view>
        </view>
      </scroll-view>
      <view class="pe-tabs-scroll-hit" @tap.stop="scrollTabsStripForward">
        <image
          class="pe-tabs-scroll-btn"
          :src="createPhotoExamplesTabScrollLeft"
          mode="aspectFit"
        />
      </view>
    </view>

    <scroll-view scroll-y class="pe-scroll">
      <view class="pe-inner">
        <!-- 正确 / 错误 对照 -->
        <view class="pe-compare">
          <view class="pe-column">
            <view class="pe-column-head pe-column-head--ok">
              <image
                class="pe-column-head__icon"
                :src="createPhotoExampleOkIcon"
                mode="aspectFit"
              />
              <text class="pe-column-title">正确示例</text>
            </view>
            <view class="pe-example-card">
              <view class="pe-card-img-wrap">
                <image
                  class="pe-card-img"
                  :src="current.correctImage"
                  mode="aspectFill"
                />
              </view>
              <view class="pe-card-foot pe-card-foot--ok">
                <view class="pe-card-foot__inner">
                  <image
                    class="pe-card-foot__icon-img"
                    :src="createPhotoExampleFootOkIcon"
                    mode="aspectFit"
                  />
                  <text class="pe-card-foot__txt">{{ current.correctFooter }}</text>
                </view>
              </view>
            </view>
          </view>

          <view class="pe-column">
            <view class="pe-column-head pe-column-head--bad">
              <image
                class="pe-column-head__icon"
                :src="createPhotoExampleBadIcon"
                mode="aspectFit"
              />
              <text class="pe-column-title">错误示例</text>
            </view>
            <view class="pe-example-card">
              <view class="pe-card-img-wrap">
                <image
                  class="pe-card-img"
                  :src="current.wrongImage"
                  mode="aspectFill"
                />
              </view>
              <view class="pe-card-foot pe-card-foot--bad">
                <view class="pe-card-foot__inner">
                  <image
                    class="pe-card-foot__icon-img"
                    :src="createPhotoExampleFootBadIcon"
                    mode="aspectFit"
                  />
                  <text class="pe-card-foot__txt">{{ current.wrongFooter }}</text>
                </view>
              </view>
            </view>
          </view>
        </view>

        <!-- 拍摄建议 -->
        <view class="pe-suggest">
          <view class="pe-suggest-head-strip">
            <view class="pe-suggest-head">
              <image
                class="pe-suggest-head__cam"
                :src="createSuggestHeadCamera"
                mode="aspectFit"
              />
              <view class="pe-suggest-head__titles">
                <text class="pe-suggest-head__main">拍摄建议</text>
                <text class="pe-suggest-head__sub">做好这3点，视频效果更好</text>
              </view>
            </view>
          </view>

          <view class="pe-suggest-tips">
            <block
              v-for="(tip, tidx) in current.tips"
              :key="tidx"
            >
              <view class="pe-tip-item">
                <view class="pe-tip-row">
                  <view class="pe-tip-icon">
                    <image
                      class="pe-tip-icon__img"
                      :src="suggestTipIconSrc(tip.iconVariant)"
                      mode="aspectFit"
                    />
                  </view>
                  <view class="pe-tip-body">
                    <text class="pe-tip-title">{{ tip.title }}</text>
                    <text class="pe-tip-desc">{{ tip.desc }}</text>
                  </view>
                </view>
                <view
                  v-if="tidx < current.tips.length - 1"
                  class="pe-tip-divider"
                />
              </view>
            </block>
          </view>

          <view class="pe-suggest-bottom">
            <view class="pe-suggest-bottom__inner">
              <image
                class="pe-suggest-bottom__icon"
                :src="createSuggestBottomTip"
                mode="aspectFit"
              />
              <text class="pe-suggest-bottom__txt">{{ current.bottomTip }}</text>
            </view>
          </view>
        </view>

        <view class="pe-scroll-bottom-space" />
      </view>
    </scroll-view>
  </view>
</template>

<script setup>
import { StaticPath } from '@/config'
import { computed, getCurrentInstance, nextTick, onMounted, ref } from 'vue'
import { onLoad, onReady } from '@dcloudio/uni-app'
import {
  getCreateNavBarInlineStyle,
  scheduleCreateNavBarStyleRefresh
} from '@/utils/create-nav-bar-style'
const createBackIcon = `${StaticPath}create/create-back-icon.png`
const createPhotoExamplesTabScrollLeft = `${StaticPath}create/create-photo-examples-tab-scroll-left.png`
const createSuggestHeadCamera = `${StaticPath}create/create-suggest-head-camera.png`
const createSuggestTipFrame = `${StaticPath}create/create-suggest-tip-frame.png`
const createSuggestTipBan = `${StaticPath}create/create-suggest-tip-ban.png`
const createSuggestTipSun = `${StaticPath}create/create-suggest-tip-sun.png`
const createSuggestBottomTip = `${StaticPath}create/create-suggest-bottom-tip.png`
const createPhotoExampleOkIcon = `${StaticPath}create/create-photo-example-ok-icon.png`
const createPhotoExampleBadIcon = `${StaticPath}create/create-photo-example-bad-icon.png`
const createPhotoExampleFootOkIcon = `${StaticPath}create/create-photo-example-foot-ok-icon.png`
const createPhotoExampleFootBadIcon = `${StaticPath}create/create-photo-example-foot-bad-icon.png`

const TAB_KEYS = ['facade', 'dish', 'env1', 'env2']

const createNavBarStyle = ref(getCreateNavBarInlineStyle())

const categories = [
  {
    key: 'facade',
    label: '门头照片',
    correctImage:
      'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=520&h=520&fit=crop',
    wrongImage:
      'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=520&h=520&fit=crop',
    correctFooter: '招牌清晰，光线充足',
    wrongFooter: '招牌被遮，光线昏暗',
    tips: [
      {
        iconVariant: 'frame',
        title: '拍摄清晰',
        desc: '整体看起来端正自然'
      },
      {
        iconVariant: 'ban',
        title: '招牌无遮挡',
        desc: '确保店名和招牌完整清晰，不要被树或障碍物遮挡'
      },
      {
        iconVariant: 'sun',
        title: '光线明亮',
        desc: '尽量在白天或灯光亮的时候拍摄，避免画面太暗'
      }
    ],
    bottomTip: '照片越清晰，生成的视频效果越好哦！'
  },
  {
    key: 'dish',
    label: '菜品照片',
    correctImage:
      'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=520&h=520&fit=crop',
    wrongImage:
      'https://images.unsplash.com/photo-1544025162-d76694265947?w=520&h=520&fit=crop&q=40',
    correctFooter: '色泽鲜亮，主体居中',
    wrongFooter: '模糊不清，构图杂乱',
    tips: [
      {
        iconVariant: 'frame',
        title: '对焦主体',
        desc: '菜品置于画面中心，近距离突出质感'
      },
      {
        iconVariant: 'ban',
        title: '避免遮挡',
        desc: '餐具、手部勿挡住菜品主体与招牌摆盘'
      },
      {
        iconVariant: 'sun',
        title: '光线柔和',
        desc: '优先自然光或明亮店内灯光，忌强反光与死黑阴影'
      }
    ],
    bottomTip: '菜品拍得诱人，成片转化更高哦！'
  },
  {
    key: 'env1',
    label: '环境照片01',
    correctImage:
      'https://images.unsplash.com/photo-1497366754035-f200968a6e72?w=520&h=520&fit=crop',
    wrongImage:
      'https://images.unsplash.com/photo-1550966871-9edbdc709498?w=520&h=520&fit=crop&q=35',
    correctFooter: '环境通透，层次分明',
    wrongFooter: '拥挤昏暗，主体不明',
    tips: [
      {
        iconVariant: 'frame',
        title: '横平竖直',
        desc: '保持地平线水平，画面稳定不歪斜'
      },
      {
        iconVariant: 'ban',
        title: '避开杂乱',
        desc: '收拾台面杂物，突出就餐氛围而非杂物堆'
      },
      {
        iconVariant: 'sun',
        title: '亮度均匀',
        desc: '开启店内照明，避免一侧过曝一侧死黑'
      }
    ],
    bottomTip: '环境越清爽，顾客越愿意进店打卡！'
  },
  {
    key: 'env2',
    label: '环境照片02',
    correctImage:
      'https://images.unsplash.com/photo-1559324824-26907029722e?w=520&h=520&fit=crop',
    wrongImage:
      'https://images.unsplash.com/photo-1560624052-449e5cd3e7fd?w=520&h=520&fit=crop&q=38',
    correctFooter: '细节清晰，氛围温馨',
    wrongFooter: '构图失衡，噪点明显',
    tips: [
      {
        iconVariant: 'frame',
        title: '特写适度',
        desc: '可拍软装细节，但保留空间感勿过于局部'
      },
      {
        iconVariant: 'ban',
        title: '勿对人脸特写',
        desc: '除非已获授权，避免清晰正面人像侵犯隐私'
      },
      {
        iconVariant: 'sun',
        title: '色温统一',
        desc: '同一组图尽量同一光源，方便成片色调一致'
      }
    ],
    bottomTip: '多角度补一张，成片镜头更丰富！'
  }
]

const activeIndex = ref(0)
/** 横向 Tab 滚动位置（px；右侧按钮步进 / 与 @scroll 同步） */
const tabsScrollLeft = ref(0)
/** 为 true 时才绑定 scroll-left；为 false 时让 scroll-into-view 生效（避免与受控 scroll-left 冲突） */
const tabStripBindScrollLeft = ref(true)
/** 微信 scroll-into-view 锚点 id（如 peTab0），用于点击 Tab 滚入可视区域 */
const tabsScrollIntoView = ref('')

const current = computed(() => categories[activeIndex.value] || categories[0])

/** 拍摄建议三条：frame / ban / sun 对应 PNG */
function suggestTipIconSrc(variant) {
  if (variant === 'frame') return createSuggestTipFrame
  if (variant === 'ban') return createSuggestTipBan
  return createSuggestTipSun
}

onLoad((query = {}) => {
  const tab = typeof query.tab === 'string' ? query.tab.trim() : ''
  const idx = TAB_KEYS.indexOf(tab)
  if (idx >= 0) activeIndex.value = idx
})

onMounted(() => scheduleCreateNavBarStyleRefresh(createNavBarStyle))
onReady(() => {
  scheduleCreateNavBarStyleRefresh(createNavBarStyle)
  nextTick(() => {
    setTimeout(() => requestTabScrollIntoView(activeIndex.value), 50)
  })
})

/**
 * 事件处理：onTabTap
 */
function onTabTap(idx) {
  activeIndex.value = idx
  requestTabScrollIntoView(idx)
}

/**
 * 使用微信 scroll-into-view 将对应 Tab 滚入可视区（避免与受控 scroll-left 冲突）
 */
function requestTabScrollIntoView(idx) {
  if (idx < 0 || idx >= categories.length) return
  tabStripBindScrollLeft.value = false
  tabsScrollIntoView.value = ''
  nextTick(() => {
    tabsScrollIntoView.value = `peTab${idx}`
    setTimeout(() => {
      tabStripBindScrollLeft.value = true
    }, 450)
  })
}

/**
 * 返回上一页
 */
function goBack() {
  uni.navigateBack({ fail: () => uni.switchTab({ url: '/pages/home/index' }) })
}

/** 右侧按钮：增大 scrollLeft，内容向左移，露出右侧被隐藏的 Tab（原先递减在 0 处无效） */
function scrollTabsStripForward() {
  tabStripBindScrollLeft.value = true
  const step = Math.round(uni.upx2px(280))
  const inst = getCurrentInstance()?.proxy

  const apply = (maxScroll) => {
    const cap =
      typeof maxScroll === 'number' && maxScroll >= 0
        ? maxScroll
        : Number.POSITIVE_INFINITY
    const cur = tabsScrollLeft.value
    const next = Math.min(cap, cur + step)
    if (next > cur + 0.5) {
      tabsScrollLeft.value = next
    }
  }

  if (!inst) {
    apply(Number.POSITIVE_INFINITY)
    return
  }

  uni
    .createSelectorQuery()
    .in(inst)
    .select('.pe-tabs-scroll')
    .boundingClientRect()
    .select('.pe-tabs-inner')
    .boundingClientRect()
    .exec((res) => {
      const wrap = res?.[0]
      const inner = res?.[1]
      let maxScroll = Number.POSITIVE_INFINITY
      if (
        wrap &&
        inner &&
        typeof wrap.width === 'number' &&
        typeof inner.width === 'number'
      ) {
        maxScroll = Math.max(0, inner.width - wrap.width)
      }
      apply(maxScroll)
    })
}

/**
 * 事件处理：onTabsScroll
 */
function onTabsScroll(e) {
  const left = e?.detail?.scrollLeft
  if (typeof left === 'number' && !Number.isNaN(left)) {
    tabsScrollLeft.value = left
  }
}
</script>

<style lang="scss" scoped>
.photo-ex-page {
  /* 真机 flex 子项需依赖确定高度，避免 scroll-view 高度为 0 导致整页空白 */
  min-height: 100vh;
  height: 100vh;
  display: flex;
  flex-direction: column;
  background: #ffffff;
  box-sizing: border-box;
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
  background: #ffffff;
}

.nav-left {
  flex: 1;
  min-width: 0;
  display: flex;
  align-items: center;
  gap: 12rpx;
}

.back-icon {
  width: 36rpx;
  height: 36rpx;
  flex-shrink: 0;
}

.nav-title {
  font-size: 34rpx;
  font-weight: 600;
  color: #1f2937;
}

.nav-bar__gap {
  flex-shrink: 0;
  width: 174rpx;
  height: 32rpx;
}

.pe-tabs-wrap {
  display: flex;
  flex-direction: row;
  align-items: center;
  padding: 8rpx 0 0;
  flex-shrink: 0;
  // border-bottom: 1rpx solid #f3f4f6;
}

.pe-tabs-scroll {
  flex: 1;
  min-width: 0;
  white-space: nowrap;
}

.pe-tabs-inner {
  display: inline-flex;
  flex-direction: row;
  align-items: flex-end;
  padding: 0 16rpx 0 30rpx;
  box-sizing: border-box;
}

.pe-tab {
  position: relative;
  flex-shrink: 0;
  padding-bottom: 16rpx;
  margin-right: 72rpx;
}

.pe-tab:last-child {
  margin-right: 0;
}

.pe-tab__label {
  font-size: 28rpx;
  color: #9ca3af;
  line-height: 40rpx;
}

.pe-tab--active .pe-tab__label {
  color: #111827;
  font-weight: 700;
}

.pe-tab__underline {
  position: absolute;
  left: 50%;
  bottom: 0;
  transform: translateX(-50%);
  width: 24rpx;
  height: 12rpx;
  border-radius: 10rpx;
  background-color: rgba(255, 170, 71, 1);
}

.pe-tabs-scroll-hit {
  flex-shrink: 0;
  padding: 8rpx 24rpx 8rpx 12rpx;
  box-sizing: border-box;
}

.pe-tabs-scroll-btn {
  display: block;
  width: 40rpx;
  height: 40rpx;
}

.pe-scroll {
  flex: 1;
  min-height: 0;
  overflow: hidden;
}

.pe-inner {
  padding: 44rpx 20rpx 0;
  box-sizing: border-box;
}

.pe-compare {
  display: flex;
  flex-direction: row;
  gap: 16rpx;
  align-items: flex-start;
  justify-content: space-between;
}

.pe-column {
  width: 344rpx;
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
  box-sizing: border-box;
}

.pe-column-head {
  display: flex;
  flex-direction: row;
  align-items: center;
  margin-bottom: 24rpx;
}

.pe-column-head__icon {
  width: 44rpx;
  height: 44rpx;
  flex-shrink: 0;
  margin-right: 12rpx;
}

.pe-column-title {
  font-size: 26rpx;
  font-weight: 600;
  color: #111827;
}

/** 图片 + 底部说明整体：344×436，外圆角 32rpx */
.pe-example-card {
  width: 344rpx;
  height: 436rpx;
  border-radius: 32rpx;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  box-sizing: border-box;
}

.pe-card-img-wrap {
  width: 344rpx;
  height: 344rpx;
  border-radius: 32rpx 32rpx 0 0;
  overflow: hidden;
  background: #f3f4f6;
  flex-shrink: 0;
  box-sizing: border-box;
}

.pe-card-img {
  width: 100%;
  height: 100%;
  display: block;
}

.pe-card-foot {
  width: 344rpx;
  height: 92rpx;
  margin-top: 0;
  padding: 0 12rpx;
  border-radius: 0 0 32rpx 32rpx;
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: center;
  box-sizing: border-box;
  flex-shrink: 0;
}

.pe-card-foot__inner {
  display: inline-flex;
  flex-direction: row;
  align-items: center;
  max-width: 100%;
  gap: 8rpx;
  box-sizing: border-box;
}

.pe-card-foot__icon-img {
  width: 36rpx;
  height: 36rpx;
  flex-shrink: 0;
}

.pe-card-foot--ok {
  background-color: rgba(242, 255, 242, 1);
  border: 2rpx solid rgba(226, 246, 226, 1);
}

.pe-card-foot--bad {
  background-color: rgba(253, 240, 240, 1);
  border: 2rpx solid rgba(249, 227, 227, 1);
}

.pe-card-foot__txt {
  min-width: 0;
  max-width: 100%;
  font-size: 24rpx;
  line-height: 1.4;
  color: #1f2937;
  font-family: OPPOSans-regular, OPPOSans, -apple-system, sans-serif;
}

.pe-suggest {
  width: 710rpx;
  height: 532rpx;
  min-height: 532rpx;
  max-height: 532rpx;
  margin: 36rpx auto 0;
  padding: 0;
  border-radius: 32rpx;
  background-color: rgba(255, 255, 255, 1);
  border: 1rpx solid rgba(241, 241, 241, 1);
  box-sizing: border-box;
  overflow-x: hidden;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  flex-shrink: 0;
}

.pe-suggest-head-strip {
  width: 100%;
  height: 84rpx;
  border-radius: 32rpx 32rpx 0 0;
  background-color: rgba(241, 241, 241, 1);
  flex-shrink: 0;
  box-sizing: border-box;
}

.pe-suggest-head {
  display: flex;
  flex-direction: row;
  align-items: center;
  height: 84rpx;
  padding: 0 24rpx;
  box-sizing: border-box;
  gap: 14rpx;
}

.pe-suggest-tips {
  display: flex;
  flex-direction: column;
  padding: 20rpx 24rpx 20rpx;
  flex: 1;
  min-height: 0;
  box-sizing: border-box;
}

.pe-tip-item {
  display: flex;
  flex-direction: column;
  width: 100%;
  box-sizing: border-box;
}

.pe-tip-divider {
  width: 650rpx;
  height: 2rpx;
  margin: 20rpx auto;
  background-color: rgba(255, 255, 255, 1);
  flex-shrink: 0;
}

.pe-suggest-head__cam {
  width: 36rpx;
  height: 36rpx;
  flex-shrink: 0;
}

.pe-suggest-head__titles {
  display: flex;
  flex-direction: row;
  align-items: center;
  flex-wrap: wrap;
  gap: 12rpx;
  min-width: 0;
}

.pe-suggest-head__main {
  font-size: 28rpx;
  text-align: left;
  font-family: OPPOSans-medium, OPPOSans, -apple-system, sans-serif;
  color: #1f2937;
  line-height: 1.2;
  flex-shrink: 0;
}

.pe-suggest-head__sub {
  font-size: 24rpx;
  text-align: left;
  font-family: OPPOSans-regular, OPPOSans, -apple-system, sans-serif;
  color: #6b7280;
  line-height: 1.35;
  flex: 1;
  min-width: 0;
}

.pe-tip-row {
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: flex-start;
  flex-shrink: 0;
}

.pe-tip-icon {
  width: 80rpx;
  height: 80rpx;
  margin-right: 28rpx;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  background-color: rgba(254, 237, 223, 1);
  box-sizing: border-box;
}

.pe-tip-icon__img {
  width: 48rpx;
  height: 48rpx;
  display: block;
}

.pe-tip-body {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 8rpx;
}

.pe-tip-title {
  font-size: 28rpx;
  font-weight: 600;
  color: #111827;
  line-height: 1.35;
}

.pe-tip-desc {
  font-size: 24rpx;
  color: #6b7280;
  line-height: 1.55;
}

.pe-suggest-bottom {
  margin-top: auto;
  width: 100%;
  height: 84rpx;
  padding: 0 24rpx;
  border-radius: 0 0 32rpx 32rpx;
  background-color: rgba(241, 241, 241, 1);
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: center;
  box-sizing: border-box;
  flex-shrink: 0;
}

.pe-suggest-bottom__inner {
  display: inline-flex;
  flex-direction: row;
  align-items: center;
  gap: 12rpx;
  max-width: 100%;
  box-sizing: border-box;
}

.pe-suggest-bottom__icon {
  width: 32rpx;
  height: 32rpx;
  flex-shrink: 0;
}

.pe-suggest-bottom__txt {
  font-size: 22rpx;
  line-height: 1.45;
  color: #6b7280;
  font-family: OPPOSans-regular, OPPOSans, -apple-system, sans-serif;
  min-width: 0;
}

.pe-scroll-bottom-space {
  height: 32rpx;
}
</style>
