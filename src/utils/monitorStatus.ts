export type MonitorStatus =
  | 'normal'
  | 'warning'
  | 'critical'
  | 'offline'
  | 'maintenance'
  | 'unknown'

export interface MonitorStatusMeta {
  label: string
  color: string
  priority: number
  description: string
  next: MonitorStatus[]
}

export interface MonitorStatusInput {
  status?: string
  temp?: number | string | null
  soilMoisture?: number | string | null
  online?: boolean
  maintenance?: boolean
}

export const MONITOR_STATUS_META: Record<MonitorStatus, MonitorStatusMeta> = {
  normal: {
    label: '正常',
    color: '#52c41a',
    priority: 1,
    description: '监测值处于演示阈值范围内，可按常规频率巡检。',
    next: ['warning', 'offline', 'maintenance']
  },
  warning: {
    label: '预警',
    color: '#fa8c16',
    priority: 2,
    description: '监测值接近或越过警戒线，需要持续关注。',
    next: ['normal', 'critical', 'offline', 'maintenance']
  },
  critical: {
    label: '严重',
    color: '#cf1322',
    priority: 3,
    description: '监测值达到危险区间，应优先处置并复核现场情况。',
    next: ['warning', 'normal', 'offline', 'maintenance']
  },
  offline: {
    label: '离线',
    color: '#8c8c8c',
    priority: 4,
    description: '监测点无有效数据或设备连接异常，需先恢复数据链路。',
    next: ['normal', 'warning', 'maintenance']
  },
  maintenance: {
    label: '维护中',
    color: '#722ed1',
    priority: 0,
    description: '设备处于人工维护或演示调试状态，不参与风险排序。',
    next: ['normal', 'offline']
  },
  unknown: {
    label: '未知',
    color: '#1890ff',
    priority: -1,
    description: '状态字段缺失或未识别，按未知状态展示。',
    next: ['normal', 'warning', 'offline']
  }
}

export const MONITOR_STATUS_ORDER: MonitorStatus[] = [
  'unknown',
  'maintenance',
  'normal',
  'warning',
  'critical',
  'offline'
]

function toNumber(value: number | string | null | undefined) {
  const n = Number(value)
  return Number.isFinite(n) ? n : null
}

export function normalizeMonitorStatus(status?: string): MonitorStatus {
  if (status && status in MONITOR_STATUS_META) {
    return status as MonitorStatus
  }
  return 'unknown'
}

export function getMonitorStatusMeta(status?: string) {
  return MONITOR_STATUS_META[normalizeMonitorStatus(status)]
}

export function getMonitorStatusLabel(status?: string): string {
  return getMonitorStatusMeta(status).label
}

export function getMonitorStatusColor(status?: string): string {
  return getMonitorStatusMeta(status).color
}

export function getMonitorStatusDescription(status?: string): string {
  return getMonitorStatusMeta(status).description
}

export function getNextMonitorStatuses(status?: string): MonitorStatus[] {
  return getMonitorStatusMeta(status).next
}

export function canTransitionMonitorStatus(from?: string, to?: string) {
  const nextStatus = normalizeMonitorStatus(to)
  return getNextMonitorStatuses(from).includes(nextStatus)
}

export function compareMonitorStatus(a?: string, b?: string) {
  return getMonitorStatusMeta(a).priority - getMonitorStatusMeta(b).priority
}

export function getWorstMonitorStatus(statuses: Array<string | undefined>) {
  return statuses
    .map(normalizeMonitorStatus)
    .sort((a, b) => compareMonitorStatus(b, a))[0] || 'unknown'
}

export function deriveMonitorStatus(input: MonitorStatusInput): MonitorStatus {
  if (input.maintenance) return 'maintenance'
  if (input.online === false) return 'offline'

  const current = normalizeMonitorStatus(input.status)
  const temp = toNumber(input.temp)
  const soilMoisture = toNumber(input.soilMoisture)

  if (temp === null || soilMoisture === null || temp < -50 || temp > 100) {
    return 'offline'
  }

  if (temp >= 38 || soilMoisture <= 10) {
    return 'critical'
  }

  if (temp >= 32 || soilMoisture <= 20 || soilMoisture >= 80) {
    return 'warning'
  }

  return current === 'unknown' || current === 'offline' ? 'normal' : current
}
