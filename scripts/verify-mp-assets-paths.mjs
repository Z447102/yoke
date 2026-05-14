/**
 * 校验 dist/build/mp-weixin/common/assets.js 里导出的静态路径是否都存在。
 */
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const root = path.resolve(__dirname, '..', 'dist', 'build', 'mp-weixin')
const assetsJs = path.join(root, 'common', 'assets.js')

if (!fs.existsSync(assetsJs)) {
  console.error('missing', assetsJs)
  process.exit(1)
}

const text = fs.readFileSync(assetsJs, 'utf8')
const re = /exports\.\w+="([^"]+)"/g
const paths = []
let m
while ((m = re.exec(text))) paths.push(m[1])

const miss = []
for (const p of paths) {
  if (p.startsWith('http')) continue
  const rel = p.startsWith('/') ? p.slice(1) : p
  const full = path.join(root, rel)
  if (!fs.existsSync(full)) miss.push(p)
}

console.log('asset paths', paths.length, 'missing', miss.length)
if (miss.length) console.log(miss.join('\n'))
process.exit(miss.length ? 1 : 0)
