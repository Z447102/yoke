/** 隐私与用户协议授权（静默登录前置条件） */
export const PRIVACY_AGREED_KEY = 'yoke_privacy_agreed_v1'

export function hasPrivacyAgreed() {
  try {
    return uni.getStorageSync(PRIVACY_AGREED_KEY) === '1'
  } catch (_) {
    return false
  }
}

export function setPrivacyAgreed() {
  try {
    uni.setStorageSync(PRIVACY_AGREED_KEY, '1')
  } catch (_) {
    /* ignore */
  }
}
