// src/router/index.js
import type { RouteRecordRaw } from 'vue-router'
import { createRouter, createWebHistory } from 'vue-router'

// import Login from '@/pages/Login.vue'
// import Dashboard from '@/pages/Dashboard.vue'
// import Monitor from '@/pages/Monitor.vue'
// import { useUserStore } from '@/stores/user'

const Login = () => import('../views/Login.vue')
const Dashboard = () => import('../views/Dashboard.vue')
const Monitor = () => import('../views/Monitor.vue')
const Alerts = () => import('../views/Alerts.vue')

// 统一组装所有路由配置
const routes: RouteRecordRaw[] = [
  { path: '/', redirect: '/dashboard' },
  { path: '/login', component: Login, name: 'Login' },
  { path: '/dashboard', component: Dashboard, name: 'Dashboard', meta: { requireAuth: true } },
  { path: '/monitor', component: Monitor, name: 'Monitor', meta: { requireAuth: true } },
  { path: '/alerts', component: Alerts, name: 'Alerts', meta: { requiresAuth: true } }
]

// 创建路由实例
const router = createRouter({
  history: createWebHistory(),
  routes
})

//全局前置守卫
router.beforeEach((to) => {
  const token = localStorage.getItem('token')

  // 认证检查：如果为true且用户未登录，就跳转到登录页面
  if (to.meta.requireAuth && !token) {
    return { path: '/login', query: { redirect: to.fullPath } }
  }
})

// 导出路由配置
export default router
