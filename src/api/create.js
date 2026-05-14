/**
 * 【一键成片 · 接口模块】
 * - 主营业务类目：供 pages/create/business 等选择链路使用
 * - 成片消耗预览：供 generate 页展示「N点」并与校验逻辑一致
 * - 已配置 `VITE_API_BASE_URL` 时：行业 `/api/industries`；一级核心品类 `.../core-tags`；二级 `.../core-tags/{firstTagId}/second-tags`（见 OpenAPI）
 */
import { VIDEO_GENERATE_COST_POINTS } from '@/constants/create'
import { get, post, put, del, isApiEnabled } from '@/utils/request'
import { listIndustries, listCoreTags } from '@/api/metadata'

// --- 主营业务类目（Mock，按行业展开树） ---
const businessCategoryTree = {
  '餐饮': [
    {
      id: 'hot-pot',
      name: '火锅',
      children: [
        { id: 'sichuan-hot-pot', name: '川渝火锅' },
        { id: 'beef-hot-pot', name: '牛肉火锅' },
        { id: 'fish-hot-pot', name: '鱼火锅' }
      ]
    },
    {
      id: 'barbecue',
      name: '烧烤',
      children: [
        { id: 'night-barbecue', name: '夜宵烧烤' },
        { id: 'korean-barbecue', name: '韩式烤肉' }
      ]
    },
    {
      id: 'fast-food',
      name: '快餐（面 / 饭）',
      children: [
        { id: 'rice-set', name: '盖饭套餐' },
        { id: 'noodle', name: '面馆' }
      ]
    },
    { id: 'snack', name: '小吃' },
    { id: 'seafood', name: '海鲜' },
    { id: 'roast-meat', name: '烤肉' },
    { id: 'restaurant', name: '正餐（家常菜 / 酒楼）' },
    { id: 'western-food', name: '西餐 / 异国料理' },
    { id: 'drink', name: '饮品' },
    { id: 'dessert', name: '甜品烘焙' }
  ],
  '美业': [
    {
      id: 'hair',
      name: '美发',
      children: [
        { id: 'hair-cut', name: '剪发造型' },
        { id: 'hair-color', name: '染烫护理' }
      ]
    },
    { id: 'nail', name: '美甲美睫' },
    { id: 'skin-care', name: '皮肤管理' }
  ]
}

/**
 * 将核心品类列表转为页面使用的类目树（parentId 关联子级）。
 * @param {Array<Record<string, unknown>>} tags
 * @returns {Array<{ id: string, name: string, children: unknown[] }>}
 */
function coreTagsToCategoryLevels(tags) {
  if (!Array.isArray(tags) || tags.length === 0) return []
  const ordered = [...tags].sort((a, b) => {
    const sa = Number(a.sort ?? 0)
    const sb = Number(b.sort ?? 0)
    if (sa !== sb) return sa - sb
    return String(a.tagId ?? '').localeCompare(String(b.tagId ?? ''))
  })
  const map = new Map()
  for (const t of ordered) {
    const id = String(t.tagId ?? '').trim()
    if (!id) continue
    map.set(id, {
      id,
      name: String(t.tagName ?? ''),
      children: []
    })
  }
  const roots = []
  for (const t of ordered) {
    const id = String(t.tagId ?? '').trim()
    if (!id || !map.has(id)) continue
    const node = map.get(id)
    const pid =
      t.parentId != null && String(t.parentId).trim() !== ''
        ? String(t.parentId).trim()
        : '0'
    if (pid === '0') {
      roots.push(node)
    } else if (map.has(pid)) {
      map.get(pid).children.push(node)
    } else {
      roots.push(node)
    }
  }
  /**
   * 函数：stripEmptyChildren
   */
  function stripEmptyChildren(n) {
    if (n.children.length === 0) delete n.children
    else n.children.forEach(stripEmptyChildren)
  }
  roots.forEach(stripEmptyChildren)
  return roots
}

/**
 * 仅一级核心品类（parentId 为 0 / 空），用于走「选中后再 GET …/second-tags」的接口链路。
 * @param {Array<Record<string, unknown>>} tags
 * @returns {Array<{ id: string, name: string }>}
 */
function coreTagsToRootNodesOnly(tags) {
  if (!Array.isArray(tags) || tags.length === 0) return []
  const ordered = [...tags].sort((a, b) => {
    const sa = Number(a.sort ?? 0)
    const sb = Number(b.sort ?? 0)
    if (sa !== sb) return sa - sb
    return String(a.tagId ?? '').localeCompare(String(b.tagId ?? ''))
  })
  const out = []
  for (const t of ordered) {
    const pidRaw = t.parentId
    const pid =
      pidRaw != null && String(pidRaw).trim() !== ''
        ? String(pidRaw).trim()
        : '0'
    if (pid !== '0') continue
    const id = String(t.tagId ?? '').trim()
    if (!id) continue
    out.push({ id, name: String(t.tagName ?? '') })
  }
  return out
}

/**
 * 函数：mockBusinessCategories
 */
function mockBusinessCategories(industry = '餐饮') {
  const key = industry && businessCategoryTree[industry] ? industry : '餐饮'
  return {
    industry: industry || key,
    levels: businessCategoryTree[industry] || businessCategoryTree[key]
  }
}

/**
 * 主营业务类目树：未配置基址时走本地 Mock；否则按行业名称匹配后端行业后拉取核心品类。
 * @param {string} [industry='餐饮'] 与门店行业名称一致（对应 ApiIndustryItemVO.industryName）
 * @returns {Promise<{ industry: string, levels: unknown[], industryId?: string | number, useSecondTagsEndpoint?: boolean }>}
 */
export async function getBusinessCategories(industry = '餐饮') {
  const name = String(industry ?? '').trim()
  if (!isApiEnabled()) {
    return Promise.resolve(mockBusinessCategories(name || '餐饮'))
  }
  if (!name) {
    return Promise.resolve({ industry: '', levels: [] })
  }
  try {
    const industries = await listIndustries()
    const hit = Array.isArray(industries)
      ? industries.find((x) => String(x.industryName ?? '').trim() === name)
      : null
    if (!hit || hit.industryId == null) {
      return mockBusinessCategories(name)
    }
    const industryId = hit.industryId
    const tags = await listCoreTags(industryId)
    const rootsOnly = coreTagsToRootNodesOnly(tags)
    if (rootsOnly.length) {
      return {
        industry: name,
        levels: rootsOnly,
        industryId,
        useSecondTagsEndpoint: true
      }
    }
    const levels = coreTagsToCategoryLevels(tags)
    if (!levels.length) {
      return mockBusinessCategories(name)
    }
    return { industry: name, levels, industryId, useSecondTagsEndpoint: false }
  } catch (_) {
    return mockBusinessCategories(name)
  }
}

// --- 成片计费预览（Mock） ---
/**
 * 单次成片消耗点数预览。联调后改为真实 GET，字段与后端约定。
 * @returns {Promise<{ points: number }>}
 */
export function getVideoGenerateCostPreview() {
  return Promise.resolve({
    points: VIDEO_GENERATE_COST_POINTS
  })
}

/**
 * 查询单条主营业务详情（编辑回显）。
 * GET /api/member/main-businesses/{id}
 * @param {string|number} id 主营业务记录 ID
 * @returns {Promise<Record<string, unknown>>}
 */
export function getMemberMainBusinessDetail(id) {
  const bid = encodeURIComponent(String(id ?? '').trim())
  return get(`/api/member/main-businesses/${bid}`)
}

/**
 * 会员主营业务列表（按行业、企业名称模糊）。
 * GET /api/member/main-businesses?industryId=&enterpriseName=
 * @param {{ industryId?: string | number, enterpriseName?: string }} [params]
 * @returns {Promise<{ total?: number, rows?: unknown[] }>}
 */
export function listMemberMainBusinesses(params = {}) {
  const industryId = String(params.industryId ?? '').trim()
  const enterpriseName = String(params.enterpriseName ?? '').trim()
  const q = []
  if (industryId) q.push(`industryId=${encodeURIComponent(industryId)}`)
  if (enterpriseName) q.push(`enterpriseName=${encodeURIComponent(enterpriseName)}`)
  const qs = q.length ? `?${q.join('&')}` : ''
  return get(`/api/member/main-businesses${qs}`)
}

/**
 * 新增会员主营业务。
 * POST /api/member/main-businesses
 * @param {Record<string, unknown>} body
 * @returns {Promise<unknown>}
 */
export function createMemberMainBusiness(body) {
  return post('/api/member/main-businesses', body)
}

/**
 * 修改会员主营业务。
 * PUT /api/member/main-businesses/{id}
 * @param {string|number} id
 * @param {Record<string, unknown>} body
 * @returns {Promise<unknown>}
 */
export function updateMemberMainBusiness(id, body) {
  const bid = encodeURIComponent(String(id ?? '').trim())
  return put(`/api/member/main-businesses/${bid}`, body)
}

/**
 * 删除会员主营业务。
 * DELETE /api/member/main-businesses/{id}
 * @param {string|number} id
 * @returns {Promise<unknown>}
 */
export function deleteMemberMainBusiness(id) {
  const bid = encodeURIComponent(String(id ?? '').trim())
  return del(`/api/member/main-businesses/${bid}`)
}

/**
 * 会员视频模板分页列表（一键成片）。
 * GET /api/member/video-templates?mainBusinessId=&platformId=&pageNum=&pageSize=
 * @param {{ mainBusinessId: string | number, platformId: string | number, pageNum?: number, pageSize?: number }} params
 * @returns {Promise<{ total?: number, rows?: unknown[] }>}
 */
export function listMemberVideoTemplates(params) {
  const mainBusinessId = String(params?.mainBusinessId ?? '').trim()
  const platformId = String(params?.platformId ?? '').trim()
  if (!mainBusinessId || !platformId) {
    return Promise.reject(new Error('缺少 mainBusinessId 或 platformId'))
  }
  const pageNumRaw = Number(params?.pageNum)
  const pageNum =
    Number.isFinite(pageNumRaw) && pageNumRaw >= 1 ? Math.trunc(pageNumRaw) : 1
  const sizeRaw = Number(params?.pageSize)
  const pageSizeRaw =
    Number.isFinite(sizeRaw) && sizeRaw >= 1 ? Math.trunc(sizeRaw) : 10
  const pageSize = Math.min(100, Math.max(1, pageSizeRaw))
  const q = [
    `mainBusinessId=${encodeURIComponent(mainBusinessId)}`,
    `platformId=${encodeURIComponent(platformId)}`,
    `pageNum=${encodeURIComponent(String(pageNum))}`,
    `pageSize=${encodeURIComponent(String(pageSize))}`
  ]
  return get(`/api/member/video-templates?${q.join('&')}`)
}

/**
 * 视频模板口播文案素材列表。
 * GET /api/member/video-templates/{videoId}/script-materials
 * @param {string|number} videoId 模板 id（与列表项 videoId 一致）
 * @returns {Promise<unknown[]>} 业务层 `data` 为数组
 */
export function getVideoTemplateScriptMaterials(videoId) {
  const vid = encodeURIComponent(String(videoId ?? '').trim())
  if (!vid) {
    return Promise.reject(new Error('缺少 videoId'))
  }
  return get(`/api/member/video-templates/${vid}/script-materials`)
}

/**
 * 视频模板照片素材槽位列表。
 * GET /api/member/video-templates/{videoId}/photo-materials
 * @param {string|number} videoId 模板 id（与列表项 videoId 一致）
 * @returns {Promise<unknown[]>} 业务层 `data` 为数组
 */
export function getVideoTemplatePhotoMaterials(videoId) {
  const vid = encodeURIComponent(String(videoId ?? '').trim())
  if (!vid) {
    return Promise.reject(new Error('缺少 videoId'))
  }
  return get(`/api/member/video-templates/${vid}/photo-materials`)
}
