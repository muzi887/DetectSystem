import catalogData from '@/assets/knowledge/treatments.json'
import type { TreatmentCatalog } from '@/types/treatment'

const catalog = catalogData as TreatmentCatalog

export const HIDDEN_DISEASE_LABELS = new Set([
  '桃缩叶病',
  '桃疮痂病',
  '桃褐腐病',
  '桃细菌性穿孔病',
  '苹果轮纹病',
  '苹果腐烂病',
  '苹果疮痂病'
])

export function canonicalizeDiseaseLabel(label: string): string | null {
  const raw = label.trim()
  if (!raw || HIDDEN_DISEASE_LABELS.has(raw)) return null
  if (catalog.items[raw]) return raw
  for (const [key, item] of Object.entries(catalog.items)) {
    if (item.aliases?.includes(raw)) return key
  }
  return raw
}
