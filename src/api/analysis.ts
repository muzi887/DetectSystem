// src / api / analysis.ts
import http from '@/utils/http'

// 定义分析请求需要携带的数据类型
interface AnalysisData {
  file: File
  cropType: string
  category: string
  additionalInfo?: string
}

/**
 * 上传图片并进行分析的 API 函数
 * @param data 包含图片文件和其他表单数据的对象
 * @returns Promise，包含后端的分析结果
 */
export const analyzeImage = (data: AnalysisData) => {
  // 1. 创建一个 FormData 对象，这是上传文件的标准做法
  const formData = new FormData()

  // 2. 将所有数据逐一添加到 FormData 中
  formData.append('file', data.file) // 'file' 是和后端约定好的字段名
  formData.append('cropType', data.cropType)
  formData.append('category', data.category)
  if (data.additionalInfo) {
    formData.append('additionalInfo', data.additionalInfo)
  }

  // 3. 发起 POST 请求
  // 注意：URL是 '/analysis/image'，它会自动与 http.ts 中的 baseURL: '/api' 拼接
  // 最终请求的地址是 /api/analysis/image
  // 让 axios 自动处理 Header
  return http.post('/analysis/image', formData)
}
