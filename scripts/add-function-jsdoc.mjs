// 为 src 内 function 声明批量追加简短 JSDoc（跳过已有块注释的声明）。
// 运行：node scripts/add-function-jsdoc.mjs
import fs from 'node:fs'
import path from 'node:path'

const ROOT = path.join(process.cwd(), 'src')

const FUNC_RE =
  /^(\s*)(export\s+)?(async\s+)?function\s+([a-zA-Z_$][\w$]*)\s*\(/

function walk(dir, out = []) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name)
    if (e.isDirectory()) walk(p, out)
    else if (/\.(js|vue|ts)$/.test(e.name)) out.push(p)
  }
  return out
}

/** 从下一行起向前跳过空白，判断紧邻上方是否已有 JSDoc 或 // 注释 */
function hasDocCommentAbove(lines, lineIndex) {
  let j = lineIndex - 1
  while (j >= 0 && !lines[j].trim()) j--
  if (j < 0) return false
  const t = lines[j].trim()
  if (t.startsWith('/**') && t.includes('*/')) return true
  if (t.startsWith('//')) return true
  if (t === '*/') {
    let k = j
    while (k >= 0) {
      const s = lines[k].trim()
      if (s.startsWith('/**') || s === '/*') return true
      k--
    }
    return false
  }
  if (t.startsWith('*') || t === '*/') {
    let k = j
    while (k >= 0) {
      const s = lines[k].trim()
      if (s.startsWith('/**')) return true
      if (s && !s.startsWith('*') && !s.startsWith('/*') && !s.endsWith('*/'))
        break
      k--
    }
  }
  return false
}

function describeFunction(name) {
  if (name === 'goBack') return '返回上一页'
  if (name.startsWith('goTo')) return `页面跳转：${name}`
  if (name.startsWith('on') && name.length > 2) return `事件处理：${name}`
  if (name.startsWith('load') || name.startsWith('fetch')) return `加载数据：${name}`
  if (name.startsWith('open')) return `打开界面/弹层：${name}`
  if (name.startsWith('close')) return `关闭界面/弹层：${name}`
  if (name.startsWith('is') || name.startsWith('has')) return `布尔判断：${name}`
  if (name.startsWith('get') || name.startsWith('read')) return `读取：${name}`
  if (name.startsWith('set') || name.startsWith('write')) return `写入：${name}`
  if (name.startsWith('apply')) return `应用数据：${name}`
  if (name.startsWith('toggle')) return `切换状态：${name}`
  if (name.startsWith('confirm')) return `确认操作：${name}`
  if (name.startsWith('select')) return `选择项：${name}`
  if (name.startsWith('build')) return `构建数据：${name}`
  if (name.startsWith('merge')) return `合并：${name}`
  if (name.startsWith('pick')) return `选取：${name}`
  if (name.startsWith('clear')) return `清空状态：${name}`
  if (name.startsWith('init')) return `初始化：${name}`
  if (name.startsWith('ensure')) return `确保前置条件：${name}`
  if (name.startsWith('sync')) return `同步：${name}`
  if (name.startsWith('handle')) return `处理：${name}`
  if (name.startsWith('show') || name.startsWith('hide')) return `显隐：${name}`
  if (name.startsWith('schedule')) return `调度/延后执行：${name}`
  if (name.startsWith('try')) return `尝试流程：${name}`
  if (name.startsWith('assert')) return `校验：${name}`
  if (name.startsWith('normalize')) return `规范化：${name}`
  if (name.startsWith('delay')) return '延时'
  if (name.startsWith('request') || name.endsWith('Request'))
    return `HTTP 请求封装：${name}`
  if (name.includes('Mock')) return `Mock：${name}`
  return `函数：${name}`
}

function processLineArray(lines) {
  const out = []
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]
    const m = line.match(FUNC_RE)
    if (m && !hasDocCommentAbove(lines, i)) {
      const indent = m[1]
      const name = m[4]
      const desc = describeFunction(name)
      out.push(`${indent}/**`)
      out.push(`${indent} * ${desc}`)
      out.push(`${indent} */`)
    }
    out.push(line)
  }
  return out
}

function processJsContent(text) {
  return processLineArray(text.split(/\r?\n/)).join('\n')
}

function processVueFile(fullText) {
  return fullText.replace(
    /<script\b([^>]*)>([\s\S]*?)<\/script>/gi,
    (match, attrs, inner) => {
      const processed = processJsContent(inner)
      return `<script${attrs}>${processed}</script>`
    }
  )
}

function main() {
  const files = walk(ROOT)
  let changed = 0
  for (const file of files) {
    const raw = fs.readFileSync(file, 'utf8')
    let next
    if (file.endsWith('.vue')) next = processVueFile(raw)
    else next = processJsContent(raw)
    if (next !== raw) {
      fs.writeFileSync(file, next, 'utf8')
      changed++
    }
  }
  console.log(`add-function-jsdoc: updated ${changed} file(s) under src/`)
}

main()
