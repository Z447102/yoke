/**
 * 扫描 dist/build/mp-weixin 下 wxss 的 url() 是否指向存在的本地文件（粗检）。
 */
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const root = path.resolve(__dirname, '..', 'dist', 'build', 'mp-weixin')

function walk(d, acc = []) {
  for (const n of fs.readdirSync(d, { withFileTypes: true })) {
    const p = path.join(d, n.name)
    if (n.isDirectory()) walk(p, acc)
    else acc.push(p)
  }
  return acc
}

if (!fs.existsSync(root)) {
  console.error('missing', root)
  process.exit(1)
}

const files = walk(root)
const wxss = files.filter((f) => f.endsWith('.wxss'))
const bad = []
for (const f of wxss) {
  const t = fs.readFileSync(f, 'utf8')
  const re = /url\(([^)]+)\)/g
  let m
  while ((m = re.exec(t))) {
    let u = m[1].replace(/["']/g, '').trim()
    if (u.startsWith('data:') || u.startsWith('http://') || u.startsWith('https://')) continue
    const base = path.dirname(f)
    let rel = u.split('?')[0].split('#')[0]
    if (rel.startsWith('/')) rel = '.' + rel
    const target = path.resolve(base, rel)
    if (!fs.existsSync(target)) bad.push({ file: path.relative(root, f), url: u, resolved: target })
  }
}

console.log('wxss', wxss.length, 'bad', bad.length)
if (bad.length) console.log(JSON.stringify(bad.slice(0, 50), null, 2))
process.exit(bad.length ? 1 : 0)
