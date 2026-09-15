export type SensorReading = {
  id: number
  pointId: number
  recordedAt: string
  airTemp: number
  airRh: number
  soilVwc: number
  soilTemp10cm: number
}

function dayKey(iso: string): string {
  return String(iso).slice(0, 10)
}

export function last7DayRange(now = new Date()): { from: string; to: string } {
  const to = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const from = new Date(to)
  from.setDate(from.getDate() - 6)
  const ymd = (d: Date) => {
    const y = d.getFullYear()
    const m = String(d.getMonth() + 1).padStart(2, '0')
    const day = String(d.getDate()).padStart(2, '0')
    return `${y}-${m}-${day}`
  }
  return { from: ymd(from), to: ymd(to) }
}

/** Keep all rows on the newest `limit` distinct days that actually have data. */
export function latestDaysWithData(rows: SensorReading[], limit = 7): SensorReading[] {
  const sorted = [...rows].sort((a, b) => a.recordedAt.localeCompare(b.recordedAt))
  const seen = new Set<string>()
  const days: string[] = []
  for (let i = sorted.length - 1; i >= 0; i--) {
    const day = dayKey(sorted[i].recordedAt)
    if (!seen.has(day)) {
      seen.add(day)
      days.push(day)
      if (days.length === limit) break
    }
  }
  const keep = new Set(days)
  return sorted.filter((row) => keep.has(dayKey(row.recordedAt)))
}

export function filterReadings(
  rows: SensorReading[],
  pointId: number,
  from?: string,
  to?: string
): SensorReading[] {
  return [...rows]
    .filter((row) => Number(row.pointId) === Number(pointId))
    .filter((row) => {
      const day = dayKey(row.recordedAt)
      if (from && day < from) return false
      if (to && day > to) return false
      return true
    })
    .sort((a, b) => a.recordedAt.localeCompare(b.recordedAt))
}

export function hasSensorTrendData(
  stations: Array<{ rows: unknown[] }>
): boolean {
  return stations.some((station) => station.rows.length > 0)
}

export type SensorAiBands = {
  waterStressHint: number
  heatHint: number
}

const DEFAULT_AI_BANDS: SensorAiBands = {
  waterStressHint: 25,
  heatHint: 32
}

function mdSlash(iso: string): string {
  const day = dayKey(iso)
  return `${Number(day.slice(5, 7))}/${Number(day.slice(8, 10))}`
}

function latestRow(rows: SensorReading[]): SensorReading {
  const sorted = [...rows].sort((a, b) => a.recordedAt.localeCompare(b.recordedAt))
  return sorted[sorted.length - 1]
}

function stationWindow(rows: SensorReading[]): { from: string; to: string } {
  const sorted = [...rows].sort((a, b) => a.recordedAt.localeCompare(b.recordedAt))
  return {
    from: mdSlash(sorted[0].recordedAt),
    to: mdSlash(sorted[sorted.length - 1].recordedAt)
  }
}

/** Plain-language summary of the newest 7 days-with-data for selected stations. */
export function buildSensorAiConclusion(
  stations: Array<{ name: string; rows: SensorReading[] }>,
  bands: SensorAiBands = DEFAULT_AI_BANDS
): string {
  const active = stations.filter((station) => station.rows.length > 0)
  if (!active.length) return '所选监测站暂无气温与墒情读数。'

  let anyDry = false
  let anyHot = false
  const parts = active.map((station) => {
    const last = latestRow(station.rows)
    const { from, to } = stationWindow(station.rows)
    const dry = last.soilVwc < bands.waterStressHint
    const hot = last.airTemp > bands.heatHint
    if (dry) anyDry = true
    if (hot) anyHot = true
    const tempJudge = hot ? '偏高' : '正常'
    const vwcJudge = dry ? '偏低' : '正常'
    const span = from === to ? from : `${from}–${to}`
    return `${station.name}（${span}）气温 ${last.airTemp.toFixed(1)}℃（${tempJudge}）、墒情 ${last.soilVwc.toFixed(1)}%vol（${vwcJudge}）`
  })

  const advice = anyDry && anyHot
    ? '建议适时补灌并注意高温。'
    : anyDry
      ? '建议适时补灌。'
      : anyHot
        ? '建议关注高温对作物的影响。'
        : '墒情与气温均在提示范围内，维持当前田间管理即可。'

  return `${parts.join('；')}。${advice}`
}
