// src/router/index.ts
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
const RelatedData = () => import('../views/RelatedData.vue')

// 统一组装所有路由配置
const routes: RouteRecordRaw[] = [
  // 1. 门户风格的页面
  { path: '/', component: Login, name: 'Home' }, // 根路径是门户/登录页
  { path: '/login', component: Login, name: 'Login' }, // /login 也指向它
  {
    path: '/related-data',
    component: RelatedData,
    name: 'RelatedData',
    meta: { requireAuth: true }
  }, // 新的“相关数据”页也使用门户风格

  // 2. BasicLayout 风格的后台功能页面
  // 注意：这里的根路径 /dashboard 被改为 /admin/dashboard 或其他，以避免冲突
  // 或者，我们可以创建一个新的父路由来组织它们
  {
    path: '/admin', // 创建一个 /admin 的父路由
    redirect: '/admin/dashboard', // 默认重定向到仪表盘
    children: [
      {
        path: 'dashboard', // 路径是 /admin/dashboard
        component: Dashboard,
        name: 'Dashboard',
        meta: { requireAuth: true }
      },
      {
        path: 'monitor', // 路径是 /admin/monitor
        component: Monitor,
        name: 'Monitor',
        meta: { requireAuth: true }
      },
      {
        path: 'alerts', // 路径是 /admin/alerts
        component: Alerts,
        name: 'Alerts',
        meta: { requireAuth: true }
      }
    ]
  }
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
