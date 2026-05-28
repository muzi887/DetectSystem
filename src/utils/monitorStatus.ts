export type MonitorStatus = 'normal' | 'warning' | 'critical' | string

const STATUS_LABELS: Record<string, string> = {
  normal: '正常',
  warning: '预警',
  critical: '严重',
  unknown: '未知'
}

const STATUS_COLORS: Record<string, string> = {
  normal: '#52c41a',
  warning: '#fa8c16',
  critical: '#cf1322',
  unknown: '#1890ff'
}

export function getMonitorStatusLabel(status?: string): string {
  if (!status) return STATUS_LABELS.unknown
  return STATUS_LABELS[status] ?? status
}

export function getMonitorStatusColor(status?: string): string {
  if (!status) return STATUS_COLORS.unknown
  return STATUS_COLORS[status] ?? STATUS_COLORS.unknown
}
