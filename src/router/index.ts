import type { RouteRecordRaw } from 'vue-router'
import { createRouter, createWebHistory } from 'vue-router'
import { useUserStore } from '@/stores/user'
import { alertRoutes } from './modules/alert'
import { homeRoutes } from './modules/home'
import { monitorRoutes } from './modules/monitor'

const Login = () => import('../views/user/Login.vue')

declare module 'vue-router' {
  interface RouteMeta {
    requiresAuth?: boolean
    requiresRole?: 'admin' | 'agronomist' | 'cooperative'
    title?: string
  }
}

const routes: RouteRecordRaw[] = [
  { path: '/', redirect: '/login' },
  {
    path: '/login',
    component: Login,
    name: 'Login',
    meta: { requiresAuth: false, title: '登录' }
  },
  ...homeRoutes,
  ...monitorRoutes,
  ...alertRoutes
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

router.beforeEach((to, _from, next) => {
  const userStore = useUserStore()
  const requiresAuth = to.meta.requiresAuth
  const requiredRole = to.meta.requiresRole
  const userRole = userStore.userInfo?.role

  if (requiresAuth && !userStore.isLogged) {
    next({ name: 'Login', query: { redirect: to.fullPath } })
  } else if (to.name === 'Login' && userStore.isLogged) {
    next({ name: 'Home' })
  } else if (requiredRole && !userStore.canEnter(requiredRole)) {
    next({ name: userRole === 'cooperative' ? 'Home' : 'MapVisualization' })
  } else {
    next()
  }
})

export default router
