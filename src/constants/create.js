/**
 * 【一键成片 · 常量模块】
 * 与 docs/frontend-development.md §10、pages/create/generate 对齐。
 * 成片消耗点数可被接口返回值覆盖；枚举配置仅供前端展示与提交字段对齐。
 */

// --- 计费：单次成片 ---
/** 单次成片默认消耗点数（设计稿「▰ N点」；接口返回后由页面覆盖展示） */
export const VIDEO_GENERATE_COST_POINTS = 20

// --- 成片参数：分辨率（与模型独立；弹窗三档对齐设计稿 480 / 720 / 1080） ---
export const CREATE_RESOLUTION_OPTIONS = [
  { id: '480p', label: '480P', hint: '画质一般', vip: false },
  { id: '720p', label: '720P', hint: '生成速度更快', vip: false },
  { id: '1080p', label: '1080P', hint: '画质更高清', vip: true }
]

// --- 成片参数：生成模型（与分辨率独立；顺序与设计稿一致） ---
export const CREATE_MODEL_OPTIONS = [
  { id: 'happy-horse', label: 'Happy horse1.0', hint: '效果逼真', vip: false },
  { id: 'vidu-q3', label: 'Vidu Q3', hint: '效果逼真', vip: false },
  { id: 'seedance2', label: 'Seedance2.0', hint: '效果极为逼真', vip: true }
]

/**
 * 成片消耗点数（与模板成片时长、分辨率、模型相关；联调后可由接口覆盖规则）。
 * @param {{ durationSec?: number, resolutionId?: string, modelId?: string }} params
 * @returns {number}
 */
export function computeVideoGenerateCostPoints(params = {}) {
  const durationSec = Math.max(1, Math.floor(Number(params.durationSec) || 30))
  const resolutionId = params.resolutionId || '720p'
  const modelId = params.modelId || 'happy-horse'

  const res = CREATE_RESOLUTION_OPTIONS.find((r) => r.id === resolutionId)
  const mod = CREATE_MODEL_OPTIONS.find((m) => m.id === modelId)

  let pts = VIDEO_GENERATE_COST_POINTS
  pts += Math.ceil(durationSec / 15) * 2
  if (res?.vip) pts += 10
  if (mod?.vip) pts += 10
  return Math.max(1, pts)
}
