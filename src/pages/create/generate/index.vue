<template>
  <!-- 一键成片 · 生成配置页 | docs §10：导航 → 筛选 → 模板/标签 → 照片/形象/文案 → 底栏 → 弹窗 -->
  <view
    class="generate-page"
    :class="{ 'generate-page--sensitive-banner': hasScriptSensitiveHit }"
  >
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
        v-for="(tag, tagIndex) in businessTags"
        :key="`${tagIndex}-${tag}`"
        class="tag active"
      >
        {{ tag }}
      </view>
    </view>

    <!-- 视频模板 -->
    <view class="section">
      <view class="section-header template-section-header">
        <text class="section-title template-section-title">请选择视频模板</text>
        <view class="view-works-btn" :class="{ 'view-works-btn__popup': showGeneratingQueueSheet }" @tap="openViewFinishedVideos">
          <view class="view-works-btn__icon-wrap" aria-hidden="true">
            <image
              class="view-works-btn__icon"
              :src="createIconViewFilm"
              mode="aspectFit"
            />
          </view>
          <!-- 小程序里 text 作 flex 子项易竖排，用 view 保证图标与文案同一行 -->
          <view class="view-works-btn__label">查看成片</view>
          <image src="../static/create-icon-hand.png" class="view-works-btn__hand" />
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
                @tap.stop="openPhotoSlotExample(slot)"
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
            <view class="copy-line-input-wrap">
              <view class="copy-line-highlight">
                <block
                  v-for="(seg, si) in scriptLineSegments(line)"
                  :key="line.key + '-seg-' + si"
                >
                  <text
                    class="copy-line-seg"
                    :class="{ 'copy-line-seg--sensitive': seg.sensitive }"
                  >{{ seg.text }}</text>
                </block>
              </view>
              <input
                v-model="line.text"
                class="copy-line-input copy-line-input--overlay"
                type="text"
                :maxlength="SCRIPT_INPUT_MAX_LEN"
              />
            </view>
            <view class="copy-line-count">
              <text
                class="copy-line-count__cur"
                :class="{ 'copy-line-count__cur--danger': scriptLineCountDanger(line) }"
              >{{ line.text.length }}</text>
              <text class="copy-line-count__rest">/{{ line.maxLen }}字</text>
            </view>
          </template>
          <text v-else class="copy-line-static-text">{{ line.text }}</text>
        </view>
      </view>
      <view v-if="hasScriptSensitiveHit" class="copy-sensitive-banner">
        <text class="copy-sensitive-banner__title">* 敏感词提示：</text>
        <view class="copy-sensitive-banner__body-wrap">
          <text class="copy-sensitive-banner__body">识别到口播文案中出现广告极限词，请您更改后生成视频。</text>
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

        <scroll-view
          scroll-y
          class="business-list-scroll"
          :style="{ height: businessListScrollHeightRpx + 'rpx' }"
        >
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
              <view class="business-popup-summary">
                <text class="business-popup-summary__prefix">{{
                  businessPopupIndustryCoreLine(business)
                }}</text>
                <view
                  v-if="businessPopupParenBlock(business)"
                  class="business-popup-summary__others"
                >
                  <text class="business-popup-summary__paren">（</text>
                  <text class="business-popup-summary__others-inner">{{
                    businessPopupParenBlock(business).inner
                  }}</text>
                  <text class="business-popup-summary__paren">）</text>
                  <text
                    v-if="businessPopupParenBlock(business).dots"
                    class="business-popup-summary__dots"
                    >...</text>
                </view>
              </view>
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
        </scroll-view>

        <view class="business-actions-row">
          <view class="business-add" @tap.stop="onBusinessAdd">
            <!-- 小程序 <image> 对 SVG 兼容性差，改用 view 绘制 + 保证必显 -->
            <view class="business-add__icon-plus" aria-hidden="true">
              <view class="business-add__icon-bar business-add__icon-bar--v" />
              <view class="business-add__icon-bar business-add__icon-bar--h" />
            </view>
            <text>新增主营业务</text>
          </view>
          <view class="business-add" @tap.stop="onBusinessDelete">
            <!-- 与「+」一致用线条绘制；避免 works-icon-delete 白线黑底在浅灰按钮上发黑块 -->
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
        <button class="popup-confirm" @tap="confirmBusiness">确定</button>
      </view>
    </view>

    <!-- 删除主营业务确认（叠在选择弹窗之上，与设计稿一致） -->
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

    <!-- 排队弹窗 -->
    <GeneratingQueueSheet
      :show="showGeneratingQueueSheet"
      @close="showGeneratingQueueSheet = false"
    />
  </view>
</template>

<script setup>
import { StaticPath } from '@/config'
/**
 * 【一键成片 · 生成配置页】pages/create/generate/index.vue
 *
 * 功能块：筛选与模板、素材与文案（含口播敏感词高亮与提示条）、底部成片操作、业务/平台弹窗、画质与模型子组件。
 * 规范：docs/frontend-development.md §10；常量 @/constants/create；接口 @/api/create。
 */
import { computed, nextTick, onMounted, ref, watch } from 'vue'
import { useUserStore } from '@/stores/user'
import {
  getMemberMainBusinessDetail,
  listMemberMainBusinesses,
  deleteMemberMainBusiness,
  listMemberVideoTemplates,
  getVideoTemplateScriptMaterials,
  getVideoTemplatePhotoMaterials
} from '@/api/create'
import { listIndustries } from '@/api/metadata'
import { isApiEnabled } from '@/utils/request'
import {
  CREATE_MODEL_OPTIONS,
  CREATE_RESOLUTION_OPTIONS,
  computeVideoGenerateCostPoints
} from '@/constants/create'
import {
  CREATE_SELECTED_PLATFORM_STORAGE_KEY,
  PLATFORM_OPTIONS
} from '@/constants/create-selected-platform'
import QualitySettingsSheet from '../components/QualitySettingsSheet.vue'
import GeneratingQueueSheet from '../components/GeneratingQueueSheet.vue'
import VipSubscribeModal from '../components/VipSubscribeModal.vue'
import PointsRechargeModal from '../components/PointsRechargeModal.vue'
import GenerateWarmTipModal from '../components/GenerateWarmTipModal.vue'
import { supportsContinuousVipSubscription } from '@/utils/vip-subscription-platform'
import {
  getCreateNavBarInlineStyle,
  scheduleCreateNavBarStyleRefresh
} from '@/utils/create-nav-bar-style'
import {
  splitTextBySensitiveWords,
  textContainsSensitive
} from '@/utils/script-sensitive-words'
const createBackIcon = `${StaticPath}create/create-back-icon.png`
const createIconArrowDown = `${StaticPath}create/create-icon-arrow-down.png`
const createIconViewFilm = `${StaticPath}create/create-icon-view-film.png`
const createIconTemplateCheck = `${StaticPath}create/create-icon-template-check.png`
const createIconUploadHelp = `${StaticPath}create/create-icon-upload-help.png`
const createPhotoExamplesChevron = `${StaticPath}create/create-icon-business-edit-chevron.png`
const createIconPhotoPlus = `${StaticPath}create/create-icon-photo-plus.png`
const createIconStack = `${StaticPath}create/create-icon-stack.png`
const createIconBusinessEdit = `${StaticPath}create/create-icon-business-edit.png`
const createIconBusinessEditChevron = `${StaticPath}create/create-icon-business-edit-chevron.png`
const createIconAttention = `${StaticPath}create/create-icon-attention.png`
const deleteMainBusinessInfoIcon = `${StaticPath}create/delete-main-business-info-icon.png`
import { onReady, onShow } from '@dcloudio/uni-app'

const createNavBarStyle = ref(getCreateNavBarInlineStyle())

const PRIMARY_BUSINESS_ID = 'primary'

// --- 页面静态配置：模板、标签、照片槽、数字人形象（Mock，后续接接口） ---
const businessTags = ref([])
/** 主营业务选择页「确定」后的标签（路径+维度+自定义），筛选栏下展示；不含店名、定位 */
const businessSelectionTagLabels = ref([])

const FALLBACK_TEMPLATE_COVER =
  'https://images.unsplash.com/photo-1497366754035-f200968a6e72?w=300&h=220&fit=crop'

/** 未接 API / 无数据时的模板区占位（与原先 mock 一致） */
const DEFAULT_VIDEO_TEMPLATES = [
  {
    id: 'store',
    title: '探店视频这样拍',
    desc: '吸引转化客户',
    tag: '探店',
    hot: '3.2w',
    durationSec: 30,
    image: FALLBACK_TEMPLATE_COVER
  },
  {
    id: 'dish',
    title: '招聘菜这样拍',
    desc: '让客人看了更有食欲',
    tag: '菜品展示',
    hot: '2.1w',
    durationSec: 15,
    image:
      'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=300&h=220&fit=crop'
  },
  {
    id: 'coupon',
    title: '团购引流这样拍',
    desc: '让老人都爱买真特色',
    tag: '团购引流',
    hot: '2.1w',
    durationSec: 30,
    image:
      'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=300&h=220&fit=crop'
  }
]

/** 视频模板列表：接口 `/api/member/video-templates` 有数据时覆盖，否则沿用 DEFAULT */
const templates = ref([...DEFAULT_VIDEO_TEMPLATES])
/** 未接照片素材接口时的上传槽位（与原先 mock 一致；示例页 tab 对齐） */
const DEFAULT_PHOTO_SLOTS = [
  { key: 'facade', label: '门头照片', legacyExampleTab: 'facade' },
  { key: 'dish', label: '菜品照片', legacyExampleTab: 'dish' },
  { key: 'env1', label: '环境照片01', legacyExampleTab: 'env1' },
  { key: 'env2', label: '环境照片02', legacyExampleTab: 'env2' }
]

function cloneDefaultPhotoSlots() {
  return DEFAULT_PHOTO_SLOTS.map((s) => ({ ...s }))
}

/** 上传槽位：接口 `/api/member/video-templates/{id}/photo-materials` 有数据时覆盖 */
const photoSlotList = ref(cloneDefaultPhotoSlots())
const STORAGE_AVATAR_TAB = 'create:generate-avatar-tab'
const STORAGE_AVATAR_ID_OFFICIAL = 'create:generate-avatar-id-official'
const STORAGE_AVATAR_ID_MINE = 'create:generate-avatar-id-mine'
/** 生成前「温馨提示」勾选「下次不再提示」后写入 */
const STORAGE_SKIP_GENERATE_WARM_TIP = 'create:skip-generate-warm-tip'
const STORAGE_EDIT_MAIN_BUSINESS_DETAIL = 'create:edit-main-business-detail'

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

const platformOptions = PLATFORM_OPTIONS
const selectedBusiness = ref('business1')
const tempBusiness = ref('business1')
const showBusinessPopup = ref(false)
/** 选择主营业务弹窗：列表单行 90rpx + 上边距 18rpx，可视区默认 4 条，超出纵向滚动 */
const BUSINESS_LIST_ROW_HEIGHT_RPX = 108
const BUSINESS_LIST_VISIBLE_ROWS = 4
const businessListScrollHeightRpx = computed(() => {
  const n = businessOptions.value?.length ?? 0
  const rows = Math.min(Math.max(n, 0), BUSINESS_LIST_VISIBLE_ROWS)
  return rows * BUSINESS_LIST_ROW_HEIGHT_RPX
})
/** 删除主营业务：居中确认弹窗 */
const showDeleteMainBusinessConfirm = ref(false)
const deleteMainBusinessTargetId = ref('')
const selectedPlatform = ref('douyin')
const tempPlatform = ref('douyin')
const showPlatformPopup = ref(false)
/**
 * 本地占位视频模板 id（无 script-materials 接口）
 */
const LOCAL_ONLY_TEMPLATE_IDS = new Set(['store', 'dish', 'coupon'])

/** 未接模板口播接口时的默认口播行（与原先 mock 一致） */
const DEFAULT_SCRIPT_LINES = [
  { key: 's1', text: '重庆老火锅', maxLen: 10 },
  { key: 's2', text: '这味道太顶了！', maxLen: 0 },
  { key: 's3', text: '惠州的宝藏正宗重庆老火锅店', maxLen: 20 },
  {
    key: 's4',
    text: '食材新鲜，现吃现切，锅底麻辣鲜香，直接封神！',
    maxLen: 0
  },
  { key: 's5', text: '爱吃重庆老火锅的直接闭眼冲！', maxLen: 0 },
  {
    key: 's6',
    text: '满满一大桌6荤8素，全惠州最便宜，套餐仅需168',
    maxLen: 20
  }
]

function cloneDefaultScriptLines() {
  return DEFAULT_SCRIPT_LINES.map((l) => ({ ...l }))
}

/**
 * 口播文案分行：maxLen>0 时为可编辑输入框 + 字数；maxLen===0 时为只读展示文案（白底无框）
 */
const scriptLines = ref(cloneDefaultScriptLines())

/** 口播单行输入长度上限（大于设计 maxLen，便于标红超限；生成前仍会校验 maxLen） */
const SCRIPT_INPUT_MAX_LEN = 200

/**
 * 敏感词表（演示）；联调后由接口拉取字典并赋值给本 ref。
 * @type {import('vue').Ref<string[]>}
 */
const sensitiveWordList = ref([
  '全惠州最便宜',
  '国家级',
  '全网第一',
  '史无前例',
  '永久',
  '疗效最佳',
  '根治',
  '百分百'
])

const hasScriptSensitiveHit = computed(() =>
  scriptLines.value.some(
    (line) =>
      line.maxLen > 0 &&
      textContainsSensitive(line.text, sensitiveWordList.value)
  )
)

/**
 * 函数：scriptLineSegments
 */
function scriptLineSegments(line) {
  return splitTextBySensitiveWords(line.text, sensitiveWordList.value)
}

/**
 * 函数：scriptLineCountDanger
 */
function scriptLineCountDanger(line) {
  return (
    line.text.length > line.maxLen ||
    textContainsSensitive(line.text, sensitiveWordList.value)
  )
}

/**
 * 函数：scriptLineOverLimit
 */
function scriptLineOverLimit(line) {
  return line.maxLen > 0 && line.text.length > line.maxLen
}

/**
 * 校验：assertScriptReadyForGenerate
 */
function assertScriptReadyForGenerate() {
  if (hasScriptSensitiveHit.value) {
    uni.showToast({ title: '请先修改口播文案中的敏感词', icon: 'none' })
    return false
  }
  if (scriptLines.value.some((l) => scriptLineOverLimit(l))) {
    uni.showToast({ title: '口播文案超出字数限制，请精简后再试', icon: 'none' })
    return false
  }
  return true
}

// --- 用户态：点数用于「生成视频」前校验 ---
const userStore = useUserStore()

// --- 成片参数：分辨率 / 模型（与常量表一致，二者独立） ---
const resolutionOptions = CREATE_RESOLUTION_OPTIONS
const modelOptions = CREATE_MODEL_OPTIONS

const selectedResolution = ref('720p')
const selectedModel = ref('seedance2')
const showQualityPopup = ref(false)

const selectedTemplateMeta = computed(() => {
  const list = templates.value
  return (
    list.find((t) => t.id === selectedTemplate.value) ||
    list[0] || {
      id: 'store',
      title: '',
      desc: '',
      tag: '',
      hot: '',
      durationSec: 30,
      image: FALLBACK_TEMPLATE_COVER
    }
  )
})

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
// 测试：你可以临时设置为true看看效果
const showGeneratingQueueSheet = ref(false)
// 本地直出「有优惠活动」版充值弹窗；联调后改回 userStore.pointsTopUpHasPromo
const pointsRechargeHasPromo = computed(() => true)

/** 与商户信息页一致：用于「编辑」跳转主营业务子页 */
const createFlowIndustry = ref('餐饮')
/** 商户页写入的 `industryId`，拉 `/api/member/main-businesses` 用 */
const createFlowIndustryId = ref('')
/** 商户页店铺/公司名称，作 enterpriseName 模糊查询 */
const createFlowEnterpriseName = ref('')
/** 从弹窗点「编辑」进入子页返回后，用于写回对应条目 */
const editingBusinessId = ref('')
/** 「新增主营业务」跳转选择页返回后追加一条到下拉选项 */
const pendingAddNewBusiness = ref(false)

// --- 展示用 computed ---
const currentBusiness = computed(
  () =>
    businessOptions.value.find(
      (item) => String(item.id) === String(selectedBusiness.value)
    ) ||
    businessOptions.value[0]
)

/** 筛选项与弹窗列表统一：按顺序展示「主营业务1 / 2 / 3…」 */
function businessSlotTitle(index) {
  const n = Number(index) + 1
  return Number.isFinite(n) && n > 0 ? `主营业务${n}` : '主营业务'
}

const deleteMainBusinessConfirmSlotTitle = computed(() => {
  const id = String(deleteMainBusinessTargetId.value ?? '').trim()
  if (!id) return '该项主营业务'
  const idx = businessOptions.value.findIndex((b) => String(b.id) === id)
  return idx >= 0 ? businessSlotTitle(idx) : '该项主营业务'
})

const currentBusinessSlotTitle = computed(() => {
  const list = businessOptions.value
  const sid = String(selectedBusiness.value ?? '')
  const idx = list.findIndex((b) => String(b.id) === sid)
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

/**
 * 函数：avatarIdInList
 */
function avatarIdInList(list, id) {
  return list.some((a) => a.id === id)
}

/**
 * 加载数据：loadAvatarTabState
 */
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

/**
 * 写入：setAvatarTab
 */
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

/**
 * 选择项：selectAvatar
 */
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
  try {
    const savedPlat = uni.getStorageSync(CREATE_SELECTED_PLATFORM_STORAGE_KEY)
    if (savedPlat && platformOptions.some((p) => p.id === savedPlat)) {
      selectedPlatform.value = savedPlat
      tempPlatform.value = savedPlat
    }
  } catch (_) {
    /* 忽略 */
  }
  syncBusinessTagsFromSelectedBusinessOption()
})

onReady(() => {
  scheduleCreateNavBarStyleRefresh(createNavBarStyle)
})

/**
 * 读取：readMerchantDraft
 */
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

/**
 * 读取：readSelectedBusinessPayload
 */
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
  if (!Array.isArray(raw.path) || raw.path.length === 0) return null
  return raw
}

/**
 * 函数：pathLabelsFromPayload
 */
function pathLabelsFromPayload(path) {
  return (path || [])
    .map((p) => String(p?.name ?? p?.label ?? p?.title ?? p?.categoryName ?? '').trim())
    .filter(Boolean)
}

/**
 * 合并多路标签文案：保序、去重（先出现的优先）。
 * @param {...unknown} lists
 * @returns {string[]}
 */
function mergeBusinessTagLists(...lists) {
  const out = []
  const seen = new Set()
  for (const list of lists) {
    if (!Array.isArray(list)) continue
    for (const x of list) {
      const t = String(x ?? '').trim()
      if (!t || seen.has(t)) continue
      seen.add(t)
      out.push(t)
    }
  }
  return out
}

/**
 * 与商户页业务范围一致：path + 维度 + 自定义；若另有 scopeTagRows（常为后端简表）须合并，
 * 不能一见 scopeTagRows 就 return，否则只剩二级等残缺项。
 */
function scopeTagNamesFromPayload(payload) {
  if (!payload || typeof payload !== 'object') return []
  const pathLabs = pathLabelsFromPayload(payload.path)
  const dimLabs = []
  const picks = Array.isArray(payload.dimensionPicks) ? payload.dimensionPicks : []
  for (const g of picks) {
    if (!g || typeof g !== 'object') continue
    const st = Array.isArray(g.selectedTags) ? g.selectedTags : []
    if (st.length) {
      for (const x of st) {
        const n = x && typeof x === 'object' ? String(x.name ?? '').trim() : ''
        const id = x && typeof x === 'object' ? String(x.id ?? '').trim() : ''
        const label = n || id
        if (label) dimLabs.push(label)
      }
      continue
    }
    const ids = Array.isArray(g.selectedTagIds) ? g.selectedTagIds : []
    for (const id of ids) {
      const s = String(id ?? '').trim()
      if (s) dimLabs.push(s)
    }
  }
  const customs = Array.isArray(payload.customScenes) ? payload.customScenes : []
  const customLabs = customs
    .map((c) => (c && typeof c === 'object' ? String(c.sceneText ?? '').trim() : ''))
    .filter(Boolean)
  const scopeRows = payload.scopeTagRows
  const scopeRowLabs = Array.isArray(scopeRows)
    ? scopeRows
        .map((r) =>
          String(r?.name ?? r?.label ?? r?.title ?? r?.categoryName ?? '').trim()
        )
        .filter(Boolean)
    : []
  return mergeBusinessTagLists(pathLabs, dimLabs, customLabs, scopeRowLabs)
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

/** 弹窗列表：`行业 - 核心品类`（核心取 tagLabels[0]；行业优先行内 popupIndustryName，否则当前成片行业） */
function businessPopupIndustryCoreLine(business) {
  const industry =
    String(business?.popupIndustryName ?? '').trim() ||
    String(createFlowIndustry.value || '').trim() ||
    '—'
  const tags = tagLabelsForBusiness(business || {})
  const core = String(tags[0] ?? '').trim()
  if (core) return `${industry} - ${core}`
  return industry
}

/**
 * 弹窗列表：括号内为二级类目 + 维度/自定义等（tagLabels 从第 2 项起）；省略号仅在「）」后。
 * @returns {{ inner: string, dots: boolean } | null}
 */
function businessPopupParenBlock(business) {
  const tags = tagLabelsForBusiness(business || {})
    .map((t) => String(t).trim())
    .filter(Boolean)
  const innerTags = tags.slice(1)
  if (!innerTags.length) return null
  const full = innerTags.join('、')
  const MAX_INNER = 14
  if (full.length <= MAX_INNER) {
    return { inner: full, dots: false }
  }
  let acc = ''
  for (let i = 0; i < innerTags.length; i += 1) {
    const t = innerTags[i]
    const next = acc ? `${acc}、${t}` : t
    if (next.length > MAX_INNER) {
      if (acc) return { inner: acc, dots: true }
      return {
        inner: t.length > MAX_INNER ? t.slice(0, MAX_INNER) : t,
        dots: true
      }
    }
    acc = next
  }
  return { inner: acc, dots: false }
}

/**
 * 应用数据：applyMerchantDraft
 */
function applyMerchantDraft(draft) {
  const industry = String(draft.industry || '').trim() || '餐饮'
  createFlowIndustry.value = industry
  createFlowIndustryId.value = String(draft.industryId ?? '').trim()
  createFlowEnterpriseName.value = String(draft.shopName ?? '').trim()
  const labelsFromCard = Array.isArray(draft.businessTagLabels)
    ? draft.businessTagLabels.map((t) => String(t).trim()).filter(Boolean)
    : []
  const labelsFromSnap = draft.selectedBusinessSnapshot
    ? scopeTagNamesFromPayload(
        /** @type {Record<string, unknown>} */ (draft.selectedBusinessSnapshot)
      )
    : []
  const labelsFromPath = pathLabelsFromPayload(draft.businessPath)
  /** 卡片标签可能只有末级；快照含 path + 维度 + 自定义，须合并避免成片页只显示二级。 */
  const labels = mergeBusinessTagLists(
    labelsFromCard,
    labelsFromSnap,
    labelsFromPath
  )
  const desc = labels.join(' - ') || '未选择'
  const shortName = labels[labels.length - 1] || '主营业务'
  const createdId = String(draft.createdMainBusinessId ?? '').trim()
  const bizId = createdId || PRIMARY_BUSINESS_ID
  businessOptions.value = [
    {
      id: bizId,
      name: shortName,
      path: desc,
      desc,
      tagLabels: labels.length ? [...labels] : []
    }
  ]
  selectedBusiness.value = bizId
  tempBusiness.value = bizId
  businessSelectionTagLabels.value = [...labels]
  businessTags.value = [...labels]
}

/**
 * 应用数据：applySelectedBusiness
 */
function applySelectedBusiness(payload) {
  const pathLabels = pathLabelsFromPayload(payload.path)
  const scopeLabels = scopeTagNamesFromPayload(payload)
  const labels = scopeLabels.length ? scopeLabels : pathLabels
  const desc =
    labels.join(' - ') ||
    String(payload.displayName || '').trim() ||
    '未选择'
  const shortName =
    pathLabels[pathLabels.length - 1] ||
    labels[labels.length - 1] ||
    '主营业务'

  if (pendingAddNewBusiness.value) {
    pendingAddNewBusiness.value = false
    const newId = `biz_${Date.now()}`
    businessOptions.value.push({
      id: newId,
      name: shortName,
      path: desc,
      desc,
      tagLabels: labels.length ? [...labels] : [],
      customScenes: Array.isArray(payload.customScenes)
        ? [...payload.customScenes]
        : []
    })
    selectedBusiness.value = newId
    tempBusiness.value = newId
    if (labels.length) {
      businessSelectionTagLabels.value = [...labels]
      businessTags.value = labels
    } else {
      businessSelectionTagLabels.value = []
      businessTags.value = []
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
  const idx = list.findIndex((b) => String(b.id) === String(id))
  if (idx >= 0) {
    list[idx] = {
      ...list[idx],
      name: shortName,
      path: desc,
      desc,
      tagLabels:
        labels.length > 0 ? [...labels] : list[idx].tagLabels,
      customScenes: Array.isArray(payload.customScenes)
        ? [...payload.customScenes]
        : (list[idx].customScenes || [])
    }
  } else if (list.length) {
    list[0] = {
      ...list[0],
      name: shortName,
      path: desc,
      desc,
      tagLabels:
        labels.length > 0 ? [...labels] : list[0].tagLabels,
      customScenes: Array.isArray(payload.customScenes)
        ? [...payload.customScenes]
        : (list[0].customScenes || [])
    }
  }
  if (labels.length) {
    businessSelectionTagLabels.value = [...labels]
    businessTags.value = labels
  }
  /* 无可用标签时不清空，避免残缺 create:selected-business 冲掉商户草稿已写入的标签行 */
  if (payload.industry) {
    createFlowIndustry.value =
      String(payload.industry).trim() || createFlowIndustry.value
  }
  editingBusinessId.value = ''
}

/**
 * 当前选中是否仍为本地演示 / 占位 id（须先拉主营业务列表再请求视频模板）。
 * @returns {boolean}
 */
function isPlaceholderMainBusinessSelection() {
  const mb = String(selectedBusiness.value ?? '').trim()
  if (!mb) return true
  if (mb === PRIMARY_BUSINESS_ID) return true
  if (/^business\d+$/i.test(mb)) return true
  return false
}

/**
 * 是否具备拉主营业务列表的前置信息（行业 id 或行业名）。
 * @returns {boolean}
 */
function hasCreateFlowIndustryHint() {
  return (
    Boolean(String(createFlowIndustryId.value || '').trim()) ||
    Boolean(String(createFlowIndustry.value || '').trim())
  )
}

onShow(async () => {
  loadAvatarTabState()
  let needRefreshList = false
  try {
    const r = uni.getStorageSync('create:refresh-main-business-list')
    needRefreshList = r === '1' || r === 1 || r === true
    if (needRefreshList) {
      uni.removeStorageSync('create:refresh-main-business-list')
    }
  } catch (_) {
    /* ignore */
  }
  if (needRefreshList && isApiEnabled()) {
    await loadBusinessOptionsFromApi({ silent: true })
  }
  pendingAddNewBusiness.value = false
  const draft = readMerchantDraft()
  if (draft) {
    applyMerchantDraft(draft)
    try {
      uni.removeStorageSync('create:merchant-draft')
    } catch (_) {
      /* ignore */
    }
  }
  const selected = readSelectedBusinessPayload()
  if (selected) {
    applySelectedBusiness(selected)
    try {
      uni.removeStorageSync('create:selected-business')
    } catch (_) {
      /* ignore */
    }
  }
  if (isApiEnabled()) {
    if (hasCreateFlowIndustryHint() && isPlaceholderMainBusinessSelection()) {
      await loadBusinessOptionsFromApi({ silent: true })
    }
    await loadVideoTemplatesFromApi({ silent: true })
  }
  syncBusinessTagsFromSelectedBusinessOption()
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

/**
 * 打开界面/弹层：openPhotoSlotExample
 * @param {string | { key?: string, legacyExampleTab?: string }} slotOrKey 槽位对象或旧版 key
 */
function openPhotoSlotExample(slotOrKey) {
  const slot =
    typeof slotOrKey === 'string'
      ? photoSlotList.value.find((s) => s.key === slotOrKey) || null
      : slotOrKey
  let tab = 'facade'
  if (
    slot &&
    typeof slot.legacyExampleTab === 'string' &&
    ['facade', 'dish', 'env1', 'env2'].includes(slot.legacyExampleTab)
  ) {
    tab = slot.legacyExampleTab
  } else if (
    typeof slotOrKey === 'string' &&
    ['facade', 'dish', 'env1', 'env2'].includes(slotOrKey)
  ) {
    tab = slotOrKey
  }
  const q = `?tab=${encodeURIComponent(tab)}`
  uni.navigateTo({
    url: `/pages/create/photo-examples/index${q}`,
    fail: () => uni.showToast({ title: '页面打开失败', icon: 'none' })
  })
}

/**
 * 事件处理：onPickPhoto
 */
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

// --- 主营业务列表（/api/member/main-businesses）---

/**
 * 解析行业 id：优先商户草稿中的 industryId，否则按行业名称查 `/api/industries`。
 * @returns {Promise<string>}
 */
async function resolveCreateFlowIndustryId() {
  let id = String(createFlowIndustryId.value || '').trim()
  if (id) return id
  const name = String(createFlowIndustry.value || '').trim()
  if (!name || !isApiEnabled()) return ''
  try {
    const list = await listIndustries()
    const hit = Array.isArray(list)
      ? list.find((x) => String(x.industryName ?? '').trim() === name)
      : null
    id = hit ? String(hit.industryId ?? '').trim() : ''
    if (id) createFlowIndustryId.value = id
    return id
  } catch (_) {
    return ''
  }
}

/**
 * GET /api/member/main-businesses 单行 → 筛选项下标签行：路径 + 维度名 + 自定义（兼容多种后端字段）。
 * @param {Record<string, unknown>} row
 * @returns {string[]}
 */
function tagLabelsFromMainBusinessApiRow(row) {
  if (!row || typeof row !== 'object') return []
  const r = /** @type {Record<string, unknown>} */ (row)
  const out = []
  const pushUnique = (s) => {
    const t = String(s ?? '').trim()
    if (t && !out.includes(t)) out.push(t)
  }
  if (Array.isArray(r.industryTagPath)) {
    for (const node of r.industryTagPath) {
      if (node && typeof node === 'object') {
        const o = /** @type {Record<string, unknown>} */ (node)
        pushUnique(o.name ?? o.tagName ?? o.label ?? o.title ?? o.categoryName)
      } else {
        pushUnique(node)
      }
    }
  }
  const fullPath = String(
    r.fullIndustryTagName ??
      r.industryTagFullName ??
      r.categoryPathNames ??
      r.industryTagPathNames ??
      ''
  ).trim()
  if (fullPath) {
    fullPath.split(/[/／>]/).forEach((p) => pushUnique(p))
  }
  if (Array.isArray(r.tagLabels)) {
    for (const x of r.tagLabels) pushUnique(x)
  }
  if (Array.isArray(r.industryTagLabelList)) {
    for (const x of r.industryTagLabelList) pushUnique(x)
  }
  const leafName = String(r.industryTagName ?? r.tagName ?? '').trim()
  if (leafName) pushUnique(leafName)
  if (!out.length) {
    const ind = String(r.industryName ?? '').trim()
    if (ind) pushUnique(ind)
  }
  if (Array.isArray(r.dimensionTagNames)) {
    for (const x of r.dimensionTagNames) pushUnique(x)
  }
  if (Array.isArray(r.dimensionTags)) {
    for (const d of r.dimensionTags) {
      if (d && typeof d === 'object') {
        const o = /** @type {Record<string, unknown>} */ (d)
        pushUnique(o.name ?? o.tagName ?? o.label)
      }
    }
  }
  if (Array.isArray(r.customSceneTexts)) {
    for (const x of r.customSceneTexts) pushUnique(x)
  }
  if (Array.isArray(r.customScenes)) {
    for (const c of r.customScenes) {
      if (c && typeof c === 'object')
        pushUnique((/** @type {Record<string, unknown>} */ (c)).sceneText)
    }
  }
  return out
}

/**
 * GET /api/member/main-businesses 单行 → 弹窗选项。
 * tagLabels 仅用于类目相关展示，不含企业名、定位（筛选下标签行用 businessSelectionTagLabels）。
 * @param {Record<string, unknown>} row
 * @returns {{ id: string, name: string, path: string, desc: string, tagLabels: string[] } | null}
 */
function mapMainBusinessRowToOption(row) {
  if (!row || typeof row !== 'object') return null
  const id = String(row.id ?? '').trim()
  if (!id) return null
  const industryTagName = String(row.industryTagName ?? '').trim()
  const industryName = String(row.industryName ?? '').trim()
  const enterpriseName = String(row.enterpriseName ?? '').trim()
  const locationName = String(row.locationName ?? '').trim()
  const address = String(row.address ?? '').trim()
  const core = industryTagName || industryName
  let tagLabels = tagLabelsFromMainBusinessApiRow(row)
  if (!tagLabels.length && core) tagLabels = [core]
  const desc =
    [enterpriseName, locationName || address].filter(Boolean).join(' · ') ||
    enterpriseName ||
    core ||
    '主营业务'
  return {
    id,
    name: enterpriseName || core || '主营业务',
    path: desc,
    desc,
    tagLabels,
    popupIndustryName: industryName
  }
}

/**
 * 列表刷新后：用当前选中项的 tagLabels 刷新筛选栏下标签行。
 * 须与「商户页/草稿已写入的 businessSelectionTagLabels」做并集：接口行常只有末级（如串串香），
 * 直接覆盖会把火锅、维度、自定义等冲掉。
 */
function syncBusinessTagsFromSelectedBusinessOption() {
  const sid = String(selectedBusiness.value || '').trim()
  const opt = businessOptions.value.find((b) => String(b.id) === sid)
  let tags = []
  if (opt && Array.isArray(opt.tagLabels) && opt.tagLabels.length) {
    tags = opt.tagLabels.map((t) => String(t).trim()).filter(Boolean)
  }
  if (!tags.length && opt) {
    tags = tagLabelsForBusiness(opt)
  }
  const prevRow = Array.isArray(businessSelectionTagLabels.value)
    ? businessSelectionTagLabels.value.map((t) => String(t).trim()).filter(Boolean)
    : []
  const merged = mergeBusinessTagLists(prevRow, tags)
  if (merged.length) {
    businessTags.value = [...merged]
    businessSelectionTagLabels.value = [...merged]
    const idx = businessOptions.value.findIndex((b) => String(b.id) === sid)
    if (idx >= 0) {
      businessOptions.value[idx] = {
        ...businessOptions.value[idx],
        tagLabels: [...merged]
      }
    }
  }
}

/**
 * 拉取会员主营业务列表并刷新弹窗选项。
 * @param {{ silent?: boolean }} [opts] silent：无 loading / 无 toast（用于编辑返回后静默刷新）
 */
async function loadBusinessOptionsFromApi(opts = {}) {
  const silent = opts.silent === true
  if (!isApiEnabled()) return
  const industryId = await resolveCreateFlowIndustryId()
  const enterpriseName = String(createFlowEnterpriseName.value || '').trim()
  if (!industryId) {
    if (!silent) {
      uni.showToast({ title: '缺少行业信息，请返回商户页选择行业', icon: 'none' })
    }
    return
  }
  if (!silent) {
    uni.showLoading({ title: '加载中', mask: true })
  }
  try {
    const data = await listMemberMainBusinesses({
      industryId,
      enterpriseName,
      pageNum: 1,
      pageSize: 100
    })
    const rows = Array.isArray(data?.rows) ? data.rows : []
    const prevById = new Map(
      businessOptions.value.map((b) => [String(b.id), b])
    )
    const mapped = rows
      .map((r) => mapMainBusinessRowToOption(r))
      .filter(Boolean)
    if (!mapped.length) {
      /* 静默刷新（删除后 / onShow）：接口无行须清空，否则会残留已删项 */
      if (silent) {
        businessOptions.value = []
        selectedBusiness.value = ''
        tempBusiness.value = ''
        businessTags.value = []
        businessSelectionTagLabels.value = []
      }
      if (!silent) {
        uni.showToast({ title: '暂无匹配的主营业务', icon: 'none' })
      }
      return
    }
    const sidSel = String(selectedBusiness.value || '').trim()
    const screenTagRow =
      Array.isArray(businessSelectionTagLabels.value) &&
      businessSelectionTagLabels.value.length
        ? businessSelectionTagLabels.value
            .map((t) => String(t).trim())
            .filter(Boolean)
        : []
    businessOptions.value = mapped.map((b) => {
      const prevOpt = prevById.get(String(b.id))
      const prevTags = Array.isArray(prevOpt?.tagLabels) ? prevOpt.tagLabels : []
      const newTags = Array.isArray(b.tagLabels) ? b.tagLabels : []
      const screen = sidSel && String(b.id) === sidSel ? screenTagRow : []
      const merged = mergeBusinessTagLists(prevTags, screen, newTags)
      return merged.length ? { ...b, tagLabels: merged } : b
    })
    const prev = String(selectedBusiness.value || '').trim()
    const still = mapped.some((b) => String(b.id) === prev)
    selectedBusiness.value = still ? prev : String(mapped[0].id)
    tempBusiness.value = selectedBusiness.value
    syncBusinessTagsFromSelectedBusinessOption()
  } catch (e) {
    if (!silent) {
      uni.showToast({
        title: e?.message ? String(e.message) : '主营业务列表加载失败',
        icon: 'none'
      })
    }
  } finally {
    if (!silent) {
      uni.hideLoading()
    }
  }
}

/**
 * 接口热度数值 → 列表区展示（与原先「3.2w」风格接近）
 * @param {unknown} heat
 * @returns {string}
 */
function formatTemplateHeat(heat) {
  const n = Number(heat)
  if (!Number.isFinite(n) || n <= 0) return '—'
  if (n >= 100000000) return `${(n / 100000000).toFixed(1)}亿`
  if (n >= 10000) return `${(n / 10000).toFixed(1)}w`
  if (n >= 1000) return `${(n / 1000).toFixed(1)}k`
  return String(Math.trunc(n))
}

/**
 * GET /api/member/video-templates 单行 → 模板卡片
 * @param {Record<string, unknown>} row
 */
function mapVideoTemplateRow(row) {
  if (!row || typeof row !== 'object') return null
  const id = String(row.videoId ?? '').trim()
  if (!id) return null
  const cover = String(row.coverUrl ?? '').trim()
  const heatNum = Number(row.heat)
  const dur = Number(row.durationSecondsTotal)
  const typeName = String(row.videoTypeName ?? '').trim()
  return {
    id,
    title: String(row.title ?? '').trim() || '视频模板',
    desc: String(row.subtitle ?? '').trim() || typeName || '',
    tag: typeName || '模板',
    hot: formatTemplateHeat(Number.isFinite(heatNum) ? heatNum : 0),
    durationSec: Number.isFinite(dur) && dur > 0 ? Math.trunc(dur) : 30,
    image: cover || FALLBACK_TEMPLATE_COVER,
    videoTypeId: row.videoTypeId != null ? String(row.videoTypeId) : '',
    matchScore: Number(row.matchScore),
    demoVideoUrl: String(row.demoVideoUrl ?? '').trim(),
    createTime: row.createTime
  }
}

/**
 * 是否可为「视频模板列表」请求带 mainBusinessId（比「可删除」宽松：允许 primary；仅排除内置 mock、biz_ 临时）
 * @param {string} id
 */
function isTemplateListMainBusinessId(id) {
  const s = String(id ?? '').trim()
  if (!s) return false
  if (/^business\d+$/i.test(s)) return false
  if (s.startsWith('biz_')) return false
  return true
}

/** 一键成片：视频模板列表接口固定 platformId（tb_category） */
const VIDEO_TEMPLATE_LIST_PLATFORM_ID = '11'

/**
 * 拉取视频模板列表（mainBusinessId + platformId）。
 * platformId 当前固定为 {@link VIDEO_TEMPLATE_LIST_PLATFORM_ID}。
 * @param {{ silent?: boolean }} [opts]
 */
async function loadVideoTemplatesFromApi(opts = {}) {
  const silent = opts.silent === true
  if (!isApiEnabled()) return
  const mbId = String(selectedBusiness.value ?? '').trim()
  if (!isTemplateListMainBusinessId(mbId)) return

  const platformParam = VIDEO_TEMPLATE_LIST_PLATFORM_ID

  if (!silent) {
    uni.showLoading({ title: '加载模板', mask: true })
  }
  try {
    const data = await listMemberVideoTemplates({
      mainBusinessId: mbId,
      platformId: platformParam,
      pageNum: 1,
      pageSize: 50
    })
    const rows = Array.isArray(data?.rows) ? data.rows : []
    const mapped = rows.map((r) => mapVideoTemplateRow(r)).filter(Boolean)
    if (!mapped.length) {
      templates.value = [...DEFAULT_VIDEO_TEMPLATES]
      selectedTemplate.value = DEFAULT_VIDEO_TEMPLATES[0].id
      if (!silent) {
        uni.showToast({ title: '暂无视频模板', icon: 'none' })
      }
      return
    }
    templates.value = mapped
    const cur = String(selectedTemplate.value || '')
    if (!mapped.some((t) => t.id === cur)) {
      selectedTemplate.value = mapped[0].id
    }
  } catch (e) {
    if (!silent) {
      uni.showToast({
        title: e?.message ? String(e.message) : '模板列表加载失败',
        icon: 'none'
      })
    }
  } finally {
    if (!silent) {
      uni.hideLoading()
    }
  }
}

/**
 * 是否请求口播文案接口：已开 API 且当前模板非本地占位 id
 * @param {string} videoId
 */
function shouldFetchScriptMaterials(videoId) {
  const id = String(videoId ?? '').trim()
  if (!id || !isApiEnabled()) return false
  if (LOCAL_ONLY_TEMPLATE_IDS.has(id)) return false
  return true
}

/**
 * 从素材 content 解析展示文案（兼容 OpenAPI 动态 property）
 * @param {unknown} content
 * @param {string} [fallbackName]
 */
function contentToScriptText(content, fallbackName = '') {
  if (content == null) return String(fallbackName || '').trim()
  if (typeof content === 'string') return content.trim()
  if (typeof content !== 'object') return String(content)
  const o = /** @type {Record<string, unknown>} */ (content)
  const direct =
    o.text ?? o.value ?? o.script ?? o.copy ?? o.defaultText ?? o.lineText
  if (direct != null && String(direct).trim() !== '') return String(direct).trim()
  const parts = []
  for (const [k, v] of Object.entries(o)) {
    if (k === 'empty') continue
    if (typeof v === 'string' && v.trim()) parts.push(v.trim())
    else if (typeof v === 'number' && Number.isFinite(v)) parts.push(String(v))
  }
  if (parts.length) return parts.join(' ')
  return String(fallbackName || '').trim()
}

/**
 * @param {unknown} content
 * @param {string} materialType
 * @param {string} sourceType
 */
function resolveScriptMaxLen(content, materialType, sourceType) {
  if (content && typeof content === 'object') {
    const o = /** @type {Record<string, unknown>} */ (content)
    const n = Number(o.maxLen ?? o.maxLength ?? o.limit ?? o.wordLimit)
    if (Number.isFinite(n) && n >= 0) return Math.min(500, Math.trunc(n))
    if (o.readonly === true || o.editable === false) return 0
  }
  const hint = `${materialType} ${sourceType}`.toLowerCase()
  if (/readonly|fixed|display|static|只读|固定|系统/i.test(hint)) return 0
  return 20
}

/**
 * script-materials 单行 → 口播行
 * @param {Record<string, unknown>} row
 * @param {number} index
 */
function mapScriptMaterialRow(row, index) {
  if (!row || typeof row !== 'object') return null
  const materialId = String(row.id ?? '').trim()
  if (!materialId) return null
  const content = row.content
  const materialName = String(row.materialName ?? '').trim()
  const materialType = String(row.materialType ?? '').trim()
  const sourceType = String(row.sourceType ?? '').trim()
  const text = contentToScriptText(content, materialName)
  const maxLen = resolveScriptMaxLen(content, materialType, sourceType)
  return {
    key: `sm-${materialId}-${index}`,
    text,
    maxLen,
    materialId,
    materialName,
    materialType,
    sourceType
  }
}

/**
 * GET /api/member/video-templates/{videoId}/script-materials → scriptLines
 * @param {{ silent?: boolean, videoId?: string }} [opts]
 */
async function loadScriptMaterialsFromApi(opts = {}) {
  const silent = opts.silent === true
  const videoId = String(opts.videoId ?? selectedTemplate.value ?? '').trim()
  if (!shouldFetchScriptMaterials(videoId)) {
    scriptLines.value = cloneDefaultScriptLines()
    return
  }
  if (!silent) {
    uni.showLoading({ title: '加载口播', mask: true })
  }
  try {
    const data = await getVideoTemplateScriptMaterials(videoId)
    const rows = Array.isArray(data) ? data : []
    const sorted = [...rows].sort(
      (a, b) => Number(a.sort ?? 0) - Number(b.sort ?? 0)
    )
    const mapped = sorted
      .map((r, i) =>
        mapScriptMaterialRow(/** @type {Record<string, unknown>} */ (r), i)
      )
      .filter(Boolean)
    if (!mapped.length) {
      scriptLines.value = cloneDefaultScriptLines()
      if (!silent) {
        uni.showToast({ title: '暂无口播文案', icon: 'none' })
      }
      return
    }
    scriptLines.value = mapped
  } catch (e) {
    scriptLines.value = cloneDefaultScriptLines()
    if (!silent) {
      uni.showToast({
        title: e?.message ? String(e.message) : '口播文案加载失败',
        icon: 'none'
      })
    }
  } finally {
    if (!silent) {
      uni.hideLoading()
    }
  }
}

/**
 * 根据槽位名称推断照片示例页 tab（与 photo-examples TAB_KEYS 对齐）
 * @param {string} materialName
 * @param {string} materialType
 */
function guessPhotoExampleTab(materialName, materialType) {
  const name = String(materialName || '')
  if (/门头|门面|店招|招牌/i.test(name)) return 'facade'
  if (/菜品|菜图|食物|餐图/i.test(name)) return 'dish'
  if (/环境|店内|就餐|座位/i.test(name)) return 'env1'
  const t = String(materialType || '').toLowerCase()
  if (t === 'video') return 'env2'
  return 'facade'
}

/**
 * photo-materials 单行 → 上传槽位
 * @param {Record<string, unknown>} row
 * @param {number} index
 */
function mapPhotoMaterialRow(row, index) {
  if (!row || typeof row !== 'object') return null
  const materialId = String(row.id ?? '').trim()
  if (!materialId) return null
  const materialName = String(row.materialName ?? '').trim()
  const materialType = String(row.materialType ?? '').trim().toLowerCase()
  if (materialType === 'text') return null
  const sourceType = String(row.sourceType ?? '').trim()
  const content =
    row.content && typeof row.content === 'object'
      ? /** @type {Record<string, unknown>} */ (row.content)
      : {}
  const tabFromContent = String(content.exampleTab ?? content.tabKey ?? '').trim()
  const legacyExampleTab = ['facade', 'dish', 'env1', 'env2'].includes(tabFromContent)
    ? tabFromContent
    : guessPhotoExampleTab(materialName, materialType)
  return {
    key: `pm-${materialId}-${index}`,
    label: materialName || `照片${index + 1}`,
    materialId,
    materialType: String(row.materialType ?? ''),
    sourceType,
    sort: Number(row.sort ?? index),
    legacyExampleTab,
    content
  }
}

/**
 * GET /api/member/video-templates/{videoId}/photo-materials → photoSlotList
 * @param {{ silent?: boolean, videoId?: string }} [opts]
 */
async function loadPhotoMaterialsFromApi(opts = {}) {
  const silent = opts.silent === true
  const videoId = String(opts.videoId ?? selectedTemplate.value ?? '').trim()
  if (!shouldFetchScriptMaterials(videoId)) {
    photoSlotList.value = cloneDefaultPhotoSlots()
    return
  }
  if (!silent) {
    uni.showLoading({ title: '加载照片槽位', mask: true })
  }
  try {
    const data = await getVideoTemplatePhotoMaterials(videoId)
    const rows = Array.isArray(data) ? data : []
    const sorted = [...rows].sort(
      (a, b) => Number(a.sort ?? 0) - Number(b.sort ?? 0)
    )
    const mapped = sorted
      .map((r, i) =>
        mapPhotoMaterialRow(/** @type {Record<string, unknown>} */ (r), i)
      )
      .filter(Boolean)
    if (!mapped.length) {
      photoSlotList.value = cloneDefaultPhotoSlots()
      if (!silent) {
        uni.showToast({ title: '暂无照片槽位', icon: 'none' })
      }
      return
    }
    photoSlotList.value = mapped
  } catch (e) {
    photoSlotList.value = cloneDefaultPhotoSlots()
    if (!silent) {
      uni.showToast({
        title: e?.message ? String(e.message) : '照片槽位加载失败',
        icon: 'none'
      })
    }
  } finally {
    if (!silent) {
      uni.hideLoading()
    }
  }
}

watch(
  () => selectedTemplate.value,
  async (id) => {
    const vid = String(id ?? '')
    try {
      await Promise.all([
        loadScriptMaterialsFromApi({ silent: true, videoId: vid }),
        loadPhotoMaterialsFromApi({ silent: true, videoId: vid })
      ])
    } catch (err) {
      try {
        console.error('[generate] template materials load failed', err)
      } catch (_) {
        /* ignore */
      }
    }
  }
)

// --- 主营业务弹窗 ---
async function openBusinessPopup() {
  tempBusiness.value = selectedBusiness.value
  if (isApiEnabled()) {
    await loadBusinessOptionsFromApi()
  }
  showBusinessPopup.value = true
}

/**
 * 关闭界面/弹层：closeBusinessPopup
 */
function closeBusinessPopup() {
  showBusinessPopup.value = false
  closeDeleteMainBusinessConfirm()
}

function closeDeleteMainBusinessConfirm() {
  showDeleteMainBusinessConfirm.value = false
  deleteMainBusinessTargetId.value = ''
}

/**
 * 选择项：selectBusiness
 */
function selectBusiness(id) {
  tempBusiness.value = id
  const opt = businessOptions.value.find((b) => String(b.id) === String(id))
  const raw = opt && Array.isArray(opt.tagLabels) ? opt.tagLabels : []
  const tags = raw.map((t) => String(t).trim()).filter(Boolean)
  if (tags.length) {
    businessSelectionTagLabels.value = [...tags]
  }
}

/**
 * 确认操作：confirmBusiness
 */
async function confirmBusiness() {
  selectedBusiness.value = tempBusiness.value
  syncBusinessTagsFromSelectedBusinessOption()
  if (!businessTags.value.length) {
    businessTags.value = [...businessSelectionTagLabels.value]
  }
  closeBusinessPopup()
  if (isApiEnabled()) {
    await loadVideoTemplatesFromApi({ silent: true })
  }
}

/** 编辑：跳转主营业务子页，返回后由 onShow 读 create:selected-business 写回 */
async function onBusinessEdit(business) {
  const industry = String(createFlowIndustry.value || '').trim() || '餐饮'
  const businessId = business?.id != null ? String(business.id) : ''
  editingBusinessId.value = businessId
  pendingAddNewBusiness.value = false
  if (businessId) {
    try {
      const detail = await getMemberMainBusinessDetail(businessId)
      uni.setStorageSync(STORAGE_EDIT_MAIN_BUSINESS_DETAIL, detail || null)
    } catch (e) {
      uni.showToast({
        title: e?.message ? String(e.message) : '主营业务详情加载失败',
        icon: 'none'
      })
      try {
        uni.removeStorageSync(STORAGE_EDIT_MAIN_BUSINESS_DETAIL)
      } catch (_) {
        /* ignore */
      }
    }
  }
  closeBusinessPopup()
  uni.navigateTo({
    url: `/pages/create/business/index?industry=${encodeURIComponent(industry)}&intent=edit`
  })
}

/** 是否可调用 DELETE：排除本地占位 id；其余交由接口校验（避免误伤短数字 id、UUID 等） */
function isDeletableMainBusinessId(id) {
  const s = String(id ?? '').trim()
  if (!s || s === PRIMARY_BUSINESS_ID) return false
  if (s.startsWith('biz_')) return false
  if (/^business\d+$/i.test(s)) return false
  return true
}

/** 删除主营业务：打开设计稿确认弹窗（当前弹窗选中项） */
function onBusinessDelete() {
  const id = String(tempBusiness.value ?? '').trim()
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

/** 确认删除：DELETE 后重新拉取主营业务列表 */
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
    if (isApiEnabled()) {
      await loadBusinessOptionsFromApi({ silent: true })
    }
    if (businessOptions.value.some((b) => String(b.id) === id)) {
      const list = businessOptions.value.filter((b) => String(b.id) !== id)
      businessOptions.value = list
      const nextId = list.length ? String(list[0].id) : ''
      tempBusiness.value = nextId
      selectedBusiness.value = nextId
    }
    const sid = String(selectedBusiness.value || '').trim()
    const nb =
      (sid && businessOptions.value.find((b) => String(b.id) === sid)) ||
      businessOptions.value[0] ||
      {}
    const tags = tagLabelsForBusiness(nb)
    businessTags.value = [...tags]
    businessSelectionTagLabels.value = [...tags]
    if (isApiEnabled()) {
      await loadVideoTemplatesFromApi({ silent: true })
    }
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

/**
 * 关闭界面/弹层：closePlatformPopup
 */
function closePlatformPopup() {
  showPlatformPopup.value = false
}

/**
 * 选择项：selectPlatform
 */
function selectPlatform(id) {
  tempPlatform.value = id
}

/**
 * 确认操作：confirmPlatform
 */
async function confirmPlatform() {
  selectedPlatform.value = tempPlatform.value
  try {
    uni.setStorageSync(CREATE_SELECTED_PLATFORM_STORAGE_KEY, tempPlatform.value)
  } catch (_) {
    /* 非 uni 环境忽略 */
  }
  closePlatformPopup()
  if (isApiEnabled()) {
    await loadVideoTemplatesFromApi({ silent: true })
  }
}

// --- 画质 / 模型底部弹窗 ---
function openQualityPopup() {
  showQualityPopup.value = true
}

/**
 * 关闭界面/弹层：closeQualityPopup
 */
function closeQualityPopup() {
  showQualityPopup.value = false
}

/**
 * 选择项：selectResolution
 */
function selectResolution(id) {
  selectedResolution.value = id
}

/** 选择分辨率：直接切换选中项；点数在「生成视频」时再校验 */
function onPickResolution(item) {
  selectResolution(item.id)
}

/**
 * 选择项：selectModel
 */
function selectModel(id) {
  selectedModel.value = id
}

/**
 * 函数：resolveVipModalVariant
 */
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

/**
 * 关闭界面/弹层：closeVipModal
 */
function closeVipModal() {
  showVipModal.value = false
}

/**
 * 事件处理：onVipSubscribeConfirm
 */
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

/**
 * 事件处理：onVipAuxBuy
 */
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

/**
 * 关闭界面/弹层：closePointsRechargeModal
 */
function closePointsRechargeModal() {
  showPointsRechargeModal.value = false
}

/**
 * 事件处理：onPointsRechargeConfirm
 */
function onPointsRechargeConfirm(payload) {
  safeHideKeyboard()
  uni.showToast({
    title: `请接入支付 ¥${payload.payYuan} / ${payload.points}点`,
    icon: 'none'
  })
  closePointsRechargeModal()
}

/**
 * 函数：safeHideKeyboard
 */
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
  if (!assertScriptReadyForGenerate()) return
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

/**
 * 函数：shouldSkipGenerateWarmTip
 */
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

/**
 * 事件处理：onGenerateWarmTipConfirm
 */
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

/**
 * 函数：runGenerateSuccessFlow
 */
function runGenerateSuccessFlow() {
  uni.showToast({
    title: '开始生成视频',
    icon: 'none'
  })
}

/**
 * 函数：generateVideo
 */
function generateVideo() {
  if (!ensureVipForGenerate()) return
  if (!assertScriptReadyForGenerate()) return
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

.generate-page--sensitive-banner {
  padding-bottom: calc(360rpx + constant(safe-area-inset-bottom));
  padding-bottom: calc(360rpx + env(safe-area-inset-bottom));
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

@keyframes promptPulse {
  0% {
    box-shadow: 0 0 0 0 rgba(255, 154, 49, 0.6);
  }
  70% {
    box-shadow: 0 0 0 16rpx rgba(255, 154, 49, 0);
  }
  100% {
    box-shadow: 0 0 0 0 rgba(255, 154, 49, 0);
  }
}

@keyframes handPoint {
  0%, 100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-16rpx);
  }
}

.view-works-btn__popup {
  position: relative;
  z-index: 9999999;
  animation: promptPulse 1.5s infinite;

  .view-works-btn__hand {
    display: block !important;
    position: absolute;
    width: 144rpx;
    height: 178rpx;
    bottom: -168rpx;
    left: 68rpx;
    animation: handPoint 1s ease-in-out infinite;
  }
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
  box-sizing: border-box;
  width: 100%;
  padding: 10rpx 20rpx 24rpx;
  border-bottom: 1rpx solid #f1f1f1;
  display: flex;
  flex-wrap: wrap;
  align-items: flex-start;
  gap: 14rpx;
}

.tag {
  box-sizing: border-box;
  flex: 0 1 auto;
  max-width: 100%;
  min-height: 54rpx;
  padding: 12rpx 22rpx;
  border: 1rpx solid #ff9a35;
  border-radius: 999rpx;
  color: #ff8e24;
  background: #fff3e6;
  font-size: 23rpx;
  line-height: 1.45;
  white-space: normal;
  word-break: break-word;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  text-align: center;
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

  .view-works-btn__hand {
    display: none;
  }
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

.copy-line-input-wrap {
  flex: 1;
  min-width: 0;
  position: relative;
  height: 56rpx;
}

.copy-line-input-wrap .copy-line-input {
  flex: none;
  width: 100%;
  box-sizing: border-box;
}

.copy-line-highlight {
  position: absolute;
  left: 0;
  right: 0;
  top: 0;
  bottom: 0;
  z-index: 0;
  pointer-events: none;
  display: flex;
  flex-direction: row;
  flex-wrap: nowrap;
  align-items: center;
  overflow: hidden;
  white-space: nowrap;
}

.copy-line-seg {
  flex-shrink: 0;
  font-size: 24rpx;
  line-height: 56rpx;
  color: #6b7280;
  font-family: OPPOSans-regular, OPPOSans, -apple-system, sans-serif;
}

.copy-line-seg--sensitive {
  background-color: #ef4444;
  border-radius: 4rpx;
  padding: 0 4rpx;
  box-sizing: border-box;
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
  font-family: OPPOSans-regular, OPPOSans, -apple-system, sans-serif;
  color: #6b7280;
  background: transparent;
  border: none;
}

.copy-line-input--overlay {
  position: relative;
  z-index: 1;
  width: 100%;
  padding: 0;
  margin: 0;
  color: transparent;
  caret-color: #374151;
}

.copy-line-count {
  flex-shrink: 0;
  display: flex;
  flex-direction: row;
  align-items: center;
  font-size: 22rpx;
  line-height: 56rpx;
}

.copy-line-count__cur {
  color: #9ca3af;
}

.copy-line-count__cur--danger {
  color: #ef4444;
}

.copy-line-count__rest {
  color: #9ca3af;
}

.copy-sensitive-banner {
  width: 750rpx;
  height: 126rpx;
  box-sizing: border-box;
  margin-top: 20rpx;
  /* 与 .section 左右 20rpx 内边距对齐，铺满 750rpx 屏宽 */
  margin-left: -20rpx;
  padding: 20rpx 30rpx;
  background-color: rgba(255, 94, 69, 1);
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: flex-start;
}

.copy-sensitive-banner__title {
  display: block;
  font-size: 28rpx;
  line-height: 1.35;
  color: #ffffff;
  font-family: OPPOSans-medium, OPPOSans, -apple-system, sans-serif;
  font-weight: 500;
}

.copy-sensitive-banner__body-wrap {
  margin-top: 6rpx;
}

.copy-sensitive-banner__body {
  display: block;
  font-size: 24rpx;
  line-height: 26rpx;
  color: rgba(255, 255, 255, 0.7);
  font-family: OPPOSans-regular, OPPOSans, -apple-system, sans-serif;
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
  left: 0;
  right: 0;
  top: 0;
  bottom: 0;
  z-index: 100;
  box-sizing: border-box;
  padding-top: constant(safe-area-inset-top);
  padding-top: env(safe-area-inset-top);
  background: rgba(0, 0, 0, 0.45);
  display: flex;
  align-items: flex-end;
}

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

.business-list-scroll {
  margin-top: 32rpx;
  width: 100%;
  box-sizing: border-box;
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

/* 选择主营业务弹窗：整段说明宽 300rpx；核心/二级不缩略，其余在（）内省略 */
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

.business-actions-row {
  display: flex;
  flex-direction: column;
  align-items: stretch;
  gap: 24rpx;
  margin-top: 20rpx;
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

/* 垃圾桶：与 business-add__icon-bar 同色，30rpx 视口内 */
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
