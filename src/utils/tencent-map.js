import md5 from 'blueimp-md5'

const TENCENT_GEOCODER_PATH = '/ws/geocoder/v1'

function getTencentMapKey() {
  return String(import.meta.env?.VITE_TENCENT_MAP_KEY || '').trim()
}

function getTencentMapSecretKey() {
  return String(import.meta.env?.VITE_TENCENT_MAP_SK || '').trim()
}

function buildSortedQuery(params) {
  return Object.keys(params)
    .sort()
    .map((key) => `${key}=${params[key]}`)
    .join('&')
}

/**
 * 使用腾讯位置服务 WebService API 逆地址解析经纬度。
 */
export function reverseGeocodeByTencent({ latitude, longitude }) {
  const key = getTencentMapKey()
  const secretKey = getTencentMapSecretKey()

  if (!key) {
    return Promise.reject(new Error('未配置腾讯地图 Key'))
  }
  if (!secretKey) {
    return Promise.reject(new Error('未配置腾讯地图 SK'))
  }

  const query = buildSortedQuery({
    get_poi: '0',
    key,
    location: `${latitude},${longitude}`
  })
  const sig = md5(`${TENCENT_GEOCODER_PATH}?${query}${secretKey}`)

  return new Promise((resolve, reject) => {
    uni.request({
      url: `https://apis.map.qq.com${TENCENT_GEOCODER_PATH}?${query}&sig=${sig}`,
      method: 'GET',
      success(res) {
        const body = res.data || {}
        if (body.status !== 0) {
          reject(new Error(body.message || '腾讯逆地理解析失败'))
          return
        }

        resolve(body.result || {})
      },
      fail(err) {
        reject(err)
      }
    })
  })
}

export function pickTencentLocationLabel(adInfo = {}) {
  return adInfo.district || adInfo.city || adInfo.province || ''
}
