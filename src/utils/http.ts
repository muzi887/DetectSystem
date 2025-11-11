// src/utils/http.ts
// HTTP客户端配置
import axios from 'axios'

// axios实例创建
const http = axios.create({
  baseURL: '/api', //所有请求都会自动加上 /api 前缀，配合开发服务器的代理配置
  timeout: 5000 //防止请求长时间挂起，5秒后自动取消
})

// 请求拦截器
http.interceptors.request.use((config) => {
  const token = localStorage.getItem('token') //自动添加token: 每次请求前检查localStorage中的token
  if (token) {
    config.headers = config.headers || {}
    config.headers.Authorization = `Bearer ${token}` //Bearer认证: 符合JWT标准的认证格式
  }
  return config
})

// 响应拦截器
http.interceptors.response.use(
  (response) => response,
  (error) => {
    // 全局错误处理
    return Promise.reject(error)
  }
)

export default http
