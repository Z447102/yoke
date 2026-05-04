/**
 * 【我的 · 接口模块】
 * Mock：各 Tab 作品数量与列表；联调后改为 request 请求真实接口。
 */

const MOCK_COVERS = [
  'https://images.unsplash.com/photo-1492691527719-9d1e07e534b4?w=400&h=300&fit=crop',
  'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=400&h=300&fit=crop',
  'https://images.unsplash.com/photo-1574717024653-61fd2cf4d44d?w=400&h=300&fit=crop',
  'https://images.unsplash.com/photo-1536240478700-b869070f9279?w=400&h=300&fit=crop',
  'https://images.unsplash.com/photo-1611162616475-46b635cb6868?w=400&h=300&fit=crop',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=300&fit=crop'
]

const MOCK_COUNTS = {
  video: 389,
  digital: 12,
  image: 56,
  copy: 128
}

function buildWorksList(tab, limit = 9) {
  const total = MOCK_COUNTS[tab] ?? 0
  const n = Math.min(limit, Math.max(0, total))
  return Array.from({ length: n }, (_, i) => ({
    id: `${tab}-${i}`,
    cover: MOCK_COVERS[i % MOCK_COVERS.length],
    duration: '时长: 30s',
    date: '26-4-20'
  }))
}

/** 首页「我的」聚合：各类型数量 + 当前 Tab 下列表 */
export function getMinePageData(tab = 'video') {
  const safeTab = MOCK_COUNTS[tab] != null ? tab : 'video'
  return Promise.resolve({
    counts: { ...MOCK_COUNTS },
    works: buildWorksList(safeTab, 9),
    activeTab: safeTab
  })
}
