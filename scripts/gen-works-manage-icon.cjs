/**
 * 生成「管理」工具栏图标（深灰 #374151，透明底），解决浅灰素材在 #f4f4f4 底上对比度不足的问题。
 * 运行：node scripts/gen-works-manage-icon.cjs
 */
const fs = require('fs')
const zlib = require('zlib')
const path = require('path')

const W = 48
const H = 48
const FG = { r: 55, g: 65, b: 81 } // #374151

function crc32(buf) {
  let c = ~0 >>> 0
  for (let i = 0; i < buf.length; i++) {
    c ^= buf[i]
    for (let k = 0; k < 8; k++) c = (c >>> 1) ^ (0xedb88320 & -(c & 1))
  }
  return (~c) >>> 0
}

function chunk(typeStr, data) {
  const type = Buffer.from(typeStr)
  const len = Buffer.alloc(4)
  len.writeUInt32BE(data.length, 0)
  const crcBuf = Buffer.concat([type, data])
  const crc = Buffer.alloc(4)
  crc.writeUInt32BE(crc32(crcBuf), 0)
  return Buffer.concat([len, type, data, crc])
}

const rgba = Buffer.alloc(W * H * 4, 0)

function rect(x0, y0, x1, y1) {
  for (let y = y0; y < y1; y++) {
    for (let x = x0; x < x1; x++) {
      if (x < 0 || x >= W || y < 0 || y >= H) continue
      const i = (y * W + x) * 4
      rgba[i] = FG.r
      rgba[i + 1] = FG.g
      rgba[i + 2] = FG.b
      rgba[i + 3] = 255
    }
  }
}

const pad = 8
const cell = 14
const gap = 4
for (let gy = 0; gy < 2; gy++) {
  for (let gx = 0; gx < 2; gx++) {
    const x0 = pad + gx * (cell + gap)
    const y0 = pad + gy * (cell + gap)
    rect(x0, y0, x0 + cell, y0 + cell)
  }
}

const raw = Buffer.alloc((W * 4 + 1) * H)
for (let y = 0; y < H; y++) {
  raw[y * (W * 4 + 1)] = 0
  rgba.copy(raw, y * (W * 4 + 1) + 1, y * W * 4, (y + 1) * W * 4)
}

const compressed = zlib.deflateSync(raw)

const ihdr = Buffer.alloc(13)
ihdr.writeUInt32BE(W, 0)
ihdr.writeUInt32BE(H, 4)
ihdr[8] = 8
ihdr[9] = 6
ihdr[10] = 0
ihdr[11] = 0
ihdr[12] = 0

const sig = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])
const png = Buffer.concat([
  sig,
  chunk('IHDR', ihdr),
  chunk('IDAT', compressed),
  chunk('IEND', Buffer.alloc(0))
])

const out = path.join(__dirname, '../src/static/create/works-icon-manage-v3.png')
fs.writeFileSync(out, png)
console.log('written', out, png.length)
