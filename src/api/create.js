/**
 * 【一键成片 · 接口模块】
 * - 主营业务类目：供 pages/create/business 等选择链路使用
 * - 成片消耗预览：供 generate 页展示「N点」并与校验逻辑一致
 * - 已配置 `VITE_API_BASE_URL` 时：行业 / 核心品类走 GET `/api/industries`、`/api/industries/{id}/core-tags`（见 OpenAPI）
 */
import { VIDEO_GENERATE_COST_POINTS } from '@/constants/create'
import { isApiEnabled } from '@/utils/request'
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
  function stripEmptyChildren(n) {
    if (n.children.length === 0) delete n.children
    else n.children.forEach(stripEmptyChildren)
  }
  roots.forEach(stripEmptyChildren)
  return roots
}

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
 * @returns {Promise<{ industry: string, levels: unknown[] }>}
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
    const tags = await listCoreTags(hit.industryId)
    const levels = coreTagsToCategoryLevels(tags)
    if (!levels.length) {
      return mockBusinessCategories(name)
    }
    return { industry: name, levels }
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
