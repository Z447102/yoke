<template>
  <!-- 一键成片 · 主营业务：按行业拉取类目树，逐级单选/展开（api/getBusinessCategories） -->
  <view class="business-page">
    <view class="nav-bar" :style="createNavBarStyle">
      <view class="nav-left" @tap="goBack">
        <image class="back-icon" :src="createBackIcon" mode="aspectFit" />
        <text class="back-text">主营业务</text>
      </view>
      <view class="nav-bar__gap" aria-hidden="true" />
    </view>

    <view class="industry-trigger" @tap="openIndustryPicker">
      <text class="industry-trigger__text">{{ industryRowLabel }}</text>
      <image
        class="industry-trigger__arrow"
        :src="createIconArrowDown"
        mode="aspectFit"
      />
    </view>

    <view v-if="showCategorySection" class="category-section">
      <view
        v-for="(level, levelIndex) in visibleLevels"
        :key="levelIndex"
        class="level-block"
      >
        <view class="category-title">
          <text>{{ level.title }}</text>
          <text class="required">*</text>
        </view>

        <view class="tag-list">
          <view
            v-for="category in level.options"
            :key="category.id"
            class="category-tag"
            :class="{ active: selectedPath[levelIndex]?.id === category.id }"
            @tap="selectCategory(levelIndex, category)"
          >
            <text>+ {{ category.name }}</text>
          </view>
        </view>
      </view>
    </view>

    <view class="bottom-action">
      <button
        class="confirm-btn"
        :class="{ 'confirm-btn--ready': canConfirm }"
        @tap="confirmSelection"
      >
        确定
      </button>
      <view class="tips">
        <image
          class="tips-icon"
          :src="createIconAttention"
          mode="aspectFill"
        />
        <text class="tips-text">后续可在【我的 - 商业信息】内修改</text>
      </view>
    </view>

    <view v-if="showIndustryPopup" class="industry-sheet-mask" @tap="closeIndustryPicker">
      <view class="industry-sheet" @tap.stop>
        <view class="industry-sheet__handle"></view>
        <view class="industry-sheet__title">选择行业</view>
        <view class="industry-sheet__grid">
          <view
            v-for="name in CREATE_INDUSTRY_OPTIONS"
            :key="name"
            class="industry-sheet__item"
            :class="{ 'industry-sheet__item--active': tempIndustry === name }"
            @tap="tempIndustry = name"
          >
            {{ name }}
          </view>
        </view>
        <button class="industry-sheet__confirm" @tap="confirmIndustryPicker">确定</button>
      </view>
    </view>
  </view>
</template>

<script setup>
import { StaticPath } from '@/config'
/**
 * 【一键成片 · 主营业务选择】按接口 levels 动态渲染；选完回写 storage 并返回上页。
 */
import { computed, ref, onMounted } from 'vue'
import { onLoad, onReady } from '@dcloudio/uni-app'
import { getBusinessCategories } from '@/api/create'
import { listSecondTags, mapTagRowsToLeafCategoryNodes } from '@/api/metadata'
import { CREATE_INDUSTRY_OPTIONS } from '@/constants/create'
import { isApiEnabled } from '@/utils/request'
import {
  getCreateNavBarInlineStyle,
  scheduleCreateNavBarStyleRefresh
} from '@/utils/create-nav-bar-style'
import {
  hidePageLoading,
  showPageLoading
} from '@/utils/page-loading'
const createBackIcon = `${StaticPath}create/create-back-icon.png`
const createIconArrowDown = `${StaticPath}create/create-icon-arrow-down.png`
const createIconAttention = `${StaticPath}create/create-icon-attention.png`

const createNavBarStyle = ref(getCreateNavBarInlineStyle())
onMounted(() => scheduleCreateNavBarStyleRefresh(createNavBarStyle))
onReady(() => scheduleCreateNavBarStyleRefresh(createNavBarStyle))

const industry = ref('餐饮')
/** add / edit：均可点行或底部面板更换行业 */
const pageIntent = ref('add')
/**
 * 一键成片生成页 · 新增主营业务：不传行业，不预勾选类目；选完行业后才能操作一二级标签
 * （来自 ?from=generate-add）
 */
const freshAddFromGenerate = ref(false)
const categoryTree = ref([])
const selectedPath = ref([])
/** 当前行业 tb_category.id；仅走 core-tags + second-tags 拆流时有值 */
const resolvedIndustryId = ref(null)
/** 为 true：一级无 children，点选一级后 GET …/second-tags 再挂二级 */
const useSecondTagsEndpoint = ref(false)
/** 一级拉二级期间，避免 children 未返回时误判为「无二级」 */
const coreTagsLoadingRootId = ref('')
const showIndustryPopup = ref(false)
const tempIndustry = ref('')

/** 展示 URL/当前选中的行业（一键成片初始页已选行业会随 query 带入）；无值时兜底「选择行业」 */
const industryRowLabel = computed(() => {
  const t = String(industry.value || '').trim()
  return t || '选择行业'
})

const showCategorySection = computed(
  () => String(industry.value || '').trim().length > 0
)

const visibleLevels = computed(() => {
  const levels = []
  let options = categoryTree.value
  let levelIndex = 0

  while (options && options.length) {
    levels.push({
      title: levelIndex === 0 ? '核心品类' : `${levelIndex + 1}级品类`,
      options
    })

    const selected = selectedPath.value[levelIndex]
    if (!selected || !selected.children?.length) {
      break
    }

    options = selected.children
    levelIndex += 1
  }

  return levels
})

const canConfirm = computed(() => {
  if (coreTagsLoadingRootId.value) return false
  if (!selectedPath.value.length) return false
  const lastSelected = selectedPath.value[selectedPath.value.length - 1]
  return Boolean(lastSelected && !lastSelected.children?.length)
})

onLoad((query = {}) => {
  const rawIntent = typeof query.intent === 'string' ? query.intent : ''
  pageIntent.value = rawIntent.toLowerCase() === 'edit' ? 'edit' : 'add'

  freshAddFromGenerate.value =
    pageIntent.value === 'add' &&
    String(query.from || '').toLowerCase() === 'generate-add'

  if (freshAddFromGenerate.value) {
    industry.value = ''
    categoryTree.value = []
    selectedPath.value = []
    resolvedIndustryId.value = null
    useSecondTagsEndpoint.value = false
    coreTagsLoadingRootId.value = ''
    return
  }

  if (query.industry) {
    industry.value = decodeURIComponent(String(query.industry))
  }

  fetchCategoryTree()
})

function goBack() {
  uni.navigateBack()
}

async function fetchCategoryTree() {
  const key = String(industry.value || '').trim()
  if (!key) {
    categoryTree.value = []
    selectedPath.value = []
    resolvedIndustryId.value = null
    useSecondTagsEndpoint.value = false
    coreTagsLoadingRootId.value = ''
    return
  }

  showPageLoading()
  try {
    const data = await getBusinessCategories(key)
    categoryTree.value = data.levels || []
    resolvedIndustryId.value =
      data.industryId != null && data.industryId !== ''
        ? data.industryId
        : null
    useSecondTagsEndpoint.value = Boolean(data.useSecondTagsEndpoint)
    selectedPath.value = []
    coreTagsLoadingRootId.value = ''

    /** 仅「一键成片初始页」等带行业的 add：默认选第一条到叶子；生成页新增主营业务不做默认勾选 */
    const useAddDefaults =
      pageIntent.value === 'add' &&
      !freshAddFromGenerate.value &&
      !useSecondTagsEndpoint.value
    if (useAddDefaults) {
      applyFirstBranchLeafPath(categoryTree.value)
    }
  } finally {
    hidePageLoading()
  }
}

/** 自上而下取每级的第一个选项，直达叶子节点 */
function applyFirstBranchLeafPath(nodes) {
  if (!Array.isArray(nodes) || !nodes.length) return
  const path = []
  let cursor = nodes[0]
  while (cursor) {
    path.push(cursor)
    const children = cursor.children
    if (!children?.length) break
    cursor = children[0]
  }
  selectedPath.value = path
}

function openIndustryPicker() {
  const cur = String(industry.value || '').trim()
  tempIndustry.value =
    cur && CREATE_INDUSTRY_OPTIONS.includes(cur)
      ? cur
      : CREATE_INDUSTRY_OPTIONS[0]
  showIndustryPopup.value = true
}

function closeIndustryPicker() {
  showIndustryPopup.value = false
}

async function confirmIndustryPicker() {
  const pick = CREATE_INDUSTRY_OPTIONS.includes(tempIndustry.value)
    ? tempIndustry.value
    : CREATE_INDUSTRY_OPTIONS[0]
  industry.value = pick
  showIndustryPopup.value = false
  await fetchCategoryTree()
}

/**
 * 拉取一级核心品类下的二级标签并写回 categoryTree 对应根节点。
 * @param {string|number} rootTagId 一级 tagId（tb_tag.id）
 * @param {{ silent?: boolean }} [opts]
 */
async function ensureSecondTagsForNode(rootTagId, opts = {}) {
  const silent = opts.silent === true
  if (!useSecondTagsEndpoint.value || resolvedIndustryId.value == null) {
    return
  }
  const id = String(rootTagId ?? '').trim()
  if (!id) return
  if (!silent) {
    showPageLoading()
  }
  try {
    const rows = await listSecondTags(resolvedIndustryId.value, id)
    const children = mapTagRowsToLeafCategoryNodes(rows)
    const roots = categoryTree.value
    const idx = roots.findIndex((r) => r.id === id)
    if (idx >= 0) {
      const prev = roots[idx]
      roots[idx] = {
        ...prev,
        children: children.length ? children : undefined
      }
      categoryTree.value = [...roots]
    }
  } catch (e) {
    uni.showToast({
      title: e?.message ? String(e.message) : '二级品类加载失败',
      icon: 'none'
    })
  } finally {
    if (!silent) {
      hidePageLoading()
    }
  }
}

/**
 * 已选路径末级叶子标签 id（tb_tag.id），供创建主营业务 POST 的 industryTagId。
 * @returns {string}
 */
function pickLeafIndustryTagIdForSubmit() {
  const p = selectedPath.value
  if (!p.length) return ''
  const last = p[p.length - 1]
  if (!last) return ''
  if (last.children?.length) return ''
  return String(last.id ?? '').trim()
}

async function selectCategory(levelIndex, category) {
  coreTagsLoadingRootId.value = ''
  selectedPath.value = selectedPath.value.slice(0, levelIndex)
  selectedPath.value[levelIndex] = category

  if (
    levelIndex === 0 &&
    useSecondTagsEndpoint.value &&
    resolvedIndustryId.value != null &&
    isApiEnabled()
  ) {
    coreTagsLoadingRootId.value = String(category.id ?? '')
    try {
      await ensureSecondTagsForNode(category.id, { silent: false })
    } finally {
      coreTagsLoadingRootId.value = ''
    }
    const updated = categoryTree.value.find((r) => r.id === category.id)
    if (updated) {
      selectedPath.value[0] = updated
    }
  }
}

function confirmSelection() {
  if (!String(industry.value || '').trim()) {
    uni.showToast({ title: '请先选择行业', icon: 'none' })
    return
  }
  if (!canConfirm.value) {
    uni.showToast({
      title: '请完成主营业务选择',
      icon: 'none'
    })
    return
  }

  const leafTagId = pickLeafIndustryTagIdForSubmit()
  if (!leafTagId) {
    uni.showToast({ title: '请完成主营业务选择', icon: 'none' })
    return
  }
  uni.setStorageSync('create:selected-business', {
    industry: industry.value,
    industryId:
      resolvedIndustryId.value != null && resolvedIndustryId.value !== ''
        ? String(resolvedIndustryId.value)
        : '',
    displayName: selectedPath.value.map((item) => item.name).join(' / '),
    path: selectedPath.value.map((item) => ({
      id: item.id,
      name: item.name
    })),
    industryTagIdForDimensions: leafTagId
  })
  uni.showToast({
    title: '已选择主营业务',
    icon: 'none'
  })

  setTimeout(() => {
    uni.navigateBack()
  }, 300)
}
</script>

<style lang="scss" scoped>
.business-page {
  min-height: 100vh;
  padding-bottom: calc(172rpx + constant(safe-area-inset-bottom));
  padding-bottom: calc(172rpx + env(safe-area-inset-bottom));
  background: #ffffff;
  color: #202633;
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
  justify-content: flex-start;
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
.back-text{
	font-size: 30rpx;
	font-family:OPPOSans-regular;
}
.nav-bar__gap {
  flex-shrink: 0;
  width: 174rpx;
  height: 32rpx;
}

.industry-trigger {
  height: 86rpx;
  border-bottom: 1rpx solid #eeeeee;
  box-sizing: border-box;
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: center;
  gap: 8rpx;
}

.industry-trigger__text {
  font-size: 28rpx;
  font-weight: 700;
  color: #1f2937;
}

.industry-trigger__arrow {
  width: 28rpx;
  height: 28rpx;
  flex-shrink: 0;
}

.title-arrow {
  margin-left: 8rpx;
  font-size: 26rpx;
}

.category-section {
  padding: 34rpx 20rpx;
}

.level-block + .level-block {
  margin-top: 32rpx;
}

.category-title {
  color: #1f2933;
  font-size: 28rpx;
  font-weight: 700;
  display: flex;
  align-items: center;
}

.required {
  color: #ff5656;
  font-size: 28rpx;
}

.tag-list {
  margin-top: 24rpx;
  display: flex;
  flex-wrap: wrap;
  gap: 18rpx 14rpx;
}

.category-tag {
  height: 56rpx;
  padding: 0 22rpx;
  border: 1rpx solid #e1e3e8;
  border-radius: 999rpx;
  color: #9da5b2;
  font-size: 24rpx;
  display: flex;
  align-items: center;
  justify-content: center;
}

.category-tag.active {
  border-color: #ff9b36;
  background: #fff6eb;
  color: #ff8e24;
}

.bottom-action {
  position: fixed;
  left: 0;
  right: 0;
  bottom: 0;
  height: calc(172rpx + constant(safe-area-inset-bottom));
  height: calc(172rpx + env(safe-area-inset-bottom));
  padding-top: 30rpx;
  padding-bottom: constant(safe-area-inset-bottom);
  padding-bottom: env(safe-area-inset-bottom);
  background: #f4f4f4;
  text-align: center;
}

.confirm-btn {
  width: 510rpx;
  height: 108rpx;
  border-radius: 999rpx;
  background: #ffc581;
  color: #ffffff;
  font-size: 32rpx;
  line-height: 108rpx;
}

.confirm-btn--ready {
  background: #ff9432;
}

.confirm-btn::after {
  border: 0;
}

.tips {
  margin-top: 12rpx;
  display: flex;
  align-items: center;
  justify-content: center;

  .tips-icon {
    width: 20rpx;
    height: 20rpx;
  }

  .tips-text {
    margin-left: 4rpx;
    font-size: 20rpx;
    color: #9ca3af;
  }
}

.industry-sheet-mask {
  position: fixed;
  inset: 0;
  z-index: 110;
  box-sizing: border-box;
  padding-top: constant(safe-area-inset-top);
  padding-top: env(safe-area-inset-top);
  background: rgba(0, 0, 0, 0.54);
  display: flex;
  align-items: flex-end;
}

.industry-sheet {
  width: 100%;
  padding: 18rpx 30rpx calc(46rpx + constant(safe-area-inset-bottom));
  padding: 18rpx 30rpx calc(46rpx + env(safe-area-inset-bottom));
  border-radius: 0;
  background: #ffffff;
}

.industry-sheet__handle {
  width: 52rpx;
  height: 8rpx;
  margin: 0 auto 30rpx;
  border-radius: 999rpx;
  background: #d8d8d8;
}

.industry-sheet__title {
  color: #1f2933;
  font-size: 30rpx;
  font-weight: 700;
  text-align: center;
}

.industry-sheet__grid {
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  margin-top: 36rpx;
}

.industry-sheet__item {
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

.industry-sheet__item:nth-child(4n) {
  margin-right: 0;
}

.industry-sheet__item--active {
  border-color: #ff8e24;
  color: #ff8e24;
  background: #fff6ed;
  font-weight: 700;
}

.industry-sheet__confirm {
  width: 510rpx;
  height: 108rpx;
  margin: 48rpx auto 0;
  border-radius: 999rpx;
  background: linear-gradient(180deg, #ffbd72 0%, #ff963a 100%);
  color: #ffffff;
  font-size: 32rpx;
  line-height: 108rpx;
}

.industry-sheet__confirm::after {
  border: 0;
}
</style>
