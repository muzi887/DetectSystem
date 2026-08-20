import http from '@/utils/http'

interface AnalysisData {
  file: File
  cropType: string
  category: string
  additionalInfo?: string
  pointId?: number
}

export const analyzeImage = (data: AnalysisData) => {
  const formData = new FormData()
  formData.append('file', data.file)
  formData.append('cropType', data.cropType)
  formData.append('category', data.category)
  if (data.additionalInfo) {
    formData.append('additionalInfo', data.additionalInfo)
  }
  if (data.pointId != null) {
    formData.append('pointId', String(data.pointId))
  }
  return http.post('/analysis/image', formData)
}

export const fetchAnalysisRecent = (limit = 20) =>
  http.get('/analysis/recent', { params: { limit } })

export const fetchAnalysisStats = () => http.get('/analysis/stats')

export const fetchAnalysisModelInfo = () => http.get('/analysis/model-info')

export const submitAnalysisFeedback = (data: {
  file: File
  correctedLabel: string
  recordId?: number
}) => {
  const formData = new FormData()
  formData.append('file', data.file)
  formData.append('correctedLabel', data.correctedLabel)
  if (data.recordId != null) {
    formData.append('recordId', String(data.recordId))
  }
  return http.post('/analysis/feedback', formData)
}
