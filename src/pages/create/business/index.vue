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

    <view class="industry-title">
      <text class="industry-text">{{ industry }}</text>
      <image class="industry-icon" :src="createIconArrowDown" mode=""></image>
    </view>

    <view class="category-section">
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
  </view>
</template>

<script setup>
/**
 * 【一键成片 · 主营业务选择】按接口 levels 动态渲染；选完回写 storage 并返回上页。
 */
import { computed, ref, onMounted } from 'vue'
import { onLoad, onReady } from '@dcloudio/uni-app'
import { getBusinessCategories } from '@/api/create'
import {
  getCreateNavBarInlineStyle,
  scheduleCreateNavBarStyleRefresh
} from '@/utils/create-nav-bar-style'
import createBackIcon from '@/static/create/create-back-icon.png'
import createIconArrowDown from '@/static/create/create-icon-arrow-down.png'
import createIconAttention from '@/static/create/create-icon-attention.png'

const createNavBarStyle = ref(getCreateNavBarInlineStyle())
onMounted(() => scheduleCreateNavBarStyleRefresh(createNavBarStyle))
onReady(() => scheduleCreateNavBarStyleRefresh(createNavBarStyle))

const industry = ref('餐饮')
const categoryTree = ref([])
const selectedPath = ref([])

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
  if (!selectedPath.value.length) return false
  const lastSelected = selectedPath.value[selectedPath.value.length - 1]
  return Boolean(lastSelected && !lastSelected.children?.length)
})

onLoad((query = {}) => {
  if (query.industry) {
    industry.value = decodeURIComponent(query.industry)
  }
  fetchCategoryTree()
})

function goBack() {
  uni.navigateBack()
}

async function fetchCategoryTree() {
  const data = await getBusinessCategories(industry.value)
  categoryTree.value = data.levels || []
  selectedPath.value = []
}

function selectCategory(levelIndex, category) {
  selectedPath.value = selectedPath.value.slice(0, levelIndex)
  selectedPath.value[levelIndex] = category
}

function confirmSelection() {
  if (!canConfirm.value) {
    uni.showToast({
      title: '请完成主营业务选择',
      icon: 'none'
    })
    return
  }

  uni.setStorageSync('create:selected-business', {
    industry: industry.value,
    displayName: selectedPath.value.map((item) => item.name).join(' / '),
    path: selectedPath.value.map((item) => ({
      id: item.id,
      name: item.name
    }))
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

.industry-title {
  height: 86rpx;
  border-bottom: 1rpx solid #eeeeee;
  color: #1f2933;
  font-size: 28rpx;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
  .industry-text{
	font-size: 28rpx;
	color: #1F2937;
  }
  .industry-icon{
	width: 28rpx;
	height: 28rpx;
	margin-left: 4rpx;
  }
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
</style>
