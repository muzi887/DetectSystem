import assert from 'node:assert/strict'
import { test } from 'node:test'
import { daysForPoint } from './forecastView.ts'

const rows = [
  { pointId: 2, date: '2026-08-24', tempMax: 34, tempMin: 22, precipMm: 2, windMax: 5 },
  { pointId: 1, date: '2026-08-22', tempMax: 30, tempMin: 20, precipMm: 0, windMax: 3 },
  { pointId: 2, date: '2026-08-22', tempMax: 41, tempMin: 24, precipMm: 0, windMax: 3 },
  { pointId: 2, date: '2026-08-23', tempMax: 36, tempMin: 23, precipMm: 0, windMax: 4 }
]

test('filters by point and sorts by date', () => {
  const days = daysForPoint(rows, 2, 7)
  assert.equal(days.length, 3)
  assert.equal(days[0].date, '2026-08-22')
  assert.equal(days[0].tempMax, 41)
  assert.equal(days[2].date, '2026-08-24')
})

test('caps at limit', () => {
  assert.equal(daysForPoint(rows, 2, 1).length, 1)
})
