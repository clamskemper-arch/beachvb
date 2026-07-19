// Run once to generate PNG icons: node generate-icons.mjs
// Requires: npm install canvas
// Draws the same design as public/favicon.svg — a white volleyball with
// curved seams on an amber rounded-square background.

import { createCanvas } from 'canvas'
import { writeFileSync } from 'fs'

// Seam curves in a 100x100 coordinate space, matching public/favicon.svg
const seams = [
  [[84, 50], [61.56, 57], [38.44, 43], [16, 50]],
  [[67, 79.44], [49.72, 63.51], [50.28, 36.49], [33, 20.56]],
  [[33, 79.44], [38.16, 56.51], [61.84, 43.49], [67, 20.56]],
]

for (const size of [192, 512]) {
  const canvas = createCanvas(size, size)
  const ctx = canvas.getContext('2d')
  const s = size / 100

  // Background
  ctx.fillStyle = '#f59e0b'
  ctx.beginPath()
  ctx.roundRect(0, 0, size, size, size * 0.2)
  ctx.fill()

  // Ball
  ctx.beginPath()
  ctx.arc(50 * s, 50 * s, 34 * s, 0, Math.PI * 2)
  ctx.fillStyle = '#ffffff'
  ctx.fill()
  ctx.lineWidth = 2.5 * s
  ctx.strokeStyle = '#1c1917'
  ctx.stroke()

  // Seams
  ctx.lineWidth = 3 * s
  ctx.strokeStyle = '#1c1917'
  ctx.lineCap = 'round'
  for (const [[x0, y0], [x1, y1], [x2, y2], [x3, y3]] of seams) {
    ctx.beginPath()
    ctx.moveTo(x0 * s, y0 * s)
    ctx.bezierCurveTo(x1 * s, y1 * s, x2 * s, y2 * s, x3 * s, y3 * s)
    ctx.stroke()
  }

  writeFileSync(`public/icon-${size}.png`, canvas.toBuffer())
  console.log(`Generated icon-${size}.png`)
}
