<template>
  <!-- 一键成片 · 生成配置页 | docs §10：导航 → 筛选 → 模板/标签 → 照片/形象/文案 → 底栏 → 弹窗 -->
  <view class="generate-page">
    <!-- 顶部导航 -->
    <view class="nav-bar" :style="createNavBarStyle">
      <view class="nav-left" @tap="goBack">
        <image class="back-icon" :src="createBackIcon" mode="aspectFit" />
        <text>一键成片</text>
      </view>
      <view class="nav-bar__gap" aria-hidden="true" />
    </view>

    <!-- 筛选：主营业务、发布平台 -->
    <view class="filter-bar">
      <view class="filter-group">
        <text class="filter-label">主营业务</text>
        <view class="filter-pill" @tap="openBusinessPopup">
          <text>{{ currentBusiness.name }}</text>
          <image
            class="filter-pill__arrow"
            :src="createIconArrowDown"
            mode="aspectFill"
          />
        </view>
      </view>
      <view class="filter-group">
        <text class="filter-label">平台</text>
        <view class="filter-pill" @tap="openPlatformPopup">
          <text>{{ currentPlatform.name }}</text>
          <image
            class="filter-pill__arrow"
            :src="createIconArrowDown"
            mode="aspectFill"
          />
        </view>
      </view>
    </view>

    <!-- 业务标签（示意） -->
    <view class="tag-row">
      <view
        v-for="tag in businessTags"
        :key="tag"
        class="tag active"
      >
        {{ tag }}
      </view>
    </view>

    <!-- 视频模板 -->
    <view class="section">
      <view class="section-header template-section-header">
        <text class="section-title template-section-title">请选择视频模板</text>
        <view class="view-works-btn" @tap="openViewFinishedVideos">
          <view class="view-works-btn__icon-wrap" aria-hidden="true">
            <image
              class="view-works-btn__icon"
              :src="createIconViewFilm"
              mode="aspectFit"
            />
          </view>
          <text class="view-works-btn__label">查看成片</text>
        </view>
      </view>
      <scroll-view scroll-x class="template-scroll" :show-scrollbar="false">
        <view class="template-list">
          <view
            v-for="template in templates"
            :key="template.id"
            class="template-card"
            :class="{ active: selectedTemplate === template.id }"
            @tap="selectedTemplate = template.id"
          >
            <image class="template-image" :src="template.image" mode="aspectFill" />
            <view v-if="selectedTemplate === template.id" class="template-check">
              <image
                class="template-check__icon"
                :src="createIconTemplateCheck"
                mode="aspectFit"
              />
            </view>
            <view class="template-body">
              <text class="template-title">{{ template.title }}</text>
              <text class="template-desc">{{ template.desc }}</text>
              <view class="template-meta">
                <text class="template-tag">{{ template.tag }}</text>
                <text class="template-hot">❤ {{ template.hot }}</text>
              </view>
            </view>
          </view>
        </view>
      </scroll-view>
    </view>

    <!-- 素材：上传照片 -->
    <view class="section upload-section">
      <view class="section-header">
        <view class="section-title">请上传照片</view>
        <view class="tips tips--shooting" @tap.stop="openShootingTips">
          <image
            class="tips-icon-img"
            :src="createIconUploadHelp"
            mode="aspectFit"
          />
          <text>拍摄技巧</text>
          <image
            class="tips-chevron"
            :src="iconChevronRightLight"
            mode="aspectFit"
          />
        </view>
      </view>

      <view class="photo-scroll-outer">
        <scroll-view
          scroll-x
          class="photo-list-scroll"
          :show-scrollbar="false"
          enable-flex
        >
          <view class="photo-list">
            <view v-for="photo in photoSlots" :key="photo" class="photo-slot">
              <view class="photo-slot__circle">
                <image
                  class="photo-slot__plus"
                  :src="createIconPhotoPlus"
                  mode="aspectFit"
                />
              </view>
              <text class="photo-slot__label">{{ photo }}</text>
            </view>
          </view>
        </scroll-view>
      </view>
    </view>

    <!-- 出镜形象 -->
    <view class="section">
      <view class="section-header">
        <view class="section-title">请选择出镜形象</view>
        <view class="segment">
          <text
            class="segment-item"
            :class="{ active: avatarSourceTab === 'official' }"
            @tap="setAvatarTab('official')"
          >
            官方
          </text>
          <text
            class="segment-item"
            :class="{ active: avatarSourceTab === 'mine' }"
            @tap="setAvatarTab('mine')"
          >
            我的
          </text>
        </view>
      </view>

      <view class="avatar-scroll-outer">
        <scroll-view
          scroll-x
          class="avatar-scroll"
          :show-scrollbar="false"
          enable-flex
        >
          <view class="avatar-list">
            <view
              v-for="avatar in displayAvatars"
              :key="avatar.id"
              class="avatar-card"
              :class="{ active: selectedAvatar === avatar.id }"
              @tap="selectAvatar(avatar.id)"
            >
              <image class="avatar-image" :src="avatar.image" mode="aspectFill" />
              <view class="avatar-label">{{ avatar.name }}</view>
              <view v-if="selectedAvatar === avatar.id" class="avatar-check">
                <image
                  class="avatar-check__icon"
                  :src="createIconTemplateCheck"
                  mode="aspectFit"
                />
              </view>
            </view>
          </view>
        </scroll-view>
      </view>
    </view>

    <!-- 口播/展示文案 -->
    <view class="section copy-section">
      <view class="section-title">视频文案</view>
      <view class="copy-card">
        <textarea
          v-model="copywriting"
          class="copy-textarea"
          maxlength="500"
          placeholder="请输入视频文案"
          placeholder-class="placeholder"
        />
        <view class="copy-footer">
          <text>{{ copywriting.length }}/500字</text>
          <button
            class="clear-btn"
            :class="{ 'clear-btn--empty': !hasCopywriting }"
            size="mini"
            :disabled="!hasCopywriting"
            @tap="clearCopywriting"
          >
            清空
          </button>
        </view>
      </view>
    </view>

    <!-- 底部：画质摘要 + 生成（消耗点数见 generateCostPoints） -->
    <view class="bottom-action">
      <view class="quality-select" @tap="openQualityPopup">
        <text class="quality-main">{{ currentResolution.label }}</text>
        <text class="quality-sub">{{ currentModel.label }}</text>
        <image
          class="quality-arrow-icon"
          :src="createIconArrowDown"
          mode="aspectFill"
        />
      </view>
      <button class="generate-btn" @tap="generateVideo">
        <text class="generate-btn__label">生成视频</text>
        <view class="generate-btn__divider" aria-hidden="true" />
        <image
          class="generate-btn__stack-icon"
          :src="createIconStack"
          mode="aspectFit"
        />
        <text class="cost">{{ generateCostPoints }}点</text>
      </button>
      <view class="ai-tip">
        <image
          class="ai-tip__icon"
          :src="createIconAttention"
          mode="aspectFill"
          aria-hidden="true"
        />
        <text class="ai-tip__text">内容由AI生成，禁止利用功能从事违法活动</text>
      </view>
    </view>

    <!-- 弹窗：主营业务 -->
    <view v-if="showBusinessPopup" class="popup-mask" @tap="closeBusinessPopup">
      <view class="business-popup" @tap.stop>
        <view class="popup-handle"></view>
        <view class="popup-title">选择主营业务</view>

        <view class="business-list">
          <view
            v-for="business in businessOptions"
            :key="business.id"
            class="business-option"
            :class="{ active: tempBusiness === business.id }"
            @tap="selectBusiness(business.id)"
          >
            <view class="business-info">
              <text class="business-name">{{ business.name }}</text>
              <text class="business-desc">{{ business.desc }}</text>
            </view>
            <view class="business-edit" @tap.stop="onBusinessEdit(business)">
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
        </view>

        <view class="business-add">＋ 新增主营业务</view>
        <button class="popup-confirm" @tap="confirmBusiness">确定</button>
      </view>
    </view>

    <!-- 弹窗：平台 -->
    <view v-if="showPlatformPopup" class="popup-mask" @tap="closePlatformPopup">
      <view class="platform-popup" @tap.stop>
        <view class="popup-handle"></view>
        <view class="popup-title">选择平台</view>

        <view class="platform-list">
          <view
            v-for="platform in platformOptions"
            :key="platform.id"
            class="platform-option"
            :class="{ active: tempPlatform === platform.id }"
            @tap="selectPlatform(platform.id)"
          >
            {{ platform.name }}
          </view>
        </view>

        <button class="popup-confirm" @tap="confirmPlatform">确定</button>
      </view>
    </view>

    <!-- 弹窗：分辨率与模型（组件） -->
    <QualitySettingsSheet
      :show="showQualityPopup"
      :cost-points="generateCostPoints"
      :resolution-options="resolutionOptions"
      :model-options="modelOptions"
      :selected-resolution="selectedResolution"
      :selected-model="selectedModel"
      :video-duration-sec="selectedTemplateMeta.durationSec ?? 30"
      @close="closeQualityPopup"
      @resolution-tap="onPickResolution"
      @model-tap="selectModel"
      @generate="confirmGenerateFromPopup"
    />

    <VipSubscribeModal
      :show="showVipModal"
      :variant="vipModalVariant"
      @close="closeVipModal"
      @confirm="onVipSubscribeConfirm"
      @aux-buy="onVipAuxBuy"
    />

    <PointsRechargeModal
      :show="showPointsRechargeModal"
      :deficit-points="pointsRechargeDeficit"
      :has-promo="pointsRechargeHasPromo"
      @close="closePointsRechargeModal"
      @confirm="onPointsRechargeConfirm"
    />
  </view>
</template>

<script setup>
/**
 * 【一键成片 · 生成配置页】pages/create/generate/index.vue
 *
 * 功能块：筛选与模板、素材与文案、底部成片操作、业务/平台弹窗、画质与模型子组件。
 * 规范：docs/frontend-development.md §10；常量 @/constants/create；接口 @/api/create。
 */
import { computed, nextTick, onMounted, ref } from 'vue'
import { useUserStore } from '@/stores/user'
import {
  CREATE_MODEL_OPTIONS,
  CREATE_RESOLUTION_OPTIONS,
  computeVideoGenerateCostPoints
} from '@/constants/create'
import QualitySettingsSheet from '../components/QualitySettingsSheet.vue'
import VipSubscribeModal from '../components/VipSubscribeModal.vue'
import PointsRechargeModal from '../components/PointsRechargeModal.vue'
import { supportsContinuousVipSubscription } from '@/utils/vip-subscription-platform'
import {
  getCreateNavBarInlineStyle,
  scheduleCreateNavBarStyleRefresh
} from '@/utils/create-nav-bar-style'
import createBackIcon from '@/static/create/create-back-icon.png'
import createIconArrowDown from '@/static/create/create-icon-arrow-down.png'
import createIconViewFilm from '@/static/create/create-icon-view-film.png'
import createIconTemplateCheck from '@/static/create/create-icon-template-check.png'
import createIconUploadHelp from '@/static/create/create-icon-upload-help.png'
import iconChevronRightLight from '@/static/mine/icon-chevron-right-light.svg'
import createIconPhotoPlus from '@/static/create/create-icon-photo-plus.png'
import createIconStack from '@/static/create/create-icon-stack.png'
import createIconBusinessEdit from '@/static/create/create-icon-business-edit.png'
import createIconBusinessEditChevron from '@/static/create/create-icon-business-edit-chevron.png'
import createIconAttention from '@/static/create/create-icon-attention.png'
import { onReady, onShow } from '@dcloudio/uni-app'

const createNavBarStyle = ref(getCreateNavBarInlineStyle())

const PRIMARY_BUSINESS_ID = 'primary'

// --- 页面静态配置：模板、标签、照片槽、数字人形象（Mock，后续接接口） ---
const businessTags = ref(['新派粤菜', '家宴', '客家菜', '活鲜', '粤菜', '融合菜'])
const templates = [
  {
    id: 'store',
    title: '探店视频这样拍',
    desc: '吸引转化客户',
    tag: '探店',
    hot: '3.2w',
    /** 成片时长（秒），参与计费；后续可由模板接口下发 */
    durationSec: 30,
    image: 'https://images.unsplash.com/photo-1497366754035-f200968a6e72?w=300&h=220&fit=crop'
  },
  {
    id: 'dish',
    title: '招聘菜这样拍',
    desc: '让客人看了更有食欲',
    tag: '菜品展示',
    hot: '2.1w',
    durationSec: 15,
    image: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=300&h=220&fit=crop'
  },
  {
    id: 'coupon',
    title: '团购引流这样拍',
    desc: '让老人都爱买真特色',
    tag: '团购引流',
    hot: '2.1w',
    durationSec: 30,
    image: 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=300&h=220&fit=crop'
  }
]
const photoSlots = ['门头照片', '内部环境', '菜品照片', '其他照片']
const STORAGE_AVATAR_TAB = 'create:generate-avatar-tab'
const STORAGE_AVATAR_ID_OFFICIAL = 'create:generate-avatar-id-official'
const STORAGE_AVATAR_ID_MINE = 'create:generate-avatar-id-mine'

const avatarsOfficial = [
  {
    id: 'script',
    name: '编辑内容',
    image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=360&h=360&fit=crop'
  },
  {
    id: 'new',
    name: '新国主播',
    image: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=360&h=360&fit=crop'
  },
  {
    id: 'doctor',
    name: '医学科普',
    image: 'https://images.unsplash.com/photo-1537368910025-700350fe46c7?w=360&h=360&fit=crop'
  },
  {
    id: 'female',
    name: '电台主播',
    image: 'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=360&h=360&fit=crop'
  },
  {
    id: 'store_host',
    name: '门店主播',
    image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=360&h=360&fit=crop'
  }
]

const avatarsMine = [
  {
    id: 'my-1',
    name: '我的形象一',
    image: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=360&h=360&fit=crop'
  },
  {
    id: 'my-2',
    name: '我的形象二',
    image: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=360&h=360&fit=crop'
  },
  {
    id: 'my-3',
    name: '我的形象三',
    image: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=360&h=360&fit=crop'
  },
  {
    id: 'my-4',
    name: '我的形象四',
    image: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=360&h=360&fit=crop'
  },
  {
    id: 'my-5',
    name: '我的形象五',
    image: 'https://images.unsplash.com/photo-1531746020798-e6953c6e612e?w=360&h=360&fit=crop'
  }
]

const selectedTemplate = ref('store')
const avatarSourceTab = ref('official')
const selectedAvatar = ref('script')
const businessOptions = ref([
  {
    id: 'business1',
    name: '主营业务1',
    path: '餐饮-火锅',
    desc: '餐饮-火锅'
  },
  {
    id: 'business2',
    name: '主营业务2',
    path: '餐饮-正餐(家常菜 / 酒楼)...',
    desc: '餐饮-正餐(家常菜 / 酒楼)...'
  }
])
const platformOptions = [
  { id: 'douyin', name: '抖音' },
  { id: 'kuaishou', name: '快手' },
  { id: 'shipinhao', name: '视频号' },
  { id: 'xiaohongshu', name: '小红书' }
]
const selectedBusiness = ref('business1')
const tempBusiness = ref('business1')
const showBusinessPopup = ref(false)
const selectedPlatform = ref('douyin')
const tempPlatform = ref('douyin')
const showPlatformPopup = ref(false)
const copywriting = ref('重庆老火锅，这味道太顶了！兄弟们，这家重庆老火锅我真的要安利一下。锅底一上来就开始翻滚，那个牛油香味直接冲上来。你看这个毛肚，七上八下，脆到不行。还有这个肥牛，一口下去全是香味。')

const hasCopywriting = computed(
  () => String(copywriting.value || '').trim().length > 0
)

function clearCopywriting() {
  if (!hasCopywriting.value) return
  copywriting.value = ''
}

// --- 用户态：点数用于「生成视频」前校验 ---
const userStore = useUserStore()

// --- 成片参数：分辨率 / 模型（与常量表一致，二者独立） ---
const resolutionOptions = CREATE_RESOLUTION_OPTIONS
const modelOptions = CREATE_MODEL_OPTIONS

const selectedResolution = ref('720p')
const selectedModel = ref('seedance2')
const showQualityPopup = ref(false)

const selectedTemplateMeta = computed(
  () => templates.find((t) => t.id === selectedTemplate.value) || templates[0]
)

const generateCostPoints = computed(() =>
  computeVideoGenerateCostPoints({
    durationSec: selectedTemplateMeta.value?.durationSec ?? 30,
    resolutionId: selectedResolution.value,
    modelId: selectedModel.value
  })
)

const showVipModal = ref(false)
/** @type {import('vue').Ref<'continuous'|'first_time_once'|'standard_once'>} */
const vipModalVariant = ref('continuous')

const showPointsRechargeModal = ref(false)
const pointsRechargeDeficit = ref(0)
// 本地直出「有优惠活动」版充值弹窗；联调后改回 userStore.pointsTopUpHasPromo
const pointsRechargeHasPromo = computed(() => true)

/** 与商户信息页一致：用于「编辑」跳转主营业务子页 */
const createFlowIndustry = ref('餐饮')
/** 从弹窗点「编辑」进入子页返回后，用于写回对应条目 */
const editingBusinessId = ref('')

// --- 展示用 computed ---
const currentBusiness = computed(
  () =>
    businessOptions.value.find((item) => item.id === selectedBusiness.value) ||
    businessOptions.value[0]
)
const currentPlatform = computed(() => platformOptions.find((item) => item.id === selectedPlatform.value) || platformOptions[0])

const currentResolution = computed(
  () => resolutionOptions.find((item) => item.id === selectedResolution.value) || resolutionOptions[0]
)
const currentModel = computed(() => modelOptions.find((item) => item.id === selectedModel.value) || modelOptions[0])

/** 使用 VIP 分辨率或 VIP 模型时，生成前需校验会员 */
const usesVipModule = computed(
  () => Boolean(currentResolution.value?.vip || currentModel.value?.vip)
)

const displayAvatars = computed(() =>
  avatarSourceTab.value === 'official' ? avatarsOfficial : avatarsMine
)

function avatarIdInList(list, id) {
  return list.some((a) => a.id === id)
}

function loadAvatarTabState() {
  let tab = uni.getStorageSync(STORAGE_AVATAR_TAB)
  if (tab !== 'official' && tab !== 'mine') tab = 'official'
  avatarSourceTab.value = tab
  const list = tab === 'official' ? avatarsOfficial : avatarsMine
  const key = tab === 'official' ? STORAGE_AVATAR_ID_OFFICIAL : STORAGE_AVATAR_ID_MINE
  let sid = uni.getStorageSync(key)
  if (!sid || !avatarIdInList(list, sid)) {
    sid = list[0]?.id || ''
  }
  selectedAvatar.value = sid
}

function setAvatarTab(tab) {
  if (tab !== 'official' && tab !== 'mine') return
  if (tab === avatarSourceTab.value) return
  const prevKey =
    avatarSourceTab.value === 'official'
      ? STORAGE_AVATAR_ID_OFFICIAL
      : STORAGE_AVATAR_ID_MINE
  uni.setStorageSync(prevKey, selectedAvatar.value)
  avatarSourceTab.value = tab
  uni.setStorageSync(STORAGE_AVATAR_TAB, tab)
  const list = tab === 'official' ? avatarsOfficial : avatarsMine
  const nextKey = tab === 'official' ? STORAGE_AVATAR_ID_OFFICIAL : STORAGE_AVATAR_ID_MINE
  let sid = uni.getStorageSync(nextKey)
  if (!sid || !avatarIdInList(list, sid)) {
    sid = list[0]?.id || ''
  }
  selectedAvatar.value = sid
}

function selectAvatar(id) {
  selectedAvatar.value = id
  const key =
    avatarSourceTab.value === 'official'
      ? STORAGE_AVATAR_ID_OFFICIAL
      : STORAGE_AVATAR_ID_MINE
  uni.setStorageSync(key, id)
}

onMounted(() => {
  scheduleCreateNavBarStyleRefresh(createNavBarStyle)
})

onReady(() => {
  scheduleCreateNavBarStyleRefresh(createNavBarStyle)
})

function readMerchantDraft() {
  let raw = uni.getStorageSync('create:merchant-draft')
  if (raw == null || raw === '') return null
  if (typeof raw === 'string') {
    try {
      raw = JSON.parse(raw)
    } catch {
      return null
    }
  }
  if (!raw || typeof raw !== 'object') return null
  return raw
}

function readSelectedBusinessPayload() {
  let raw = uni.getStorageSync('create:selected-business')
  if (raw == null || raw === '') return null
  if (typeof raw === 'string') {
    try {
      raw = JSON.parse(raw)
    } catch {
      return null
    }
  }
  if (!raw || typeof raw !== 'object') return null
  if (!Array.isArray(raw.path)) return null
  return raw
}

function pathLabelsFromPayload(path) {
  return (path || [])
    .map((p) => String(p?.name ?? p?.label ?? p?.title ?? p?.categoryName ?? '').trim())
    .filter(Boolean)
}

function applyMerchantDraft(draft) {
  const industry = String(draft.industry || '').trim() || '餐饮'
  createFlowIndustry.value = industry
  const labels = pathLabelsFromPayload(draft.businessPath)
  const desc = labels.join(' - ') || '未选择'
  const shortName = labels[labels.length - 1] || '主营业务'
  businessOptions.value = [
    {
      id: PRIMARY_BUSINESS_ID,
      name: shortName,
      path: desc,
      desc
    }
  ]
  selectedBusiness.value = PRIMARY_BUSINESS_ID
  tempBusiness.value = PRIMARY_BUSINESS_ID
  if (labels.length) {
    businessTags.value = labels
  }
}

function applySelectedBusiness(payload) {
  const labels = pathLabelsFromPayload(payload.path)
  const desc =
    labels.join(' - ') ||
    String(payload.displayName || '').trim() ||
    '未选择'
  const shortName = labels[labels.length - 1] || '主营业务'
  const id = editingBusinessId.value || selectedBusiness.value
  const list = businessOptions.value
  const idx = list.findIndex((b) => b.id === id)
  if (idx >= 0) {
    list[idx] = {
      ...list[idx],
      name: shortName,
      path: desc,
      desc
    }
  } else if (list.length) {
    list[0] = { ...list[0], name: shortName, path: desc, desc }
  }
  if (labels.length) {
    businessTags.value = labels
  }
  if (payload.industry) {
    createFlowIndustry.value = String(payload.industry).trim() || createFlowIndustry.value
  }
  editingBusinessId.value = ''
}

onShow(() => {
  loadAvatarTabState()
  const selected = readSelectedBusinessPayload()
  if (selected) {
    applySelectedBusiness(selected)
    uni.removeStorageSync('create:selected-business')
    return
  }
  const draft = readMerchantDraft()
  if (draft) {
    applyMerchantDraft(draft)
    uni.removeStorageSync('create:merchant-draft')
  }
})

// --- 页面导航 ---
function goBack() {
  uni.navigateBack()
}

/** 查看已生成成片（列表页接入后改为 navigateTo） */
function openViewFinishedVideos() {
  uni.showToast({ title: '成片列表即将上线', icon: 'none' })
}

function openShootingTips() {
  uni.showToast({ title: '拍摄技巧即将上线', icon: 'none' })
}

// --- 主营业务弹窗 ---
function openBusinessPopup() {
  tempBusiness.value = selectedBusiness.value
  showBusinessPopup.value = true
}

function closeBusinessPopup() {
  showBusinessPopup.value = false
}

function selectBusiness(id) {
  tempBusiness.value = id
}

function confirmBusiness() {
  selectedBusiness.value = tempBusiness.value
  closeBusinessPopup()
}

/** 编辑：跳转主营业务子页，返回后由 onShow 读 create:selected-business 写回 */
function onBusinessEdit(business) {
  const industry = String(createFlowIndustry.value || '').trim() || '餐饮'
  editingBusinessId.value = business?.id != null ? String(business.id) : ''
  closeBusinessPopup()
  uni.navigateTo({
    url: `/pages/create/business/index?industry=${encodeURIComponent(industry)}`
  })
}

// --- 发布平台弹窗 ---
function openPlatformPopup() {
  tempPlatform.value = selectedPlatform.value
  showPlatformPopup.value = true
}

function closePlatformPopup() {
  showPlatformPopup.value = false
}

function selectPlatform(id) {
  tempPlatform.value = id
}

function confirmPlatform() {
  selectedPlatform.value = tempPlatform.value
  closePlatformPopup()
}

// --- 画质 / 模型底部弹窗 ---
function openQualityPopup() {
  showQualityPopup.value = true
}

function closeQualityPopup() {
  showQualityPopup.value = false
}

function selectResolution(id) {
  selectedResolution.value = id
}

/** 选择分辨率：直接切换选中项；点数在「生成视频」时再校验 */
function onPickResolution(item) {
  selectResolution(item.id)
}

function selectModel(id) {
  selectedModel.value = id
}

function resolveVipModalVariant() {
  if (supportsContinuousVipSubscription()) return 'continuous'
  return userStore.isFirstVipSubscribeEligible ? 'first_time_once' : 'standard_once'
}

/** 使用 VIP 模块且非会员：关闭画质弹窗并打开对应 VIP 弹窗 */
function openVipRechargeForGenerate() {
  closeQualityPopup()
  vipModalVariant.value = resolveVipModalVariant()
  showVipModal.value = true
}

function closeVipModal() {
  showVipModal.value = false
}

async function onVipSubscribeConfirm(payload) {
  /** 前端模拟：视为支付成功，写入 VIP 并持久化；联调后改为支付成功回调再 mergeProfile / 拉用户信息 */
  userStore.mergeProfile({
    isVip: true,
    firstVipSubscribe: false
  })
  closeVipModal()
  uni.showToast({
    title: `VIP 已开通（模拟 · ${payload.plan === 'year' ? '年' : '月'}套餐）`,
    icon: 'none',
    duration: 1800
  })
  await nextTick()
  pointsRechargeDeficit.value = Math.max(
    0,
    Math.ceil(generateCostPoints.value - userStore.points)
  )
  showPointsRechargeModal.value = true
}

function onVipAuxBuy(payload) {
  uni.showToast({
    title: `请接入单笔购买：${payload.kind}`,
    icon: 'none'
  })
}

/** 需使用 VIP 能力且当前非会员时拦截为 false */
function ensureVipForGenerate() {
  if (!usesVipModule.value) return true
  if (userStore.isVip) return true
  openVipRechargeForGenerate()
  return false
}

/** 已是 VIP 但点数不足成片：关画质弹窗并打开点数充值（有/无活动由 profile.pointsTopUpPromo 控制） */
function openPointsRechargeForGenerate() {
  safeHideKeyboard()
  closeQualityPopup()
  pointsRechargeDeficit.value = Math.max(
    0,
    Math.ceil(generateCostPoints.value - userStore.points)
  )
  showPointsRechargeModal.value = true
}

function closePointsRechargeModal() {
  showPointsRechargeModal.value = false
}

function onPointsRechargeConfirm(payload) {
  safeHideKeyboard()
  uni.showToast({
    title: `请接入支付 ¥${payload.payYuan} / ${payload.points}点`,
    icon: 'none'
  })
  closePointsRechargeModal()
}

function safeHideKeyboard() {
  try {
    if (typeof uni !== 'undefined' && typeof uni.hideKeyboard === 'function') {
      uni.hideKeyboard()
    }
  } catch {
    // ignore
  }
}

// --- 发起成片（弹窗内 / 主按钮：VIP 模块先校验会员；已是 VIP 且点数不足则弹出充值点数） ---
function confirmGenerateFromPopup() {
  if (!ensureVipForGenerate()) return
  if (userStore.points < generateCostPoints.value) {
    if (userStore.isVip) {
      openPointsRechargeForGenerate()
    } else {
      uni.showToast({ title: '点数不足', icon: 'none' })
    }
    return
  }
  closeQualityPopup()
  generateVideo()
}

function generateVideo() {
  if (!ensureVipForGenerate()) return
  if (userStore.points < generateCostPoints.value) {
    if (userStore.isVip) {
      openPointsRechargeForGenerate()
    } else {
      uni.showToast({ title: '点数不足', icon: 'none' })
    }
    return
  }
  uni.showToast({
    title: '开始生成视频',
    icon: 'none'
  })
}
</script>

<style lang="scss" scoped>
/* 【一键成片 · 生成页】区块样式：导航 / 筛选 / 卡片 / 底栏 / 业务与平台弹窗 */

.generate-page {
  min-height: 100vh;
  /* 底栏为两行（操作行 + 提示文案），固定 height 过小会导致内容溢出盖住上方；预留与底栏实际高度一致 */
  padding-bottom: calc(268rpx + constant(safe-area-inset-bottom));
  padding-bottom: calc(268rpx + env(safe-area-inset-bottom));
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

.nav-bar__gap {
  flex-shrink: 0;
  width: 174rpx;
  height: 32rpx;
}

.filter-bar {
  height: 82rpx;
  padding: 0 20rpx;
  border-bottom: 1rpx solid #eeeeee;
  display: flex;
  align-items: center;
  gap: 30rpx;
}

.filter-group,
.filter-pill,
.section-header,
.segment,
.bottom-action,
.quality-select,
.generate-btn {
  display: flex;
  align-items: center;
}

.filter-label {
  margin-right: 12rpx;
  color: #1f2933;
  font-size: 26rpx;
  font-weight: 700;
}

.filter-pill {
  height: 52rpx;
  padding: 0 24rpx;
  border-radius: 999rpx;
  background: #f1f1f1;
  color: #4d5560;
  font-size: 24rpx;
  gap: 14rpx;

  /* 与一键成片商户页行业下拉右侧箭头一致 */
  .filter-pill__arrow {
    flex-shrink: 0;
    width: 28rpx;
    height: 28rpx;
    margin-left: 18rpx;
  }
}

.tag-row {
  padding: 10rpx 20rpx 24rpx;
  border-bottom: 1rpx solid #f1f1f1;
  display: flex;
  flex-wrap: wrap;
  gap: 14rpx;
}

.tag {
  height: 54rpx;
  padding: 0 22rpx;
  border: 1rpx solid #ff9a35;
  border-radius: 999rpx;
  color: #ff8e24;
  background: #fff3e6;
  font-size: 23rpx;
  line-height: 54rpx;
}

.section {
  padding: 26rpx 20rpx 18rpx;
  border-bottom: 1rpx solid #f1f1f1;
}

.section-title {
  color: #1f2933;
  font-size: 28rpx;
  font-weight: 700;
}

.section-header {
  justify-content: space-between;
}

/* 与筛选项 pill 同高，标题与按钮垂直居中 */
.template-section-header {
  align-items: center;
  min-height: 52rpx;
  gap: 16rpx;
}

.template-section-title {
  flex: 1;
  min-width: 0;
  line-height: 1.35;
}

/* 设计稿：右侧「查看成片」为独立圆角按钮，非纯文字链 */
.view-works-btn {
  box-sizing: border-box;
  flex-shrink: 0;
  height: 52rpx;
  padding: 0 26rpx 0 28rpx;
  border-radius: 999rpx;
  border: 1rpx solid #ffd4a3;
  background: linear-gradient(180deg, rgba(255, 197, 129, 1) 0%, rgba(255, 148, 50, 1) 100%);
  display: flex;
  flex-direction: row;
  align-items: center;
  position: relative;
}

/* 无独立底色块：图标区透明，透出按钮渐变；黑底白标 PNG 用 screen 与底色融合，避免再叠一层黑/白底 */
.view-works-btn__icon-wrap {
  box-sizing: border-box;
  width: 36rpx;
  height: 36rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  background: transparent;
}

.view-works-btn__icon {
  width: 26rpx;
  height: 26rpx;
  mix-blend-mode: screen;
}

.view-works-btn__label {
  font-size: 24rpx;
  font-weight: 600;
  color: #FFFFFF;
  line-height: 1;
  margin-left: 10rpx;
}

.tips {
  color: #9ca3af;
  font-size: 24rpx;
}

.tips--shooting {
  display: flex;
  align-items: center;
  gap: 6rpx;
}

.tips-chevron {
  flex-shrink: 0;
  width: 24rpx;
  height: 24rpx;
  margin-left: 2rpx;
}

.tips-icon-img {
  flex-shrink: 0;
  width: 28rpx;
  height: 28rpx;
}

.tips-icon {
  margin-right: 6rpx;
}

.template-scroll {
  margin-top: 20rpx;
  white-space: nowrap;
}

.template-list {
  display: inline-flex;
  gap: 14rpx;
}

/* 与「请上传照片」一致：抵消 section 左右 padding，全宽横滑；默认可视约 3 个 180rpx 形象 + 下一格露出 */
.avatar-scroll-outer {
  margin-top: 20rpx;
  margin-left: -20rpx;
  margin-right: -20rpx;
  width: calc(100% + 40rpx);
  box-sizing: border-box;
}

.avatar-scroll {
  width: 100%;
  white-space: nowrap;
  box-sizing: border-box;
}

.avatar-list {
  display: inline-flex;
  flex-direction: row;
  align-items: flex-start;
  gap: 20rpx;
  padding: 0 20rpx 8rpx 20rpx;
  box-sizing: border-box;
}

.template-card {
  position: relative;
  overflow: hidden;
  width: 222rpx;
  border: 2rpx solid transparent;
  border-radius: 12rpx;
  background: #ffffff;
  box-shadow: 0 8rpx 20rpx rgba(255, 137, 30, 0.12);
}

.template-card.active {
  border-color: #ff982f;
}

.template-image {
  width: 222rpx;
  height: 138rpx;
}

.template-check,
.avatar-check {
  position: absolute;
  top: 8rpx;
  right: 8rpx;
  width: 34rpx;
  height: 34rpx;
  border-radius: 8rpx;
  background: #ffffff;
  display: flex;
  align-items: center;
  justify-content: center;
}

.template-check__icon,
.avatar-check__icon {
  width: 22rpx;
  height: 22rpx;
}

.template-body {
  padding: 10rpx;
}

.template-title,
.template-desc {
  display: block;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.template-title {
  color: #333333;
  font-size: 22rpx;
  font-weight: 700;
}

.template-desc {
  margin-top: 4rpx;
  color: #777777;
  font-size: 18rpx;
}

.template-meta {
  margin-top: 10rpx;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.template-tag {
  padding: 3rpx 8rpx;
  border-radius: 6rpx;
  background: #fff1dc;
  color: #ff8e24;
  font-size: 16rpx;
}

.template-hot {
  color: #ff9b36;
  font-size: 17rpx;
}

/* 与屏幕内容区等宽横滑：抵消 section 左右 padding，默认可视约 3 格 + 下一格露出；共 4 个模块 */
.photo-scroll-outer {
  margin-top: 20rpx;
  margin-left: -20rpx;
  margin-right: -20rpx;
  width: calc(100% + 40rpx);
  box-sizing: border-box;
}

.photo-list-scroll {
  width: 100%;
  white-space: nowrap;
  box-sizing: border-box;
}

.photo-list {
  display: inline-flex;
  flex-direction: row;
  align-items: flex-start;
  gap: 20rpx;
  padding: 0 20rpx 8rpx 20rpx;
  box-sizing: border-box;
}

.photo-slot {
  box-sizing: border-box;
  flex-shrink: 0;
  width: 180rpx;
  height: 180rpx;
  border: 1rpx solid #ffe2e2;
  border-radius: 18rpx;
  background: #fff9f9;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 16rpx;
}

.photo-slot__circle {
  width: 64rpx;
  height: 64rpx;
  border-radius: 50%;
  background-color: rgba(255, 255, 255, 1);
  box-shadow: 0rpx 0rpx 6rpx 0rpx rgba(223, 192, 192, 0.49);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.photo-slot__plus {
  width: 24rpx;
  height: 24rpx;
}

.photo-slot__label {
  color: #c7a6a6;
  font-size: 21rpx;
  line-height: 1.3;
  text-align: center;
  padding: 0 8rpx;
  box-sizing: border-box;
  white-space: normal;
  width: 100%;
}

.segment {
  height: 48rpx;
  padding: 4rpx;
  border-radius: 999rpx;
  background: #f4f4f4;
}

.segment-item {
  min-width: 82rpx;
  height: 40rpx;
  border-radius: 999rpx;
  color: #9ca3af;
  font-size: 23rpx;
  line-height: 40rpx;
  text-align: center;
}

.segment-item.active {
  background: #ff9b36;
  color: #ffffff;
}

.avatar-card {
  position: relative;
  overflow: hidden;
  width: 180rpx;
  height: 180rpx;
  flex-shrink: 0;
  border: 2rpx solid transparent;
  border-radius: 18rpx;
  box-sizing: border-box;
}

.avatar-card.active {
  border-color: #ff982f;
}

.avatar-image {
  width: 180rpx;
  height: 180rpx;
  display: block;
}

.avatar-label {
  position: absolute;
  left: 10rpx;
  top: 10rpx;
  max-width: calc(100% - 20rpx);
  padding: 4rpx 10rpx;
  border-radius: 999rpx;
  background: rgba(0, 0, 0, 0.35);
  color: #ffffff;
  font-size: 20rpx;
  line-height: 1.25;
  box-sizing: border-box;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.copy-card {
  margin-top: 22rpx;
  padding: 22rpx;
  border-radius: 18rpx;
  background: #fff9f9;
}

.copy-textarea {
  width: 100%;
  height: 196rpx;
  color: #5d6672;
  font-size: 25rpx;
  line-height: 1.7;
}

.copy-footer {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 14rpx;
  color: #a4abb5;
  font-size: 22rpx;
}

.clear-btn {
  width: 86rpx;
  height: 38rpx;
  margin: 0;
  padding: 0;
  border-radius: 999rpx;
  background: #9ca3af;
  color: #ffffff;
  font-size: 20rpx;
  line-height: 38rpx;
}

.clear-btn--empty {
  background: rgba(156, 163, 175, 0.5);
  color: rgba(255, 255, 255, 0.85);
}

.clear-btn::after,
.generate-btn::after {
  border: 0;
}

.bottom-action {
  box-sizing: border-box;
  position: fixed;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 20;
  min-height: calc(178rpx + constant(safe-area-inset-bottom));
  min-height: calc(178rpx + env(safe-area-inset-bottom));
  padding: 28rpx 30rpx constant(safe-area-inset-bottom);
  padding: 28rpx 30rpx env(safe-area-inset-bottom);
  background: #f4f4f4;
  gap: 18rpx;
  flex-wrap: wrap;
}

.quality-select {
  width: 234rpx;
  height: 88rpx;
  padding: 0 48rpx 0 40rpx;
  border-radius: 999rpx;
  background: #d7d9de;
  color: #526070;
  flex-wrap: wrap;
  position: relative;
  box-sizing: border-box;
  flex-shrink: 0;
}

.quality-main {
  width: 100%;
  font-size: 30rpx;
  font-weight: 800;
}

.quality-sub {
  margin-top: -12rpx;
  font-size: 16rpx;
}

.quality-arrow-icon {
  position: absolute;
  right: 20rpx;
  top: 50%;
  transform: translateY(-50%);
  width: 28rpx;
  height: 28rpx;
}

.generate-btn {
  box-sizing: border-box;
  width: 422rpx;
  flex: none;
  height: 88rpx;
  margin: 0;
  border-radius: 999rpx;
  background: linear-gradient(180deg, #ffc98f 0%, #ff9835 100%);
  color: #ffffff;
  font-size: 30rpx;
  line-height: 88rpx;
  justify-content: center;
  align-items: center;
  gap: 0;
  flex-shrink: 0;
}

.generate-btn__label {
  flex-shrink: 0;
  margin-right: 56rpx;
}

.generate-btn__divider {
  flex-shrink: 0;
  width: 2rpx;
  height: 36rpx;
  border-radius: 1rpx;
  background: rgba(255, 255, 255, 0.45);
  margin-right: 28rpx;
}

.generate-btn__stack-icon {
  flex-shrink: 0;
  width: 30rpx;
  height: 30rpx;
  margin-right: 12rpx;
}

.cost {
  font-size: 23rpx;
}

.ai-tip {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 4rpx;
}

.ai-tip__icon {
  flex-shrink: 0;
  width: 20rpx;
  height: 20rpx;
}

.ai-tip__text {
  font-size: 20rpx;
  color: #9ca3af;
  line-height: 1.45;
}

.popup-mask {
  position: fixed;
  inset: 0;
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

.business-list {
  margin-top: 32rpx;
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

.business-option.focused {
  border-color: #409eff;
}

.business-name {
  color: #ff8e24;
  font-size: 28rpx;
  font-weight: 700;
}

.business-desc {
  margin-left: 28rpx;
  color: #5d6672;
  font-size: 24rpx;
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

.business-add {
  height: 90rpx;
  margin-top: 20rpx;
  border-radius: 18rpx;
  background: #f2f2f2;
  color: #1f2933;
  font-size: 28rpx;
  display: flex;
  align-items: center;
  justify-content: center;
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

.platform-popup {
  box-sizing: border-box;
  width: 100%;
  padding: 16rpx 22rpx calc(40rpx + constant(safe-area-inset-bottom));
  padding: 16rpx 22rpx calc(40rpx + env(safe-area-inset-bottom));
  border-radius: 26rpx 26rpx 0 0;
  background: #ffffff;
}

/* 设计稿：四个平台同一行横排，未选中灰边白底，选中橙边浅橙底 */
.platform-list {
  box-sizing: border-box;
  margin-top: 36rpx;
  display: flex;
  flex-direction: row;
  flex-wrap: nowrap;
  align-items: stretch;
  justify-content: space-between;
  gap: 12rpx;
  padding: 0 4rpx;
}

.platform-option {
  box-sizing: border-box;
  flex: 1;
  min-width: 0;
  height: 76rpx;
  margin-top: 0;
  border-radius: 16rpx;
  border: 2rpx solid #e5e7eb;
  background: #ffffff;
  color: #1f2933;
  font-size: 24rpx;
  font-weight: 600;
  display: flex;
  align-items: center;
  justify-content: center;
  line-height: 1.2;
  text-align: center;
}

.platform-option.active {
  border-color: #ff9a31;
  background: #fff2df;
  color: #ff8e24;
}

.platform-popup .popup-confirm {
  display: block;
  width: 100%;
  max-width: 510rpx;
  margin: 48rpx auto 0;
}
</style>
