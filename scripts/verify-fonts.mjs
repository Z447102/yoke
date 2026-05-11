/**
 * 校验 OPPO Sans 是否已正确引入并可被小程序构建产物加载。
 * 用法：先 `npm run build:mp-weixin`，再 `npm run verify:fonts`
 */
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const root = path.resolve(__dirname, '..')

const SRC_FONT = path.join(root, 'src', 'static', 'fonts', 'OPPOSans-4.0.ttf')
const MP_ROOT = path.join(root, 'dist', 'build', 'mp-weixin')
const MP_FONT = path.join(MP_ROOT, 'static', 'fonts', 'OPPOSans-4.0.ttf')
const MP_APP_WXSS = path.join(MP_ROOT, 'app.wxss')

function isLikelyTtfOrOtf(buf) {
  if (!buf || buf.length < 12) return false
  const scal = buf.readUInt32BE(0)
  if (scal === 0x00010000) return true
  const tag = buf.subarray(0, 4).toString('ascii')
  return tag === 'true' || tag === 'typ1' || tag === 'OTTO'
}

let failed = false
function ok(msg) {
  console.log(`OK  ${msg}`)
}
function bad(msg) {
  console.error(`FAIL  ${msg}`)
  failed = true
}

console.log('[verify-fonts] 项目根:', root)

if (!fs.existsSync(SRC_FONT)) {
  bad(`源字体不存在: ${SRC_FONT}`)
} else {
  const st = fs.statSync(SRC_FONT)
  const head = Buffer.alloc(16)
  const fd = fs.openSync(SRC_FONT, 'r')
  fs.readSync(fd, head, 0, 16, 0)
  fs.closeSync(fd)
  if (!isLikelyTtfOrOtf(head)) {
    bad('源文件不是有效的 SFNT/OpenType(TrueType) 字体')
  } else {
    ok(
      `源字体格式合法 (${(st.size / 1024 / 1024).toFixed(1)} MB) — ${path.relative(root, SRC_FONT)}`
    )
  }
}

if (!fs.existsSync(MP_APP_WXSS)) {
  bad('未找到 dist/build/mp-weixin/app.wxss，请先执行: npm run build:mp-weixin')
} else {
  const wxss = fs.readFileSync(MP_APP_WXSS, 'utf8')
  const needles = [
    '@font-face',
    'OPPOSans-4.0.ttf',
    'OPPOSans-regular',
    'OPPOSans-medium',
    'OPPOSans-bold',
    'font-family:OPPOSans'
  ]
  for (const s of needles) {
    if (!wxss.includes(s)) bad(`app.wxss 缺少:「${s}」`)
  }
  if (!needles.some((s) => !wxss.includes(s))) {
    ok('app.wxss 中含 @font-face、字体文件名与四套 font-family')
  }
}

if (!fs.existsSync(MP_FONT)) {
  bad(`小程序目录下缺少字体拷贝: ${path.relative(root, MP_FONT)}`)
} else {
  const headMp = Buffer.alloc(16)
  const fdMp = fs.openSync(MP_FONT, 'r')
  fs.readSync(fdMp, headMp, 0, 16, 0)
  fs.closeSync(fdMp)
  if (!isLikelyTtfOrOtf(headMp)) {
    bad('小程序包内字体文件头校验失败')
  } else if (fs.existsSync(SRC_FONT)) {
    const a = fs.statSync(SRC_FONT).size
    const b = fs.statSync(MP_FONT).size
    if (a !== b) {
      bad(`源字体与小程序包内字体大小不一致 (${a} vs ${b})`)
    } else {
      ok('小程序包内字体与源文件大小一致，且格式合法')
    }
  }
}

if (!failed) {
  console.log('')
  ok('静态校验全部通过。（最终渲染请以微信开发者工具 / 真机为准。）')
  process.exit(0)
}

console.error('\n存在 FAIL 项，请修复后重试。\n')
process.exit(1)
