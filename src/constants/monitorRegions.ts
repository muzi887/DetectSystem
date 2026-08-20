export type MonitorRegionId = 'northeast' | 'jjj'

export interface MonitorRegionOption {
  id: MonitorRegionId
  label: string
  shortLabel: string
  /** 区域默认地图中心 [lat, lng] */
  center: [number, number]
  zoom: number
}

export const MONITOR_REGIONS: MonitorRegionOption[] = [
  {
    id: 'northeast',
    label: '东北四省',
    shortLabel: '东北',
    center: [45.2, 126.5],
    zoom: 5
  },
  {
    id: 'jjj',
    label: '京津冀',
    shortLabel: '京津冀',
    center: [38.44, 115.95],
    zoom: 8
  }
]

export const DEFAULT_MONITOR_REGION: MonitorRegionId = 'northeast'

export function getMonitorRegion(id: MonitorRegionId): MonitorRegionOption {
  return MONITOR_REGIONS.find((r) => r.id === id) ?? MONITOR_REGIONS[0]
}
