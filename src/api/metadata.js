/**
 * 一键成片 · 元数据（与后端 OpenAPI「一键成片-元数据」一致）
 * 文档：项目接口基址 + `/v3/api-docs`（如 http://47.107.171.124/v3/api-docs）
 */
import { get } from '@/utils/request'

/**
 * 行业列表（不分页）
 * GET /api/industries
 * 说明：当前后端在 Spring Security 下通常要求已登录（Bearer）；未登录会返回 401。
 * @returns {Promise<Array<{ industryId: string, industryName: string, dimensionTitle?: string | null, sort?: number }>>}
 */
export function listIndustries() {
  return get('/api/industries')
}

/**
 * 行业下拉展示名列表（按 `sort` 升序，再按 `industryName`）；供一键成片商户页、主营业务页共用。
 * @returns {Promise<string[]>}
 */
export async function fetchIndustryOptionNames() {
  const data = await listIndustries()
  if (!Array.isArray(data) || data.length === 0) return []
  return [...data]
    .sort((a, b) => {
      const sa = Number(a.sort ?? 0)
      const sb = Number(b.sort ?? 0)
      if (sa !== sb) return sa - sb
      return String(a.industryName ?? '').localeCompare(
        String(b.industryName ?? ''),
        'zh-Hans-CN'
      )
    })
    .map((row) => String(row.industryName ?? '').trim())
    .filter(Boolean)
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

/**
 * 二级核心品类（选中一级核心品类后拉取；未配置二级时返回空数组）
 * GET /api/industries/{industryId}/core-tags/{firstTagId}/second-tags
 * @param {string | number} industryId 行业 ID（tb_category.id，category_type=industry）
 * @param {string | number} firstTagId 一级核心品类标签 ID（tb_tag.id，须与 GET …/core-tags 返回项 tagId 一致）
 * @returns {Promise<Array<{ tagId?: string, tagName?: string, categoryId?: string, parentId?: string, level?: number, sort?: number }>>}
 */
export async function listSecondTags(industryId, firstTagId) {
  const iid = encodeURIComponent(String(industryId ?? '').trim())
  const tid = encodeURIComponent(String(firstTagId ?? '').trim())
  const raw = await get(`/api/industries/${iid}/core-tags/${tid}/second-tags`)
  return Array.isArray(raw) ? raw : []
}

/**
 * 行业下维度分类及一级维度标签（不按核心品类与维度关聯过滤）
 * GET /api/industries/{industryId}/dimensions
 * 数据口径与后台 GET /film/tag/overview/{industryId} 的 dimensions、dimension_title 一致。
 * @param {string | number} industryId 行业 ID（tb_category.id）
 * @returns {Promise<Record<string, unknown>>}
 */
export function listIndustryDimensions(industryId) {
  const id = encodeURIComponent(String(industryId ?? '').trim())
  return get(`/api/industries/${id}/dimensions`)
}

/**
 * 从 /dimensions 响应中取「二级品类」展示标题（与 overview 的 dimension_title 一致）。
 * @param {unknown} payload
 * @returns {string}
 */
export function pickSecondLevelBlockTitleFromIndustryDimensions(payload) {
  if (payload == null || typeof payload !== 'object') return ''
  const o = /** @type {Record<string, unknown>} */ (payload)
  const direct = o.dimension_title ?? o.dimensionTitle
  if (direct != null && String(direct).trim()) return String(direct).trim()
  const dims = o.dimensions
  if (!Array.isArray(dims) || dims.length === 0) return ''
  const first = dims[0]
  if (first == null || typeof first !== 'object') return ''
  const f = /** @type {Record<string, unknown>} */ (first)
  const t =
    f.dimension_title ??
    f.dimensionTitle ??
    f.categoryName ??
    f.name ??
    f.title
  if (t != null && String(t).trim()) return String(t).trim()
  return ''
}

/**
 * 将 core-tags / second-tags 等「标签行」转为页面用的叶子节点列表（无 children）。
 * @param {unknown} rows
 * @returns {Array<{ id: string, name: string }>}
 */
export function mapTagRowsToLeafCategoryNodes(rows) {
  if (!Array.isArray(rows) || rows.length === 0) return []
  return [...rows]
    .sort((a, b) => {
      const sa = Number(a.sort ?? 0)
      const sb = Number(b.sort ?? 0)
      if (sa !== sb) return sa - sb
      return String(a.tagId ?? a.id ?? '').localeCompare(String(b.tagId ?? b.id ?? ''))
    })
    .map((t) => ({
      id: String(t.tagId ?? t.id ?? '').trim(),
      name: String(t.tagName ?? t.name ?? '').trim()
    }))
    .filter((n) => n.id && n.name)
}

/**
 * 维度多选分组（按当前选中的行业标签过滤）
 * GET /api/industries/{industryId}/dimension-option-groups?industryTagId=
 * @param {string | number} industryId
 * @param {string | number} industryTagId 当前选中的核心/二级品类标签 id（tb_tag.id）
 * @returns {Promise<{ dimensionTitle?: string | null, groups?: Array<Record<string, unknown>> }>}
 */
export function listDimensionOptionGroups(industryId, industryTagId) {
  const iid = encodeURIComponent(String(industryId ?? '').trim())
  const tid = String(industryTagId ?? '').trim()
  return get(`/api/industries/${iid}/dimension-option-groups`, {
    industryTagId: tid
  })
}
