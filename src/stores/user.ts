// src/stores/user.ts
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import axios from 'axios'
import http from '@/utils/http'

// 定义用户信息的接口
interface UserInfo {
  id?: number
  name?: string
  phone?: string
  role?: 'admin' | 'user' // 明确角色类型
}

// 创建Store实例
export const useUserStore = defineStore('user', () => {
  // 1. 从 localStorage 初始化 token 和 userInfo
  const token = ref<string>(localStorage.getItem('token') || '')
  // 用户信息也需要从 localStorage 加载，防止刷新丢失角色信息
  const userInfo = ref<{ name?: string; phone?: string }>({})

  // 2. 计算属性
  const isLogged = computed(() => !!token.value) // 初始化为false
  const userRole = computed(() => userInfo.value.role) // 获取角色

  //模拟登录
  // async function loginMock(phone: string, password: string) {
  //   //模拟网络延迟
  //   await new Promise((r) => setTimeout(r, 400))
  //   token.value = 'mock-token-' + Date.now()
  //   userInfo.value = { name: ' 测试用户', phone } //登录成功后isLogged变为true
  //   localStorage.setItem('token', token.value) // 持久化
  //   return { success: true }
  // }

  // 登录 API
  async function loginApi(phone: string, password: string) {
    const res = await axios.post('/api/login', { phone, password }) // 调用真实 API

    if (res.data && res.data.token) {
      token.value = res.data.token // 使用服务器返回的 token
      userInfo.value = res.data.user // 保存完整的用户信息，包含 role

      // 3. 将 token 和 userInfo 持久化到 localStorage
      localStorage.setItem('token', token.value)
      localStorage.setItem('userInfo', JSON.stringify(userInfo.value)) // 必须将对象字符串化
    }

    return res.data
  }

  function logout() {
    token.value = ''
    userInfo.value = {}

    // 4. 退出登录时，清除 localStorage 中的所有相关信息
    localStorage.removeItem('token')
    localStorage.removeItem('userInfo')
  }
  // 5. 返回所有 state 和 actions，新增了 userRole
  return { token, userInfo, isLogged, userRole, loginApi, logout }
})
