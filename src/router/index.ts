// src/router/index.ts
import type { RouteRecordRaw } from 'vue-router'
import { createRouter, createWebHistory } from 'vue-router'
// 1. 引入 useUserStore 以便在守卫中使用
import { useUserStore } from '@/stores/user'

// =========================================================
// 1. 现有组件的动态导入 (Admin/Portal)
// =========================================================
// const Login = () => import('../views/Login.vue')
// const Dashboard = () => import('../views/Dashboard.vue')
// const Monitor = () => import('../views/Monitor.vue')
// const Alerts = () => import('../views/Alerts.vue')
// const RelatedData = () => import('../views/RelatedData.vue')

// =========================================================
// 2. 普通用户/7大核心功能：组件的动态导入
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
  { path: '/', component: Home, name: 'Home' }, // 默认根路径
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

  // =========================================================
  // C. BasicLayout 风格的后台功能页面 (Admin 专属)
  // 原有的 dashboard, monitor, alerts 归类到此，仅供管理员使用
  // =========================================================
  // {
  //   path: '/admin', // 创建一个 /admin 的父路由
  //   redirect: '/admin/dashboard', // 默认重定向到管理员仪表盘
  //   meta: { requireAuth: true, role: 'admin' }, // 通过 meta.role 来实现更细致的权限控制
  //   children: [
  //     {
  //       path: 'dashboard', // 路径是 /admin/dashboard
  //       component: Dashboard,
  //       name: 'Dashboard',
  //       // meta: { requireAuth: true }
  //       meta: { title: '管理员仪表盘' }
  //     },
  //     {
  //       path: 'monitor', // 路径是 /admin/monitor
  //       component: Monitor,
  //       name: 'AdminMonitor', // 避免与普通用户的 MapVisualization 冲突，名称最好区分
  //       meta: { title: '后台监测管理' }
  //     },
  //     {
  //       path: 'alerts', // 路径是 /admin/alerts
  //       component: Alerts,
  //       name: 'AdminAlerts', // 避免与普通用户的 WarningSystem 冲突，名称最好区分
  //       meta: { title: '后台警报管理' }
  //     }
  //   ]
  // }

  // 捕获所有未匹配的路由
  // { path: '/:pathMatch(.*)*', name: 'NotFound', component: () => import('../views/NotFound.vue') }
]
// 创建路由实例
const router = createRouter({
  history: createWebHistory(),
  routes
})

//全局前置守卫
router.beforeEach((to) => {
  // 2. 在守卫函数内部获取 user store 实例
  const userStore = useUserStore()
  const token = userStore.token // 从 store 获取 token，保持单一数据源

  // 认证检查：如果路由需要认证（meta.requireAuth为true），但用户未登录（没有token），
  // 就强制跳转到登录页面。
  if (to.meta.requireAuth && !token) {
    return { path: '/login', query: { redirect: to.fullPath } }
  }

  // // 3. 权限检查：如果路由需要特定角色，但用户角色不匹配
  // const requiredRole = to.meta.role as string | undefined
  // if (requiredRole && userRole !== requiredRole) {
  //   // 如果用户角色不符合要求 (例如，普通用户尝试访问 admin 页面)
  //   // 则重定向到他们有权限的首页（这里假设是 /map）
  //   // 使用 replace: true, 用户无法通过浏览器后退按钮返回到被拒绝的页面
  //   return { path: '/map', replace: true }
  // }

  // 如果所有检查都通过，则允许导航，默认放行
})

// 导出路由配置
export default router
