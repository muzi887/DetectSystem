/**
 * 将大图转为 WebP，并缩小遥感热力图尺寸。
 * 依赖 npx sharp-cli（无需写入 package.json）。
 * 运行：npm run optimize-assets
 */
import { execSync } from 'node:child_process'
import { existsSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..')
const assetsDir = path.join(root, 'src', 'assets')

const webpTargets = [
  'ndvi-heatmap.jpg',
  'soil-moisture-heatmap.jpg',
  'bg.jpg',
  'wheat.jpg',
  'logo.jpg'
]

const heatmapMaxWidth = 1600
const cli = 'npx --yes sharp-cli'

function run(cmd) {
  console.log(cmd)
  execSync(cmd, { stdio: 'inherit', cwd: root, shell: true })
}

for (const file of ['ndvi-heatmap.jpg', 'soil-moisture-heatmap.jpg']) {
  const input = path.join(assetsDir, file)
  if (!existsSync(input)) continue
  run(
    `${cli} -i "${input}" -o "${input}" resize ${heatmapMaxWidth} -- -f jpg -q 85`
  )
}

for (const file of webpTargets) {
  const input = path.join(assetsDir, file)
  if (!existsSync(input)) {
    console.warn(`skip (missing): ${file}`)
    continue
  }
  const out = path.join(assetsDir, file.replace(/\.(jpe?g|png)$/i, '.webp'))
  run(`${cli} -i "${input}" -o "${out}" -f webp -q 82`)
}

console.log('done.')
