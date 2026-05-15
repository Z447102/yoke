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

export default defineConfig({
  plugins: [
    uni(),
    {
      name: 'mp-weixin-common-assets-shim',
      writeBundle(options) {
        writeMpWeixinCommonAssetsShim(options.dir)
      },
      closeBundle() {
        const cwd = process.cwd()
        for (const rel of ['dist/dev/mp-weixin', 'dist/build/mp-weixin']) {
          writeMpWeixinCommonAssetsShim(join(cwd, rel))
        }
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
