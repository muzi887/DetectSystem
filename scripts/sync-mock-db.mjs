/**
 * P0-7：将 src/mock/db.json 同步到 deploy/api_mock/db.json
 * 避免开发 Mock 与线上部署包遥感/业务数据不一致。
 */
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const srcPath = path.join(root, 'src/mock/db.json')
const destPath = path.join(root, 'deploy/api_mock/db.json')

const src = JSON.parse(fs.readFileSync(srcPath, 'utf-8'))
const dest = JSON.parse(fs.readFileSync(destPath, 'utf-8'))

const syncKeys = [
  'fields',
  'ndviLayers',
  'moistureLayers',
  'thresholdProfiles',
  'ruleState',
  'weatherForecast',
  'extremeEvents',
  'pestRiskPredictions'
]

for (const key of syncKeys) {
  dest[key] = src[key]
}

fs.writeFileSync(destPath, `${JSON.stringify(dest, null, 2)}\n`, 'utf-8')
console.log(`[sync:mock-db] 已同步 ${syncKeys.join(', ')} → deploy/api_mock/db.json`)
