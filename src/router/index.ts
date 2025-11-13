// src/router/index.ts
import type { RouteRecordRaw } from 'vue-router'
import { createRouter, createWebHistory } from 'vue-router'
// 引入 useUserStore 以便在守卫中使用
import { useUserStore } from '@/stores/user'

// =========================================================
// 普通用户/7大核心功能组件的动态导入
// =========================================================
// 1. 首页 -> 登录
const Home = () => import('../views/user/Home.vue')
// 2. 相关数据 -> 决策建议
const RelatedData = () => import('../views/user/RelatedData.vue')
// 3. 灾害实时监测 -> 地图可视化
const MapVisualization = () => import('../views/user/MapVisualization.vue')
// 4. 智能数据分析 -> 数据报告
const DataAnalysis = () => import('../views/user/DataAnalysis.vue')
// 5. 灾害预警系统 -> 预警中心
const WarningSystem = () => import('../views/user/WarningSystem.vue')
// 6. 智慧决策支持 -> 决策建议
const DecisionSupport = () => import('../views/user/DecisionSupport.vue')
// 7. 关于我们 -> 青禾智匠
const About = () => import('../views/user/About.vue')

// 统一组装所有路由配置
const routes: RouteRecordRaw[] = [
  { path: '/', redirect: '/home' }, // 默认根路径
  {
    path: '/home', // 对应：1. 首页
    component: Home,
    name: 'Home',
    meta: { requireAuth: false, title: '首页' }
  },
  {
    path: '/related-data', // 对应：2.相关数据
    component: RelatedData,
    name: 'RelatedData',
    meta: { requireAuth: true, title: '相关数据' }
  },
  {
    path: '/map', // 对应：3. 灾害实时监测
    component: MapVisualization,
    name: 'MapVisualization',
    meta: { requireAuth: true, title: '实时监测' }
  },
  {
    path: '/analysis', // 对应：4. 智能数据分析
    component: DataAnalysis,
    name: 'DataAnalysis',
    meta: { requireAuth: true, title: '智能分析' }
  },
  {
    path: '/warnings', // 对应：5. 灾害预警系统
    component: WarningSystem,
    name: 'WarningSystem',
    meta: { requireAuth: true, title: '预警中心' }
  },
  {
    path: '/decision', // 对应：6. 智慧决策支持
    component: DecisionSupport,
    name: 'DecisionSupport',
    meta: { requireAuth: true, title: '智慧决策' }
  },
  {
    path: '/about', // 对应：7. 关于我们
    component: About,
    name: 'About',
    meta: { requireAuth: true, title: '关于我们' }
  }

  // 捕获所有未匹配的路由
  // { path: '/:pathMatch(.*)*', name: 'NotFound', component: () => import('../views/NotFound.vue') }
]

// =========================================================
// 创建路由实例
// =========================================================
const router = createRouter({
  history: createWebHistory(),
  routes
})

// =========================================================
// 全局前置守卫（仅检查是否已登录，针对 Pinia ref 的正确用法）
// =========================================================
router.beforeEach((to) => {
  // 从 pinia store 获取 token / role
  const userStore = useUserStore()

  // userStore.token 是 pinia 的 ref，必须读 .value（防止把 ref 本身当成真值）
  const tokenRef = (userStore as any).token
  const token = tokenRef ? tokenRef.value : ''

  // 认证检查：如果路由需要认证（meta.requireAuth为true），但用户未登录（没有token），
  // 就强制跳转到登录页面。
  const requireAuth = Boolean((to.meta as any)?.requireAuth)
  if (requireAuth && !token) {
    return { name: 'Home', replace: true }
  }

  // 如果所有检查都通过，则允许导航，默认放行
})

// 导出路由配置
export default router
