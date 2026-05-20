/** 登录态：token / userInfo 持久化到 localStorage */
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import http from '@/utils/http'

interface UserInfo {
  id?: number
  name?: string
  phone?: string
  role?: string
}

export const useUserStore = defineStore('user', () => {
  const token = ref<string>(localStorage.getItem('token') || '')
  const userInfo = ref<UserInfo>(JSON.parse(localStorage.getItem('userInfo') || '{}'))

  const isLogged = computed(() => !!token.value)

  async function loginApi(phone: string, password: string) {
    const res = await http.post('/login', { phone, password })

    if (res.data?.token) {
      token.value = res.data.token
      userInfo.value = res.data.user
      localStorage.setItem('token', token.value)
      localStorage.setItem('userInfo', JSON.stringify(userInfo.value))
    }

    return res.data
  }

  function logout() {
    token.value = ''
    userInfo.value = {}
    localStorage.removeItem('token')
    localStorage.removeItem('userInfo')
  }

  return { token, userInfo, isLogged, loginApi, logout }
})
