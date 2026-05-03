/**
 * 一键成片 / 生成配置相关常量（与 docs/frontend-development.md §10 对齐）。
 * 点数消耗以后端为准时可配合 {@link getVideoGenerateCostPreview} 覆盖展示。
 */

/** 单次成片默认消耗点数（设计稿底部「20点」；接口返回后由页面覆盖展示） */
export const VIDEO_GENERATE_COST_POINTS = 20

/** 分辨率选项：分辨率与模型列表互不耦合，仅共用本文件配置 */
export const CREATE_RESOLUTION_OPTIONS = [
  { id: '720p', label: '720P', hint: '生成速度更快', vip: false },
  { id: '1080p', label: '1080P', hint: '画质更高清', vip: true },
  { id: '4k', label: '4K', hint: '画质更高清', vip: true }
]

/** 生成模型选项（与分辨率独立） */
export const CREATE_MODEL_OPTIONS = [
  { id: 'seedance2', label: 'Seedance2.0', hint: '效果极为逼真' },
  { id: 'vidu-q3', label: 'Vidu Q3', hint: '效果逼真' },
  { id: 'happy-horse', label: 'Happy horse1.0', hint: '效果逼真' }
]

/** 选择时需消耗点数校验的高清档位（点数不足时弹出 VIP 套餐，见设计图） */
export const HD_RESOLUTION_IDS = ['1080p', '4k']
