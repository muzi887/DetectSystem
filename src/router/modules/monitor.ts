import type { RouteRecordRaw } from 'vue-router'

export const monitorRoutes: RouteRecordRaw[] = [
  {
    path: '/map',
    component: () => import('@/views/user/MapVisualization.vue'),
    name: 'MapVisualization',
    meta: { requiresAuth: true, title: '实时监测', requiresRole: 'agronomist' }
  },
  {
    path: '/analysis',
    component: () => import('@/views/user/DataAnalysis.vue'),
    name: 'DataAnalysis',
    meta: { requiresAuth: true, title: '智能分析', requiresRole: 'agronomist' }
  }
]
