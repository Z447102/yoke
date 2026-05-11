/**
 * 口播文案敏感词：拆分高亮、命中检测。
 * 词表由页面 `sensitiveWordList` 维护；联调后由接口下发并写入该 ref 即可。
 */

/**
 * @param {string[]} words
 * @returns {string[]}
 */
function normalizeWordList(words) {
  return [...new Set((words || []).filter((w) => typeof w === 'string' && w.trim()))].sort(
    (a, b) => b.length - a.length
  )
}

/**
 * @param {string} text
 * @param {string[]} words
 * @returns {{ text: string, sensitive: boolean }[]}
 */
export function splitTextBySensitiveWords(text, words) {
  const sorted = normalizeWordList(words)
  if (text == null || text === '') return [{ text: '', sensitive: false }]
  if (!sorted.length) return [{ text, sensitive: false }]

  const parts = []
  let i = 0
  while (i < text.length) {
    let hit = ''
    for (const w of sorted) {
      if (text.startsWith(w, i)) {
        hit = w
        break
      }
    }
    if (hit) {
      parts.push({ text: hit, sensitive: true })
      i += hit.length
      continue
    }
    let end = i + 1
    while (end < text.length) {
      let next = false
      for (const w of sorted) {
        if (text.startsWith(w, end)) {
          next = true
          break
        }
      }
      if (next) break
      end++
    }
    parts.push({ text: text.slice(i, end), sensitive: false })
    i = end
  }
  return mergeAdjacentParts(parts)
}

/**
 * @param {{ text: string, sensitive: boolean }[]} parts
 */
function mergeAdjacentParts(parts) {
  const out = []
  for (const p of parts) {
    if (!p.text) continue
    const last = out[out.length - 1]
    if (last && last.sensitive === p.sensitive) {
      last.text += p.text
    } else {
      out.push({ text: p.text, sensitive: p.sensitive })
    }
  }
  return out.length ? out : [{ text: '', sensitive: false }]
}

/**
 * @param {string} text
 * @param {string[]} words
 */
export function textContainsSensitive(text, words) {
  const sorted = normalizeWordList(words)
  if (!text || !sorted.length) return false
  for (let i = 0; i < text.length; i++) {
    for (const w of sorted) {
      if (text.startsWith(w, i)) return true
    }
  }
  return false
}
