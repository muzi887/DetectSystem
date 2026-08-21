import http from '@/utils/http'

export const evaluateAllAlerts = () => http.post('/alerts/evaluate-all')

export const evaluateExtremeEvents = () => http.post('/weather/extreme-events/evaluate')

export const fetchForecast = () => http.get('/weatherForecast')

export const fetchExtremeEvents = () => http.get('/extremeEvents')

export const fetchThresholds = (pointId: number) =>
  http.get(`/field-sensors/${pointId}/thresholds`)

export const saveThresholds = (pointId: number, body: unknown) =>
  http.put(`/field-sensors/${pointId}/thresholds`, body)
