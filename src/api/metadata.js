/**
 * 一键成片 · 元数据（与后端 OpenAPI「一键成片-元数据」一致）
 * 文档：项目接口基址 + `/v3/api-docs`（如 https://baseapi.compoai.cn/v3/api-docs）。
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
 * 从 GET …/second-tags 解包「区块标题」（与 dimensions 的 dimension_title 类似）。
 * @param {unknown} raw `data` 或整包
 * @returns {string}
 */
export function pickSecondLevelTitleFromSecondTagsPayload(raw) {
  if (raw == null || typeof raw !== 'object' || Array.isArray(raw)) return ''
  const o = /** @type {Record<string, unknown>} */ (raw)
  const keys = [
    'secondLevelTitle',
    'second_level_title',
    'subTitle',
    'subtitle',
    'blockTitle',
    'categoryTitle',
    'tagCategoryTitle',
    'dimension_title',
    'dimensionTitle',
    'title'
  ]
  for (const k of keys) {
    const v = o[k]
    if (v != null && String(v).trim()) return String(v).trim()
  }
  const nested = o.data
  if (nested != null && typeof nested === 'object' && !Array.isArray(nested)) {
    const d = /** @type {Record<string, unknown>} */ (nested)
    for (const k of keys) {
      const v = d[k]
      if (v != null && String(v).trim()) return String(v).trim()
    }
  }
  return ''
}

/**
 * 从 second-tags 响应中取出标签行数组（兼容 data 为对象且列表在子字段）。
 * @param {unknown} raw
 * @returns {unknown[]}
 */
export function extractSecondTagListFromPayload(raw) {
  if (raw == null) return []
  if (Array.isArray(raw)) return raw
  if (typeof raw !== 'object') return []
  const o = /** @type {Record<string, unknown>} */ (raw)
  const candidates = [
    o.tags,
    o.rows,
    o.list,
    o.options,
    o.tagList,
    o.coreTags,
    o.secondTags,
    o.data
  ]
  for (const c of candidates) {
    if (Array.isArray(c)) return c
  }
  const nested = o.data
  if (nested != null && typeof nested === 'object' && !Array.isArray(nested)) {
    const d = /** @type {Record<string, unknown>} */ (nested)
    for (const k of ['tags', 'rows', 'list', 'options', 'secondTags']) {
      const arr = d[k]
      if (Array.isArray(arr)) return arr
    }
  }
  return []
}

/**
 * 二级核心品类（选中一级核心品类后拉取；未配置二级时返回空列表）
 * GET /api/industries/{industryId}/core-tags/{firstTagId}/second-tags
 * @param {string | number} industryId 行业 ID（tb_category.id，category_type=industry）
 * @param {string | number} firstTagId 一级核心品类标签 ID（tb_tag.id，须与 GET …/core-tags 返回项 tagId 一致）
 * @returns {Promise<{ title: string, rows: Array<Record<string, unknown>> }>}
 */
export async function listSecondTags(industryId, firstTagId) {
  const iid = encodeURIComponent(String(industryId ?? '').trim())
  const tid = encodeURIComponent(String(firstTagId ?? '').trim())
  const raw = await get(`/api/industries/${iid}/core-tags/${tid}/second-tags`)
  const title = pickSecondLevelTitleFromSecondTagsPayload(raw)
  const rows = extractSecondTagListFromPayload(raw)
  return {
    title,
    rows: Array.isArray(rows) ? /** @type {Array<Record<string, unknown>>} */ (rows) : []
  }
}

/**
 * 行业下多维度「全量」可选标签（用于 UI 渲染所有可选项）
 * GET /api/industries/{industryId}/dimensions
 * 成功 `data` 为 ApiDimensionOptionGroupsVO：`dimensionTitle`、`groups[]`（含 categoryName、options 同 core-tags 条目）。
 * @param {string | number} industryId 行业 ID（tb_category.id）
 * @returns {Promise<Record<string, unknown>>}
 */
export function listIndustryDimensions(industryId) {
  const id = encodeURIComponent(String(industryId ?? '').trim())
  return get(`/api/industries/${id}/dimensions`)
}

/**
 * 将 GET …/dimensions 的 `data` 规范为页面可用的分组结构。
 * @param {unknown} payload 接口 `data`（或已解包对象）
 * @returns {{ dimensionTitle: string, groups: Array<{ categoryId: string, categoryName: string, sort: number, options: Array<{ id: string, name: string }> }> }}
 */
export function normalizeIndustryDimensionOptionGroups(payload) {
  if (payload == null || typeof payload !== 'object') {
    return { dimensionTitle: '', groups: [] }
  }
  const o = /** @type {Record<string, unknown>} */ (payload)
  const rawTitle = o.dimension_title ?? o.dimensionTitle
  const dimensionTitle =
    rawTitle != null && String(rawTitle).trim() ? String(rawTitle).trim() : ''

  let groupsRaw = o.groups
  if (!Array.isArray(groupsRaw)) groupsRaw = []

  const groups = [...groupsRaw]
    .filter((g) => g != null && typeof g === 'object')
    .map((g) => {
      const row = /** @type {Record<string, unknown>} */ (g)
      const categoryId = String(
        row.categoryId ?? row.category_id ?? ''
      ).trim()
      const categoryName = String(
        row.categoryName ?? row.category_name ?? ''
      ).trim()
      const sort = Number(row.sort ?? 0)
      const options = mapTagRowsToLeafCategoryNodes(row.options ?? row.optionList)
      return { categoryId, categoryName, sort, options }
    })
    .filter((g) => g.categoryName && g.options.length)
    .sort((a, b) => {
      if (a.sort !== b.sort) return a.sort - b.sort
      return a.categoryName.localeCompare(b.categoryName, 'zh-Hans-CN')
    })

  return { dimensionTitle, groups }
}

/**
 * 与主营业务页维度多选 state 的 key 一致：优先分组 `categoryId`。
 * @param {{ categoryId?: string }} g
 * @param {number} index
 * @returns {string}
 */
export function dimensionGroupKey(g, index) {
  const cid = String(g?.categoryId ?? '').trim()
  return cid || `dim_${index}`
}

/**
 * @param {Record<string, unknown>} item 原始 option 行（ApiCoreTagItemVO）
 * @returns {boolean}
 */
function isOptionMarkedDefaultSelected(item) {
  if (!item || typeof item !== 'object') return false
  const t = item
  if (t.selected === true) return true
  if (t.defaultSelected === true) return true
  if (t.checked === true) return true
  if (t.isDefault === true) return true
  if (t.defaultSelect === true) return true
  if (t.default === true) return true
  const n = t.isSelected ?? t.selectedFlag
  if (n === 1 || n === true) return true
  const s = String(t.selectStatus ?? t.chooseStatus ?? '')
    .trim()
    .toLowerCase()
  if (s === 'default' || s === 'selected' || s === '1') return true
  return false
}

/**
 * 从 dimension-option-groups（或同结构的 dimensions）响应里解析各分组默认应勾选的 tagId。
 * 兼容：分组上 `defaultTagIds` 等数组；选项行上 `selected` / `defaultSelected` 等布尔。
 * @param {unknown} payload 接口 `data`
 * @param {Array<{ categoryId: string, categoryName: string, sort: number, options: Array<{ id: string, name: string }> }>} normalizedGroups `normalizeIndustryDimensionOptionGroups` 的 `groups`
 * @returns {Record<string, string[]>} key 同 {@link dimensionGroupKey}
 */
export function extractDefaultDimensionSelectionsFromPayload(
  payload,
  normalizedGroups
) {
  const out = /** @type {Record<string, string[]>} */ ({})
  if (
    payload == null ||
    typeof payload !== 'object' ||
    !Array.isArray(normalizedGroups)
  ) {
    return out
  }
  const o = /** @type {Record<string, unknown>} */ (payload)
  const groupsRaw = Array.isArray(o.groups) ? o.groups : []

  for (let gi = 0; gi < normalizedGroups.length; gi++) {
    const g = normalizedGroups[gi]
    const key = dimensionGroupKey(g, gi)
    const cid = String(g.categoryId ?? '').trim()
    const cname = String(g.categoryName ?? '').trim()
    const gsort = Number(g.sort ?? 0)

    let rawG = groupsRaw.find(
      (r) =>
        r &&
        typeof r === 'object' &&
        String(
          /** @type {Record<string, unknown>} */ (r).categoryId ??
            /** @type {Record<string, unknown>} */ (r).category_id ??
            ''
        ).trim() === cid &&
        cid !== ''
    )
    if (!rawG && cname) {
      rawG =
        groupsRaw.find(
          (r) =>
            r &&
            typeof r === 'object' &&
            String(
              /** @type {Record<string, unknown>} */ (r).categoryName ??
                /** @type {Record<string, unknown>} */ (r).category_name ??
                ''
            ).trim() === cname &&
            Number(/** @type {Record<string, unknown>} */ (r).sort ?? 0) === gsort
        ) ?? null
    }
    if (!rawG && typeof groupsRaw[gi] === 'object' && groupsRaw[gi] != null) {
      rawG = /** @type {Record<string, unknown>} */ (groupsRaw[gi])
    }
    if (!rawG || typeof rawG !== 'object') continue

    const validIds = new Set(g.options.map((x) => x.id))
    const picked = new Set()

    const rawRec = /** @type {Record<string, unknown>} */ (rawG)
    const groupIdArrays = [
      rawRec.defaultTagIds,
      rawRec.defaultSelectedTagIds,
      rawRec.defaultOptionIds
    ]
    for (const arr of groupIdArrays) {
      if (!Array.isArray(arr)) continue
      for (const x of arr) {
        const id = String(x ?? '').trim()
        if (id && validIds.has(id)) picked.add(id)
      }
    }

    const rawOpts = rawRec.options ?? rawRec.optionList
    if (Array.isArray(rawOpts)) {
      for (const item of rawOpts) {
        if (!item || typeof item !== 'object') continue
        const row = /** @type {Record<string, unknown>} */ (item)
        const id = String(row.tagId ?? row.id ?? '').trim()
        if (!id || !validIds.has(id)) continue
        if (isOptionMarkedDefaultSelected(row)) picked.add(id)
      }
    }

    if (picked.size) out[key] = [...picked]
  }
  return out
}

/**
 * 将「全量 dimensions 分组」与「dimension-option-groups」响应对齐，生成页面用的默认选中 map。
 * - 列表与可点选范围一律来自 **dimensions** 的 `fullGroups`；
 * - **option-groups** 仅贡献默认勾选：优先选项行/分组上的显式默认标记（见 {@link extractDefaultDimensionSelectionsFromPayload}）；
 *   若某维度分组无显式标记，且 option-groups 中该分组 `options` **条数少于**全量 dimensions 同组条数，
 *   则将 option-groups 返回的 id 视为「已选子集」默认勾选；条数相同则不再推断，避免误全选。
 *
 * @param {Array<{ categoryId: string, categoryName: string, sort: number, options: Array<{ id: string, name: string }> }>} fullGroups `normalizeIndustryDimensionOptionGroups(dimensions)` 的 `groups`
 * @param {unknown} ogPayload `GET …/dimension-option-groups` 的 `data`
 * @returns {Record<string, string[]>} key 为 {@link dimensionGroupKey}(fullGroup, 在 fullGroups 中的下标)
 */
export function buildDimensionSelectionsForFullGroupsFromOptionGroups(
  fullGroups,
  ogPayload
) {
  const out = /** @type {Record<string, string[]>} */ ({})
  if (!Array.isArray(fullGroups) || fullGroups.length === 0) return out
  if (!ogPayload || typeof ogPayload !== 'object') return out

  const ogNorm = normalizeIndustryDimensionOptionGroups(ogPayload).groups
  const explicitByOgKey = extractDefaultDimensionSelectionsFromPayload(
    ogPayload,
    ogNorm
  )

  for (let fi = 0; fi < fullGroups.length; fi++) {
    const fg = fullGroups[fi]
    const fullKey = dimensionGroupKey(fg, fi)
    const allowed = new Set(fg.options.map((o) => o.id))
    if (!allowed.size) continue

    const cid = String(fg.categoryId ?? '').trim()
    const cname = String(fg.categoryName ?? '').trim()
    const fsort = Number(fg.sort ?? 0)

    let ogIdx = ogNorm.findIndex(
      (g) => cid !== '' && String(g.categoryId ?? '').trim() === cid
    )
    if (ogIdx < 0) {
      ogIdx = ogNorm.findIndex(
        (g) =>
          String(g.categoryName ?? '').trim() === cname &&
          Number(g.sort ?? 0) === fsort
      )
    }
    if (ogIdx < 0 && fi < ogNorm.length) ogIdx = fi
    if (ogIdx < 0 || ogIdx >= ogNorm.length) continue

    const ogG = ogNorm[ogIdx]
    const ogKey = dimensionGroupKey(ogG, ogIdx)
    const picked = new Set()

    for (const id of explicitByOgKey[ogKey] || []) {
      if (allowed.has(id)) picked.add(id)
    }

    if (
      picked.size === 0 &&
      Array.isArray(ogG.options) &&
      ogG.options.length > 0 &&
      ogG.options.length < fg.options.length
    ) {
      for (const opt of ogG.options) {
        if (opt.id && allowed.has(opt.id)) picked.add(opt.id)
      }
    }

    if (picked.size) out[fullKey] = [...picked]
  }
  return out
}

/**
 * 从 /dimensions 响应中取「二级品类」展示标题（与 overview 的 dimension_title 一致）。
 * @param {unknown} payload
 * @returns {string}
 */
export function pickSecondLevelBlockTitleFromIndustryDimensions(payload) {
  if (payload == null || typeof payload !== 'object') return ''
  const { dimensionTitle, groups } =
    normalizeIndustryDimensionOptionGroups(payload)
  if (dimensionTitle) return dimensionTitle
  if (groups.length && groups[0].categoryName) return groups[0].categoryName
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
 * 维度默认选中态（与 overview dimensions 同源，按 tag_relation 过滤；**不替代** GET …/dimensions 的全量列表）
 * GET /api/industries/{industryId}/dimension-option-groups?industryTagId=
 * 成功 `data` 为 ApiDimensionOptionGroupsVO：常与 dimensions 同结构，用于「哪些标签默认高亮」——选项行布尔 / 分组 default*Ids，或仅返回已选子集。
 * @param {string | number} industryId
 * @param {string | number} industryTagId 当前选中的核心/二级品类标签 id（tb_tag.id）
 * @returns {Promise<Record<string, unknown>>}
 */
export function listDimensionOptionGroups(industryId, industryTagId) {
  const iid = encodeURIComponent(String(industryId ?? '').trim())
  const tid = String(industryTagId ?? '').trim()
  return get(`/api/industries/${iid}/dimension-option-groups`, {
    industryTagId: tid
  })
}
