export type RuleLevel = 'hint' | 'alert'
export type RuleId = 'water_stress' | 'heat_stress' | 'waterlogging'
export type AlertChain = 'env' | 'extreme' | 'pest'
export type MappedAlertLevel = 'warning' | 'high' | 'critical'

export interface SensorSnapshot {
  pointId: number
  airTemp: number
  soilVwc: number
  recordedAt: string
}

export interface ThresholdProfile {
  pointId: number
  waterStressHint: number
  waterStressAlert: number
  waterStressHintMinutes: number
  waterStressAlertMinutes: number
  heatHint: number
  heatAlert: number
  heatHintMinutes: number
  heatAlertMinutes: number
  waterloggingAlert: number
  waterloggingMinutes: number
}

export interface RuleHit {
  ruleId: RuleId
  level: RuleLevel
  durationMinutes: number
  reason: string
  metric: 'soilVwc' | 'airTemp'
  value: number
  threshold: number
}

export interface RuleState {
  pointId: number
  ruleId: RuleId
  level: RuleLevel
  startedAt: string
  lastSeenAt: string
  alertEmitted: boolean
}

export interface ForecastDay {
  date: string
  tempMax: number
  tempMin: number
  precipMm: number
  windMax: number
  humidity?: number
}

export interface NewAlert {
  pointId: number
  fieldId?: string | null
  level: MappedAlertLevel
  message: string
  time: number
  handled: false
  source: 'auto'
  ruleId: string
  chain: AlertChain
  draft: boolean
}

export interface ExtremeEvent {
  pointId: number
  type: string
  title: string
  description: string
  level: MappedAlertLevel
  startAt: string
  ruleId: string
}

export interface EvaluateReadingResult {
  hits: RuleHit[]
  nextStates: RuleState[]
  alertsToCreate: NewAlert[]
}
