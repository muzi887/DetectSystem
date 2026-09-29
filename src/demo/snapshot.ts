export interface DemoAlert {
  id: number
  pointId: number
  fieldId: string | null
  level: string
  message: string
  time: number
  handled: boolean
  source: 'auto' | 'manual'
  ruleId: string
  chain: 'env' | 'extreme' | 'pest'
  draft: boolean
}

export interface DemoForecastRow {
  pointId: number
  date: string
  tempMax: number
  tempMin: number
  precipMm: number
  windMax: number
  humidity: number
}

export interface DemoSnapshot {
  monitorPoints: Array<Record<string, unknown>>
  weatherReadings: Array<Record<string, unknown>>
  alerts: DemoAlert[]
  weatherForecast: DemoForecastRow[]
  extremeEvents: Array<{ pointId: number; title: string; startAt: string }>
  pestRiskPredictions: Array<Record<string, unknown>>
  notifications: Array<{ id: number; title: string; read: boolean; alertId: number; createdAt: string }>
  droneMissions: Array<Record<string, unknown>>
  fields: Array<Record<string, unknown>>
  ndviLayers: Array<Record<string, unknown>>
  moistureLayers: Array<Record<string, unknown>>
  sensorReadings: Array<{
    id: number
    pointId: number
    recordedAt: string
    airTemp: number
    airRh: number
    soilVwc: number
    soilTemp10cm: number
  }>
  thresholds: Array<Record<string, unknown>>
  dailyReportMarkdown: string
  analysisRecords: Array<{ id: number; label: string; confidence: number; cropType?: string; createdAt?: string }>
  analysisStats: Record<string, unknown>
  modelInfo: { classes_count: number; best_val_acc: number }
}

function forecastFor(pointId: number): DemoForecastRow[] {
  return Array.from({ length: 7 }, (_, index) => {
    const day = String(index + 1).padStart(2, '0')
    const heavy = pointId === 1 && index === 3
    return {
      pointId,
      date: `2026-09-${day}`,
      tempMax: pointId === 1 && index === 2 ? 36 : 29,
      tempMin: 18,
      precipMm: heavy ? 48 : 2,
      windMax: heavy ? 12 : 4,
      humidity: heavy ? 90 : 62
    }
  })
}

function readingsFor(pointId: number, soilVwc: number) {
  return [1, 2].map((day) => ({
    id: pointId * 10 + day,
    pointId,
    recordedAt: `2026-09-0${day}T08:00:00+08:00`,
    airTemp: 27,
    airRh: 62,
    soilVwc,
    soilTemp10cm: 22
  }))
}

export const demoSnapshot: DemoSnapshot = {
  monitorPoints: [
    { id: 1, name: '雄县', region: 'jjj', lat: 38.99, lng: 116.12, temp: 28.4, soilMoisture: 16.2, status: 'warning', online: true },
    { id: 2, name: '河间', region: 'jjj', lat: 38.44, lng: 116.08, temp: 26.1, soilMoisture: 28.0, status: 'normal', online: true },
    { id: 3, name: '栾城', region: 'jjj', lat: 37.88, lng: 114.65, temp: 27.2, soilMoisture: 24.5, status: 'normal', online: true }
  ],
  weatherReadings: [
    { id: 1, pointId: 1, updatedAt: '2026-09-02T08:00:00+08:00', soilVwc: 16.2, soilTemp10cm: 22, soilEc: 0.4, airTemp: 28.4, airRh: 58, windSpeed: 3.2, windDirection: 90, windDirectionText: '东', pressure: 1008, hourlyRain: 0 },
    { id: 2, pointId: 2, updatedAt: '2026-09-02T08:00:00+08:00', soilVwc: 28, soilTemp10cm: 21, soilEc: 0.4, airTemp: 26.1, airRh: 64, windSpeed: 2.4, windDirection: 180, windDirectionText: '南', pressure: 1010, hourlyRain: 0 },
    { id: 3, pointId: 3, updatedAt: '2026-09-02T08:00:00+08:00', soilVwc: 24.5, soilTemp10cm: 22, soilEc: 0.3, airTemp: 27.2, airRh: 70, windSpeed: 2.1, windDirection: 45, windDirectionText: '东北', pressure: 1009, hourlyRain: 0 }
  ],
  alerts: [
    {
      id: 1,
      pointId: 1,
      fieldId: null,
      level: 'warning',
      message: '[自动预警] 雄县土壤湿度低于告警线，墒情持续偏低。',
      time: 1750000003000,
      handled: false,
      source: 'auto',
      ruleId: 'water_stress',
      chain: 'env',
      draft: false
    },
    {
      id: 2,
      pointId: 1,
      fieldId: null,
      level: 'high',
      message: '[极端天气] 雄县未来 7 日有强降水，已按预报写入预警。',
      time: 1750000002000,
      handled: false,
      source: 'auto',
      ruleId: 'extreme_rain',
      chain: 'extreme',
      draft: false
    },
    {
      id: 3,
      pointId: 3,
      fieldId: null,
      level: 'high',
      message: '[虫情风险] 栾城虫情风险为草稿，正式发布需确认。',
      time: 1750000001000,
      handled: false,
      source: 'auto',
      ruleId: 'pest_risk',
      chain: 'pest',
      draft: true
    }
  ],
  weatherForecast: [1, 2, 3].flatMap(forecastFor),
  extremeEvents: [{ pointId: 1, title: '强降水', startAt: '2026-09-04T00:00:00+08:00' }],
  pestRiskPredictions: [],
  notifications: [
    { id: 1, title: '雄县墒情预警', read: false, alertId: 1, createdAt: '2026-09-02T08:00:00+08:00' }
  ],
  droneMissions: [],
  fields: [],
  ndviLayers: [],
  moistureLayers: [],
  sensorReadings: [...readingsFor(1, 16.2), ...readingsFor(2, 28), ...readingsFor(3, 24.5)],
  thresholds: [
    { pointId: 1 },
    { pointId: 2 },
    { pointId: 3 }
  ],
  dailyReportMarkdown: '# 演示日报\n\n监测点：河间、雄县、栾城。雄县墒情预警与极端天气预警已写入。栾城虫情为草稿。',
  analysisRecords: [],
  analysisStats: { byLabel: [] },
  modelInfo: { classes_count: 23, best_val_acc: 0.9404598959759102 }
}

export function chainCoverage(snapshot: DemoSnapshot) {
  const xiongxian = snapshot.monitorPoints.find((point) => String(point.name).includes('雄县'))
  const hejian = snapshot.monitorPoints.find((point) => String(point.name).includes('河间'))
  const luancheng = snapshot.monitorPoints.find((point) => String(point.name).includes('栾城'))
  const forecastCount = snapshot.weatherForecast.filter((row) => row.pointId === Number(xiongxian?.id)).length
  return {
    counties: Boolean(xiongxian && hejian && luancheng && xiongxian.region === 'jjj'),
    env: snapshot.alerts.some(
      (alert) =>
        alert.chain === 'env' &&
        alert.draft !== true &&
        alert.message.includes('土壤湿度') &&
        alert.message.includes('雄县')
    ),
    extreme: snapshot.alerts.some(
      (alert) => alert.chain === 'extreme' && alert.draft !== true && alert.message.includes('[极端天气]')
    ),
    pestDraft: snapshot.alerts.some(
      (alert) => alert.chain === 'pest' && alert.draft === true && alert.message.includes('[虫情风险]')
    ),
    forecast: forecastCount >= 7
  }
}
