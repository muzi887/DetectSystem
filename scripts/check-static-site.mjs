import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs'
import { join, extname } from 'node:path'

const textExt = new Set(['.html', '.js', '.css', '.json', '.svg', '.txt', '.vue', '.ts', '.md', '.srt'])
const requireVideo = process.argv.includes('--require-video')
const words = [
  ['www.', 'dizhongkeji', '.cn'].join(''),
  ['82.157', '.234', '.123'].join(''),
  ['河北', '地质', '大学'].join(''),
  ['坤灵智巡', '创工队'].join(''),
  ['信息', '工程学院'].join(''),
  ['hgu', '.edu', '.cn'].join(''),
  ['kunling', '-smart'].join(''),
  ['指导', '教师'].join(''),
  ['刘兴', '冉'].join(''),
  ['孙丞', '淼'].join(''),
  ['中国', '科学院'].join(''),
  ['西北', '农林'].join(''),
  ['98', '.99'].join(''),
  'mAP'
]
const loopback = ['localhost', ['127', '.0', '.0', '.1'].join('')]
const pageRoots = ['index.html', 'src', 'public']
if (existsSync('dist')) pageRoots.push('dist')
const roots = ['README.md', ...pageRoots]
const hits = []

function walk(path) {
  if (!existsSync(path)) return
  const stat = statSync(path)
  if (stat.isDirectory()) {
    for (const name of readdirSync(path)) walk(join(path, name))
    return
  }
  if (path.endsWith('.test.ts')) return
  if (path.split(/[/\\]/).includes('mock')) return
  if (!textExt.has(extname(path))) return
  const lines = readFileSync(path, 'utf8').split(/\r?\n/)
  const inDist = path === 'dist' || path.startsWith('dist/') || path.startsWith('dist\\')
  const banned = path === 'README.md' ? words : words.concat(loopback)
  lines.forEach((line, index) => {
    for (const word of banned) {
      if (word === 'localhost' && inDist) continue
      if (word === '98.99' && inDist && !/(^|[^\d.])98\.99/.test(line)) continue
      if (line.includes(word)) hits.push(`${path}:${index + 1}: ${word}`)
    }
    if (inDist && line.includes('://localhost')) hits.push(`${path}:${index + 1}: ://localhost`)
    if (path.endsWith('.js') && inDist) {
      if (line.includes('baseURL:"/api"') || line.includes('baseURL: "/api"') || line.includes("baseURL:'/api'")) {
        hits.push(`${path}:${index + 1}: live api baseURL`)
      }
    }
  })
}

for (const root of roots) walk(root)

if (requireVideo) {
  const limit = 40 * 1024 * 1024
  for (const file of ['public/demo/analysis.mp4', 'dist/demo/analysis.mp4']) {
    if (!existsSync(file)) {
      hits.push(`${file}: missing`)
      continue
    }
    const size = statSync(file).size
    if (size < 1 || size > limit) hits.push(`${file}: size ${size}`)
  }
}

if (hits.length) {
  console.error(hits.join('\n'))
  process.exit(1)
}
console.log('static site check ok')
