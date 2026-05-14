// 移除「单行 /** … */」紧后面误插入的三行 JSDoc（由 add-function-jsdoc 造成）。
import fs from 'node:fs'
import path from 'node:path'

const ROOT = path.join(process.cwd(), 'src')

function walk(dir, out = []) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name)
    if (e.isDirectory()) walk(p, out)
    else if (/\.(js|vue|ts)$/.test(e.name)) out.push(p)
  }
  return out
}

// 上一非空行是否为单行块注释 /** ... */
function prevIsSingleLineBlockComment(lines, idx) {
  let j = idx - 1
  while (j >= 0 && !lines[j].trim()) j--
  if (j < 0) return false
  const t = lines[j].trim()
  return t.startsWith('/**') && t.includes('*/')
}

function stripTripletAfterSingleLineDoc(text) {
  const lines = text.split(/\r?\n/)
  const out = []
  let i = 0
  while (i < lines.length) {
    if (
      i + 2 < lines.length &&
      lines[i].trim() === '/**' &&
      lines[i + 1].trim().startsWith('* ') &&
      lines[i + 2].trim() === '*/' &&
      prevIsSingleLineBlockComment(lines, i)
    ) {
      i += 3
      continue
    }
    out.push(lines[i])
    i++
  }
  return out.join('\n')
}

function processVue(fullText) {
  return fullText.replace(
    /<script\b([^>]*)>([\s\S]*?)<\/script>/gi,
    (match, attrs, inner) => {
      const next = stripTripletAfterSingleLineDoc(inner)
      return `<script${attrs}>${next}</script>`
    }
  )
}

function main() {
  const files = walk(ROOT)
  let n = 0
  for (const file of files) {
    const raw = fs.readFileSync(file, 'utf8')
    const next = file.endsWith('.vue')
      ? processVue(raw)
      : stripTripletAfterSingleLineDoc(raw)
    if (next !== raw) {
      fs.writeFileSync(file, next, 'utf8')
      n++
    }
  }
  console.log(`strip-duplicate-auto-jsdoc: cleaned ${n} file(s)`)
}

main()
