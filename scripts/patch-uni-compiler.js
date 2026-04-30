const fs = require('fs')
const path = require('path')

const root = path.resolve(__dirname, '..')
const source = path.join(
  root,
  'node_modules',
  '@dcloudio',
  'vue-cli-plugin-uni',
  'packages',
  '@vue',
  'component-compiler-utils',
  'dist',
  'compileTemplate.js'
)
const target = path.join(
  root,
  'node_modules',
  '@vue',
  'component-compiler-utils',
  'dist',
  'compileTemplate.js'
)

if (!fs.existsSync(source) || !fs.existsSync(target)) {
  console.warn('[patch-uni-compiler] component compiler files not found, skipping')
  process.exit(0)
}

fs.copyFileSync(source, target)
console.log('[patch-uni-compiler] patched @vue/component-compiler-utils for uni-app Vue2')
