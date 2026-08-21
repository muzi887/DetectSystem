export function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value))
}

export function droughtIndex(soilVwc: number, dryDays: number): number {
  return clamp((25 - soilVwc) * 2 + dryDays * 5, 0, 100)
}

export function countConsecutiveDryDays(days: Array<{ date: string; precipMm: number }>): number {
  const sorted = [...days].sort((a, b) => a.date.localeCompare(b.date))
  let count = 0
  for (const day of sorted) {
    if (Number(day.precipMm) < 1) count += 1
    else break
  }
  return count
}
