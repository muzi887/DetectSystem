import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import http from '@/utils/http'

export type FarmUserRole = 'admin' | 'agronomist' | 'cooperative'

interface UserInfo {
  id?: number
  name?: string
  phone?: string
  role?: FarmUserRole
}

export interface FarmLoginPayload {
  phone: string
  verificationCode: string
  role: FarmUserRole
  password?: string
}

const ROLE_LEVEL: Record<FarmUserRole, number> = {
  cooperative: 1,
  agronomist: 2,
  admin: 3
}

function normalizeFarmRole(role?: string): FarmUserRole {
  if (role === 'admin' || role === 'agronomist' || role === 'cooperative') return role
  return role === 'user' ? 'cooperative' : 'agronomist'
}

export const useUserStore = defineStore('user', () => {
  const token = ref<string>(localStorage.getItem('token') || '')
  const savedUserInfo = JSON.parse(localStorage.getItem('userInfo') || '{}')
  const userInfo = ref<UserInfo>({
    ...savedUserInfo,
    role: savedUserInfo.role ? normalizeFarmRole(savedUserInfo.role) : undefined
  })

  const isLogged = computed(() => !!token.value)
  const roleLabel = computed(() => {
    const labels: Record<FarmUserRole, string> = {
      admin: '管理员',
      agronomist: '农技员',
      cooperative: '合作社'
    }
    return userInfo.value.role ? labels[userInfo.value.role] : '未登录'
  })

  async function loginApi(payload: FarmLoginPayload) {
    const res = await http.post('/login', {
      phone: payload.phone,
      code: payload.verificationCode,
      role: payload.role,
      password: payload.password
    })

    if (res.data?.token) {
      token.value = res.data.token
      userInfo.value = {
        ...res.data.user,
        role: normalizeFarmRole(res.data.user?.role)
      }
      localStorage.setItem('token', token.value)
      localStorage.setItem('userInfo', JSON.stringify(userInfo.value))
    }

    return res.data
  }

  function canEnter(requiredRole: FarmUserRole) {
    const role = normalizeFarmRole(userInfo.value.role)
    return ROLE_LEVEL[role] >= ROLE_LEVEL[requiredRole]
  }

  function logout() {
    token.value = ''
    userInfo.value = {}
    localStorage.removeItem('token')
    localStorage.removeItem('userInfo')
  }

  return { token, userInfo, isLogged, roleLabel, loginApi, canEnter, logout }
})
