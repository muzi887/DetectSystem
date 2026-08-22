import axios, { type AxiosError, type AxiosRequestConfig } from 'axios'

export interface ApiResult<T = unknown> {
  code: number
  message: string
  data: T
  requestId: string
}

const API_ERROR_MESSAGES: Record<number, string> = {
  400: '请求参数不完整，请检查表单内容',
  401: '登录状态已失效，请重新进入系统',
  403: '当前角色暂无该操作权限',
  404: '接口地址不存在，请检查 Flask 服务或反向代理配置',
  500: '服务端处理失败，请稍后重试'
}

function createRequestId() {
  return `qh-${Date.now()}-${Math.random().toString(16).slice(2, 8)}`
}

function clearLocalSession() {
  localStorage.removeItem('token')
  localStorage.removeItem('userInfo')
}

const http = axios.create({
  baseURL: '/api',
  timeout: 8000
})

http.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  const requestId = createRequestId()
  config.headers = config.headers || {}
  config.headers['X-Qinghe-Request-Id'] = requestId
  ;(config as AxiosRequestConfig & { requestId?: string }).requestId = requestId

  if (token) {
    config.headers.Authorization = `Qinghe ${token}`
  }
  return config
})

http.interceptors.response.use(
  (response) => response,
  (error: AxiosError<{ message?: string }>) => {
    const status = error.response?.status || 0
    const requestId =
      (error.config as AxiosRequestConfig & { requestId?: string } | undefined)?.requestId || ''
    const message =
      error.response?.data?.message ||
      API_ERROR_MESSAGES[status] ||
      (error.code === 'ECONNABORTED' ? '接口响应超时，请检查服务是否运行' : '网络异常，请稍后重试')

    if (status === 401) {
      clearLocalSession()
      if (window.location.pathname !== '/login') {
        window.location.assign(`/login?redirect=${encodeURIComponent(window.location.pathname)}`)
      }
    }

    return Promise.reject({
      ...error,
      status,
      requestId,
      friendlyMessage: message
    })
  }
)

export default http
