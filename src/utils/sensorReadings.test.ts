import assert from 'node:assert/strict'
import { test } from 'node:test'
import {
  buildSensorAiConclusion,
  filterReadings,
  hasSensorTrendData,
  latestDaysWithData
} from './sensorReadings.ts'

const rows = [
  { id: 1, pointId: 2, recordedAt: '2026-08-19T08:00:00+08:00', airTemp: 33, airRh: 40, soilVwc: 12.1, soilTemp10cm: 30 },
  { id: 2, pointId: 2, recordedAt: '2026-08-21T08:00:00+08:00', airTemp: 35, airRh: 38, soilVwc: 12.8, soilTemp10cm: 31 },
  { id: 3, pointId: 1, recordedAt: '2026-08-21T08:00:00+08:00', airTemp: 28, airRh: 50, soilVwc: 25, soilTemp10cm: 27 }
]

test('filters by point and date range inclusive', () => {
  const out = filterReadings(rows, 2, '2026-08-20', '2026-08-21')
  assert.equal(out.length, 1)
  assert.equal(out[0].id, 2)
})

test('sorts by recordedAt', () => {
  const out = filterReadings(rows, 2)
  assert.equal(out[0].id, 1)
})

test('hasSensorTrendData is false when stations have no rows', () => {
  assert.equal(
    hasSensorTrendData([
      { rows: [] },
      { rows: [] }
    ]),
    false
  )
})

test('hasSensorTrendData is true when any station has rows', () => {
  assert.equal(
    hasSensorTrendData([
      { rows: [] },
      { rows: [rows[0]] }
    ]),
    true
  )
})

test('latestDaysWithData keeps the newest 7 days that have rows', () => {
  const history = Array.from({ length: 10 }, (_, i) => {
    const day = String(i + 1).padStart(2, '0')
    return {
      id: i + 1,
      pointId: 2,
      recordedAt: `2026-08-${day}T08:00:00+08:00`,
      airTemp: 30,
      airRh: 40,
      soilVwc: 12,
      soilTemp10cm: 28
    }
  })
  const out = latestDaysWithData(history, 7)
  assert.equal(out.length, 7)
  assert.equal(out[0].id, 4)
  assert.equal(out[6].id, 10)
  assert.equal(String(out[0].recordedAt).slice(0, 10), '2026-08-04')
})

test('latestDaysWithData skips empty calendar days', () => {
  const sparse = [
    { ...rows[0], id: 1, recordedAt: '2026-07-01T08:00:00+08:00' },
    { ...rows[0], id: 2, recordedAt: '2026-07-10T08:00:00+08:00' },
    { ...rows[0], id: 3, recordedAt: '2026-08-21T08:00:00+08:00' }
  ]
  const out = latestDaysWithData(sparse, 2)
  assert.deepEqual(
    out.map((row) => row.id),
    [2, 3]
  )
})

test('latestDaysWithData keeps every reading on a kept day', () => {
  const sameDay = [
    { ...rows[0], id: 1, recordedAt: '2026-08-01T08:00:00+08:00' },
    { ...rows[0], id: 2, recordedAt: '2026-08-21T08:00:00+08:00' },
    { ...rows[0], id: 3, recordedAt: '2026-08-21T18:00:00+08:00' }
  ]
  const out = latestDaysWithData(sameDay, 1)
  assert.deepEqual(
    out.map((row) => row.id),
    [2, 3]
  )
})

test('buildSensorAiConclusion is empty when no rows', () => {
  assert.equal(
    buildSensorAiConclusion([{ name: '雄县', rows: [] }]),
    '所选监测站暂无气温与墒情读数。'
  )
})

test('buildSensorAiConclusion reads latest temp and soil moisture', () => {
  const text = buildSensorAiConclusion(
    [{ name: '雄县', rows: [rows[0], rows[1]] }],
    { waterStressHint: 25, heatHint: 32 }
  )
  assert.match(text, /雄县（8\/19–8\/21）/)
  assert.match(text, /气温 35\.0℃（偏高）/)
  assert.match(text, /墒情 12\.8%vol（偏低）/)
  assert.match(text, /补灌/)
  assert.match(text, /高温/)
  assert.doesNotMatch(text, /pointId/)
  assert.doesNotMatch(text, /传感器网络/)
})

test('buildSensorAiConclusion stays calm when values are within bands', () => {
  const text = buildSensorAiConclusion(
    [{ name: '栾城', rows: [rows[2]] }],
    { waterStressHint: 25, heatHint: 32 }
  )
  assert.match(text, /气温 28\.0℃（正常）/)
  assert.match(text, /墒情 25\.0%vol（正常）/)
  assert.match(text, /维持当前田间管理/)
})
