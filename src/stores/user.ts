// src/stores/user.ts
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import axios from 'axios'
import http from '@/utils/http'

// 创建Store实例
export const useUserStore = defineStore('user', () => {
  const token = ref<string>(localStorage.getItem('token') || '')
  const userInfo = ref<{ name?: string; phone?: string }>({})
  const isLogged = computed(() => !!token.value) // 初始化为false

  //模拟登录
  // async function loginMock(phone: string, password: string) {
  //   //模拟网络延迟
  //   await new Promise((r) => setTimeout(r, 400))
  //   token.value = 'mock-token-' + Date.now()
  //   userInfo.value = { name: ' 测试用户', phone } //登录成功后isLogged变为true
  //   localStorage.setItem('token', token.value) // 持久化
  //   return { success: true }
  // }

  //备用：真实请求
  async function loginApi(phone: string, password: string) {
    const res = await axios.post('/api/login', { phone, password }) // 调用真实 API
    token.value = res.data.token // 使用服务器返回的 token
    userInfo.value = res.data.user
    localStorage.setItem('token', token.value)
    return res.data
  }

  function logout() {
    token.value = ''
    userInfo.value = {}
    localStorage.removeItem('token')
  }

  return { token, userInfo, isLogged, loginApi, logout }
})
