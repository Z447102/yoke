/**
 * 【一键成片 · 常量模块】
 * 与 docs/frontend-development.md §10、pages/create/generate 对齐。
 * 成片消耗点数可被接口返回值覆盖；枚举配置仅供前端展示与提交字段对齐。
 */

// --- 计费：单次成片 ---
/** 单次成片默认消耗点数（设计稿「▰ N点」；接口返回后由页面覆盖展示） */
export const VIDEO_GENERATE_COST_POINTS = 20

// --- 成片参数：分辨率（与模型联动；弹窗三档对齐设计稿 540 / 720 / 1080） ---
export const CREATE_RESOLUTION_OPTIONS = [
  { id: '540p', label: '540P', hint: '画质普通', vip: false },
  { id: '720p', label: '720P', hint: '生成速度快', vip: false },
  { id: '1080p', label: '1080P', hint: '画质更高清', vip: true }
]

// --- 成片参数：生成模型（顺序与设计稿一致：Vidu / PixVerse / Seedance） ---
export const CREATE_MODEL_OPTIONS = [
  { id: 'vidu', label: 'Vidu', vip: false },
  { id: 'pixverse', label: 'PixVerse', vip: false },
  { id: 'seedance', label: 'Seedance', vip: true }
]

/** 各模型可选分辨率 id 列表 */
export const MODEL_SUPPORTED_RESOLUTIONS = {
  vidu: ['540p', '720p'],
  pixverse: ['540p', '720p', '1080p'],
  seedance: ['540p', '720p', '1080p']
}

/** 当前分辨率下展示「推荐 · 最适合」的模型 id */
export const RESOLUTION_RECOMMENDED_MODEL = {
  '540p': 'vidu',
  '720p': 'vidu',
  '1080p': 'seedance'
}

const UNSUPPORTED_RESOLUTION_HINT = '该模型暂不支持'

/**
 * @param {string} modelId
 * @param {string} resolutionId
 * @returns {boolean}
 */
export function isResolutionSupportedByModel(modelId, resolutionId) {
  const list = MODEL_SUPPORTED_RESOLUTIONS[modelId]
  return Array.isArray(list) && list.includes(resolutionId)
}

/**
 * @param {string} modelId
 * @param {string} resolutionId
 * @returns {boolean}
 */
export function isModelRecommendedForResolution(modelId, resolutionId) {
  return RESOLUTION_RECOMMENDED_MODEL[resolutionId] === modelId
}

/**
 * @param {string} modelId
 * @param {{ id: string, hint?: string }} resolution
 * @returns {string}
 */
export function getResolutionHintForModel(modelId, resolution) {
  if (!resolution || !resolution.id) return ''
  if (!isResolutionSupportedByModel(modelId, resolution.id)) {
    return UNSUPPORTED_RESOLUTION_HINT
  }
  return resolution.hint || ''
}

/**
 * 切换模型后若当前分辨率不可用，回落到该模型推荐档。
 * @param {string} modelId
 * @returns {string}
 */
export function pickDefaultResolutionForModel(modelId) {
  const preferred = Object.entries(RESOLUTION_RECOMMENDED_MODEL).find(
    ([, mid]) => mid === modelId
  )
  if (preferred && isResolutionSupportedByModel(modelId, preferred[0])) {
    return preferred[0]
  }
  const list = MODEL_SUPPORTED_RESOLUTIONS[modelId]
  return Array.isArray(list) && list.length ? list[0] : '720p'
}

/** 一键成片可选行业（与商户信息页一致；接口下发后可替换数据源） */
export const CREATE_INDUSTRY_OPTIONS = [
  '餐饮',
  '美业',
  '健身',
  '医疗',
  '医美',
  '大健康',
  '教育',
  '宠物',
  '母婴',
  '设计',
  '零售',
  '娱乐',
  '酒店',
  '旅游',
  '摄影',
  '策划',
  '创意',
  '自媒体',
  '金融',
  '保险',
  '装修业',
  '家居',
  '建材',
  '地产',
  '制造业',
  '互联网',
  '服务类',
  '生活类'
]

/**
 * 成片消耗点数（与模板成片时长、分辨率、模型相关；联调后可由接口覆盖规则）。
 * @param {{ durationSec?: number, resolutionId?: string, modelId?: string }} params
 * @returns {number}
 */
export function computeVideoGenerateCostPoints(params = {}) {
  const durationSec = Math.max(1, Math.floor(Number(params.durationSec) || 30))
  const resolutionId = params.resolutionId || '720p'
  const modelId = params.modelId || 'vidu'

  const res = CREATE_RESOLUTION_OPTIONS.find((r) => r.id === resolutionId)
  const mod = CREATE_MODEL_OPTIONS.find((m) => m.id === modelId)

  let pts = VIDEO_GENERATE_COST_POINTS
  pts += Math.ceil(durationSec / 15) * 2
  if (res?.vip) pts += 10
  if (mod?.vip) pts += 10
  return Math.max(1, pts)
}
