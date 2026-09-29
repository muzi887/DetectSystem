import { cpSync, existsSync, rmSync } from 'node:fs'
import { resolve } from 'node:path'

const src = resolve('satellite-maps')
const dest = resolve('dist/satellite-maps')
if (!existsSync(src)) {
  console.error('missing satellite-maps/')
  process.exit(1)
}
if (!existsSync(resolve('dist'))) {
  console.error('missing dist/; run vite build first')
  process.exit(1)
}
rmSync(dest, { recursive: true, force: true })
cpSync(src, dest, { recursive: true })
console.log('copied satellite-maps to dist/satellite-maps')
