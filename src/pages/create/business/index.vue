<template>
  <!-- 一键成片 · 主营业务：按行业拉取类目树，逐级单选/展开（api/getBusinessCategories） -->
  <view class="business-page">
    <CreateNavBar title="主营业务" title-class="back-text" @back="goBack" />

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

    <view
      v-if="showCategorySection && showDimensionSection"
      class="dimension-section"
    >
      <view v-if="dimensionLoading" class="dimension-loading">
        <text>加载多维度标签…</text>
      </view>
      <view v-else-if="dimensionLoadError" class="dimension-error">
        <text>{{ dimensionLoadError }}</text>
      </view>
      <template v-else>
        <view v-if="dimensionSectionTitle" class="dimension-head">
          <text>{{ dimensionSectionTitle }}</text>
        </view>
        <view
          v-for="(g, gi) in dimensionGroups"
          :key="dimensionGroupKey(g, gi)"
          class="dimension-group"
          :class="{ 'dimension-group--split': gi > 0 }"
        >
          <view class="tag-list">
            <view
              v-for="opt in g.options"
              :key="opt.id"
              class="category-tag"
              :class="{ active: isDimTagSelected(gi, opt.id) }"
              @tap="toggleDimTag(gi, opt.id)"
            >
              <text>+ {{ opt.name }}</text>
            </view>
          </view>
        </view>
      </template>
    </view>

    <view
      v-if="showCategorySection && showCustomSection"
      class="custom-section"
    >
      <view class="category-title custom-section__title">
        <text>自定义</text>
      </view>
      <view class="tag-list">
        <view
          v-for="(c, ci) in customScenes"
          :key="c.key"
          class="category-tag active custom-chip"
        >
          <text class="custom-chip__text">{{ c.sceneText }}</text>
          <view
            v-if="customDeleteMode"
            class="custom-chip__remove"
            @tap.stop="removeCustomScene(ci)"
          >
            <text class="custom-chip__minus">−</text>
          </view>
        </view>
        <view
          v-if="customScenes.length >= 1"
          class="category-tag custom-add-btn"
          :class="{ active: customDeleteMode }"
          @tap.stop="toggleCustomDeleteMode"
        >
          <text>− 删除</text>
        </view>
        <view
          v-if="customScenes.length < CUSTOM_SCENE_MAX"
          class="category-tag custom-add-btn"
          :class="{ active: showCustomTagSheet }"
          @tap="openAddCustomScene"
        >
          <text>+ 添加</text>
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

    <view
      v-if="showCustomTagSheet"
      class="custom-tag-sheet-mask"
      @touchmove.stop.prevent="noop"
      @tap="closeCustomTagSheet"
    >
      <view class="custom-tag-sheet" @tap.stop>
        <view class="custom-tag-sheet__head">
          <text class="custom-tag-sheet__cancel" @tap="closeCustomTagSheet">取消</text>
          <text class="custom-tag-sheet__title-text">自定义标签</text>
          <text class="custom-tag-sheet__create" @tap="confirmCustomTagSheet">创建</text>
        </view>
        <view class="custom-tag-sheet__field">
          <input
            class="custom-tag-sheet__input"
            type="text"
            :value="customTagDraft"
            :focus="customTagInputFocus"
            :maxlength="CUSTOM_TAG_INPUT_MAX"
            placeholder="请输入标签"
            placeholder-class="custom-tag-sheet__ph"
            confirm-type="done"
            adjust-position
            @input="onCustomTagDraftInput"
            @confirm="confirmCustomTagSheet"
          />
          <text class="custom-tag-sheet__counter">{{ customTagDraft.length }}/{{ CUSTOM_TAG_INPUT_MAX }}字</text>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup>
import CreateNavBar from '@/pages/create/components/CreateNavBar.vue'
import { StaticPath } from '@/config'
/**
 * 【一键成片 · 主营业务选择】按接口 levels 动态渲染；选完回写 storage 并返回上页。
 */
import { computed, ref, onMounted, nextTick, watch } from 'vue'
import { onLoad, onReady } from '@dcloudio/uni-app'
import { getBusinessCategories } from '@/api/create'
import {
  listSecondTags,
  mapTagRowsToLeafCategoryNodes,
  listIndustryDimensions,
  listDimensionOptionGroups,
  normalizeIndustryDimensionOptionGroups,
  buildDimensionSelectionsForFullGroupsFromOptionGroups,
  dimensionGroupKey
} from '@/api/metadata'
import { CREATE_INDUSTRY_OPTIONS } from '@/constants/create'
import { isApiEnabled } from '@/utils/request'
import {
  hidePageLoading,
  showPageLoading
} from '@/utils/page-loading'
const createIconArrowDown = `${StaticPath}create/create-icon-arrow-down.png`
const createIconAttention = `${StaticPath}create/create-icon-attention.png`

/** 与 create/index `collectCustomSceneTextsFromPayload` 上限一致 */
const CUSTOM_SCENE_MAX = 50
/** 单次自定义标签字数（与产品设计一致） */
const CUSTOM_TAG_INPUT_MAX = 10

/** 一键成片商户页再次进入主营业务子页时，用于回显上次「确定」前的完整选择（与 create/index 写入一致） */
const BUSINESS_RESTORE_STORAGE_KEY = 'create:business-restore'

/** 成片页「编辑」跳转前写入，本页 intent=edit 时用于类目/维度/自定义回显 */
const STORAGE_EDIT_MAIN_BUSINESS_DETAIL = 'create:edit-main-business-detail'

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
/** second-tags 接口返回的二级品类区块标题（替代写死的「2级品类」） */
const secondLevelCategoryTitle = ref('')
/** 一级拉二级期间，避免 children 未返回时误判为「无二级」 */
const coreTagsLoadingRootId = ref('')
const showIndustryPopup = ref(false)
const tempIndustry = ref('')

/** 多维度：GET …/dimensions 渲染全量；GET …/dimension-option-groups 仅默认选中 */
const dimensionLoading = ref(false)
const dimensionLoadError = ref('')
const dimensionSectionTitle = ref('')
/** @type {import('vue').Ref<Array<{ categoryId: string, categoryName: string, sort: number, options: Array<{ id: string, name: string }> }>>} */
const dimensionGroups = ref([])
/** 维度分组多选：key 为 dimensionGroupKey，值为 tagId[] */
const dimensionSelections = ref(/** @type {Record<string, string[]>} */ ({}))

/** 自定义场景文案（写入 create:selected-business.customScenes） */
const customScenes = ref(/** @type {Array<{ key: string, sceneText: string }>} */ ([]))

/** 自定义标签 ≥1 时显示「− 删除」；点按进入/退出删除模式，标签上出现 − 可删单条 */
const customDeleteMode = ref(false)

/** 底部「自定义标签」输入层 */
const showCustomTagSheet = ref(false)
const customTagDraft = ref('')
const customTagInputFocus = ref(false)

function noop() {}
function isBusinessCategoryLeafSelected() {
  if (coreTagsLoadingRootId.value) return false
  const p = selectedPath.value
  if (!Array.isArray(p) || !p.length) return false
  const last = p[p.length - 1]
  if (!last || typeof last !== 'object') return false
  const ch = last.children
  return !ch || ch.length === 0
}

const showDimensionSection = computed(
  () =>
    dimensionLoading.value ||
    Boolean(dimensionLoadError.value) ||
    dimensionGroups.value.length > 0
)

/** 与「确定」可点条件一致：叶子品类选定后展示自定义区（贴底在维度区之下） */
const showCustomSection = computed(() => isBusinessCategoryLeafSelected())

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
      title:
        levelIndex === 0
          ? '核心品类'
          : levelIndex === 1 && useSecondTagsEndpoint.value
            ? secondLevelCategoryTitle.value.trim() || '二级品类'
            : `${levelIndex + 1}级品类`,
      options
    })

    const selected = selectedPath.value[levelIndex]
    if (!selected) {
      break
    }

    const children = selected.children
    const hasChildren = Array.isArray(children) && children.length > 0
    if (hasChildren) {
      options = children
      levelIndex += 1
      continue
    }

    /**
     * second-tags 拆流：一级已选但二级列表为空或未返回时，仍保留占位行（标题 + *，标签可为空）。
     */
    if (
      levelIndex === 0 &&
      useSecondTagsEndpoint.value &&
      selectedPath.value[0] &&
      !hasChildren
    ) {
      const secondTitle =
        secondLevelCategoryTitle.value.trim() || '二级品类'
      levels.push({
        title: secondTitle,
        options: Array.isArray(children) ? children : []
      })
    }
    break
  }

  return levels
})

const canConfirm = computed(() => isBusinessCategoryLeafSelected())

watch(
  () => customScenes.value.length,
  (len) => {
    if (len < 1) customDeleteMode.value = false
  }
)

function clearDimensionState() {
  dimensionLoading.value = false
  dimensionLoadError.value = ''
  dimensionSectionTitle.value = ''
  dimensionGroups.value = []
  dimensionSelections.value = {}
}

/**
 * @returns {Record<string, unknown> | null}
 */
function readBusinessRestorePayload() {
  let raw = uni.getStorageSync(BUSINESS_RESTORE_STORAGE_KEY)
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
  return /** @type {Record<string, unknown>} */ (raw)
}

function clearBusinessRestoreStorage() {
  try {
    uni.removeStorageSync(BUSINESS_RESTORE_STORAGE_KEY)
  } catch {
    /* ignore */
  }
}

/**
 * 当前 id 是否为类目树根节点（一级核心品类）。second-tags 接口仅允许传此类 id。
 * @param {unknown} tagId
 */
function isIndustryRootCoreTagId(tagId) {
  const id = String(tagId ?? '').trim()
  if (!id) return false
  return categoryTree.value.some((r) => String(r.id) === id)
}

/**
 * 在 second-tags 拆流下，用叶子 id 反查其所属一级根，返回 [根, 叶子] 两段 path。
 * @param {string} leafId
 * @param {string} leafNameFallback
 * @returns {Promise<Array<{ id: string, name: string }> | null>}
 */
async function expandLeafToSecondTagsRootPath(leafId, leafNameFallback) {
  const lid = String(leafId ?? '').trim()
  if (!lid || !useSecondTagsEndpoint.value || !isApiEnabled()) return null
  for (const root of categoryTree.value) {
    const rid = String(root.id ?? '').trim()
    if (!rid) continue
    await ensureSecondTagsForNode(rid, { silent: true })
    const refreshed = categoryTree.value.find((r) => String(r.id) === rid)
    const children = refreshed?.children || []
    const leaf = children.find((c) => String(c.id) === lid)
    if (leaf) {
      return [
        { id: String(root.id), name: String(root.name ?? '').trim() || rid },
        {
          id: String(leaf.id),
          name: String(leaf.name ?? '').trim() || leafNameFallback || lid
        }
      ]
    }
  }
  return null
}

/**
 * 避免用叶子 id 调 core-tags/{id}/second-tags：首段非根时按叶子展开为 [根, 叶子]。
 * @param {Array<{ id?: unknown, name?: unknown }>} pathNodes
 * @returns {Promise<Array<{ id?: unknown, name?: unknown }>>}
 */
async function normalizePathNodesForSecondTagsFlow(pathNodes) {
  if (
    !useSecondTagsEndpoint.value ||
    !isApiEnabled() ||
    !Array.isArray(pathNodes) ||
    !pathNodes.length ||
    !categoryTree.value.length
  ) {
    return pathNodes
  }
  const firstId = String(pathNodes[0]?.id ?? '').trim()
  if (firstId && isIndustryRootCoreTagId(firstId)) {
    return pathNodes
  }
  const leafId =
    pathNodes.length === 1
      ? String(pathNodes[0]?.id ?? '').trim()
      : String(pathNodes[pathNodes.length - 1]?.id ?? '').trim()
  const leafName =
    pathNodes.length === 1
      ? String(pathNodes[0]?.name ?? '').trim()
      : String(pathNodes[pathNodes.length - 1]?.name ?? '').trim()
  if (!leafId) return pathNodes
  const expanded = await expandLeafToSecondTagsRootPath(leafId, leafName)
  return expanded && expanded.length ? expanded : pathNodes
}

/**
 * 按 path 各级的 id 在 categoryTree 上还原 selectedPath（含 second-tags 补拉）。
 * @param {Array<{ id?: unknown, name?: unknown }>} pathNodes
 * @returns {Promise<boolean>}
 */
async function applyPathFromRestore(pathNodes) {
  if (!Array.isArray(pathNodes) || !pathNodes.length) return false
  const nodes = await normalizePathNodesForSecondTagsFlow(pathNodes)
  const built = []
  let options = categoryTree.value
  for (let level = 0; level < nodes.length; level += 1) {
    const wantId = String(nodes[level]?.id ?? '').trim()
    if (!wantId) return false
    let node = (options || []).find((n) => String(n.id) === wantId)
    if (
      !node &&
      level === 0 &&
      useSecondTagsEndpoint.value &&
      resolvedIndustryId.value != null &&
      isApiEnabled()
    ) {
      await ensureSecondTagsForNode(wantId, { silent: true })
      options = categoryTree.value
      node = (options || []).find((n) => String(n.id) === wantId)
    }
    if (!node) return false
    built.push(node)

    if (level < nodes.length - 1) {
      let children = node.children
      if (
        (!children || !children.length) &&
        level === 0 &&
        useSecondTagsEndpoint.value &&
        resolvedIndustryId.value != null &&
        isApiEnabled()
      ) {
        await ensureSecondTagsForNode(node.id, { silent: true })
        const refreshed = categoryTree.value.find((r) => String(r.id) === String(node.id))
        if (refreshed) {
          built[level] = refreshed
          node = refreshed
        }
        children = node.children
      }
      if (!children || !children.length) return false
      options = children
    }
  }
  selectedPath.value = built
  return true
}

/**
 * 在 syncIndustryDimensionsForPath 之后，用缓存 payload 覆盖维度多选与自定义标签。
 * @param {Record<string, unknown>} restore
 */
function applyDimensionAndCustomFromRestore(restore) {
  const picks = Array.isArray(restore.dimensionPicks) ? restore.dimensionPicks : []
  const nextSel = { ...dimensionSelections.value }
  dimensionGroups.value.forEach((g, gi) => {
    const key = dimensionGroupKey(g, gi)
    const allowed = new Set((g.options || []).map((o) => String(o.id)))
    let match = picks[gi]
    if (
      !match ||
      typeof match !== 'object' ||
      String(match.categoryId ?? '') !== String(g.categoryId ?? '')
    ) {
      match = picks.find(
        (p) =>
          p &&
          typeof p === 'object' &&
          String(p.categoryId ?? '').trim() === String(g.categoryId ?? '').trim()
      )
    }
    if (!match || typeof match !== 'object') return
    const ids = Array.isArray(match.selectedTagIds) ? match.selectedTagIds : []
    const filtered = ids
      .map((x) => String(x ?? '').trim())
      .filter((id) => id && allowed.has(id))
    if (filtered.length) nextSel[key] = filtered
  })
  dimensionSelections.value = nextSel

  const cs = Array.isArray(restore.customScenes) ? restore.customScenes : []
  const rows = []
  for (let i = 0; i < cs.length; i += 1) {
    const row = cs[i]
    if (!row || typeof row !== 'object') continue
    const sceneText = String(row.sceneText ?? '').trim()
    if (!sceneText) continue
    const k =
      row.key != null && String(row.key).trim()
        ? String(row.key).trim()
        : `c_${Date.now()}_${i}`
    rows.push({ key: k, sceneText })
    if (rows.length >= CUSTOM_SCENE_MAX) break
  }
  customScenes.value = rows
}

/**
 * 解包接口 data
 * @param {unknown} raw
 * @returns {Record<string, unknown>}
 */
function unwrapApiRecord(raw) {
  if (raw && typeof raw === 'object' && raw.data != null && typeof raw.data === 'object') {
    return /** @type {Record<string, unknown>} */ (raw.data)
  }
  return /** @type {Record<string, unknown>} */ (raw && typeof raw === 'object' ? raw : {})
}

/**
 * GET 单条主营业务详情 → 与 create:selected-business 相近结构，供路径/维度/自定义回显。
 * @param {Record<string, unknown>} rawDetail
 * @returns {Record<string, unknown> | null}
 */
function buildRestorePayloadFromMainBusinessDetail(rawDetail) {
  const d = unwrapApiRecord(rawDetail)
  if (!d || typeof d !== 'object') return null
  const industry = String(d.industryName ?? d.industry ?? '').trim()
  const industryId = String(d.industryId ?? '').trim()
  const path = []
  const rawPath = d.industryTagPath ?? d.tagPath ?? d.categoryPath ?? d.pathNodes
  if (Array.isArray(rawPath)) {
    for (const n of rawPath) {
      if (!n || typeof n !== 'object') continue
      const id = String(n.id ?? n.tagId ?? '').trim()
      const name = String(
        n.name ?? n.tagName ?? n.label ?? n.industryTagName ?? ''
      ).trim()
      if (id || name) path.push({ id: id || name, name: name || id })
    }
  }
  if (!path.length) {
    const firstId = String(
      d.firstIndustryTagId ??
        d.coreIndustryTagId ??
        d.rootIndustryTagId ??
        d.parentIndustryTagId ??
        ''
    ).trim()
    const firstName = String(
      d.firstIndustryTagName ??
        d.coreIndustryTagName ??
        d.rootIndustryTagName ??
        d.parentIndustryTagName ??
        ''
    ).trim()
    const tid = String(d.industryTagId ?? d.tagId ?? '').trim()
    const tname = String(d.industryTagName ?? d.tagName ?? '').trim()
    if (firstId && tid && firstId !== tid) {
      path.push(
        { id: firstId, name: firstName || firstId },
        { id: tid, name: tname || tid }
      )
    } else if (tid || tname) {
      path.push({ id: tid || tname, name: tname || tid })
    }
  }
  const leafId =
    String(d.industryTagId ?? d.tagId ?? '').trim() ||
    String(path[path.length - 1]?.id ?? '').trim()

  let dimensionPicks = []
  if (Array.isArray(d.dimensionPicks)) {
    dimensionPicks = d.dimensionPicks
      .filter((x) => x && typeof x === 'object')
      .map((x) => ({ ...x }))
  }

  const customScenes = []
  const ct = d.customSceneTexts ?? d.customSceneTextList
  if (Array.isArray(ct)) {
    ct.forEach((item, i) => {
      if (typeof item === 'string') {
        const sceneText = item.trim()
        if (sceneText) customScenes.push({ key: `db_${Date.now()}_${i}`, sceneText })
      } else if (item && typeof item === 'object') {
        const sceneText = String(item.sceneText ?? item.text ?? '').trim()
        if (sceneText) {
          customScenes.push({
            key: String(item.key ?? `db_${i}_${Date.now()}`),
            sceneText
          })
        }
      }
    })
  }

  if (!path.length && !leafId) return null
  return {
    industry,
    industryId,
    path,
    industryTagIdForDimensions: leafId,
    dimensionPicks,
    customScenes
  }
}

/**
 * 成片编辑入口：读详情缓存并回显类目路径、维度、自定义标签。
 */
async function applyEditMainBusinessDetailFromStorage() {
  let raw = null
  try {
    raw = uni.getStorageSync(STORAGE_EDIT_MAIN_BUSINESS_DETAIL)
  } catch (_) {
    return
  }
  if (raw == null || raw === '') return
  if (typeof raw === 'string') {
    try {
      raw = JSON.parse(raw)
    } catch {
      return
    }
  }
  const payload = buildRestorePayloadFromMainBusinessDetail(
    /** @type {Record<string, unknown>} */ (raw)
  )
  if (!payload || !Array.isArray(payload.path) || !payload.path.length) return
  const ok = await applyPathFromRestore(
    /** @type {Array<{ id?: unknown, name?: unknown }>} */ (payload.path)
  )
  if (!ok) return
  await syncIndustryDimensionsForPath()
  applyDimensionAndCustomFromRestore(payload)
  try {
    uni.removeStorageSync(STORAGE_EDIT_MAIN_BUSINESS_DETAIL)
  } catch (_) {
    /* ignore */
  }
}

async function syncIndustryDimensionsForPath() {
  dimensionLoadError.value = ''
  if (
    !isApiEnabled() ||
    resolvedIndustryId.value == null ||
    !isBusinessCategoryLeafSelected()
  ) {
    clearDimensionState()
    return
  }
  const leafId = String(pickLeafIndustryTagIdForSubmit() || '').trim()
  if (!leafId) {
    clearDimensionState()
    return
  }
  dimensionLoading.value = true
  try {
    const dimRaw = await listIndustryDimensions(resolvedIndustryId.value)
    const { dimensionTitle, groups } =
      normalizeIndustryDimensionOptionGroups(dimRaw)
    dimensionSectionTitle.value = dimensionTitle
    dimensionGroups.value = groups

    let selections = {}
    try {
      const ogRaw = await listDimensionOptionGroups(
        resolvedIndustryId.value,
        leafId
      )
      selections = buildDimensionSelectionsForFullGroupsFromOptionGroups(
        groups,
        ogRaw
      )
    } catch (ogErr) {
      console.warn('[Yoke] dimension-option-groups 失败，仅展示全量维度无默认选中', ogErr)
    }
    dimensionSelections.value = { ...selections }
  } catch (e) {
    const msg = e?.message ? String(e.message) : '多维度标签加载失败'
    dimensionLoadError.value = msg
    dimensionSectionTitle.value = ''
    dimensionGroups.value = []
    dimensionSelections.value = {}
    uni.showToast({ title: msg, icon: 'none' })
  } finally {
    dimensionLoading.value = false
  }
}

/**
 * @param {number} groupIndex
 * @param {string} tagId
 */
function isDimTagSelected(groupIndex, tagId) {
  const g = dimensionGroups.value[groupIndex]
  if (!g) return false
  const key = dimensionGroupKey(g, groupIndex)
  const tid = String(tagId ?? '').trim()
  return (dimensionSelections.value[key] || []).includes(tid)
}

/**
 * @param {number} groupIndex
 * @param {string} tagId
 */
function toggleDimTag(groupIndex, tagId) {
  const g = dimensionGroups.value[groupIndex]
  if (!g) return
  const key = dimensionGroupKey(g, groupIndex)
  const tid = String(tagId ?? '').trim()
  if (!tid) return
  const prev = dimensionSelections.value[key] || []
  const has = prev.includes(tid)
  const next = has ? prev.filter((x) => x !== tid) : [...prev, tid]
  dimensionSelections.value = { ...dimensionSelections.value, [key]: next }
}

function removeCustomScene(index) {
  customScenes.value = customScenes.value.filter((_, i) => i !== index)
}

function toggleCustomDeleteMode() {
  if (customScenes.value.length < 1) {
    customDeleteMode.value = false
    return
  }
  customDeleteMode.value = !customDeleteMode.value
}

function closeCustomTagSheet() {
  customTagInputFocus.value = false
  showCustomTagSheet.value = false
  customTagDraft.value = ''
}

function onCustomTagDraftInput(e) {
  const v = String(e?.detail?.value ?? '').slice(0, CUSTOM_TAG_INPUT_MAX)
  customTagDraft.value = v
}

function openAddCustomScene() {
  if (customScenes.value.length >= CUSTOM_SCENE_MAX) {
    uni.showToast({ title: `最多添加${CUSTOM_SCENE_MAX}条`, icon: 'none' })
    return
  }
  customDeleteMode.value = false
  customTagDraft.value = ''
  customTagInputFocus.value = false
  showCustomTagSheet.value = true
  nextTick(() => {
    customTagInputFocus.value = true
    setTimeout(() => {
      if (showCustomTagSheet.value) {
        customTagInputFocus.value = true
      }
    }, 150)
  })
}

function confirmCustomTagSheet() {
  const t = String(customTagDraft.value || '').trim()
  if (!t) {
    uni.showToast({ title: '请输入标签', icon: 'none' })
    return
  }
  if (customScenes.value.length >= CUSTOM_SCENE_MAX) {
    uni.showToast({ title: `最多添加${CUSTOM_SCENE_MAX}条`, icon: 'none' })
    closeCustomTagSheet()
    return
  }
  if (customScenes.value.some((x) => x.sceneText === t)) {
    uni.showToast({ title: '已存在相同标签', icon: 'none' })
    return
  }
  customScenes.value = [
    ...customScenes.value,
    { key: `c_${Date.now()}`, sceneText: t.slice(0, CUSTOM_TAG_INPUT_MAX) }
  ]
  closeCustomTagSheet()
}

onLoad((query = {}) => {
  const rawIntent = typeof query.intent === 'string' ? query.intent : ''
  pageIntent.value = rawIntent.toLowerCase() === 'edit' ? 'edit' : 'add'

  const from = String(query.from || '').toLowerCase()
  freshAddFromGenerate.value =
    pageIntent.value === 'add' &&
    (from === 'generate-add' || from === 'mine-add')

  if (freshAddFromGenerate.value) {
    industry.value = ''
    categoryTree.value = []
    selectedPath.value = []
    resolvedIndustryId.value = null
    useSecondTagsEndpoint.value = false
    secondLevelCategoryTitle.value = ''
    coreTagsLoadingRootId.value = ''
    clearDimensionState()
    customScenes.value = []
    customDeleteMode.value = false
    closeCustomTagSheet()
    return
  }

  if (query.industry) {
    industry.value = decodeURIComponent(String(query.industry))
  }

  fetchCategoryTree()
})

function goBack() {
  closeCustomTagSheet()
  customDeleteMode.value = false
  uni.navigateBack()
}

async function fetchCategoryTree() {
  const key = String(industry.value || '').trim()
  if (!key) {
    categoryTree.value = []
    selectedPath.value = []
    resolvedIndustryId.value = null
    useSecondTagsEndpoint.value = false
    secondLevelCategoryTitle.value = ''
    coreTagsLoadingRootId.value = ''
    clearDimensionState()
    customScenes.value = []
    customDeleteMode.value = false
    closeCustomTagSheet()
    return
  }

  showPageLoading()
  try {
    const restorePayload = readBusinessRestorePayload()
    const restoreMatch =
      !!restorePayload &&
      pageIntent.value === 'add' &&
      !freshAddFromGenerate.value &&
      String(restorePayload.industry ?? '').trim() === key

    if (restorePayload && !restoreMatch) {
      clearBusinessRestoreStorage()
    }

    clearDimensionState()
    customScenes.value = []
    closeCustomTagSheet()
    const data = await getBusinessCategories(key)
    categoryTree.value = data.levels || []
    resolvedIndustryId.value =
      data.industryId != null && data.industryId !== ''
        ? data.industryId
        : null
    useSecondTagsEndpoint.value = Boolean(data.useSecondTagsEndpoint)
    secondLevelCategoryTitle.value = ''
    selectedPath.value = []
    coreTagsLoadingRootId.value = ''

    let restoredPathOk = false
    if (
      restoreMatch &&
      restorePayload &&
      Array.isArray(restorePayload.path) &&
      restorePayload.path.length
    ) {
      restoredPathOk = await applyPathFromRestore(
        /** @type {Array<{ id?: unknown, name?: unknown }>} */ (restorePayload.path)
      )
      if (!restoredPathOk) {
        uni.showToast({ title: '主营路径已变更，请重新选择', icon: 'none' })
      }
    }

    /** 仅「一键成片初始页」等带行业的 add：默认选第一条到叶子；生成页新增主营业务不做默认勾选 */
    const useAddDefaults =
      pageIntent.value === 'add' &&
      !freshAddFromGenerate.value &&
      !useSecondTagsEndpoint.value &&
      !restoredPathOk

    if (useAddDefaults) {
      applyFirstBranchLeafPath(categoryTree.value)
    }
    await syncIndustryDimensionsForPath()
    if (restoreMatch && restorePayload && restoredPathOk) {
      applyDimensionAndCustomFromRestore(restorePayload)
    }
    if (restorePayload) {
      clearBusinessRestoreStorage()
    }
    if (pageIntent.value === 'edit') {
      await applyEditMainBusinessDetailFromStorage()
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
  closeCustomTagSheet()
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
  const roots = categoryTree.value
  if (!roots.some((r) => String(r.id) === id)) {
    return
  }
  if (!silent) {
    showPageLoading()
  }
  try {
    const { title, rows } = await listSecondTags(resolvedIndustryId.value, id)
    const t = String(title ?? '').trim()
    if (t) secondLevelCategoryTitle.value = t
    const children = mapTagRowsToLeafCategoryNodes(rows)
    const idx = roots.findIndex((r) => String(r.id) === id)
    if (idx >= 0) {
      const prev = roots[idx]
      roots[idx] = {
        ...prev,
        children: children.length ? children : undefined
      }
      categoryTree.value = [...roots]
    }
  } catch (e) {
    if (!silent) {
      uni.showToast({
        title: e?.message ? String(e.message) : '二级品类加载失败',
        icon: 'none'
      })
    }
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
  closeCustomTagSheet()
  customDeleteMode.value = false
  customScenes.value = []
  coreTagsLoadingRootId.value = ''
  if (levelIndex === 0) {
    secondLevelCategoryTitle.value = ''
  }
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
  await syncIndustryDimensionsForPath()
}

function confirmSelection() {
  closeCustomTagSheet()
  customDeleteMode.value = false
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
    industryTagIdForDimensions: leafTagId,
    dimensionPicks: dimensionGroups.value.map((g, gi) => {
      const key = dimensionGroupKey(g, gi)
      const ids = [...(dimensionSelections.value[key] || [])]
      const options = Array.isArray(g.options) ? g.options : []
      return {
        categoryId: g.categoryId,
        categoryName: g.categoryName,
        selectedTagIds: ids,
        selectedTags: ids.map((tid) => {
          const t = String(tid ?? '').trim()
          const opt = options.find((o) => String(o.id) === t)
          return {
            id: t,
            name: opt ? String(opt.name ?? '').trim() : ''
          }
        })
      }
    }),
    customScenes: customScenes.value.map(({ key, sceneText }) => ({ key, sceneText }))
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

.dimension-section {
  padding: 0 20rpx 48rpx;
  border-top: 1rpx solid #f0f0f0;
}

.dimension-head {
  padding-top: 28rpx;
  color: #1f2933;
  font-size: 28rpx;
  font-weight: 700;
}

.dimension-group {
  margin-top: 28rpx;
}

/* 多维度：除第一个分组外，上方加分隔线 */
.dimension-group--split {
  border-top: 1rpx solid #f0f0f0;
  padding-top: 28rpx;
  margin-top: 28rpx;
}

.dimension-loading,
.dimension-error {
  padding: 28rpx 0;
  font-size: 26rpx;
  color: #6b7280;
}

.dimension-error {
  color: #ef4444;
}

.custom-section {
  padding: 0 20rpx 48rpx;
  border-top: 1rpx solid #f0f0f0;
}

.custom-section__title {
  padding-top: 28rpx;
}

.custom-chip {
  position: relative;
  padding-right: 12rpx;
  max-width: 100%;
  box-sizing: border-box;
}

.custom-chip__text {
  max-width: 420rpx;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.custom-chip__remove {
  position: absolute;
  top: -10rpx;
  right: -10rpx;
  z-index: 2;
  width: 30rpx;
  height: 30rpx;
  border-radius: 50%;
  background: #b8bcc4;
  display: flex;
  align-items: center;
  justify-content: center;
}

.custom-chip__minus {
  color: #ffffff;
  font-size: 22rpx;
  font-weight: 700;
  line-height: 1;
}

.custom-add-btn {
  border-color: #e1e3e8;
  background: #ffffff;
  color: #9da5b2;
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

.custom-tag-sheet-mask {
  position: fixed;
  inset: 0;
  z-index: 130;
  box-sizing: border-box;
  padding-top: constant(safe-area-inset-top);
  padding-top: env(safe-area-inset-top);
  background: rgba(0, 0, 0, 0.54);
  display: flex;
  align-items: flex-end;
}

.custom-tag-sheet {
  width: 100%;
  box-sizing: border-box;
  padding: 0 0 calc(28rpx + constant(safe-area-inset-bottom));
  padding: 0 0 calc(28rpx + env(safe-area-inset-bottom));
  border-radius: 28rpx 28rpx 0 0;
  background: #ffffff;
}

.custom-tag-sheet__head {
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  padding: 28rpx 30rpx 20rpx;
  border-bottom: 1rpx solid #f0f0f0;
}

.custom-tag-sheet__cancel {
  flex: 0 0 auto;
  min-width: 80rpx;
  font-size: 28rpx;
  font-family: OPPOSans-regular, sans-serif;
  color: #101010;
}

.custom-tag-sheet__title-text {
  flex: 1;
  text-align: center;
  font-size: 28rpx;
  font-family: OPPOSans-medium, sans-serif;
  color: #101010;
}

.custom-tag-sheet__create {
  flex: 0 0 auto;
  min-width: 80rpx;
  text-align: right;
  font-size: 28rpx;
  font-family: OPPOSans-regular, sans-serif;
  color: #ffa554;
}

.custom-tag-sheet__field {
  display: flex;
  flex-direction: row;
  align-items: center;
  box-sizing: border-box;
  width: 710rpx;
  height: 68rpx;
  margin: 32rpx auto 0;
  padding: 0 20rpx;
  border: 2rpx solid rgba(252, 240, 240, 1);
  border-radius: 14rpx;
  background-color: rgba(255, 255, 255, 1);
}

.custom-tag-sheet__input {
  flex: 1;
  min-width: 0;
  height: 68rpx;
  line-height: 68rpx;
  font-size: 28rpx;
  font-family: PingFangSC-Regular, 'PingFang SC', sans-serif;
  color: rgba(16, 16, 16, 1);
  background: transparent;
}

.custom-tag-sheet__ph {
  color: #9ca3af;
}

.custom-tag-sheet__counter {
  flex-shrink: 0;
  margin-left: 12rpx;
  font-size: 24rpx;
  color: #9ca3af;
}
</style>
