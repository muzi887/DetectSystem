import type { RouteRecordRaw } from 'vue-router'

export const alertRoutes: RouteRecordRaw[] = [
  {
    path: '/warnings',
    component: () => import('@/views/user/WarningSystem.vue'),
    name: 'WarningSystem',
    meta: { requiresAuth: true, title: '预警中心', requiresRole: 'agronomist' }
  },
  {
    path: '/decision',
    component: () => import('@/views/user/DecisionSupport.vue'),
    name: 'DecisionSupport',
    meta: { requiresAuth: true, title: '智慧决策', requiresRole: 'agronomist' }
  }
]
