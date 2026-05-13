/**
 * 登录相关接口
 * - 未配置 `VITE_API_BASE_URL` 时走 Mock
 *
 * 【产品约定】
 * 1. 预登录会话标识：与后端对齐，字段名为 **uuid**；前端持久化在 `wxSessionUuid`（见 session 归一化）。
 * 2. 登录落地页（`pages/login`）两条路：
 *    - **未**走微信「授权手机号」：用户输入手机号 + 短信验证码，请求 `POST /api/auth/login`
 *     （`send-code` → `login`）；成功后写入 **token**（及可选 profile，见 `normalizeSmsLoginPayload`）。
 *    - **已**拿到微信 `getPhoneNumber` 的 **phoneCode**：请求 `POST /api/auth/wechat/mobile-login`，
 *      请求体 **仅** `{ uuid, phoneCode }`；成功后写入 **token**（`hooks/use-login.js` → `setLoginState`）。
 * 3. 登录成功后的「下一步跳转 / 资料完善」等编排 **暂不实现**，由后续需求再接。
 * 4. 开屏 `pages/splash`：隐私同意后 `silentLoginOnce`（`uni.login` → `session`）；已下发正式 token 且无需绑手机则 **进首页**；微信小程序侧仅 uuid 预登录时门闸内 **`getPhoneNumber`**（点击后由 **微信原生** 绘制授权弹窗）→ `mobile-login` 成功后进首页；未拿到手机号或非微信端需绑手机则 **跳转 `pages/login`**（`redirect=/pages/home/index`）走验证码登录。
 *
 * ---
 * - 静默登录：`POST /api/auth/wechat/session`（可用 `VITE_AUTH_WECHAT_SILENT_PATH` 覆盖）
 * - 请求体：`{ loginCode }`（值为 `uni.login` 返回的微信 code）
 * - 成功外壳：`{ code: 200, msg, data }`（成功码见 `VITE_API_BIZ_CODE_SUCCESS`，默认 200）
 *
 * data 约定（微信 session）：
 * - needPhoneAuthorization → needBindPhone
 * - uuid → wxSessionUuid（后续 mobile-login 必带同一 uuid）
 * - loginResult.token → token；loginResult 内可含 user 等扩展字段
 *
 * 【与 mobile-login 的关系】静默登录 **只** 调 session，**不会**自动请求 mobile-login。
 * mobile-login 由用户在 `pages/login` 授权手机号后，经 `loginWithPhoneCode` → `bindPhoneByCode` 发起。
 *
 * 手机号授权登录：`POST /api/auth/wechat/mobile-login`
 * - 请求体：`{ uuid, phoneCode }`；**不附带 Authorization**
 * - 响应 data：至少含 `token`；可含 `user`/`profile`、`points`（见 `normalizeMobileLoginPayload`）
 *
 * 其它认证：`POST /api/auth/send-code`、`POST /api/auth/login`；登出 `POST /api/auth/logout`。
 */
import { isApiEnabled, post } from '@/utils/request'
import {
  getAuthWechatSilentPath,
  getAuthWechatMobileLoginPath
} from '@/config/env'

/**
 * 异步延迟，用于 Mock 模拟网络耗时。
 * @param {number} ms 毫秒
 * @returns {Promise<void>}
 */
function delay(ms) {
  return new Promise((r) => setTimeout(r, ms))
}

/** 将 uuid 等字段规范为 trim 后的字符串（兼容 number） */
function asSessionId(v) {
  if (v == null) return ''
  if (typeof v === 'number' && Number.isFinite(v)) return String(Math.trunc(v))
  if (typeof v === 'string') return v.trim()
  return ''
}

/**
 * 静默登录本地 Mock：不请求后端。
 * @param {{ code: string }} param0
 * @returns {Promise<object>} 归一化后的会话对象
 */
async function silentLoginMock({ code }) {
  await delay(280)
  if (!code) {
    const err = new Error('登录 code 为空')
    err.code = 'EMPTY_CODE'
    throw err
  }
  return {
    token: `silent_${code.slice(0, 8)}_${Date.now()}`,
    profile: {
      id: 'wx_mock_1',
      nickname: '微信用户',
      phone: '',
      avatarUrl: '',
      /** Mock：默认非 VIP，便于一键成片走 VIP 开通链路 */
      isVip: false,
      /** 本地模拟：首充点数享优惠活动，展示充值弹窗活动样式 */
      pointsTopUpPromo: true,
      /** 本地模拟：默认视为可享「首次开通 VIP」优惠，用于 VIP 弹窗设计二 */
      firstVipSubscribe: true
    },
    needBindPhone: true,
    points: 50,
    /** 与真实 session 对齐：后续 mobile-login 需携带 uuid */
    wxSessionUuid: `mock_wx_session_${Date.now()}`
  }
}

/**
 * 手机号登录本地 Mock：不请求后端。
 * @param {{ phoneCode: string }} param0
 * @returns {Promise<object>}
 */
async function bindPhoneByCodeMock({ phoneCode }) {
  await delay(320)
  if (!phoneCode) {
    const err = new Error('手机号授权失败')
    err.code = 'EMPTY_PHONE_CODE'
    throw err
  }
  return {
    token: `phone_${phoneCode.slice(0, 6)}_${Date.now()}`,
    profile: {
      id: 'wx_mock_1',
      nickname: '微信用户',
      phone: '138****0000',
      avatarUrl: '',
      isVip: false,
      pointsTopUpPromo: true,
      firstVipSubscribe: true
    },
    needBindPhone: false,
    points: 50,
    wxSessionUuid: ''
  }
}

/** 退出登录 Mock。 */
async function logoutMock() {
  await delay(100)
  return { ok: true }
}

/**
 * 将「微信 session」接口返回的 `data` 转为 Pinia 使用的会话结构。
 * @param {Record<string, unknown>} raw 后端 data 对象
 * @returns {{ token: string, profile: object, needBindPhone: boolean, points: number, wxSessionUuid: string }}
 */
function normalizeSessionPayload(raw) {
  if (!raw || typeof raw !== 'object') {
    const err = new Error('登录响应异常')
    err.code = 'BAD_RESPONSE'
    throw err
  }

  const loginResult =
    raw.loginResult && typeof raw.loginResult === 'object'
      ? raw.loginResult
      : null

  const token = String(
    (loginResult && loginResult.token) ??
      raw.token ??
      raw.accessToken ??
      raw.access_token ??
      raw.sessionToken ??
      raw.tempToken ??
      raw.temporaryToken ??
      raw.preLoginToken ??
      ''
  ).trim()

  const wxSessionUuid =
    asSessionId(raw.uuid) ||
    asSessionId(raw.sessionUuid) ||
    asSessionId(raw.wxSessionUuid) ||
    asSessionId(loginResult && loginResult.uuid)

  /**
   * 预登录：部分后端在需绑定手机号阶段只下发 uuid、暂不下发 JWT。
   * 此时不再抛错，返回空 token + uuid，由前端 isLogin（含预登录）与后续 mobile-login 衔接。
   */
  if (!token) {
    if (wxSessionUuid) {
      const preNeed =
        typeof raw.needPhoneAuthorization === 'boolean'
          ? raw.needPhoneAuthorization
          : typeof raw.needBindPhone === 'boolean'
            ? raw.needBindPhone
            : typeof raw.needBindMobile === 'boolean'
              ? raw.needBindMobile
              : typeof raw.phoneRequired === 'boolean'
                ? raw.phoneRequired
                : true
      const srcRawPre =
        raw.profile ??
        raw.user ??
        raw.userInfo ??
        (loginResult && typeof loginResult === 'object'
          ? loginResult.user ?? loginResult.profile
          : null)
      const srcPre = srcRawPre && typeof srcRawPre === 'object' ? srcRawPre : {}
      const profilePre = {
        id: String(srcPre.userId ?? srcPre.id ?? srcPre.userName ?? ''),
        nickname: String(srcPre.nickName ?? srcPre.nickname ?? srcPre.name ?? ''),
        phone: String(srcPre.phonenumber ?? srcPre.phone ?? srcPre.mobile ?? ''),
        avatarUrl: String(srcPre.avatar ?? srcPre.avatarUrl ?? srcPre.headImgUrl ?? '')
      }
      const pointsRawPre = raw.points ?? raw.score ?? raw.integral ?? raw.coin ?? 0
      const pnPre = Number(pointsRawPre)
      const pointsPre = Number.isFinite(pnPre) ? Math.max(0, Math.floor(pnPre)) : 0
      return {
        token: '',
        profile: profilePre,
        needBindPhone: Boolean(preNeed),
        points: pointsPre,
        wxSessionUuid
      }
    }
    const err = new Error('登录成功但未返回 token 或 uuid')
    err.code = 'NO_TOKEN'
    throw err
  }

  const srcRaw =
    raw.profile ??
    raw.user ??
    raw.userInfo ??
    (loginResult && typeof loginResult === 'object'
      ? loginResult.user ?? loginResult.profile
      : null)
  const src =
    srcRaw && typeof srcRaw === 'object' ? srcRaw : {}

  const profile = {
    id: String(src.userId ?? src.id ?? src.userName ?? ''),
    nickname: String(src.nickName ?? src.nickname ?? src.name ?? ''),
    phone: String(src.phonenumber ?? src.phone ?? src.mobile ?? ''),
    avatarUrl: String(src.avatar ?? src.avatarUrl ?? src.headImgUrl ?? '')
  }

  let needBindPhone
  if (typeof raw.needPhoneAuthorization === 'boolean') {
    needBindPhone = raw.needPhoneAuthorization
  } else if (typeof raw.needBindPhone === 'boolean') {
    needBindPhone = raw.needBindPhone
  } else if (typeof raw.needBindMobile === 'boolean') {
    needBindPhone = raw.needBindMobile
  } else if (typeof raw.phoneRequired === 'boolean') {
    needBindPhone = raw.phoneRequired
  } else if (typeof raw.isBindPhone === 'boolean') {
    needBindPhone = !raw.isBindPhone
  } else {
    needBindPhone = !profile.phone.trim()
  }

  const pointsRaw = raw.points ?? raw.score ?? raw.integral ?? raw.coin ?? 0
  const pn = Number(pointsRaw)
  const points = Number.isFinite(pn) ? Math.max(0, Math.floor(pn)) : 0

  return {
    token,
    profile,
    needBindPhone: Boolean(needBindPhone),
    points,
    wxSessionUuid
  }
}

/**
 * 将「手机号授权登录」接口返回的 `data` 转为最小会话结构（通常无 profile）。
 * @param {Record<string, unknown>} raw 后端 data
 * @returns {{ token: string, needBindPhone: boolean, wxSessionUuid: string }}
 */
function normalizeMobileLoginPayload(raw) {
  if (!raw || typeof raw !== 'object') {
    const err = new Error('手机号登录响应异常')
    err.code = 'BAD_RESPONSE'
    throw err
  }
  const token = String(
    raw.token ?? raw.accessToken ?? raw.access_token ?? ''
  ).trim()
  if (!token) {
    const err = new Error('手机号登录未返回 token')
    err.code = 'NO_TOKEN'
    throw err
  }
  const srcRaw =
    raw.profile ??
    raw.user ??
    raw.userInfo ??
    (raw.loginResult && typeof raw.loginResult === 'object'
      ? raw.loginResult.user ?? raw.loginResult.profile
      : null)
  let profile = null
  if (srcRaw && typeof srcRaw === 'object') {
    profile = {
      id: String(srcRaw.userId ?? srcRaw.id ?? srcRaw.userName ?? ''),
      nickname: String(
        srcRaw.nickName ?? srcRaw.nickname ?? srcRaw.name ?? ''
      ),
      phone: String(
        srcRaw.phonenumber ?? srcRaw.phone ?? srcRaw.mobile ?? ''
      ),
      avatarUrl: String(
        srcRaw.avatar ?? srcRaw.avatarUrl ?? srcRaw.headImgUrl ?? ''
      )
    }
  }
  const pointsRaw = raw.points ?? raw.score ?? raw.integral ?? raw.coin
  let points
  if (pointsRaw != null) {
    const pn = Number(pointsRaw)
    points = Number.isFinite(pn) ? Math.max(0, Math.floor(pn)) : undefined
  }
  return {
    token,
    profile,
    needBindPhone: false,
    wxSessionUuid: '',
    ...(points !== undefined ? { points } : {})
  }
}

/**
 * 真实网络：微信 code → session（请求体字段名为 `loginCode`）。
 * @param {{ code: string }} param0 `uni.login` 得到的 code
 * @returns {Promise<object>}
 */
async function silentLoginRequest({ code }) {
  const path = getAuthWechatSilentPath()
  const raw = await post(path, { loginCode: code }, { auth: false })
  return normalizeSessionPayload(raw)
}

/**
 * 微信静默会话：使用 `wx.login` 得到的 code 调后端换 token / uuid 等。
 * @param {{ code: string }} param0
 * @returns {Promise<object>} 归一化会话，供 `setLoginState` 使用
 */
export async function silentLogin({ code }) {
  if (!isApiEnabled()) {
    return silentLoginMock({ code })
  }
  return silentLoginRequest({ code })
}

/**
 * 真实网络：预登录 uuid + 手机号动态令牌 → 正式 token。
 * @param {{ phoneCode: string, wxSessionUuid?: string }} param0
 * @returns {Promise<object>}
 */
async function mobileLoginRequest({ phoneCode, wxSessionUuid }) {
  const path = getAuthWechatMobileLoginPath()
  const uuid = wxSessionUuid && String(wxSessionUuid).trim()
  if (!uuid) {
    const err = new Error('缺少预登录会话，请重新进入后再授权手机号')
    err.code = 'NO_WX_SESSION'
    throw err
  }
  const raw = await post(path, { uuid, phoneCode }, { auth: false })
  return normalizeMobileLoginPayload(raw)
}

/**
 * 微信手机号授权登录（对外仍用函数名 `bindPhoneByCode` 以少改页面引用）。
 * @param {{ phoneCode: string, wxSessionUuid?: string }} param0 phoneCode 为 getPhoneNumber 返回；wxSessionUuid 为 session 返回的 uuid
 * @returns {Promise<object>}
 */
export async function bindPhoneByCode({ phoneCode, wxSessionUuid }) {
  if (!isApiEnabled()) {
    return bindPhoneByCodeMock({ phoneCode })
  }
  return mobileLoginRequest({ phoneCode, wxSessionUuid })
}

/**
 * 将「短信验证码登录」接口返回的 `data` 转为与 session 类似的会话切片，供 Pinia 写入。
 * @param {Record<string, unknown>} raw 后端 data
 * @returns {{ token: string, profile: object | null, needBindPhone: false, points: number, wxSessionUuid: '' }}
 */
function normalizeSmsLoginPayload(raw) {
  if (!raw || typeof raw !== 'object') {
    const err = new Error('登录响应异常')
    err.code = 'BAD_RESPONSE'
    throw err
  }
  const token = String(
    raw.token ?? raw.accessToken ?? raw.access_token ?? ''
  ).trim()
  if (!token) {
    const err = new Error('登录未返回 token')
    err.code = 'NO_TOKEN'
    throw err
  }
  const srcRaw =
    raw.profile ??
    raw.user ??
    raw.userInfo ??
    (raw.loginResult && typeof raw.loginResult === 'object'
      ? raw.loginResult.user ?? raw.loginResult.profile
      : null)
  let profile = null
  if (srcRaw && typeof srcRaw === 'object') {
    profile = {
      id: String(srcRaw.userId ?? srcRaw.id ?? srcRaw.userName ?? ''),
      nickname: String(
        srcRaw.nickName ?? srcRaw.nickname ?? srcRaw.name ?? ''
      ),
      phone: String(
        srcRaw.phonenumber ?? srcRaw.phone ?? srcRaw.mobile ?? ''
      ),
      avatarUrl: String(
        srcRaw.avatar ?? srcRaw.avatarUrl ?? srcRaw.headImgUrl ?? ''
      )
    }
  }
  const pointsRaw = raw.points ?? raw.score ?? raw.integral ?? raw.coin ?? 0
  const pn = Number(pointsRaw)
  const points = Number.isFinite(pn) ? Math.max(0, Math.floor(pn)) : 0
  return {
    token,
    profile,
    needBindPhone: false,
    points,
    wxSessionUuid: ''
  }
}

/**
 * 发送短信验证码（登录用）
 * POST /api/auth/send-code
 * @param {{ mobile: string }} param0 11 位手机号
 * @returns {Promise<void>}
 */
export async function sendSmsCode({ mobile }) {
  if (!isApiEnabled()) {
    await delay(200)
    return
  }
  await post('/api/auth/send-code', { mobile }, { auth: false })
}

/**
 * 短信验证码登录
 * POST /api/auth/login
 * @param {{ mobile: string, code: string }} param0
 * @returns {Promise<{ token: string, profile: object | null, needBindPhone: false, points: number, wxSessionUuid: string }>}
 */
export async function loginWithSms({ mobile, code }) {
  const m = String(mobile || '').trim()
  const c = String(code || '').trim()
  if (!/^1\d{10}$/.test(m)) {
    const err = new Error('请输入正确手机号')
    err.code = 'INVALID_INPUT'
    throw err
  }
  if (!c || c.length < 4) {
    const err = new Error('请输入验证码')
    err.code = 'INVALID_INPUT'
    throw err
  }
  if (!isApiEnabled()) {
    await delay(280)
    return normalizeSmsLoginPayload({
      token: `sms_${m.slice(-4)}_${Date.now()}`,
      user: {
        id: `mock_sms_${m}`,
        nickname: '手机用户',
        phonenumber: m,
        phone: m,
        avatarUrl: ''
      },
      points: 50
    })
  }
  const raw = await post('/api/auth/login', { mobile: m, code: c }, {
    auth: false
  })
  return normalizeSmsLoginPayload(raw)
}

export async function logout() {
  if (!isApiEnabled()) {
    return logoutMock()
  }
  return post('/api/auth/logout', {}, { auth: true })
}
