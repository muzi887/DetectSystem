import assert from 'node:assert/strict'
import { test } from 'node:test'
import { evaluatePestRisk } from './pestRiskRules.ts'
import type { ForecastDay } from '../types/rules.ts'

function makeDays(count: number, over: Partial<ForecastDay> = {}): ForecastDay[] {
  return Array.from({ length: count }, (_, i) => ({
    date: `2026-08-${String(22 + i).padStart(2, '0')}`,
    tempMax: 26,
    tempMin: 24,
    precipMm: 13,
    windMax: 2,
    humidity: 85,
    ...over
  }))
}

test('four factors yield high and a draft alert', () => {
  const out = evaluatePestRisk({
    fieldId: 'xiongxian',
    fieldName: '2号地块（雄县）',
    pointId: 2,
    forecast: makeDays(7),
    ndvi: 0.4,
    ndviFieldAvg: 0.6,
    crop: '小麦',
    growthStage: '拔节',
    recentAiAlertCount: 2
  })
  assert.equal(out.riskLevel, 'high')
  assert.ok(out.factors.length >= 2)
  assert.equal(out.draftAlert?.draft, true)
  assert.match(out.draftAlert!.message, /^\[虫情风险\]/)
})

test('low score has no draft', () => {
  const out = evaluatePestRisk({
    fieldId: 'hejian',
    fieldName: '1号地块（河间市）',
    pointId: 1,
    forecast: [
      { date: '2026-08-22', tempMax: 26, tempMin: 18, precipMm: 0, windMax: 2, humidity: 40 }
    ],
    ndvi: 0.7,
    ndviFieldAvg: 0.7,
    crop: '小麦',
    growthStage: '拔节',
    recentAiAlertCount: 0
  })
  assert.equal(out.riskLevel, 'low')
  assert.equal(out.draftAlert, undefined)
})

test('humid_3d alone adds one factor', () => {
  const out = evaluatePestRisk({
    fieldId: 'xiongxian',
    fieldName: '2号地块（雄县）',
    pointId: 2,
    forecast: makeDays(3, { precipMm: 0, tempMax: 18, tempMin: 10 }),
    ndvi: 0.7,
    ndviFieldAvg: 0.7,
    crop: '玉米',
    growthStage: '拔节',
    recentAiAlertCount: 0
  })
  assert.equal(out.riskLevel, 'low')
  assert.ok(out.factors.some((f) => f.includes('湿度')))
  assert.equal(out.draftAlert, undefined)
})
