import assert from 'node:assert/strict'
import { test } from 'node:test'
import { dedupeAlerts, nextAlertId, tickSensorSimulation, tickSoilVwc } from './persistRules.ts'

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

test('tick updates xiongxian lastSeenAt and same-day reading', () => {
  const now = new Date(2026, 7, 21, 15, 0, 0)
  const db = {
    weatherReadings: [
      {
        id: 2,
        pointId: 2,
        soilVwc: 12.8,
        airTemp: 35.6,
        airRh: 38,
        soilTemp10cm: 31.5,
        updatedAt: '2026-08-21T14:00:00+08:00'
      }
    ],
    monitorPoints: [{ id: 2, name: '监测站 · 雄县', online: true, lastSeenAt: '2026-08-01T00:00:00+08:00' }],
    sensorReadings: [
      {
        id: 7,
        pointId: 2,
        recordedAt: '2026-08-21T08:00:00+08:00',
        airTemp: 35.6,
        airRh: 38,
        soilVwc: 12.8,
        soilTemp10cm: 31.5
      }
    ]
  }
  tickSensorSimulation(db, now)
  assert.equal(db.monitorPoints[0].online, true)
  assert.notEqual(db.monitorPoints[0].lastSeenAt, '2026-08-01T00:00:00+08:00')
  assert.equal(db.weatherReadings[0].soilVwc, 13.2)
  assert.equal(db.sensorReadings[0].soilVwc, 13.2)
  assert.equal(db.sensorReadings.length, 1)
})
