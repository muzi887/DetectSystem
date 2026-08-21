import type { ForecastDay, NewAlert } from '../types/rules.ts'

export interface PestRiskInput {
  fieldId: string
  fieldName: string
  pointId?: number
  forecast: ForecastDay[]
  ndvi: number
  ndviFieldAvg: number
  crop: string
  growthStage: string
  recentAiAlertCount: number
}

export interface PestRiskResult {
  riskLevel: 'low' | 'medium' | 'high'
  factors: string[]
  window: string
  draftAlert?: NewAlert
}

function dayMeanTemp(day: ForecastDay): number {
  return (Number(day.tempMax) + Number(day.tempMin)) / 2
}

function hasHumid3d(days: ForecastDay[]): boolean {
  const sorted = [...days].sort((a, b) => a.date.localeCompare(b.date))
  for (let i = 0; i <= sorted.length - 3; i++) {
    const window = sorted.slice(i, i + 3)
    if (window.every((d) => Number(d.humidity ?? 0) > 80)) return true
  }
  return false
}

function rain7d(days: ForecastDay[]): number {
  const sorted = [...days].sort((a, b) => a.date.localeCompare(b.date)).slice(0, 7)
  return sorted.reduce((sum, d) => sum + Number(d.precipMm || 0), 0)
}

function meanTemp5d(days: ForecastDay[]): number | null {
  const sorted = [...days].sort((a, b) => a.date.localeCompare(b.date)).slice(0, 5)
  if (sorted.length === 0) return null
  const sum = sorted.reduce((acc, d) => acc + dayMeanTemp(d), 0)
  return sum / sorted.length
}

function scoreToLevel(score: number): PestRiskResult['riskLevel'] {
  if (score >= 4) return 'high'
  if (score >= 2) return 'medium'
  return 'low'
}

export function evaluatePestRisk(input: PestRiskInput): PestRiskResult {
  const factors: string[] = []
  const forecast = input.forecast || []

  if (hasHumid3d(forecast)) {
    factors.push('连续 3 日湿度 > 80%')
  }
  if (rain7d(forecast) > 80) {
    factors.push('7 日累计降水偏多')
  }
  if (input.ndviFieldAvg > 0 && input.ndvi < input.ndviFieldAvg * 0.85) {
    factors.push('NDVI 低于田间均值 15%')
  }
  const mean5 = meanTemp5d(forecast)
  if (
    mean5 != null &&
    mean5 >= 22 &&
    mean5 <= 28 &&
    String(input.crop).includes('小麦')
  ) {
    factors.push('气温处于病害流行适温区间')
  }
  if (input.recentAiAlertCount >= 2) {
    factors.push('近期 AI 已多次检出病虫害')
  }

  const riskLevel = scoreToLevel(factors.length)
  const window = forecast.length
    ? `${forecast[0].date}~${forecast[forecast.length - 1].date}`
    : ''

  const result: PestRiskResult = { riskLevel, factors, window }
  if (riskLevel === 'high') {
    result.draftAlert = {
      pointId: input.pointId ?? 0,
      fieldId: input.fieldId,
      level: 'high',
      message: `[虫情风险] 地块 ${input.fieldName} - 风险等级：high（${factors.join('；')}）`,
      time: Date.now(),
      handled: false,
      source: 'auto',
      ruleId: 'pest_risk',
      chain: 'pest',
      draft: true
    }
  }
  return result
}
