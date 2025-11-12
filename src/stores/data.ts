// src/stores/data.ts
// 统一管理监测点和预警数据。
import { ref } from 'vue'
import { defineStore } from 'pinia'
import http from '@/utils/http'

export const useDataStore = defineStore('data', () => {
  const monitorPoints = ref<Array<any>>([])
  const alerts = ref<Array<any>>([])
  const loadingPoints = ref(false)
  const loadingAlerts = ref(false)

  // 获取数据
  async function fetchMonitorPoints() {
    loadingPoints.value = true
    try {
      const res = await http.get('/monitorPoints')
      monitorPoints.value = res.data || []
    } catch (e) {
      console.error('fetchMonitorPoints error', e)
      throw e
    } finally {
      loadingPoints.value = false
    }
  }

  // force 参数（兼容外部调用）
  async function fetchAlerts(force: boolean = false) {
    // 目前没有本地缓存策略；force 参数为了兼容调用方
    loadingAlerts.value = true
    try {
      const res = await http.get('/alerts?_sort=time&_order=desc')
      alerts.value = res.data || []
    } catch (e) {
      console.error('fetchAlerts error', e)
      throw e
    } finally {
      loadingAlerts.value = false // 关闭加载状态
    }
  }

  // 创建预警 - 核心功能！
  async function createAlert(alertData: Partial<Alert>) {
    console.log(' 创建预警请求:', alertData)

    const payload: Alert = {
      time: Date.now(),
      handled: false,
      // 强制保证 pointId/level/message 等字段存在（调用者应传好）
      pointId: Number(alertData.pointId || 0),
      level: (alertData.level || 'medium') as AlertLevel,
      message: String(alertData.message || ''),
      ...alertData
    }

    if (!payload.pointId || !payload.message.trim()) {
      throw new Error('pointId 和 message 为必填项')
    }

    const res = await http.post('/alerts', payload)

    console.log(' 创建预警响应:', res.data)

    //  刷新列表（也可以改为乐观更新）
    await fetchAlerts()

    return res.data
  }

  // 更新预警状态
  async function updateAlert(
    id: number,
    updates: Partial<Pick<Alert, 'level' | 'message' | 'handled'>>
  ) {
    const res = await http.patch(`/alerts/${id}`, updates)
    // 刷新列表
    await fetchAlerts()
    return res.data
  }

  // 删除预警
  async function deleteAlert(id: number) {
    await http.delete(`/alerts/${id}`)
    // 本地删除（避免额外请求）
    alerts.value = alerts.value.filter((a) => a.id !== id)
  }

  return {
    monitorPoints,
    alerts,
    loadingPoints,
    loadingAlerts,
    fetchMonitorPoints,
    fetchAlerts,
    createAlert,
    updateAlert,
    deleteAlert
  }
})
