import { computed, ref } from 'vue'
import { defineStore } from 'pinia'
import http from '@/utils/http'
import { deriveMonitorStatus } from '@/utils/monitorStatus'
import {
  DEFAULT_MONITOR_REGION,
  type MonitorRegionId
} from '@/constants/monitorRegions'

export type AlertLevel = 'low' | 'medium' | 'high' | 'critical' | 'warning'

export interface Alert {
  id: number
  pointId: number
  fieldId?: string | null
  level: AlertLevel
  message: string
  time: number
  handled: boolean
  source?: 'manual' | 'auto'
  ruleId?: string
  chain?: 'env' | 'extreme' | 'pest'
  draft?: boolean
}

export type CreateAlertPayload = Omit<Alert, 'id'>

export interface WeatherReading {
  id: number
  pointId: number
  updatedAt: string
  soilVwc: number
  soilTemp10cm: number
  soilEc: number
  airTemp: number
  airRh: number
  windSpeed: number
  windDirection: number
  windDirectionText: string
  pressure: number
  hourlyRain: number
}

export const useDataStore = defineStore('data', () => {
  const monitorPoints = ref<Array<any>>([])
  const alerts = ref<Array<any>>([])
  const weatherReadings = ref<WeatherReading[]>([])
  const selectedRegion = ref<MonitorRegionId>(DEFAULT_MONITOR_REGION)
  const loadingPoints = ref(false)
  const loadingAlerts = ref(false)
  const loadingWeather = ref(false)

  const regionPointIds = computed(() => {
    const ids = new Set<number>()
    for (const point of monitorPoints.value) {
      if (point.region === selectedRegion.value) ids.add(point.id)
    }
    return ids
  })

  const filteredMonitorPoints = computed(() =>
    monitorPoints.value.filter((point) => point.region === selectedRegion.value)
  )

  const filteredAlerts = computed(() =>
    alerts.value.filter(
      (alert) => regionPointIds.value.has(alert.pointId) && alert.draft !== true
    )
  )

  const unhandledAlerts = computed(() =>
    filteredAlerts.value.filter((alert) => !alert.handled)
  )

  function setSelectedRegion(region: MonitorRegionId) {
    selectedRegion.value = region
  }

  async function fetchMonitorPoints() {
    loadingPoints.value = true
    try {
      const res = await http.get('/monitorPoints')
      const rawData = res.data || []

      monitorPoints.value = rawData
        .filter((item: any) => item.id && item.status)
        .map((item: any) => {
          let fixedTemp = parseFloat(item.temp)
          const fixedMoisture = parseFloat(item.soilMoisture)
          const status = deriveMonitorStatus({
            status: item.status,
            temp: fixedTemp,
            soilMoisture: fixedMoisture,
            online: item.online,
            maintenance: item.maintenance
          })

          if (!Number.isFinite(fixedTemp) || fixedTemp < -50 || fixedTemp > 100) {
            fixedTemp = 0
          }

          const calibratedLat = item.lat + 0.00001
          const calibratedLng = item.lng + 0.00001

          return {
            ...item,
            region: item.region || 'jjj',
            status,
            temp: fixedTemp.toFixed(1),
            soilMoisture: fixedMoisture.toFixed(1),
            lat: calibratedLat,
            lng: calibratedLng,
            processedTime: new Date().toLocaleString()
          }
        })
    } catch (e) {
      console.error('fetchMonitorPoints error', e)
      throw e
    } finally {
      loadingPoints.value = false
    }
  }

  async function fetchWeatherReadings() {
    loadingWeather.value = true
    try {
      const res = await http.get('/weatherReadings')
      weatherReadings.value = res.data || []
    } catch (e) {
      console.error('fetchWeatherReadings error', e)
      throw e
    } finally {
      loadingWeather.value = false
    }
  }

  function getWeatherReadingByPointId(pointId: number): WeatherReading | undefined {
    return weatherReadings.value.find((item) => item.pointId === pointId)
  }

  async function fetchAlerts(force: boolean = false) {
    void force
    loadingAlerts.value = true
    try {
      const res = await http.get('/alerts?_sort=time&_order=desc')
      alerts.value = res.data || []
    } catch (e) {
      console.error('fetchAlerts error', e)
      throw e
    } finally {
      loadingAlerts.value = false
    }
  }

  async function createAlert(alertData: Partial<Alert>) {
    const payload: CreateAlertPayload = {
      time: Date.now(),
      handled: false,
      pointId: Number(alertData.pointId || 0),
      level: (alertData.level || 'medium') as AlertLevel,
      message: String(alertData.message || ''),
      ...alertData
    }

    if (!payload.pointId || !payload.message.trim()) {
      throw new Error('pointId 和 message 为必填项')
    }

    const res = await http.post('/alerts', payload)
    await fetchAlerts()
    return res.data
  }

  async function updateAlert(
    id: number,
    updates: Partial<Pick<Alert, 'level' | 'message' | 'handled'>>
  ) {
    const res = await http.patch(`/alerts/${id}`, updates)
    await fetchAlerts()
    return res.data
  }

  async function deleteAlert(id: number) {
    await http.delete(`/alerts/${id}`)
    alerts.value = alerts.value.filter((a) => a.id !== id)
  }

  return {
    monitorPoints,
    alerts,
    weatherReadings,
    selectedRegion,
    filteredMonitorPoints,
    filteredAlerts,
    unhandledAlerts,
    loadingPoints,
    loadingAlerts,
    loadingWeather,
    setSelectedRegion,
    fetchMonitorPoints,
    fetchWeatherReadings,
    getWeatherReadingByPointId,
    fetchAlerts,
    createAlert,
    updateAlert,
    deleteAlert
  }
})
