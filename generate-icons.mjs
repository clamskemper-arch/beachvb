// Run once to generate PNG icons: node generate-icons.mjs
// Requires: npm install sharp (or use an online tool to create icon-192.png and icon-512.png)
// Alternatively, use any image editor to create two PNG files:
//   public/icon-192.png  (192x192px)
//   public/icon-512.png  (512x512px)
// Suggested: amber/yellow background (#f59e0b) with a volleyball emoji in the center

import { createCanvas } from 'canvas' // npm install canvas
import { writeFileSync } from 'fs'

for (const size of [192, 512]) {
  const canvas = createCanvas(size, size)
  const ctx = canvas.getContext('2d')

  // Background
  ctx.fillStyle = '#f59e0b'
  const r = size * 0.2
  ctx.beginPath()
  ctx.roundRect(0, 0, size, size, r)
  ctx.fill()

  // Text
  ctx.font = `${size * 0.6}px serif`
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.fillText('🏐', size / 2, size / 2)

  writeFileSync(`public/icon-${size}.png`, canvas.toBuffer())
  console.log(`Generated icon-${size}.png`)
}
