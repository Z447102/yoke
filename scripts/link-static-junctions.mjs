/**
 * 将 `src/pages/<segment>/static` 链到 `src/static/<segment>`，
 * 以便 `@/static/<segment>/...` 在 uni 的 mp 解析链中仍能解析到真实文件。
 * Windows 使用 junction；macOS/Linux 使用相对目录 symlink。
 */
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const root = path.resolve(__dirname, '..')
const srcStatic = path.join(root, 'src', 'static')
const segments = ['home', 'mine', 'create', 'login', 'splash']

function removeLink(p) {
  try {
    fs.unlinkSync(p)
  } catch {
    /* 不存在或非链接 */
  }
}

for (const name of segments) {
  const linkPath = path.join(srcStatic, name)
  const targetAbs = path.join(root, 'src', 'pages', name, 'static')
  if (!fs.existsSync(targetAbs)) {
    console.warn(`[link-static] skip ${name}: missing ${targetAbs}`)
    continue
  }
  removeLink(linkPath)
  fs.mkdirSync(srcStatic, { recursive: true })
  if (process.platform === 'win32') {
    fs.symlinkSync(targetAbs, linkPath, 'junction')
  } else {
    const rel = path.relative(path.dirname(linkPath), targetAbs)
    fs.symlinkSync(rel, linkPath, 'dir')
  }
  console.log(`[link-static] ${name} -> ${targetAbs}`)
}

/** 小程序构建不会带上 `src/assets/fonts`，@font-face 需走 `static/fonts` 才能进 dist */
const fontSrc = path.join(root, 'src', 'assets', 'fonts', 'OPPOSans-4.0.ttf')
const fontDestDir = path.join(srcStatic, 'fonts')
const fontDest = path.join(fontDestDir, 'OPPOSans-4.0.ttf')
if (fs.existsSync(fontSrc)) {
  fs.mkdirSync(fontDestDir, { recursive: true })
  fs.copyFileSync(fontSrc, fontDest)
  console.log(`[link-static] font -> ${fontDest}`)
} else {
  console.warn(`[link-static] skip font: missing ${fontSrc}`)
}
