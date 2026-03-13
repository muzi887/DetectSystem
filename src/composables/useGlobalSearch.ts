/**
 * 全局搜索 Composable
 * 支持搜索：导航菜单、监测点、预警信息
 */
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useDataStore } from '@/stores/data'

export type SearchResultType = 'menu' | 'monitor' | 'alert'

export interface SearchResult {
  type: SearchResultType
  id: string
  title: string
  subtitle?: string
  path?: string
  query?: Record<string, string | number>
}

// 导航菜单（与路由对应，排除登录页）
const MENU_ITEMS: { path: string; title: string; keywords: string[] }[] = [
  { path: '/home', title: '首页', keywords: ['首页', 'home'] },
  { path: '/related-data', title: '相关数据', keywords: ['相关数据', '数据'] },
  { path: '/map', title: '灾害实时监测', keywords: ['灾害', '实时监测', '地图', '监测'] },
  { path: '/analysis', title: '智能分析', keywords: ['智能分析', '分析', '数据报告'] },
  { path: '/warnings', title: '灾害预警', keywords: ['灾害预警', '预警', '预警中心'] },
  { path: '/decision', title: '智慧决策', keywords: ['智慧决策', '决策', '决策支持'] },
  { path: '/about', title: '关于我们', keywords: ['关于我们', '关于'] }
]

export function useGlobalSearch() {
  const router = useRouter()
  const dataStore = useDataStore()
  const keyword = ref('')
  const visible = ref(false)

  const results = computed<SearchResult[]>(() => {
    const q = keyword.value.trim()
    if (!q) return []

    const k = q.toLowerCase()
    const list: SearchResult[] = []

    // 1. 搜索菜单
    for (const item of MENU_ITEMS) {
      const match =
        item.title.toLowerCase().includes(k) ||
        item.keywords.some((kw) => kw.toLowerCase().includes(k) || k.includes(kw.toLowerCase()))
      if (match) {
        list.push({
          type: 'menu',
          id: `menu-${item.path}`,
          title: item.title,
          path: item.path
        })
      }
    }

    // 2. 搜索监测点（需先加载数据）
    const points = dataStore.monitorPoints || []
    for (const p of points) {
      const name = (p.name || '').toString()
      if (name && name.toLowerCase().includes(k)) {
        list.push({
          type: 'monitor',
          id: `monitor-${p.id}`,
          title: name,
          subtitle: `状态: ${p.status || '-'}`,
          path: '/map',
          query: { highlight: p.id }
        })
      }
    }

    // 3. 搜索预警信息
    const alerts = dataStore.alerts || []
    const pointMap = new Map(points.map((p: any) => [p.id, p]))
    for (const a of alerts) {
      const msg = (a.message || '').toString()
      const pointName = pointMap.get(a.pointId)?.name || `监测点#${a.pointId}`
      if (msg.toLowerCase().includes(k) || pointName.toLowerCase().includes(k)) {
        list.push({
          type: 'alert',
          id: `alert-${a.id}`,
          title: msg.length > 40 ? msg.slice(0, 40) + '...' : msg,
          subtitle: pointName,
          path: '/warnings',
          query: { highlight: a.id }
        })
      }
    }

    return list
  })

  function open() {
    visible.value = true
  }

  function close() {
    visible.value = false
  }

  async function ensureData() {
    if (!dataStore.monitorPoints?.length) await dataStore.fetchMonitorPoints().catch(() => {})
    if (!dataStore.alerts?.length && !dataStore.loadingAlerts) await dataStore.fetchAlerts().catch(() => {})
  }

  function search(value: string) {
    keyword.value = value
    if (value.trim()) {
      visible.value = true
      ensureData()
    } else {
      visible.value = false
    }
  }

  function selectResult(result: SearchResult) {
    if (result.path) {
      router.push({ path: result.path, query: result.query })
    }
    close()
    keyword.value = ''
  }

  return {
    keyword,
    visible,
    results,
    search,
    selectResult,
    open,
    close,
    ensureData
  }
}
