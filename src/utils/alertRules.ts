import type {
  EvaluateReadingResult,
  NewAlert,
  RuleHit,
  RuleState,
  SensorSnapshot,
  ThresholdProfile
} from '../types/rules.ts'
import { mapRuleLevel } from './ruleLevelMap.ts'

export const DEFAULT_THRESHOLD_PROFILE: ThresholdProfile = {
  pointId: 0,
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

export function detectHits(reading: SensorSnapshot, profile: ThresholdProfile): RuleHit[] {
  const hits: RuleHit[] = []
  const soil = reading.soilVwc
  const temp = reading.airTemp

  if (soil < profile.waterStressAlert) {
    hits.push({
      ruleId: 'water_stress',
      level: 'alert',
      durationMinutes: profile.waterStressAlertMinutes,
      reason: 'soil moisture below alert',
      metric: 'soilVwc',
      value: soil,
      threshold: profile.waterStressAlert
    })
  } else if (soil < profile.waterStressHint) {
    hits.push({
      ruleId: 'water_stress',
      level: 'hint',
      durationMinutes: profile.waterStressHintMinutes,
      reason: 'soil moisture below hint',
      metric: 'soilVwc',
      value: soil,
      threshold: profile.waterStressHint
    })
  }

  if (soil > profile.waterloggingAlert) {
    hits.push({
      ruleId: 'waterlogging',
      level: 'alert',
      durationMinutes: profile.waterloggingMinutes,
      reason: 'soil moisture above waterlogging',
      metric: 'soilVwc',
      value: soil,
      threshold: profile.waterloggingAlert
    })
  }

  if (temp > profile.heatAlert) {
    hits.push({
      ruleId: 'heat_stress',
      level: 'alert',
      durationMinutes: profile.heatAlertMinutes,
      reason: 'air temp above alert',
      metric: 'airTemp',
      value: temp,
      threshold: profile.heatAlert
    })
  } else if (temp > profile.heatHint) {
    hits.push({
      ruleId: 'heat_stress',
      level: 'hint',
      durationMinutes: profile.heatHintMinutes,
      reason: 'air temp above hint',
      metric: 'airTemp',
      value: temp,
      threshold: profile.heatHint
    })
  }

  return hits
}

export function buildEnvAlertMessage(
  pointName: string,
  hit: RuleHit,
  elapsedMinutes: number
): string {
  const kind = hit.level === 'hint' ? '提示阈值' : '告警阈值'
  if (hit.metric === 'airTemp') {
    return `[自动预警] ${pointName} - 气温 ${hit.value}℃ 超过${kind} ${hit.threshold}℃，已持续 ${elapsedMinutes} min`
  }
  if (hit.ruleId === 'waterlogging') {
    return `[自动预警] ${pointName} - 土壤湿度 ${hit.value}% 偏高，高于${kind} ${hit.threshold}%，已持续 ${elapsedMinutes} min`
  }
  return `[自动预警] ${pointName} - 土壤湿度 ${hit.value}% 低于${kind} ${hit.threshold}%，已持续 ${elapsedMinutes} min`
}

export function evaluateReading(
  reading: SensorSnapshot,
  profile: ThresholdProfile,
  states: RuleState[],
  now: Date,
  pointName = 'POINT'
): EvaluateReadingResult {
  const nextStates: RuleState[] = []
  const alertsToCreate: NewAlert[] = []
  const hits: RuleHit[] = []

  for (const hit of detectHits(reading, profile)) {
    hits.push(hit)
    const prev = states.find((s) => s.pointId === reading.pointId && s.ruleId === hit.ruleId)
    const startedAt = prev && prev.level === hit.level ? prev.startedAt : now.toISOString()
    const elapsed = (now.getTime() - Date.parse(startedAt)) / 60000
    const alertEmitted = Boolean(prev?.alertEmitted && prev.level === hit.level)
    const state: RuleState = {
      pointId: reading.pointId,
      ruleId: hit.ruleId,
      level: hit.level,
      startedAt,
      lastSeenAt: now.toISOString(),
      alertEmitted
    }
    if (elapsed >= hit.durationMinutes && !state.alertEmitted) {
      alertsToCreate.push({
        pointId: reading.pointId,
        fieldId: null,
        level: mapRuleLevel(hit.level),
        message: buildEnvAlertMessage(pointName, hit, Math.floor(elapsed)),
        time: now.getTime(),
        handled: false,
        source: 'auto',
        ruleId: hit.ruleId,
        chain: 'env',
        draft: false
      })
      state.alertEmitted = true
    }
    nextStates.push(state)
  }

  return { hits, nextStates, alertsToCreate }
}
