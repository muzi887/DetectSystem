import type { RouteRecordRaw } from 'vue-router'
import { createRouter, createWebHistory } from 'vue-router'
import { useUserStore } from '@/stores/user'

const Login = () => import('../views/user/Login.vue')
const Home = () => import('../views/user/Home.vue')
const RelatedData = () => import('../views/user/RelatedData.vue')
const MapVisualization = () => import('../views/user/MapVisualization.vue')
const DataAnalysis = () => import('../views/user/DataAnalysis.vue')
const WarningSystem = () => import('../views/user/WarningSystem.vue')
const DecisionSupport = () => import('../views/user/DecisionSupport.vue')
const About = () => import('../views/user/About.vue')

const routes: RouteRecordRaw[] = [
  { path: '/', redirect: '/login' },
  {
    path: '/login',
    component: Login,
    name: 'Login',
    meta: { requireAuth: false, title: '登录' }
  },
  {
    path: '/home',
    component: Home,
    name: 'Home',
    meta: { requireAuth: true, title: '首页' }
  },
  {
    path: '/related-data',
    component: RelatedData,
    name: 'RelatedData',
    meta: { requireAuth: true, title: '相关数据' }
  },
  {
    path: '/map',
    component: MapVisualization,
    name: 'MapVisualization',
    meta: { requireAuth: true, title: '实时监测' }
  },
  {
    path: '/analysis',
    component: DataAnalysis,
    name: 'DataAnalysis',
    meta: { requireAuth: true, title: '智能分析' }
  },
  {
    path: '/warnings',
    component: WarningSystem,
    name: 'WarningSystem',
    meta: { requireAuth: true, title: '预警中心' }
  },
  {
    path: '/decision',
    component: DecisionSupport,
    name: 'DecisionSupport',
    meta: { requireAuth: true, title: '智慧决策' }
  },
  {
    path: '/about',
    component: About,
    name: 'About',
    meta: { requireAuth: true, title: '关于我们' }
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

router.beforeEach((to, _from, next) => {
  const userStore = useUserStore()
  const token = userStore.token
  const requireAuth = to.meta.requireAuth

  if (requireAuth && !token) {
    next({ name: 'Login', query: { redirect: to.fullPath } })
  } else if (to.name === 'Login' && token) {
    next({ name: 'Home' })
  } else {
    next()
  }
})

export default router
