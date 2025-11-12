// src/stores/data.ts
// 统一管理监测点和预警数据。
import { ref } from 'vue'
import { defineStore } from 'pinia'
import http from '@/utils/http'

// 类型定义
// 定义预警级别
export type AlertLevel = 'low' | 'medium' | 'high' | 'critical'

// 定义预警数据结构
export interface Alert {
  id: number // 服务端分配的ID
  pointId: number // 关联的监测点ID
  level: AlertLevel // 预警级别
  message: string // 预警信息
  time: number // 预警时间戳
  handled: boolean // 是否已处理
}
// Omit<Alert, 'id'> ：一个和 Alert 类型一样的对象，但是省略掉 id 字段
export type CreateAlertPayload = Omit<Alert, 'id'>

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

  // 创建预警
  // 接收调用者传来的一些预警信息（alertData），然后补全一些默认字段（如 time 和 handled），
  // 最后把完整的预警数据包（payload）发送给服务器。
  async function createAlert(alertData: Partial<Alert>) {
    console.log(' 创建预警请求:', alertData)

    // id 由服务器（或者数据库）在保存这条数据后自动生成并返回
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
