// src/stores/user.ts
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import http from '@/utils/http'

// 定义用户信息的接口
interface UserInfo {
  id?: number
  name?: string
  phone?: string
  // role?: 'admin' | 'user' // 明确角色类型
}

// 创建Store实例
export const useUserStore = defineStore('user', () => {
  // 从 localStorage 初始化 token 和 userInfo
  const token = ref<string>(localStorage.getItem('token') || '')
  const userInfo = ref<UserInfo>(JSON.parse(localStorage.getItem('userInfo') || '{}')) // 必须将对象字符串化

  // 计算属性：是否已登录
  const isLogged = computed(() => !!token.value) // 初始化为false

  // 登录 API
  async function loginApi(phone: string, password: string) {
    // 使用封装的 http（会自动加 baseURL 和 token header）
    const res = await http.post('/api/login', { phone, password }) // 调用真实 API

    if (res.data && res.data.token) {
      token.value = res.data.token // 使用服务器返回的 token
      userInfo.value = res.data.user // 保存完整的用户信息，包含 role

      // 将 token 和 userInfo 持久化到 localStorage
      localStorage.setItem('token', token.value)
      localStorage.setItem('userInfo', JSON.stringify(userInfo.value))
    }

    return res.data
  }

  // 登出
  function logout() {
    token.value = ''
    userInfo.value = {}

    // 清除 localStorage 中的所有相关信息
    localStorage.removeItem('token')
    localStorage.removeItem('userInfo')
  }
  // 返回所有 state 和 actions
  return { token, userInfo, isLogged, loginApi, logout }
})
