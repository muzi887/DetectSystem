import assert from 'node:assert/strict'
import { test } from 'node:test'
import { evaluateForecast } from './extremeWeatherRules.ts'

test('single day 40C creates extreme heat event and alert', () => {
  const days = [
    { date: '2026-08-22', tempMax: 41, tempMin: 24, precipMm: 0, windMax: 3 }
  ]
  const out = evaluateForecast(2, '监测站 · 雄县', days)
  assert.equal(out.events.length, 1)
  assert.equal(out.events[0].type, 'high_temperature')
  assert.equal(out.alertsToCreate[0].chain, 'extreme')
  assert.match(out.alertsToCreate[0].message, /^\[极端天气\]/)
})

test('same event is identified by startAt', () => {
  const days = [{ date: '2026-08-22', tempMax: 41, tempMin: 24, precipMm: 0, windMax: 3 }]
  const a = evaluateForecast(2, '监测站 · 雄县', days)
  const b = evaluateForecast(2, '监测站 · 雄县', days)
  assert.equal(a.events[0].startAt, b.events[0].startAt)
})
