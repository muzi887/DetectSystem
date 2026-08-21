import http from '@/utils/http'

export const evaluateAllAlerts = () => http.post('/alerts/evaluate-all')

export const fetchThresholds = (pointId: number) =>
  http.get(`/field-sensors/${pointId}/thresholds`)

export const saveThresholds = (pointId: number, body: unknown) =>
  http.put(`/field-sensors/${pointId}/thresholds`, body)
