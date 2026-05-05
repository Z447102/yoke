/** 隐私与用户协议授权（静默登录前置条件） */
export const PRIVACY_AGREED_KEY = 'yoke_privacy_agreed_v1'

/**
 * 判断用户是否已在本地标记同意隐私/用户协议。
 * @returns {boolean}
 */
export function hasPrivacyAgreed() {
  try {
    return uni.getStorageSync(PRIVACY_AGREED_KEY) === '1'
  } catch (_) {
    return false
  }
}

/** 将隐私与用户协议同意状态写入本地（值为 `1`）。 */
export function setPrivacyAgreed() {
  try {
    uni.setStorageSync(PRIVACY_AGREED_KEY, '1')
  } catch (_) {
    /* ignore */
  }
}
