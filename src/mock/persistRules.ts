import type { ExtremeEvent, NewAlert, RuleState, SensorSnapshot, ThresholdProfile } from '../types/rules.ts'
import { DEFAULT_THRESHOLD_PROFILE, evaluateReading } from '../utils/alertRules.ts'
import { evaluateForecast } from '../utils/extremeWeatherRules.ts'

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
  if (found) return found
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
