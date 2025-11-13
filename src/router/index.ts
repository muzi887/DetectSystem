// src/router/index.ts
import type { RouteRecordRaw } from 'vue-router'
import { createRouter, createWebHistory } from 'vue-router'
// 引入 useUserStore 以便在守卫中使用
import { useUserStore } from '@/stores/user'

// =========================================================
// 普通用户/7大核心功能组件的动态导入
// =========================================================
// 0. 登录
const Login = () => import('../views/user/Login.vue')
// 1. 首页 ->
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
  { path: '/', redirect: '/login' }, // 默认根路径
  {
    path: '/login', // 对应：0. 登录
    component: Login,
    name: 'Login',
    meta: { requireAuth: false, title: '登录' }
  },
  {
    path: '/home', // 对应：1. 首页
    component: Home,
    name: 'Home',
    meta: { requireAuth: true, title: '首页' }
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
router.beforeEach((to, from, next) => {
  // 从 pinia store 获取 token / role
  const userStore = useUserStore()

  // userStore.token 是 pinia 的 ref，必须读 .value（防止把 ref 本身当成真值）
  // 直接从 store 的 state 中读取 token
  // Pinia 会自动处理 ref 的解包，不需要也不应该使用 .value
  const token = userStore.token

  // 判断目标路由是否需要认证（meta.requireAuth为true）
  const requireAuth = to.meta.requireAuth
  if (requireAuth && !token) {
    // 如果需要认证但没有 token，重定向到登录页
    // 并将用户想去的页面路径作为查询参数，以便登录后能跳回去
    next({
      name: 'Login',
      query: { redirect: to.fullPath }
    })
  } else if (to.name === 'Login' && token) {
    // 如果用户已经登录，但又访问了登录页，直接让他去首页
    next({ name: 'Home' })
  } else {
    // 其他所有情况，正常放行
    next()
  }
})

// 导出路由配置
export default router
