import type { ExtremeEvent, NewAlert, RuleState, SensorSnapshot, ThresholdProfile } from '../types/rules.ts'
import { DEFAULT_THRESHOLD_PROFILE, evaluateReading } from '../utils/alertRules.ts'
import { evaluateForecast } from '../utils/extremeWeatherRules.ts'
import { evaluatePestRisk } from '../utils/pestRiskRules.ts'

export type AlertRow = NewAlert & { id: number }

export function nextAlertId(alerts: Array<{ id?: number }>): number {
  let max = 0
  for (const row of alerts) {
    const id = Number(row.id) || 0
    if (id > max) max = id
  }
  return max + 1
}

export function dedupeAlerts(
  existing: AlertRow[],
  incoming: NewAlert[]
): { alerts: AlertRow[]; created: AlertRow[] } {
  const alerts = [...existing]
  const created: AlertRow[] = []
  let nextId = nextAlertId(alerts)
  for (const item of incoming) {
    const dup = alerts.find(
      (row) =>
        !row.handled &&
        row.pointId === item.pointId &&
        row.ruleId === item.ruleId &&
        row.chain === item.chain
    )
    if (dup) continue
    const row: AlertRow = { ...item, id: nextId }
    nextId += 1
    alerts.push(row)
    created.push(row)
  }
  return { alerts, created }
}

export function readingFromWeatherRow(row: Record<string, unknown>): SensorSnapshot {
  return {
    pointId: Number(row.pointId),
    airTemp: Number(row.airTemp),
    soilVwc: Number(row.soilVwc),
    recordedAt: String(row.updatedAt || row.recordedAt || '')
  }
}

function latestWeatherByPoint(rows: Array<Record<string, unknown>>): Map<number, Record<string, unknown>> {
  const latest = new Map<number, Record<string, unknown>>()
  for (const row of rows) {
    const pointId = Number(row.pointId)
    const prev = latest.get(pointId)
    if (!prev || Number(row.id) >= Number(prev.id)) {
      latest.set(pointId, row)
    }
  }
  return latest
}

export function profileForPoint(db: any, pointId: number): ThresholdProfile {
  const rows = Array.isArray(db.thresholdProfiles) ? db.thresholdProfiles : []
  const found = rows.find((row: ThresholdProfile) => Number(row.pointId) === pointId)
  if (found) return { ...DEFAULT_THRESHOLD_PROFILE, ...found, pointId }
  return { ...DEFAULT_THRESHOLD_PROFILE, pointId }
}

function defaultPointNameOf(db: any, pointId: number): string {
  const point = (db.monitorPoints || []).find((row: any) => Number(row.id) === pointId)
  return point?.name || `POINT-${pointId}`
}

function fieldIdOfPoint(db: any, pointId: number): string | null {
  const field = (db.fields || []).find((row: any) => Number(row.monitorPointId) === pointId)
  return field?.id ? String(field.id) : null
}

export function runChain1OnDb(
  db: any,
  now: Date,
  pointNameOf?: (pointId: number) => string
): { created: AlertRow[] } {
  if (!Array.isArray(db.weatherReadings)) db.weatherReadings = []
  if (!Array.isArray(db.ruleState)) db.ruleState = []
  if (!Array.isArray(db.alerts)) db.alerts = []

  const latest = latestWeatherByPoint(db.weatherReadings)
  const processed = new Set<number>()
  const nextStates: RuleState[] = []
  const incoming: NewAlert[] = []

  for (const [pointId, row] of latest) {
    processed.add(pointId)
    const reading = readingFromWeatherRow(row)
    const profile = profileForPoint(db, pointId)
    const prevStates = (db.ruleState as RuleState[]).filter((s) => s.pointId === pointId)
    const name = pointNameOf ? pointNameOf(pointId) : defaultPointNameOf(db, pointId)
    const out = evaluateReading(reading, profile, prevStates, now, name)
    const fieldId = fieldIdOfPoint(db, pointId)
    for (const alert of out.alertsToCreate) {
      incoming.push({ ...alert, fieldId })
    }
    nextStates.push(...out.nextStates)
  }

  db.ruleState = [
    ...(db.ruleState as RuleState[]).filter((s) => !processed.has(s.pointId)),
    ...nextStates
  ]
  const { alerts, created } = dedupeAlerts(db.alerts, incoming)
  db.alerts = alerts
  return { created }
}

function nextEventId(events: Array<{ id?: number }>): number {
  let max = 0
  for (const row of events) {
    const id = Number(row.id) || 0
    if (id > max) max = id
  }
  return max + 1
}

export function upsertExtremeEvents(
  existing: Array<ExtremeEvent & { id?: number }>,
  incoming: ExtremeEvent[]
): { events: Array<ExtremeEvent & { id: number }>; added: Array<ExtremeEvent & { id: number }> } {
  const events = [...existing] as Array<ExtremeEvent & { id: number }>
  const added: Array<ExtremeEvent & { id: number }> = []
  let nextId = nextEventId(events)
  for (const item of incoming) {
    const dup = events.find(
      (row) => row.pointId === item.pointId && row.type === item.type && row.startAt === item.startAt
    )
    if (dup) continue
    const row = { ...item, id: nextId }
    nextId += 1
    events.push(row)
    added.push(row)
  }
  return { events, added }
}

export function runChain2OnDb(db: any, now: Date = new Date()): { created: AlertRow[] } {
  if (!Array.isArray(db.weatherForecast)) db.weatherForecast = []
  if (!Array.isArray(db.extremeEvents)) db.extremeEvents = []
  if (!Array.isArray(db.alerts)) db.alerts = []

  const byPoint = new Map<number, any[]>()
  for (const row of db.weatherForecast) {
    const pointId = Number(row.pointId)
    if (!byPoint.has(pointId)) byPoint.set(pointId, [])
    byPoint.get(pointId)!.push(row)
  }

  const incomingEvents: ExtremeEvent[] = []
  const incomingAlerts: NewAlert[] = []
  for (const [pointId, days] of byPoint) {
    const name = defaultPointNameOf(db, pointId)
    const fieldId = fieldIdOfPoint(db, pointId)
    const out = evaluateForecast(pointId, name, days)
    incomingEvents.push(...out.events)
    for (const alert of out.alertsToCreate) {
      incomingAlerts.push({ ...alert, fieldId, time: now.getTime() })
    }
  }

  const upserted = upsertExtremeEvents(db.extremeEvents, incomingEvents)
  db.extremeEvents = upserted.events
  const { alerts, created } = dedupeAlerts(db.alerts, incomingAlerts)
  db.alerts = alerts
  return { created }
}

export function tickSoilVwc(current: number): number {
  const stepped = Number((current + 0.4).toFixed(1))
  if (stepped > 14.5) return 11
  if (stepped < 11) return 11
  return stepped
}

function localDay(now: Date): string {
  const y = now.getFullYear()
  const m = String(now.getMonth() + 1).padStart(2, '0')
  const d = String(now.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

function nextRowId(rows: Array<{ id?: number }>): number {
  let max = 0
  for (const row of rows) {
    const id = Number(row.id) || 0
    if (id > max) max = id
  }
  return max + 1
}

export function tickSensorSimulation(db: any, now = new Date()): void {
  if (!Array.isArray(db.weatherReadings)) return
  const latest = latestWeatherByPoint(db.weatherReadings)
  const row = latest.get(2)
  if (!row) return
  row.soilVwc = tickSoilVwc(Number(row.soilVwc))

  if (!Array.isArray(db.monitorPoints)) db.monitorPoints = []
  const point = db.monitorPoints.find((item: { id: number }) => Number(item.id) === 2)
  if (point) {
    point.online = true
    point.lastSeenAt = now.toISOString()
  }

  if (!Array.isArray(db.sensorReadings)) db.sensorReadings = []
  const today = localDay(now)
  const existing = db.sensorReadings.find(
    (item: { pointId: number; recordedAt: string }) =>
      Number(item.pointId) === 2 && String(item.recordedAt).slice(0, 10) === today
  )
  if (existing) {
    existing.soilVwc = row.soilVwc
    return
  }
  db.sensorReadings.push({
    id: nextRowId(db.sensorReadings),
    pointId: 2,
    recordedAt: `${today}T08:00:00+08:00`,
    airTemp: Number(row.airTemp ?? 0),
    airRh: Number(row.airRh ?? 0),
    soilVwc: row.soilVwc,
    soilTemp10cm: Number(row.soilTemp10cm ?? 0)
  })
}

function ndviMid(layer: { ndviMin?: number; ndviMax?: number } | undefined): number {
  if (!layer) return 0.5
  const min = Number(layer.ndviMin ?? 0.5)
  const max = Number(layer.ndviMax ?? 0.5)
  return (min + max) / 2
}

function latestNdviByField(db: any): Map<string, any> {
  const map = new Map<string, any>()
  for (const layer of db.ndviLayers || []) {
    const prev = map.get(layer.fieldId)
    if (!prev || String(layer.date) >= String(prev.date)) {
      map.set(String(layer.fieldId), layer)
    }
  }
  return map
}

function recentAiCount(db: any, pointId: number, now: Date): number {
  const cutoff = now.getTime() - 7 * 24 * 60 * 60 * 1000
  return (db.alerts || []).filter(
    (row: any) =>
      Number(row.pointId) === pointId &&
      Number(row.time) >= cutoff &&
      String(row.message || '').includes('[AI识别]')
  ).length
}

export function publishAlert(db: any, id: number): any | null {
  const row = (db.alerts || []).find((item: any) => Number(item.id) === Number(id))
  if (!row) return null
  row.draft = false
  return row
}

export function runChain3OnDb(db: any, now: Date): { created: AlertRow[] } {
  if (!Array.isArray(db.fields)) db.fields = []
  if (!Array.isArray(db.pestRiskPredictions)) db.pestRiskPredictions = []
  if (!Array.isArray(db.alerts)) db.alerts = []
  if (!Array.isArray(db.weatherForecast)) db.weatherForecast = []

  const latestNdvi = latestNdviByField(db)
  const mids = [...latestNdvi.values()].map((layer) => ndviMid(layer))
  const ndviFieldAvg = mids.length ? mids.reduce((a, b) => a + b, 0) / mids.length : 0.5
  const predictions: any[] = []
  const incoming: NewAlert[] = []

  for (const field of db.fields) {
    const fieldId = String(field.id)
    const pointId = Number(field.monitorPointId || 0)
    const forecast = (db.weatherForecast || []).filter((row: any) => Number(row.pointId) === pointId)
    const profile = profileForPoint(db, pointId)
    const out = evaluatePestRisk({
      fieldId,
      fieldName: field.name || fieldId,
      pointId,
      forecast,
      ndvi: ndviMid(latestNdvi.get(fieldId)),
      ndviFieldAvg,
      crop: profile.crop || '小麦',
      growthStage: profile.growthStage || '拔节',
      recentAiAlertCount: recentAiCount(db, pointId, now)
    })
    predictions.push({
      id: predictions.length + 1,
      fieldId,
      riskLevel: out.riskLevel,
      factors: out.factors,
      window: out.window
    })
    if (out.draftAlert) {
      incoming.push({ ...out.draftAlert, time: now.getTime() })
    }
  }

  db.pestRiskPredictions = predictions
  const { alerts, created } = dedupeAlerts(db.alerts, incoming)
  db.alerts = alerts
  return { created }
}

export function appendNotifications(db: any, createdAlerts: AlertRow[], now = new Date()): void {
  if (!Array.isArray(db.notifications)) db.notifications = []
  let nextId = nextAlertId(db.notifications)
  for (const alert of createdAlerts) {
    let title = String(alert.message || '').slice(0, 40)
    if (alert.draft) title = `草稿 ${title}`
    db.notifications.push({
      id: nextId,
      title,
      read: false,
      alertId: alert.id,
      createdAt: now.toISOString()
    })
    nextId += 1
  }
}

export function runAllChains(db: any, now: Date): { created: AlertRow[] } {
  const env = runChain1OnDb(db, now)
  const extreme = runChain2OnDb(db, now)
  const pest = runChain3OnDb(db, now)
  const created = [...env.created, ...extreme.created, ...pest.created]
  appendNotifications(db, created, now)
  return { created }
}
