import assert from 'node:assert/strict'
import { test } from 'node:test'
import { dedupeAlerts, nextAlertId, tickSoilVwc } from './persistRules.ts'

test('dedupe skips unhandled same pointId+ruleId+chain', () => {
  const existing = [
    { id: 1, pointId: 2, ruleId: 'water_stress', chain: 'env', handled: false, message: 'x' }
  ]
  const incoming = [
    {
      pointId: 2,
      ruleId: 'water_stress',
      chain: 'env',
      handled: false,
      message: 'y',
      level: 'high',
      time: 1,
      source: 'auto',
      draft: false
    }
  ]
  const { alerts, created } = dedupeAlerts(existing as any, incoming as any)
  assert.equal(created.length, 0)
  assert.equal(alerts.length, 1)
})

test('nextAlertId is max+1', () => {
  assert.equal(nextAlertId([{ id: 37 }, { id: 12 }]), 38)
})

test('tick keeps xiongxian in drought band', () => {
  const next = tickSoilVwc(12.8)
  assert.ok(next <= 14.5 && next >= 11)
})
