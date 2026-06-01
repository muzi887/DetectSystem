import type { AlertLevel } from '@/stores/data'

const alertLevelColors: Record<AlertLevel, string> = {
  low: 'blue',
  medium: 'orange',
  high: 'red',
  warning: 'gold',
  critical: '#a70000'
}

const alertLevelText: Record<AlertLevel, string> = {
  low: '低',
  medium: '中',
  high: '高',
  warning: '警告',
  critical: '危急'
}

export function normalizeAlertLevel(level?: string): AlertLevel {
  if (level && level in alertLevelText) {
    return level as AlertLevel
  }
  return 'medium'
}

export function getAlertLevelColor(level?: string) {
  return alertLevelColors[normalizeAlertLevel(level)]
}

export function getAlertLevelText(level?: string) {
  return alertLevelText[normalizeAlertLevel(level)]
}

export function getAlertLevelClass(level?: string) {
  return `level-${normalizeAlertLevel(level)}`
}
