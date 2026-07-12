/**
 * 将 ml-bjj/knowledge/treatments.json 同步到前端静态资源目录。
 * 源文件为唯一维护点，运行 pnpm run sync:knowledge 后重新 build 前端即可。
 */
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const srcPath = path.join(root, 'ml-bjj/knowledge/treatments.json')
const destDir = path.join(root, 'src/assets/knowledge')
const destPath = path.join(destDir, 'treatments.json')

fs.mkdirSync(destDir, { recursive: true })
fs.copyFileSync(srcPath, destPath)
console.log('[sync:knowledge] ml-bjj/knowledge/treatments.json → src/assets/knowledge/treatments.json')
