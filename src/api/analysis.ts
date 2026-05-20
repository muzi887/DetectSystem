import http from '@/utils/http'

interface AnalysisData {
  file: File
  cropType: string
  category: string
  additionalInfo?: string
}

/** POST /api/analysis/image → Flask */
export const analyzeImage = (data: AnalysisData) => {
  const formData = new FormData()
  formData.append('file', data.file)
  formData.append('cropType', data.cropType)
  formData.append('category', data.category)
  if (data.additionalInfo) {
    formData.append('additionalInfo', data.additionalInfo)
  }
  return http.post('/analysis/image', formData)
}
