import http from '@/utils/http'

export const evaluateAllAlerts = () => http.post('/alerts/evaluate-all')

export const evaluateExtremeEvents = () => http.post('/weather/extreme-events/evaluate')

export const fetchForecast = (pointId?: number) =>
  http.get('/weatherForecast', { params: pointId ? { pointId } : undefined })

export const fetchExtremeEvents = () => http.get('/extremeEvents')

export const evaluatePestRisk = () => http.post('/pest-risk/evaluate')

export const fetchPestPredictions = () => http.get('/pestRiskPredictions')

export const publishAlert = (id: number) => http.post(`/alerts/${id}/publish`)

export const fetchThresholds = (pointId: number) =>
  http.get(`/field-sensors/${pointId}/thresholds`)

export const saveThresholds = (pointId: number, body: unknown) =>
  http.put(`/field-sensors/${pointId}/thresholds`, body)
