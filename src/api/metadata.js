/**
 * 一键成片 · 元数据（与后端 OpenAPI「一键成片-元数据」一致）
 * 文档：项目接口基址 + `/v3/api-docs`（如 http://47.107.171.124/v3/api-docs）
 */
import { get } from '@/utils/request'

/**
 * 行业列表（不分页）
 * GET /api/industries
 * @returns {Promise<Array<{ industryId: string, industryName: string, dimensionTitle?: string | null, sort?: number }>>}
 */
export function listIndustries() {
  return get('/api/industries')
}

/**
 * 核心品类列表（按行业）
 * GET /api/industries/{industryId}/core-tags
 * @param {string | number} industryId 行业 ID（tb_category.id）
 * @returns {Promise<Array<{ tagId: string, tagName: string, categoryId?: string, parentId?: string, level?: number, sort?: number }>>}
 */
export function listCoreTags(industryId) {
  const id = encodeURIComponent(String(industryId ?? '').trim())
  return get(`/api/industries/${id}/core-tags`)
}
