/**
 * 一键成片「发布平台」与发布成片页共用：id 须与 generate 页下拉一致。
 */
export const CREATE_SELECTED_PLATFORM_STORAGE_KEY = 'create:selected-platform-id'

/** @type {{ id: string, name: string }[]} */
export const PLATFORM_OPTIONS = [
  { id: 'douyin', name: '抖音' },
  { id: 'kuaishou', name: '快手' },
  { id: 'shipinhao', name: '视频号' },
  { id: 'xiaohongshu', name: '小红书' }
]
