/**
 * 一键成片「发布平台」与发布成片页共用：id 须与 generate 页下拉一致。
 */
export const CREATE_SELECTED_PLATFORM_STORAGE_KEY = 'create:selected-platform-id'

/**
 * 读取 `tb_category` 发布平台分类 id（供 `/api/member/video-templates` 的 `platformId`）。
 * 未配置时为 0，此时一键成片不请求视频模板列表（沿用页面本地占位模板）。
 * @param {string} envKey
 * @returns {number}
 */
function readPlatformCategoryId(envKey) {
  try {
    const raw = import.meta.env[envKey]
    if (raw == null || String(raw).trim() === '') return 0
    const n = Math.trunc(Number(raw))
    return Number.isFinite(n) && n > 0 ? n : 0
  } catch (_) {
    return 0
  }
}

/**
 * 视频模板 `platformId` 全局兜底（各 `VITE_PLATFORM_CATEGORY_*` 未配时仍可拉列表；联调可只配此项）。
 * @returns {number}
 */
export function getDefaultVideoTemplatePlatformCategoryId() {
  try {
    const raw = import.meta.env?.VITE_VIDEO_TEMPLATE_DEFAULT_PLATFORM_ID
    if (raw == null || String(raw).trim() === '') return 0
    const n = Math.trunc(Number(raw))
    return Number.isFinite(n) && n > 0 ? n : 0
  } catch (_) {
    return 0
  }
}

/** @type {{ id: string, name: string, platformCategoryId: number }[]} */
export const PLATFORM_OPTIONS = [
  {
    id: 'douyin',
    name: '抖音',
    platformCategoryId: readPlatformCategoryId('VITE_PLATFORM_CATEGORY_DOUYIN')
  },
  {
    id: 'kuaishou',
    name: '快手',
    platformCategoryId: readPlatformCategoryId('VITE_PLATFORM_CATEGORY_KUAISHOU')
  },
  {
    id: 'shipinhao',
    name: '视频号',
    platformCategoryId: readPlatformCategoryId('VITE_PLATFORM_CATEGORY_SHIPINHAO')
  },
  {
    id: 'xiaohongshu',
    name: '小红书',
    platformCategoryId: readPlatformCategoryId('VITE_PLATFORM_CATEGORY_XIAOHONGSHU')
  }
]
