export type SatelliteType = 'drought' | 'heat' | 'rain' | 'wind'

export type ThematicKind = 'day' | 'summary'

export type ParsedThematic =
  | { kind: 'day'; date: string }
  | { kind: 'summary' }

export type SatelliteDayItem = { date: string; url: string }
export type SatelliteSummaryItem = { id: 'summary'; label: string; url: string }

export type SatelliteTypeBucket = {
  summary: SatelliteSummaryItem | null
  days: SatelliteDayItem[]
}

export type SatelliteCatalog = Record<SatelliteType, SatelliteTypeBucket>

const TYPE_FOLDERS: Record<string, SatelliteType> = {
  干旱: 'drought',
  高温: 'heat',
  暴雨: 'rain',
  大风: 'wind'
}

const SUMMARY_FILES: Record<string, SatelliteType> = {
  xinganhan: 'drought',
  xingaowen: 'heat',
  xinbaoyu: 'rain',
  xindafeng: 'wind'
}

function pad2(n: number) {
  return String(n).padStart(2, '0')
}

export function parseThematicName(filename: string, year: number): ParsedThematic | null {
  const base = filename.replace(/\.[^.]+$/, '').trim()
  if (/^mmexport/i.test(base)) return null
  const summaryKey = base.toLowerCase()
  if (SUMMARY_FILES[summaryKey]) return { kind: 'summary' }

  const iso = base.match(/(\d{4})-(\d{2})-(\d{2})/)
  if (iso) {
    return { kind: 'day', date: `${iso[1]}-${iso[2]}-${iso[3]}` }
  }

  const md = base.match(/(?:高温)?(\d{1,2})\.(\d{1,2})$/)
  if (!md) return null
  const month = Number(md[1])
  const day = Number(md[2])
  if (month < 1 || month > 12 || day < 1 || day > 31) return null
  return { kind: 'day', date: `${year}-${pad2(month)}-${pad2(day)}` }
}

export function typeFromRelPath(relPath: string): SatelliteType | null {
  const normalized = relPath.replaceAll('\\', '/')
  const parts = normalized.split('/')
  const filename = parts[parts.length - 1] ?? ''
  const stem = filename.replace(/\.[^.]+$/, '').toLowerCase()
  if (SUMMARY_FILES[stem]) return SUMMARY_FILES[stem]
  const folder = parts[0]
  return TYPE_FOLDERS[folder] ?? null
}

export function daysForType(catalog: SatelliteCatalog, type: SatelliteType): string[] {
  return catalog[type].days.map((item) => item.date)
}

export function itemById(
  catalog: SatelliteCatalog,
  type: SatelliteType,
  id: string
): { url: string; label: string } | null {
  const bucket = catalog[type]
  if (id === 'summary') {
    if (!bucket.summary) return null
    return { url: bucket.summary.url, label: bucket.summary.label }
  }
  const day = bucket.days.find((item) => item.date === id)
  if (!day) return null
  return { url: day.url, label: day.date }
}

export function imageDayCount(catalog: SatelliteCatalog, type: SatelliteType): number {
  return catalog[type].days.length
}

export function latestDay(catalog: SatelliteCatalog, type: SatelliteType): string | null {
  const days = daysForType(catalog, type)
  return days.length ? days[days.length - 1] : null
}

export const SATELLITE_TYPES: { key: SatelliteType; label: string }[] = [
  { key: 'drought', label: '干旱' },
  { key: 'heat', label: '高温' },
  { key: 'rain', label: '暴雨' },
  { key: 'wind', label: '大风' }
]

export const EMPTY_CATALOG: SatelliteCatalog = {
  drought: { summary: null, days: [] },
  heat: { summary: null, days: [] },
  rain: { summary: null, days: [] },
  wind: { summary: null, days: [] }
}
