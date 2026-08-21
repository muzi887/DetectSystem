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
