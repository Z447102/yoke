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
          <text>{{ currentBusinessSlotTitle }}</text>
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
          <!-- 小程序里 text 作 flex 子项易竖排，用 view 保证图标与文案同一行 -->
          <view class="view-works-btn__label">查看成片</view>
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

    <!-- 素材：上传照片（设计：四格 + 每格下「示例」+ 顶部照片示例入口） -->
    <view class="section upload-section">
      <view class="section-header upload-section-header">
        <view class="section-title">请上传照片</view>
        <view class="photo-examples-link" @tap.stop="openPhotoExamples">
          <image
            class="photo-examples-link__icon"
            :src="createIconUploadHelp"
            mode="aspectFit"
          />
          <text class="photo-examples-link__text">照片示例</text>
          <image
            class="photo-examples-link__chevron"
            :src="createPhotoExamplesChevron"
            mode="aspectFit"
          />
        </view>
      </view>

      <view class="upload-warning">
        <text class="upload-warning__alert">* 重要提示</text>
        <text class="upload-warning__rest">请参照 </text>
        <text
          class="upload-warning__rest upload-warning__link"
          @tap.stop="openPhotoExamples"
        >[照片示例]</text>
        <text class="upload-warning__rest"> 拍摄照片</text>
      </view>

      <!-- 与旧版一致：默认可视约 3 格 + 露出一截下一格，横向滑动看剩余 -->
      <view class="photo-scroll-outer">
        <scroll-view
          scroll-x
          class="photo-upload-scroll"
          :show-scrollbar="false"
          enable-flex
        >
          <view class="photo-upload-list">
            <view
              v-for="slot in photoSlotList"
              :key="slot.key"
              class="upload-photo-slide"
            >
              <view class="photo-slot-box" @tap="onPickPhoto(slot.key)">
                <view class="photo-slot-box__circle">
                  <image
                    class="photo-slot-box__plus"
                    :src="createIconPhotoPlus"
                    mode="aspectFit"
                  />
                </view>
                <text class="photo-slot-box__label">{{ slot.label }}</text>
              </view>
              <view
                class="photo-example-pill"
                @tap.stop="openPhotoSlotExample(slot.key)"
              >
                示例
              </view>
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

    <!-- 视频口播文案：多行独立输入（字数限制按设计稿） -->
    <view class="section copy-section">
      <view class="section-title copy-section-title">视频口播文案</view>
      <view class="copy-lines">
        <view
          v-for="line in scriptLines"
          :key="line.key"
          class="copy-line-row"
          :class="
            line.maxLen > 0 ? 'copy-line-row--editable' : 'copy-line-row--static'
          "
        >
          <template v-if="line.maxLen > 0">
            <input
              v-model="line.text"
              class="copy-line-input"
              type="text"
              :maxlength="line.maxLen"
            />
            <text class="copy-line-count">
              {{ line.text.length }}/{{ line.maxLen }}字
            </text>
          </template>
          <text v-else class="copy-line-static-text">{{ line.text }}</text>
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
            v-for="(business, businessIndex) in businessOptions"
            :key="business.id"
            class="business-option"
            :class="{ active: tempBusiness === business.id }"
            @tap="selectBusiness(business.id)"
          >
            <view class="business-info">
              <text class="business-name">{{
                businessSlotTitle(businessIndex)
              }}</text>
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

        <view class="business-add" @tap.stop="onBusinessAdd">
          <!-- 小程序 <image> 对 SVG 兼容性差，改用 view 绘制 + 保证必显 -->
          <view class="business-add__icon-plus" aria-hidden="true">
            <view class="business-add__icon-bar business-add__icon-bar--v" />
            <view class="business-add__icon-bar business-add__icon-bar--h" />
          </view>
          <text>新增主营业务</text>
        </view>
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

    <GenerateWarmTipModal
      :show="showGenerateWarmTipModal"
      @confirm="onGenerateWarmTipConfirm"
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
import GenerateWarmTipModal from '../components/GenerateWarmTipModal.vue'
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
import createPhotoExamplesChevron from '@/static/create/create-icon-business-edit-chevron.png'
import createIconPhotoPlus from '@/static/create/create-icon-photo-plus.png'
import createIconStack from '@/static/create/create-icon-stack.png'
import createIconBusinessEdit from '@/static/create/create-icon-business-edit.png'
import createIconBusinessEditChevron from '@/static/create/create-icon-business-edit-chevron.png'
import createIconAttention from '@/static/create/create-icon-attention.png'
import { onReady, onShow } from '@dcloudio/uni-app'

const createNavBarStyle = ref(getCreateNavBarInlineStyle())

const PRIMARY_BUSINESS_ID = 'primary'

// --- 页面静态配置：模板、标签、照片槽、数字人形象（Mock，后续接接口） ---
const businessTags = ref([])
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
/** 上传槽位：与设计稿「门头 / 菜品 / 环境01 / 环境02」一致 */
const photoSlotList = [
  { key: 'facade', label: '门头照片' },
  { key: 'dish', label: '菜品照片' },
  { key: 'env1', label: '环境照片01' },
  { key: 'env2', label: '环境照片02' }
]
const STORAGE_AVATAR_TAB = 'create:generate-avatar-tab'
const STORAGE_AVATAR_ID_OFFICIAL = 'create:generate-avatar-id-official'
const STORAGE_AVATAR_ID_MINE = 'create:generate-avatar-id-mine'
/** 生成前「温馨提示」勾选「下次不再提示」后写入 */
const STORAGE_SKIP_GENERATE_WARM_TIP = 'create:skip-generate-warm-tip'

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
    desc: '餐饮-火锅',
    tagLabels: ['餐饮', '火锅']
  },
  {
    id: 'business2',
    name: '主营业务2',
    path: '餐饮-正餐(家常菜 / 酒楼)...',
    desc: '餐饮-正餐(家常菜 / 酒楼)...',
    tagLabels: ['餐饮', '正餐(家常菜 / 酒楼)']
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
/**
 * 口播文案分行：maxLen>0 时为可编辑输入框 + 字数；maxLen===0 时为只读展示文案（白底无框）
 */
const scriptLines = ref([
  { key: 's1', text: '重庆老火锅', maxLen: 10 },
  { key: 's2', text: '这味道太顶了！', maxLen: 0 },
  { key: 's3', text: '惠州的宝藏正宗重庆老火锅店', maxLen: 20 },
  {
    key: 's4',
    text: '食材新鲜，现吃现切，锅底麻辣鲜香，直接封神！',
    maxLen: 0
  },
  { key: 's5', text: '爱吃重庆老火锅的直接闭眼冲！', maxLen: 0 },
  { key: 's6', text: '满满一大桌6荤8素，仅需168', maxLen: 20 }
])

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
const showGenerateWarmTipModal = ref(false)
// 本地直出「有优惠活动」版充值弹窗；联调后改回 userStore.pointsTopUpHasPromo
const pointsRechargeHasPromo = computed(() => true)

/** 与商户信息页一致：用于「编辑」跳转主营业务子页 */
const createFlowIndustry = ref('餐饮')
/** 从弹窗点「编辑」进入子页返回后，用于写回对应条目 */
const editingBusinessId = ref('')
/** 「新增主营业务」跳转选择页返回后追加一条到下拉选项 */
const pendingAddNewBusiness = ref(false)

// --- 展示用 computed ---
const currentBusiness = computed(
  () =>
    businessOptions.value.find((item) => item.id === selectedBusiness.value) ||
    businessOptions.value[0]
)

/** 筛选项与弹窗列表统一：按顺序展示「主营业务1 / 2 / 3…」 */
function businessSlotTitle(index) {
  const n = Number(index) + 1
  return Number.isFinite(n) && n > 0 ? `主营业务${n}` : '主营业务'
}

const currentBusinessSlotTitle = computed(() => {
  const list = businessOptions.value
  const idx = list.findIndex((b) => b.id === selectedBusiness.value)
  return idx >= 0 ? businessSlotTitle(idx) : businessSlotTitle(0)
})

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
  const biz = businessOptions.value.find(
    (b) => b.id === selectedBusiness.value
  )
  businessTags.value = tagLabelsForBusiness(biz || {})
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
      desc,
      tagLabels: labels.length ? [...labels] : []
    }
  ]
  selectedBusiness.value = PRIMARY_BUSINESS_ID
  tempBusiness.value = PRIMARY_BUSINESS_ID
  businessTags.value = labels.length ? [...labels] : []
}

function applySelectedBusiness(payload) {
  const labels = pathLabelsFromPayload(payload.path)
  const desc =
    labels.join(' - ') ||
    String(payload.displayName || '').trim() ||
    '未选择'
  const shortName = labels[labels.length - 1] || '主营业务'

  if (pendingAddNewBusiness.value) {
    pendingAddNewBusiness.value = false
    const newId = `biz_${Date.now()}`
    businessOptions.value.push({
      id: newId,
      name: shortName,
      path: desc,
      desc,
      tagLabels: labels.length ? [...labels] : []
    })
    selectedBusiness.value = newId
    tempBusiness.value = newId
    if (labels.length) {
      businessTags.value = labels
    }
    if (payload.industry) {
      createFlowIndustry.value =
        String(payload.industry).trim() || createFlowIndustry.value
    }
    editingBusinessId.value = ''
    return
  }

  const id = editingBusinessId.value || selectedBusiness.value
  const list = businessOptions.value
  const idx = list.findIndex((b) => b.id === id)
  if (idx >= 0) {
    list[idx] = {
      ...list[idx],
      name: shortName,
      path: desc,
      desc,
      tagLabels:
        labels.length > 0 ? [...labels] : list[idx].tagLabels
    }
  } else if (list.length) {
    list[0] = {
      ...list[0],
      name: shortName,
      path: desc,
      desc,
      tagLabels:
        labels.length > 0 ? [...labels] : list[0].tagLabels
    }
  }
  if (labels.length) {
    businessTags.value = labels
  }
  if (payload.industry) {
    createFlowIndustry.value =
      String(payload.industry).trim() || createFlowIndustry.value
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
  pendingAddNewBusiness.value = false
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

/** 查看成片：跳转列表页（当前用 `mock=1` 拉 Mock 有数据列表；接入真实接口后去掉 query） */
function openViewFinishedVideos() {
  uni.navigateTo({
    url: '/pages/create/works/index?mock=1',
    fail: () => {
      uni.showToast({ title: '页面打开失败', icon: 'none' })
    }
  })
}

/** 跳转照片示例页；槽位「示例」带 tab 预选对齐门头/菜品/环境 */
function openPhotoExamples() {
  uni.navigateTo({
    url: '/pages/create/photo-examples/index',
    fail: () => uni.showToast({ title: '页面打开失败', icon: 'none' })
  })
}

function openPhotoSlotExample(key) {
  const q = key ? `?tab=${encodeURIComponent(String(key))}` : ''
  uni.navigateTo({
    url: `/pages/create/photo-examples/index${q}`,
    fail: () => uni.showToast({ title: '页面打开失败', icon: 'none' })
  })
}

function onPickPhoto() {
  uni.chooseImage({
    count: 1,
    sizeType: ['compressed'],
    sourceType: ['album', 'camera'],
    success: () => {
      uni.showToast({ title: '已添加照片', icon: 'none' })
    }
  })
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
  const biz = businessOptions.value.find(
    (b) => b.id === selectedBusiness.value
  )
  businessTags.value = tagLabelsForBusiness(biz || {})
  closeBusinessPopup()
}

/** 编辑：跳转主营业务子页，返回后由 onShow 读 create:selected-business 写回 */
function onBusinessEdit(business) {
  const industry = String(createFlowIndustry.value || '').trim() || '餐饮'
  editingBusinessId.value = business?.id != null ? String(business.id) : ''
  pendingAddNewBusiness.value = false
  closeBusinessPopup()
  uni.navigateTo({
    url: `/pages/create/business/index?industry=${encodeURIComponent(industry)}&intent=edit`
  })
}

/** 新增主营业务：与设计稿一致进入「主营业务」选择页 */
function onBusinessAdd() {
  editingBusinessId.value = ''
  pendingAddNewBusiness.value = true
  closeBusinessPopup()
  uni.navigateTo({
    url: '/pages/create/business/index?intent=add&from=generate-add'
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
  openGenerateWarmTipOrRun()
}

function shouldSkipGenerateWarmTip() {
  try {
    return uni.getStorageSync(STORAGE_SKIP_GENERATE_WARM_TIP) === '1'
  } catch {
    return false
  }
}

/** 已通过 VIP / 点数校验后：按需弹出「温馨提示」，再进入生成流程 */
function openGenerateWarmTipOrRun() {
  if (shouldSkipGenerateWarmTip()) {
    runGenerateSuccessFlow()
    return
  }
  safeHideKeyboard()
  showGenerateWarmTipModal.value = true
}

function onGenerateWarmTipConfirm(payload) {
  if (payload?.skipNextTime) {
    try {
      uni.setStorageSync(STORAGE_SKIP_GENERATE_WARM_TIP, '1')
    } catch {
      // ignore
    }
  }
  showGenerateWarmTipModal.value = false
  runGenerateSuccessFlow()
}

function runGenerateSuccessFlow() {
  uni.showToast({
    title: '开始生成视频',
    icon: 'none'
  })
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
  openGenerateWarmTipOrRun()
}
</script>

<style lang="scss" scoped>
/* 【一键成片 · 生成页】区块样式：导航 / 筛选 / 卡片 / 底栏 / 业务与平台弹窗 */

.generate-page {
  // min-height: 100vh;
  /* 固定底栏：画质+生成按钮同排或竖向换行、下方 AI 提示；栏高会变高，留白不足会把最后一屏内容与底栏重合，滚动末尾显示不全 */
  padding-bottom: calc(240rpx + constant(safe-area-inset-bottom));
  padding-bottom: calc(240rpx + env(safe-area-inset-bottom));
  background: #ffffff;
  color: #202633;
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
  // border-bottom: 1rpx solid #f1f1f1;
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
  flex-wrap: nowrap;
  align-items: center;
  justify-content: center;
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
  flex-shrink: 0;
  font-size: 24rpx;
  font-weight: 600;
  color: #ffffff;
  line-height: 1.2;
  margin-left: 10rpx;
  white-space: nowrap;
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

.upload-section-header {
  align-items: center;
  min-height: 52rpx;
}

.photo-examples-link {
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 8rpx;
  flex-shrink: 0;
}

.photo-examples-link__icon {
  width: 28rpx;
  height: 28rpx;
  flex-shrink: 0;
  display: block;
}

.photo-examples-link__text {
  line-height: 42rpx;
  color: rgba(156, 163, 175, 1);
  font-size: 28rpx;
  font-family: OPPOSans-regular, OPPOSans, -apple-system, sans-serif;
  font-weight: 400;
}

.photo-examples-link__chevron {
  width: 24rpx;
  height: 24rpx;
  flex-shrink: 0;
  display: block;
}

.upload-warning {
  margin-top: 14rpx;
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  align-items: baseline;
  line-height: 1.55;
}

.upload-warning__alert {
  margin-right: 18rpx;
  font-size: 24rpx;
  color: #ff705a;
}

.upload-warning__rest {
  font-size: 24rpx;
  color: #6b7280;
}

/* 可点击，与说明文案同色 */
.upload-warning__link {
  padding: 0 2rpx;
}

.photo-scroll-outer {
  margin-top: 22rpx;
  margin-left: -20rpx;
  margin-right: -20rpx;
  width: calc(100% + 40rpx);
  box-sizing: border-box;
}

.photo-upload-scroll {
  width: 100%;
  white-space: nowrap;
  box-sizing: border-box;
}

.photo-upload-list {
  display: inline-flex;
  flex-direction: row;
  align-items: flex-start;
  gap: 20rpx;
  padding: 0 20rpx 8rpx 20rpx;
  box-sizing: border-box;
}

.upload-photo-slide {
  flex-shrink: 0;
  width: 180rpx;
  display: flex;
  flex-direction: column;
  align-items: center;
}

/* 上传方格：与改版前 .photo-slot 一致（浅粉底 + 描边 + 圆形容器上的加号） */
.photo-slot-box {
  box-sizing: border-box;
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

.photo-slot-box__circle {
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

.photo-slot-box__plus {
  width: 24rpx;
  height: 24rpx;
}

.photo-slot-box__label {
  color: #c7a6a6;
  font-size: 21rpx;
  line-height: 1.3;
  text-align: center;
  padding: 0 8rpx;
  box-sizing: border-box;
  white-space: normal;
  width: 100%;
}

.photo-example-pill {
  margin-top: 20rpx;
  width: 100%;
  max-width: 132rpx;
  height: 44rpx;
  line-height: 44rpx;
  text-align: center;
  border-radius: 999rpx;
  font-size: 22rpx;
  color: #ffffff;
  font-weight: 500;
  background: linear-gradient(
    180deg,
    rgba(255, 197, 129, 1) 0%,
    rgba(255, 148, 50, 1) 100%
  );
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

.copy-section {
  background-color: rgba(255, 255, 255, 1);
}

.copy-section-title {
  margin-bottom: 0;
}

.copy-lines {
  margin-top: 26rpx;
  background-color: rgba(255, 255, 255, 1);
}

.copy-line-row {
  box-sizing: border-box;
  margin-top: 16rpx;
}

.copy-line-row:first-child {
  margin-top: 0;
}

.copy-line-row--editable {
  width: 710rpx;
  max-width: 100%;
  height: 56rpx;
  box-sizing: border-box;
  padding: 0 24rpx;
  border-radius: 12rpx;
  background-color: rgba(254, 249, 249, 1);
  border: 1rpx solid rgba(252, 240, 240, 1);
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 16rpx;
}

.copy-line-row--static {
  width: 710rpx;
  max-width: 100%;
  height: 56rpx;
  box-sizing: border-box;
  /* 与带框行同宽高；透明边线占位 + 左右 24rpx，与 input 对齐 */
  padding: 0 24rpx;
  border: 1rpx solid transparent;
  border-radius: 12rpx;
  background-color: rgba(255, 255, 255, 1);
  display: flex;
  flex-direction: row;
  align-items: center;
}

.copy-line-input {
  flex: 1;
  min-width: 0;
  height: 56rpx;
  line-height: 56rpx;
  font-size: 24rpx;
  color: #6b7280;
  background: transparent;
  border: none;
}

.copy-line-count {
  flex-shrink: 0;
  font-size: 22rpx;
  color: #9ca3af;
  line-height: 56rpx;
}

.copy-line-static-text {
  flex: 1;
  min-width: 0;
  font-size: 24rpx;
  color: #6b7280;
  line-height: 56rpx;
  height: 56rpx;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

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
  padding-top: 28rpx;
  padding-left: 30rpx;
  padding-right: 30rpx;
  padding-bottom: calc(20rpx + constant(safe-area-inset-bottom));
  padding-bottom: calc(20rpx + env(safe-area-inset-bottom));
  background: #f4f4f4;
  gap: 18rpx;
  flex-wrap: wrap;
  align-content: flex-start;
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
  flex-direction: row;
  align-items: center;
  justify-content: center;
  gap: 10rpx;
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
