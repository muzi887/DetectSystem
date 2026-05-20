/** axios 实例：baseURL /api，请求头附带 token */
import axios from 'axios'

const http = axios.create({
  baseURL: '/api',
  timeout: 5000
})

http.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers = config.headers || {}
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

http.interceptors.response.use(
  (response) => response,
  (error) => Promise.reject(error)
)

export default http
