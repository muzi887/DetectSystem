import assert from 'node:assert/strict'
import { test } from 'node:test'
import { evaluateReading, buildEnvAlertMessage } from './alertRules.ts'
import { mapRuleLevel } from './ruleLevelMap.ts'
import type { RuleState, SensorSnapshot, ThresholdProfile } from '../types/rules.ts'

const profile: ThresholdProfile = {
  pointId: 2,
  crop: '小麦',
  growthStage: '拔节',
  waterStressHint: 25,
  waterStressAlert: 15,
  waterStressHintMinutes: 30,
  waterStressAlertMinutes: 10,
  heatHint: 32,
  heatAlert: 38,
  heatHintMinutes: 30,
  heatAlertMinutes: 10,
  waterloggingAlert: 80,
  waterloggingMinutes: 10
}

const reading = (over: Partial<SensorSnapshot> = {}): SensorSnapshot => ({
  pointId: 2,
  airTemp: 26,
  soilVwc: 12.8,
  recordedAt: '2026-08-21T08:00:00+08:00',
  ...over
})

test('jitter below alert threshold does not emit before duration', () => {
  const now = new Date('2026-08-21T08:02:00+08:00')
  const out = evaluateReading(reading(), profile, [], now)
  assert.equal(out.alertsToCreate.length, 0)
  assert.equal(out.nextStates[0]?.alertEmitted, false)
  assert.equal(out.nextStates[0]?.ruleId, 'water_stress')
})

test('sustained alert soil moisture emits one auto alert', () => {
  const started = new Date('2026-08-21T07:50:00+08:00')
  const now = new Date('2026-08-21T08:02:00+08:00')
  const states: RuleState[] = [
    {
      pointId: 2,
      ruleId: 'water_stress',
      level: 'alert',
      startedAt: started.toISOString(),
      lastSeenAt: started.toISOString(),
      alertEmitted: false
    }
  ]
  const out = evaluateReading(reading(), profile, states, now)
  assert.equal(out.alertsToCreate.length, 1)
  assert.equal(out.alertsToCreate[0].chain, 'env')
  assert.equal(out.alertsToCreate[0].ruleId, 'water_stress')
  assert.equal(out.alertsToCreate[0].level, 'high')
  assert.match(out.alertsToCreate[0].message, /^\[自动预警\]/)
  assert.equal(out.nextStates[0]?.alertEmitted, true)
})

test('recovery clears state so the rule can fire again', () => {
  const now = new Date('2026-08-21T08:02:00+08:00')
  const states: RuleState[] = [
    {
      pointId: 2,
      ruleId: 'water_stress',
      level: 'alert',
      startedAt: '2026-08-21T07:00:00+08:00',
      lastSeenAt: '2026-08-21T07:50:00+08:00',
      alertEmitted: true
    }
  ]
  const out = evaluateReading(reading({ soilVwc: 30 }), profile, states, now)
  assert.equal(out.nextStates.length, 0)
  assert.equal(out.alertsToCreate.length, 0)
})

test('mapRuleLevel and message format', () => {
  assert.equal(mapRuleLevel('hint'), 'warning')
  assert.equal(mapRuleLevel('alert'), 'high')
  const msg = buildEnvAlertMessage('监测站 · 雄县', {
    ruleId: 'water_stress',
    level: 'alert',
    durationMinutes: 10,
    reason: '',
    metric: 'soilVwc',
    value: 12.8,
    threshold: 15
  }, 12)
  assert.equal(
    msg,
    '[自动预警] 监测站 · 雄县 - 土壤湿度 12.8% 低于告警阈值 15%，已持续 12 min'
  )
})
