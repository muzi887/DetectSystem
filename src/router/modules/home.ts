import type { RouteRecordRaw } from 'vue-router'

export const homeRoutes: RouteRecordRaw[] = [
  {
    path: '/home',
    component: () => import('@/views/user/Home.vue'),
    name: 'Home',
    meta: { requiresAuth: true, title: '首页', requiresRole: 'cooperative' }
  },
  {
    path: '/related-data',
    component: () => import('@/views/user/RelatedData.vue'),
    name: 'RelatedData',
    meta: { requiresAuth: true, title: '相关数据', requiresRole: 'agronomist' }
  },
  {
    path: '/about',
    component: () => import('@/views/user/About.vue'),
    name: 'About',
    meta: { requiresAuth: true, title: '关于我们', requiresRole: 'cooperative' }
  }
]
