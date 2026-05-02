<template>
  <view class="business-page">
    <view class="nav-bar">
      <view class="nav-left" @tap="goBack">
        <text class="back-icon">‹</text>
        <text>主营业务</text>
      </view>
      <view class="capsule">
        <text class="dot">•••</text>
        <view class="circle"></view>
      </view>
    </view>

    <view class="industry-title">
      <text>{{ industry }}</text>
      <text class="title-arrow">⌄</text>
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
        :class="{ active: canConfirm }"
        :disabled="!canConfirm"
        @tap="confirmSelection"
      >
        确定
      </button>
      <text class="tip">◎ 后续可在【我的 - 商业信息】内修改</text>
    </view>
  </view>
</template>

<script setup>
import { computed, ref } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
import { getBusinessCategories } from '@/api/create'

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
  padding-bottom: calc(172rpx + env(safe-area-inset-bottom));
  background: #ffffff;
  color: #202633;
}

.nav-bar {
  height: calc(112rpx + env(safe-area-inset-top));
  padding: calc(30rpx + env(safe-area-inset-top)) 18rpx 16rpx;
  background: linear-gradient(180deg, #ffd29f 0%, #ffffff 100%);
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.nav-left {
  display: flex;
  align-items: center;
  color: #1f2933;
  font-size: 30rpx;
}

.back-icon {
  margin-right: 8rpx;
  font-size: 52rpx;
  line-height: 1;
}

.capsule {
  width: 172rpx;
  height: 58rpx;
  border-radius: 999rpx;
  background: rgba(255, 255, 255, 0.86);
  display: flex;
  align-items: center;
  justify-content: space-around;
}

.dot {
  margin-top: -8rpx;
  color: #111111;
  font-size: 28rpx;
  font-weight: 800;
}

.circle {
  width: 24rpx;
  height: 24rpx;
  border: 4rpx solid #111111;
  border-radius: 50%;
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
  height: calc(172rpx + env(safe-area-inset-bottom));
  padding-top: 30rpx;
  padding-bottom: env(safe-area-inset-bottom);
  background: #f4f4f4;
  text-align: center;
}

.confirm-btn {
  width: 510rpx;
  height: 108rpx;
  border-radius: 999rpx;
  background: #f6c99d;
  color: #ffffff;
  font-size: 32rpx;
  line-height: 108rpx;
}

.confirm-btn.active {
  background: linear-gradient(180deg, #ffc98f 0%, #ff9835 100%);
}

.confirm-btn::after {
  border: 0;
}

.tip {
  display: block;
  margin-top: 14rpx;
  color: #a4abb5;
  font-size: 22rpx;
}
</style>
