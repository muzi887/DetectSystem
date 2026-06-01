import { computed, ref } from 'vue'
import { defineStore } from 'pinia'
import http from '@/utils/http'
import { deriveMonitorStatus } from '@/utils/monitorStatus'

export type AlertLevel = 'low' | 'medium' | 'high' | 'critical' | 'warning'

export interface Alert {
  id: number
  pointId: number
  level: AlertLevel
  message: string
  time: number
  handled: boolean
}

export type CreateAlertPayload = Omit<Alert, 'id'>

export const useDataStore = defineStore('data', () => {
  const monitorPoints = ref<Array<any>>([])
  const alerts = ref<Array<any>>([])
  const loadingPoints = ref(false)
  const loadingAlerts = ref(false)
  const unhandledAlerts = computed(() => alerts.value.filter((alert) => !alert.handled))

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
    unhandledAlerts,
    loadingPoints,
    loadingAlerts,
    fetchMonitorPoints,
    fetchAlerts,
    createAlert,
    updateAlert,
    deleteAlert
  }
})
