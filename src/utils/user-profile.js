/**
 * /api/user/me 与客户端 profile 字段映射、无头像时的首字展示。
 */

/**
 * 取昵称首字（支持中文等多字节字符；英文字母转大写）。
 * @param {string} [nickname]
 * @returns {string}
 */
export function nicknameAvatarLetter(nickname) {
  const s = String(nickname ?? '').trim()
  if (!s) return '用'
  const first = Array.from(s)[0] || '用'
  if (/^[a-zA-Z]$/.test(first)) return first.toUpperCase()
  return first
}

/**
 * 将 GET /api/user/me 的 data 转为 store.profile 结构。
 * @param {Record<string, unknown> | null | undefined} raw
 * @returns {{ id: string, memberId: string, nickname: string, phone: string, mobile: string, avatarUrl: string, avatar: string }}
 */
export function mapUserMeToProfile(raw) {
  const src = raw && typeof raw === 'object' ? raw : {}
  const memberId = String(src.memberId ?? src.id ?? '').trim()
  const mobile = String(src.mobile ?? src.phone ?? '').trim()
  const nickname = String(src.nickname ?? src.nickName ?? '').trim()
  const avatar = String(src.avatar ?? src.avatarUrl ?? '').trim()
  return {
    id: memberId,
    memberId,
    nickname: nickname || '用户',
    phone: mobile,
    mobile,
    avatarUrl: avatar,
    avatar
  }
}
