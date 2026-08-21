import assert from 'node:assert/strict'
import { test } from 'node:test'
import { filterReadings } from './sensorReadings.ts'

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
