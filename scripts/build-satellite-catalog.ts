import { mkdirSync, readdirSync, statSync, writeFileSync } from 'node:fs'
import { basename, join, relative } from 'node:path'
import { fileURLToPath } from 'node:url'
import {
  EMPTY_CATALOG,
  parseThematicName,
  typeFromRelPath,
  type SatelliteCatalog
} from '../src/utils/satelliteThematic.ts'

const root = fileURLToPath(new URL('..', import.meta.url))
const mapsRoot = join(root, 'docs', '出图')
const year = 2025

function walk(dir: string, acc: string[] = []): string[] {
  for (const name of readdirSync(dir)) {
    const full = join(dir, name)
    const st = statSync(full)
    if (st.isDirectory()) walk(full, acc)
    else if (name.toLowerCase().endsWith('.jpg')) acc.push(full)
  }
  return acc
}

function toUrl(rel: string) {
  return `/satellite-maps/${rel.split('/').map(encodeURIComponent).join('/')}`
}

function emptyCatalog(): SatelliteCatalog {
  return JSON.parse(JSON.stringify(EMPTY_CATALOG)) as SatelliteCatalog
}

const catalog = emptyCatalog()
for (const abs of walk(mapsRoot)) {
  const rel = relative(mapsRoot, abs).replaceAll('\\', '/')
  const type = typeFromRelPath(rel)
  const parsed = parseThematicName(basename(abs), year)
  if (!type || !parsed) continue
  const url = toUrl(rel)
  if (parsed.kind === 'summary') {
    catalog[type].summary = { id: 'summary', label: '1–8 月汇总', url }
    continue
  }
  const days = catalog[type].days.filter((item) => item.date !== parsed.date)
  days.push({ date: parsed.date, url })
  catalog[type].days = days.sort((a, b) => a.date.localeCompare(b.date))
}

const outDir = join(root, 'public', 'satellite')
mkdirSync(outDir, { recursive: true })
const outFile = join(outDir, 'catalog.json')
writeFileSync(outFile, `${JSON.stringify(catalog, null, 2)}\n`, 'utf8')
const counts = Object.fromEntries(
  Object.entries(catalog).map(([key, bucket]) => [key, bucket.days.length])
)
console.log('wrote', outFile, counts)
