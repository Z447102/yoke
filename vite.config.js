import { defineConfig } from 'vite'
import { existsSync, mkdirSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
import uniPlugin from '@dcloudio/vite-plugin-uni'

const uni = uniPlugin.default || uniPlugin

/** 部分真机调试 / 旧缓存会探测 common/assets.js；当前 uni 链通常只产出 common/vendor.js */
function writeMpWeixinCommonAssetsShim(outDir) {
  if (!outDir || typeof outDir !== 'string') return
  const norm = outDir.replace(/\\/g, '/')
  if (!norm.includes('mp-weixin')) return
  const commonDir = join(outDir, 'common')
  const target = join(commonDir, 'assets.js')
  if (existsSync(target)) return
  try {
    mkdirSync(commonDir, { recursive: true })
  } catch {
    /* ignore */
  }
  writeFileSync(
    target,
    [
      '"use strict";',
      '/** Build shim: tooling may probe common/assets.js (vendor-only split). */',
      'Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });',
      ''
    ].join('\n'),
    'utf8'
  )
}

/**
 * 微信开发者工具 / 部分调试链路会把 `@/stores/home` 误解析为分包内路径
 * `pages/home/stores/home.js`，导致 ENOENT。写入转发模块指向真实的根目录 stores/home.js。
 */
function writeMpWeixinHomeStorePathShim(outDir) {
  if (!outDir || typeof outDir !== 'string') return
  const norm = outDir.replace(/\\/g, '/')
  if (!norm.includes('mp-weixin')) return
  if (!existsSync(join(outDir, 'app.json'))) return

  const shimDir = join(outDir, 'pages', 'home', 'stores')
  const shimFile = join(shimDir, 'home.js')
  try {
    mkdirSync(shimDir, { recursive: true })
  } catch {
    /* ignore */
  }
  writeFileSync(
    shimFile,
    [
      '"use strict";',
      '/** Debug shim: real store is ../../stores/home.js from package root */',
      'module.exports = require("../../../stores/home.js");',
      ''
    ].join('\n'),
    'utf8'
  )
}

function patchMpWeixinOutDirs(cwd = process.cwd()) {
  for (const rel of ['dist/dev/mp-weixin', 'dist/build/mp-weixin']) {
    const out = join(cwd, rel)
    writeMpWeixinCommonAssetsShim(out)
    writeMpWeixinHomeStorePathShim(out)
  }
}

export default defineConfig({
  plugins: [
    uni(),
    {
      name: 'mp-weixin-common-assets-shim',
      writeBundle(options) {
        writeMpWeixinCommonAssetsShim(options.dir)
        writeMpWeixinHomeStorePathShim(options.dir)
        patchMpWeixinOutDirs(process.cwd())
      },
      closeBundle() {
        patchMpWeixinOutDirs(process.cwd())
      }
    }
  ],
  /** 减轻 Sass legacy API 弃用警告刷屏（uni 编译链仍会走部分 legacy 调用时可保留） */
  css: {
    preprocessorOptions: {
      scss: {
        silenceDeprecations: ['legacy-js-api']
      }
    }
  }
})
