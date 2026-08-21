export type ForecastRow = {
  pointId: number
  date: string
  tempMax: number
  tempMin: number
  precipMm: number
  windMax: number
  humidity?: number
}

export function daysForPoint(
  rows: ForecastRow[],
  pointId: number,
  limit = 7
): ForecastRow[] {
  return [...rows]
    .filter((row) => Number(row.pointId) === Number(pointId))
    .sort((a, b) => a.date.localeCompare(b.date))
    .slice(0, limit)
}
