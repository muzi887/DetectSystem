import catalogData from '@/assets/knowledge/treatments.json'
import type { TreatmentCatalog, TreatmentItem } from '@/types/treatment'

const catalog = catalogData as TreatmentCatalog

function resolveByLabel(label: string): TreatmentItem | null {
  const trimmed = label.trim()
  if (catalog.items[trimmed]) return catalog.items[trimmed]

  for (const item of Object.values(catalog.items)) {
    if (item.aliases?.some((alias) => trimmed === alias || trimmed.includes(alias))) {
      return item
    }
  }
  return null
}

export function getTreatment(label: string): TreatmentItem {
  return resolveByLabel(label) ?? catalog.items['健康']
}

export function parseDiseaseFromAlert(message: string): string | null {
  const aiMatch = message.match(/\[AI识别\].*?-\s*(.+?)\s*\(置信度/)
  if (aiMatch) return aiMatch[1].trim()

  for (const key of Object.keys(catalog.items)) {
    if (key !== '健康' && message.includes(key)) return key
  }
  return null
}

function appendMeasureLines(
  lines: string[],
  items: string[] | undefined,
  label: string
): void {
  if (!items?.length) return
  items.forEach((text, index) => {
    const suffix = items.length > 1 ? `${index + 1}` : ''
    lines.push(`${label}${suffix}：${text}`)
  })
}

export interface TreatmentPanel {
  key: string
  title: string
  lines: string[]
}

export function buildTreatmentPanels(item: TreatmentItem): TreatmentPanel[] {
  const panels: TreatmentPanel[] = []

  if (item.summary) {
    panels.push({ key: 'summary', title: '病害概述', lines: [item.summary] })
  }
  if (item.symptoms?.length) {
    panels.push({ key: 'symptoms', title: '典型症状', lines: item.symptoms })
  }
  if (item.measures.chemical?.length) {
    panels.push({ key: 'chemical', title: '化学防治', lines: item.measures.chemical })
  }
  if (item.measures.biological?.length) {
    panels.push({ key: 'biological', title: '生物防治', lines: item.measures.biological })
  }
  if (item.measures.agronomic?.length) {
    panels.push({ key: 'agronomic', title: '农艺措施', lines: item.measures.agronomic })
  }
  if (item.timing) {
    panels.push({ key: 'timing', title: '防治适期', lines: [item.timing] })
  }
  if (item.safety) {
    panels.push({ key: 'safety', title: '安全提示', lines: [item.safety] })
  }

  return panels
}

export function flattenTreatmentPanels(panels: TreatmentPanel[]): string[] {
  return panels.flatMap((panel) => panel.lines.map((line) => `【${panel.title}】${line}`))
}

export function buildTreatmentSuggestionLines(
  item: TreatmentItem,
  options?: { manualReview?: boolean }
): string[] {
  const lines: string[] = []

  if (options?.manualReview) {
    lines.push('【注意】置信度偏低，建议人工复核后再用药；以下仅供辅助参考。')
  }

  lines.push(`【${item.crop}·知识库】${item.summary}`)
  appendMeasureLines(lines, item.measures.chemical, '化学防治')
  appendMeasureLines(lines, item.measures.biological, '生物防治')
  appendMeasureLines(lines, item.measures.agronomic, '农艺措施')

  if (item.timing) lines.push(`防治适期：${item.timing}`)
  if (item.safety) lines.push(`安全提示：${item.safety}`)

  return lines
}

export function useTreatmentGuide() {
  return {
    disclaimer: catalog.disclaimer,
    region: catalog.region,
    catalogVersion: catalog.version,
    getTreatment,
    resolveByLabel,
    parseDiseaseFromAlert,
    buildTreatmentSuggestionLines,
    buildTreatmentPanels,
    flattenTreatmentPanels
  }
}
