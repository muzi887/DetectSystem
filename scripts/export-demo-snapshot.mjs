import { readFileSync, writeFileSync } from 'node:fs'

const base = 'http://127.0.0.1:5000'
const target = 'src/demo/snapshot.ts'

async function getJson(path) {
  let res
  try {
    res = await fetch(base + path)
  } catch {
    console.error('start python ml-bjj/serving/app.py first')
    process.exit(1)
  }
  if (!res.ok) {
    console.error(`${path} ${res.status}`)
    process.exit(1)
  }
  return res.json()
}

const meta = JSON.parse(readFileSync('ml-bjj/models/pest-cls-meta.json', 'utf8'))
if (!Array.isArray(meta.classes) || meta.classes.length !== 23) {
  console.error('classes_count is not 23')
  process.exit(1)
}
if ((Number(meta.best_val_acc) * 100).toFixed(2) !== '94.05') {
  console.error('displayed accuracy is not 94.05')
  process.exit(1)
}

const monitorPoints = await getJson('/monitorPoints')
const sensorReadings = []
const thresholds = []
for (const point of monitorPoints) {
  sensorReadings.push(...(await getJson(`/field-sensors/${point.id}/readings`)))
  thresholds.push(await getJson(`/field-sensors/${point.id}/thresholds`))
}
const daily = await getJson('/reports/daily')
const recent = await getJson('/api/analysis/recent?limit=20')
const snapshot = {
  monitorPoints,
  weatherReadings: await getJson('/weatherReadings'),
  alerts: await getJson('/alerts'),
  weatherForecast: await getJson('/weatherForecast'),
  extremeEvents: await getJson('/extremeEvents'),
  pestRiskPredictions: await getJson('/pestRiskPredictions'),
  notifications: await getJson('/notifications'),
  droneMissions: await getJson('/droneMissions'),
  fields: await getJson('/fields'),
  ndviLayers: await getJson('/ndviLayers'),
  moistureLayers: await getJson('/moistureLayers'),
  sensorReadings,
  thresholds,
  dailyReportMarkdown: daily.markdown ?? '',
  analysisRecords: recent.records ?? [],
  analysisStats: { byLabel: [] },
  modelInfo: { classes_count: meta.classes.length, best_val_acc: meta.best_val_acc }
}

const original = readFileSync(target, 'utf8')
const start = original.indexOf('export const demoSnapshot')
const end = original.indexOf('export function chainCoverage')
if (start < 0 || end < 0 || end <= start) {
  console.error('snapshot.ts is missing demoSnapshot or chainCoverage')
  process.exit(1)
}
const next =
  original.slice(0, start) +
  `export const demoSnapshot: DemoSnapshot = ${JSON.stringify(snapshot, null, 2)}\n\n` +
  original.slice(end)
writeFileSync(target, next)
console.log('wrote', target)
