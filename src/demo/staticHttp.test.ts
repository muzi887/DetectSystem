import assert from 'node:assert/strict'
import { test } from 'node:test'
import { chainCoverage, demoSnapshot } from './snapshot.ts'
import { createStaticHttp } from './staticHttp.ts'

test('snapshot covers three counties and three chains', () => {
  const coverage = chainCoverage(demoSnapshot)
  assert.deepEqual(coverage, {
    counties: true,
    env: true,
    extreme: true,
    pestDraft: true,
    forecast: true
  })
})

test('displayed accuracy is 94.05 for 23 classes', () => {
  assert.equal(demoSnapshot.modelInfo.classes_count, 23)
  assert.equal((demoSnapshot.modelInfo.best_val_acc * 100).toFixed(2), '94.05')
})

test('alerts sort desc and xiongxian forecast has a heavy-rain day', async () => {
  const http = createStaticHttp(demoSnapshot)
  const alerts = await http.get('/alerts?_sort=time&_order=desc')
  const times = (alerts.data as Array<{ time: number }>).map((row) => row.time)
  assert.deepEqual(times, [...times].sort((a, b) => b - a))
  const forecast = await http.get('/weatherForecast', { params: { pointId: 1 } })
  const rows = forecast.data as Array<{ pointId: number; precipMm: number }>
  assert.equal(rows.length, 7)
  assert.equal(rows.every((row) => row.pointId === 1), true)
  assert.equal(rows.some((row) => row.precipMm >= 40), true)
})

test('publish flips only the in-memory draft', async () => {
  const http = createStaticHttp(demoSnapshot)
  const before = await http.get('/alerts')
  const draft = (before.data as Array<{ id: number; draft?: boolean }>).find((row) => row.draft === true)
  assert.ok(draft)
  await http.post(`/alerts/${draft.id}/publish`)
  const after = await http.get('/alerts')
  const published = (after.data as Array<{ id: number; draft?: boolean }>).find((row) => row.id === draft.id)
  assert.equal(published?.draft, false)
  const fresh = createStaticHttp(demoSnapshot)
  const again = await fresh.get('/alerts')
  const original = (again.data as Array<{ id: number; draft?: boolean }>).find((row) => row.id === draft.id)
  assert.equal(original?.draft, true)
})

test('login returns an agronomist token without a network call', async () => {
  const http = createStaticHttp(demoSnapshot)
  const res = await http.post('/login', { phone: '13800000000', code: '2026', role: 'agronomist' })
  const body = res.data as { token: string; user: { role: string } }
  assert.equal(body.user.role, 'agronomist')
  assert.equal(typeof body.token, 'string')
})

test('image upload is rejected', async () => {
  const http = createStaticHttp(demoSnapshot)
  await assert.rejects(() => http.post('/analysis/image', {}), /公网实时上传/)
})

test('every page endpoint used today resolves', async () => {
  const http = createStaticHttp(demoSnapshot)
  const gets = [
    '/monitorPoints',
    '/weatherReadings',
    '/alerts?_sort=time&_order=desc',
    '/weatherForecast',
    '/extremeEvents',
    '/pestRiskPredictions',
    '/notifications',
    '/droneMissions',
    '/fields',
    '/ndviLayers',
    '/moistureLayers',
    '/moisture/value?lat=38.99&lng=116.12',
    '/analysis/recent',
    '/analysis/stats',
    '/analysis/model-info',
    '/reports/daily',
    '/field-sensors/1/readings',
    '/field-sensors/1/thresholds'
  ]
  for (const url of gets) {
    const res = await http.get(url)
    assert.notEqual(res.data, undefined, url)
  }
})
