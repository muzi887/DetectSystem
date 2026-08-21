import type { ExtremeEvent, ForecastDay, NewAlert } from '../types/rules.ts'

function sortDays(days: ForecastDay[]): ForecastDay[] {
  return [...days].sort((a, b) => a.date.localeCompare(b.date))
}

function makeEvent(
  pointId: number,
  ruleId: string,
  type: string,
  title: string,
  description: string,
  level: ExtremeEvent['level'],
  startAt: string
): ExtremeEvent {
  return { pointId, ruleId, type, title, description, level, startAt }
}

function toAlert(pointName: string, event: ExtremeEvent): NewAlert {
  return {
    pointId: event.pointId,
    fieldId: null,
    level: event.level,
    message: `[极端天气] ${pointName} - ${event.title}：${event.description}`,
    time: Date.now(),
    handled: false,
    source: 'auto',
    ruleId: event.ruleId,
    chain: 'extreme',
    draft: false
  }
}

export function evaluateForecast(
  pointId: number,
  pointName: string,
  days: ForecastDay[]
): { events: ExtremeEvent[]; alertsToCreate: NewAlert[] } {
  const sorted = sortDays(days)
  const events: ExtremeEvent[] = []

  for (const day of sorted) {
    if (day.tempMax >= 40) {
      events.push(
        makeEvent(
          pointId,
          'extreme_heat_40',
          'high_temperature',
          '极端高温',
          `预报最高气温达到 ${day.tempMax}℃`,
          'critical',
          day.date
        )
      )
    }
    if (day.tempMin <= -5) {
      events.push(
        makeEvent(
          pointId,
          'extreme_frost',
          'frost',
          '霜冻风险',
          `预报最低气温 ${day.tempMin}℃`,
          'high',
          day.date
        )
      )
    }
    if (day.windMax >= 17.2) {
      events.push(
        makeEvent(
          pointId,
          'extreme_wind',
          'gale',
          '大风',
          `预报最大风速 ${day.windMax} m/s`,
          'warning',
          day.date
        )
      )
    }
    if (day.precipMm >= 50) {
      events.push(
        makeEvent(
          pointId,
          'extreme_rain',
          'heavy_rain',
          '暴雨',
          `预报日降水 ${day.precipMm} mm`,
          'high',
          day.date
        )
      )
    }
  }

  for (let i = 0; i <= sorted.length - 3; i++) {
    const window = sorted.slice(i, i + 3)
    if (window.every((d) => d.tempMax >= 38)) {
      events.push(
        makeEvent(
          pointId,
          'extreme_heat_3d',
          'high_temperature',
          '连续高温',
          `连续 3 日最高气温 ≥ 38℃（自 ${window[0].date}）`,
          'warning',
          window[0].date
        )
      )
      break
    }
  }

  const alertsToCreate = events.map((event) => toAlert(pointName, event))
  return { events, alertsToCreate }
}
