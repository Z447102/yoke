/**
 * C 端「当前用户」（与 OpenAPI「API 用户」一致）
 * 文档：项目接口基址 + `/v3/api-docs`
 * 鉴权：Authorization: Bearer &lt;token&gt;
 */
import { get, put } from '@/utils/request'
export { mapUserMeToProfile, nicknameAvatarLetter } from '@/utils/user-profile'

/**
 * 获取当前登录会员资料（用于恢复登录态与个人中心展示）
 * GET /api/user/me
 * @returns {Promise<{ memberId?: string, mobile?: string, nickname?: string, avatar?: string }>}
 */
export function getCurrentUserInfo() {
  return get('/api/user/me')
}

/**
 * 修改当前用户资料（昵称、头像）
 * PUT /api/user/profile
 * @param {{ nickname?: string, avatar?: string }} body 均可选；未修改的字段可不传
 * @returns {Promise<unknown>} 成功时为 ApiUserInfoVO 结构的 data
 */
export function updateUserProfile(body) {
  return put('/api/user/profile', body ?? {})
}
