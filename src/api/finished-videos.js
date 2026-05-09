/**
 * 【一键成片 · 成片列表】接口层
 * 与设计稿对齐：摘要条（生成中进度）、徽章、九宫格成片；联调后改为真实 GET。
 */

const MOCK_COVERS = [
  'https://images.unsplash.com/photo-1497366754035-f200968a6e72?w=400&h=300&fit=crop',
  'https://images.unsplash.com/photo-1544148103-0772bfafdadd?w=400&h=300&fit=crop',
  'https://images.unsplash.com/photo-1540189549336-e13e71387f61?w=400&h=300&fit=crop',
  'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=400&h=300&fit=crop',
  'https://images.unsplash.com/photo-1574894709920-11b28e7367e3?w=400&h=300&fit=crop'
]

/** 分页 Mock 总站数（仅 mock: true） */
const MOCK_TOTAL_ITEMS = 30

/** 前几项视为「生成中」（与图二一致） */
const MOCK_GENERATING_COUNT = 3

/**
 * @typedef {{ id: string, title?: string, cover: string, durationLabel: string, dateLabel: string, status: 'processing'|'completed'|'failed', progress?: number, videoUrl?: string }} FinishedVideoItem
 */

function buildSummary() {
  return {
    generatingCount: MOCK_GENERATING_COUNT,
    generatingPercent: 60,
    totalGeneratedBadge: 30
  }
}

function buildMockItem(globalIndex, status, progressOpt) {
  const i = globalIndex + 1
  const durations = ['30s', '15s', '30s']
  return {
    id: `fv-${i}`,
    title: `成片 ${i}`,
    cover: MOCK_COVERS[(globalIndex + 3) % MOCK_COVERS.length],
    durationLabel: durations[globalIndex % durations.length],
    dateLabel: '26-4-20 16:24',
    status,
    progress: status === 'processing' ? progressOpt ?? 45 : undefined,
    videoUrl: ''
  }
}

/**
 * 默认返回空列表（便于做空态页）；联调真实接口后由后端决定是否有数据。
 * 本地演示有数据列表：传 `mock: true` 或页面 `?mock=1`。
 *
 * @param {{ page?: number, pageSize?: number, mock?: boolean }} params
 */
export function getFinishedVideoList(params = {}) {
  const page = Math.max(1, Number(params.page) || 1)
  const pageSize = Math.min(50, Math.max(1, Number(params.pageSize) || 20))

  if (params.mock !== true) {
    return Promise.resolve({
      list: [],
      total: 0,
      page: 1,
      pageSize,
      summary: {
        generatingCount: 0,
        generatingPercent: 0,
        totalGeneratedBadge: 0
      }
    })
  }

  const progresses = [55, 38, 72]
  const list = []
  const start = (page - 1) * pageSize
  for (let i = 0; i < pageSize && start + i < MOCK_TOTAL_ITEMS; i++) {
    const idx = start + i
    const status = idx < MOCK_GENERATING_COUNT ? 'processing' : 'completed'
    const progress =
      status === 'processing' ? progresses[idx % MOCK_GENERATING_COUNT] : undefined
    list.push(buildMockItem(idx, status, progress))
  }

  return Promise.resolve({
    list,
    total: MOCK_TOTAL_ITEMS,
    page,
    pageSize,
    summary: buildSummary()
  })
}

/**
 * @param {string[]} ids
 * @returns {Promise<{ ok: boolean }>}
 */
export function deleteFinishedVideos(ids) {
  const n = Array.isArray(ids) ? ids.length : 0
  if (!n) return Promise.resolve({ ok: true })
  return Promise.resolve({ ok: true })
}

export function getFinishedVideoDetail(id) {
  const sid = String(id || '').trim()
  if (!sid) return Promise.resolve(null)
  return getFinishedVideoList({ page: 1, pageSize: 100 }).then(({ list }) => {
    const hit = list.find((x) => x.id === sid)
    if (hit) return hit
    return {
      id: sid,
      title: '成片',
      cover: MOCK_COVERS[0],
      durationSec: 30,
      durationLabel: '30s',
      dateLabel: '—',
      status: 'completed',
      videoUrl: ''
    }
  })
}
