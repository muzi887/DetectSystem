# AI技术赋能下的作物灾害智慧监测预警系统 V1.0.4 源程序

## 软件基本信息

| 项目 | 内容 |
|------|------|
| 软件全称 | AI技术赋能下的作物灾害智慧监测预警系统 |
| 软件简称 | AI作物灾害监测预警系统 |
| 版本 | 1.0.4 |
| 终端类型 | Web 浏览器访问 |
| 适用方向 | 作物灾害监测、农情数据展示、预警管理、辅助决策 |
| 开发单位 | 河北地质大学 · 坤灵智巡创工队 |
| 线上地址 | http://82.157.234.123:88 |

说明：本文件由《AI技术赋能下的作物灾害智慧监测预警系统V1.0.4使用说明书》附录 D 所列模块及对应业务页面提炼，收录源文件完整代码。说明书附录 D 为节选对照，本文件为完整源码。本文件收录有效代码约 3,095 行。

## 源程序规模

本系统源程序采用 Vue 3 + TypeScript + JavaScript + Python 开发，统计口径为生产代码目录（前端 `src/`、图像分析服务 `server/`、业务接口 `deploy/api_mock/`），不含第三方依赖包、构建产物与演示数据文件。

| 项目 | 数值 |
|------|------|
| 源程序文件数 | 44 个 |
| 有效代码行数（非空行） | 约 6,538 行 |
| 前端有效代码 | 约 6,146 行 |
| 后端有效代码 | 约 392 行（含农业业务规则与图像分析服务） |
| 本文件收录有效代码 | 约 3,095 行（12 个源文件） |

按开发语言分布（有效代码行）：

| 语言/类型 | 文件数 | 有效代码行 | 主要用途 |
|-----------|--------|------------|----------|
| Vue 单文件组件 | 16 | 约 4,592 行 | 登录、首页、相关数据、地图监测、智能分析、预警、决策等业务页面 |
| TypeScript | 22 | 约 1,292 行 | 状态管理、路由、地图组合逻辑、监测状态机、接口封装 |
| JavaScript | 2 | 约 272 行 | 农业领域业务规则与接口服务 |
| Python | 1 | 约 120 行 | 作物图像预处理、特征提取与分类建议 |
| 样式表（CSS） | 3 | 约 262 行 | 玻璃拟态主题、地图与页面公共样式 |

按功能模块分布（有效代码行）：

| 功能模块 | 有效代码行 | 说明 |
|----------|------------|------|
| 业务页面 | 约 3,500 行 | 七大导航模块对应的用户界面与交互 |
| 布局与公共组件 | 约 1,090 行 | 顶栏导航、全局搜索、遥感地图、空状态展示 |
| 状态与业务逻辑 | 约 1,072 行 | 监测点/预警/气象/遥感数据管理、状态机、检索 |
| 后端服务 | 约 392 行 | 登录校验、灾害规则评估、查墒情、图像分析 |

下文收录 12 个源文件之完整代码，涵盖附录 D 核心业务逻辑与说明书第四章主要业务页面，合计约 3,095 行有效代码。

## 收录范围说明

| 原则 | 说明 |
|------|------|
| 完整收录业务代码 | 监测状态机、遥感对比、GIS 查墒情、灾害规则评估、图像分析流水线及主要业务页面 |
| 不收录通用脚手架 | 不含 Vite 配置、Axios 基础封装、标准路由守卫、Ant Design 表单样板等 |
| 与正文功能对应 | 下列各文件分别对应说明书第四章「相关数据」「灾害实时监测」「智能分析」「灾害预警」「智慧决策」 |
| 术语与正文一致 | 监测点状态机、九类农田小气候读数、NDVI 期次对比、最近站查墒情等表述与说明书统一 |

## 模块索引

| 序号 | 源文件 | 对应说明书功能 | 核心职责 |
|------|--------|----------------|----------|
| 1 | src/utils/monitorStatus.ts | 3.1.4、4.4 | 监测点六态状态机与阈值推导 |
| 2 | src/stores/data.ts | 4.2、4.6 | 监测点/预警/气象读数聚合与落库 |
| 3 | src/composables/useGlobalSearch.ts | 3.2、4.2.2 | 菜单、监测点、预警全局检索 |
| 4 | src/composables/useMonitorPointLayer.ts | 4.3.5、4.4 | 地图聚类、弹窗处置、GIS 查值联动高亮 |
| 5 | src/stores/remoteSensing.ts | 4.3.4 | NDVI 地块切换与两期影像对比状态 |
| 6 | deploy/api_mock/agriMockCore.cjs | 4.3、4.7 | 农情登录、NDVI 摘要、墒情趋势、灾害规则、最近站查墒情 |
| 7 | src/mock/server.ts | 1.4、4.3 | 农业领域 REST 路由注册 |
| 8 | server/app.py | 4.5 | 作物图像预处理—特征—分类—建议流水线 |
| 9 | src/views/user/RelatedData.vue | 4.3 | 传感器/气象/遥感/GIS/AI 文案/简报多 Tab 业务界面 |
| 10 | src/views/user/DataAnalysis.vue | 4.5 | 作物图像上传、分析类型选择与结果展示 |
| 11 | src/views/user/DecisionSupport.vue | 4.7 | 预警关联选择与处置建议展示 |
| 12 | src/views/user/MapVisualization.vue | 4.4 | 监测点地图渲染、弹窗处置与状态联动 |

## 模块 1：监测点状态机
文件路径：src/utils/monitorStatus.ts
对应说明书：3.1.4、4.4
```typescript
export type MonitorStatus =
  | 'normal'
  | 'warning'
  | 'critical'
  | 'offline'
  | 'maintenance'
  | 'unknown'

export interface MonitorStatusMeta {
  label: string
  color: string
  priority: number
  description: string
  next: MonitorStatus[]
}

export interface MonitorStatusInput {
  status?: string
  temp?: number | string | null
  soilMoisture?: number | string | null
  online?: boolean
  maintenance?: boolean
}

export const MONITOR_STATUS_META: Record<MonitorStatus, MonitorStatusMeta> = {
  normal: {
    label: '正常',
    color: '#52c41a',
    priority: 1,
    description: '监测值处于演示阈值范围内，可按常规频率巡检。',
    next: ['warning', 'offline', 'maintenance']
  },
  warning: {
    label: '预警',
    color: '#fa8c16',
    priority: 2,
    description: '监测值接近或越过警戒线，需要持续关注。',
    next: ['normal', 'critical', 'offline', 'maintenance']
  },
  critical: {
    label: '严重',
    color: '#cf1322',
    priority: 3,
    description: '监测值达到危险区间，应优先处置并复核现场情况。',
    next: ['warning', 'normal', 'offline', 'maintenance']
  },
  offline: {
    label: '离线',
    color: '#8c8c8c',
    priority: 4,
    description: '监测点无有效数据或设备连接异常，需先恢复数据链路。',
    next: ['normal', 'warning', 'maintenance']
  },
  maintenance: {
    label: '维护中',
    color: '#722ed1',
    priority: 0,
    description: '设备处于人工维护或演示调试状态，不参与风险排序。',
    next: ['normal', 'offline']
  },
  unknown: {
    label: '未知',
    color: '#1890ff',
    priority: -1,
    description: '状态字段缺失或未识别，按未知状态展示。',
    next: ['normal', 'warning', 'offline']
  }
}

export const MONITOR_STATUS_ORDER: MonitorStatus[] = [
  'unknown',
  'maintenance',
  'normal',
  'warning',
  'critical',
  'offline'
]

function toNumber(value: number | string | null | undefined) {
  const n = Number(value)
  return Number.isFinite(n) ? n : null
}

export function normalizeMonitorStatus(status?: string): MonitorStatus {
  if (status && status in MONITOR_STATUS_META) {
    return status as MonitorStatus
  }
  return 'unknown'
}

export function getMonitorStatusMeta(status?: string) {
  return MONITOR_STATUS_META[normalizeMonitorStatus(status)]
}

export function getMonitorStatusLabel(status?: string): string {
  return getMonitorStatusMeta(status).label
}

export function getMonitorStatusColor(status?: string): string {
  return getMonitorStatusMeta(status).color
}

export function getMonitorStatusDescription(status?: string): string {
  return getMonitorStatusMeta(status).description
}

export function getNextMonitorStatuses(status?: string): MonitorStatus[] {
  return getMonitorStatusMeta(status).next
}

export function canTransitionMonitorStatus(from?: string, to?: string) {
  const nextStatus = normalizeMonitorStatus(to)
  return getNextMonitorStatuses(from).includes(nextStatus)
}

export function compareMonitorStatus(a?: string, b?: string) {
  return getMonitorStatusMeta(a).priority - getMonitorStatusMeta(b).priority
}

export function getWorstMonitorStatus(statuses: Array<string | undefined>) {
  return statuses
    .map(normalizeMonitorStatus)
    .sort((a, b) => compareMonitorStatus(b, a))[0] || 'unknown'
}

export function deriveMonitorStatus(input: MonitorStatusInput): MonitorStatus {
  if (input.maintenance) return 'maintenance'
  if (input.online === false) return 'offline'

  const current = normalizeMonitorStatus(input.status)
  const temp = toNumber(input.temp)
  const soilMoisture = toNumber(input.soilMoisture)

  if (temp === null || soilMoisture === null || temp < -50 || temp > 100) {
    return 'offline'
  }

  if (temp >= 38 || soilMoisture <= 10) {
    return 'critical'
  }

  if (temp >= 32 || soilMoisture <= 20 || soilMoisture >= 80) {
    return 'warning'
  }

  return current === 'unknown' || current === 'offline' ? 'normal' : current
}
```

## 模块 2：农情数据 Store
文件路径：src/stores/data.ts
对应说明书：4.2、4.6
```typescript
import { computed, ref } from 'vue'
import { defineStore } from 'pinia'
import http from '@/utils/http'
import { deriveMonitorStatus } from '@/utils/monitorStatus'

export type AlertLevel = 'low' | 'medium' | 'high' | 'critical' | 'warning'

export interface Alert {
  id: number
  pointId: number
  level: AlertLevel
  message: string
  time: number
  handled: boolean
}

export type CreateAlertPayload = Omit<Alert, 'id'>

export interface WeatherReading {
  id: number
  pointId: number
  updatedAt: string
  soilVwc: number
  soilTemp10cm: number
  soilEc: number
  airTemp: number
  airRh: number
  windSpeed: number
  windDirection: number
  windDirectionText: string
  pressure: number
  hourlyRain: number
}

export const useDataStore = defineStore('data', () => {
  const monitorPoints = ref<Array<any>>([])
  const alerts = ref<Array<any>>([])
  const weatherReadings = ref<WeatherReading[]>([])
  const loadingPoints = ref(false)
  const loadingAlerts = ref(false)
  const loadingWeather = ref(false)
  const unhandledAlerts = computed(() => alerts.value.filter((alert) => !alert.handled))

  async function fetchMonitorPoints() {
    loadingPoints.value = true
    try {
      const res = await http.get('/monitorPoints')
      const rawData = res.data || []

      monitorPoints.value = rawData
        .filter((item: any) => item.id && item.status)
        .map((item: any) => {
          let fixedTemp = parseFloat(item.temp)
          const fixedMoisture = parseFloat(item.soilMoisture)
          const status = deriveMonitorStatus({
            status: item.status,
            temp: fixedTemp,
            soilMoisture: fixedMoisture,
            online: item.online,
            maintenance: item.maintenance
          })

          if (!Number.isFinite(fixedTemp) || fixedTemp < -50 || fixedTemp > 100) {
            fixedTemp = 0
          }

          const calibratedLat = item.lat + 0.00001
          const calibratedLng = item.lng + 0.00001

          return {
            ...item,
            status,
            temp: fixedTemp.toFixed(1),
            soilMoisture: fixedMoisture.toFixed(1),
            lat: calibratedLat,
            lng: calibratedLng,
            processedTime: new Date().toLocaleString()
          }
        })
    } catch (e) {
      console.error('fetchMonitorPoints error', e)
      throw e
    } finally {
      loadingPoints.value = false
    }
  }

  async function fetchWeatherReadings() {
    loadingWeather.value = true
    try {
      const res = await http.get('/weatherReadings')
      weatherReadings.value = res.data || []
    } catch (e) {
      console.error('fetchWeatherReadings error', e)
      throw e
    } finally {
      loadingWeather.value = false
    }
  }

  function getWeatherReadingByPointId(pointId: number): WeatherReading | undefined {
    return weatherReadings.value.find((item) => item.pointId === pointId)
  }

  async function fetchAlerts(force: boolean = false) {
    void force
    loadingAlerts.value = true
    try {
      const res = await http.get('/alerts?_sort=time&_order=desc')
      alerts.value = res.data || []
    } catch (e) {
      console.error('fetchAlerts error', e)
      throw e
    } finally {
      loadingAlerts.value = false
    }
  }

  async function createAlert(alertData: Partial<Alert>) {
    const payload: CreateAlertPayload = {
      time: Date.now(),
      handled: false,
      pointId: Number(alertData.pointId || 0),
      level: (alertData.level || 'medium') as AlertLevel,
      message: String(alertData.message || ''),
      ...alertData
    }

    if (!payload.pointId || !payload.message.trim()) {
      throw new Error('pointId 和 message 为必填项')
    }

    const res = await http.post('/alerts', payload)
    await fetchAlerts()
    return res.data
  }

  async function updateAlert(
    id: number,
    updates: Partial<Pick<Alert, 'level' | 'message' | 'handled'>>
  ) {
    const res = await http.patch(`/alerts/${id}`, updates)
    await fetchAlerts()
    return res.data
  }

  async function deleteAlert(id: number) {
    await http.delete(`/alerts/${id}`)
    alerts.value = alerts.value.filter((a) => a.id !== id)
  }

  return {
    monitorPoints,
    alerts,
    weatherReadings,
    unhandledAlerts,
    loadingPoints,
    loadingAlerts,
    loadingWeather,
    fetchMonitorPoints,
    fetchWeatherReadings,
    getWeatherReadingByPointId,
    fetchAlerts,
    createAlert,
    updateAlert,
    deleteAlert
  }
})
```

## 模块 3：全局农情检索
文件路径：src/composables/useGlobalSearch.ts
对应说明书：3.2、4.2.2
```typescript
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useDataStore } from '@/stores/data'
import { getMonitorStatusLabel } from '@/utils/monitorStatus'

export type SearchResultType = 'menu' | 'monitor' | 'alert'

export interface SearchResult {
  type: SearchResultType
  id: string
  title: string
  subtitle?: string
  path?: string
  query?: Record<string, string | number>
}

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

    const points = dataStore.monitorPoints || []
    for (const p of points) {
      const name = (p.name || '').toString()
      if (name && name.toLowerCase().includes(k)) {
        list.push({
          type: 'monitor',
          id: `monitor-${p.id}`,
          title: name,
          subtitle: `状态: ${getMonitorStatusLabel(p.status)}`,
          path: '/map',
          query: { highlight: p.id }
        })
      }
    }

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
```

## 模块 4：地图监测点图层与 GIS 联动
文件路径：src/composables/useMonitorPointLayer.ts
对应说明书：4.3.5、4.4
```typescript
import * as L from 'leaflet'
import 'leaflet.markercluster'
import 'leaflet.markercluster/dist/MarkerCluster.css'
import 'leaflet.markercluster/dist/MarkerCluster.Default.css'
import {
  buildMonitorPopupHtml,
  createMonitorDivIcon
} from '@/composables/useMonitorMarkers'
import type { Alert } from '@/stores/data'

export interface MonitorPointRecord {
  id: number
  name: string
  lat: number
  lng: number
  temp: string | number
  soilMoisture: string | number
  status: string
}

export interface MonitorPointLayerOptions {
  readonly?: boolean
  onTriggerAlert?: (point: MonitorPointRecord) => Promise<void>
  onResolveAlert?: (point: MonitorPointRecord) => Promise<boolean>
}

export interface HighlightPointOptions {
  /** 查墒情点击位置；传入时用 fitBounds 同时框住点击处与监测站 */
  queryLatLng?: L.LatLng
  maxZoom?: number
}

const FIT_BOTH_POPUPS_PADDING: L.PointExpression = [100, 100]

const LAYER_POPUP_OPTIONS: L.PopupOptions = {
  autoPan: false,
  autoClose: false,
  closeOnClick: false
}

export function createMonitorPointLayer(map: L.Map, options: MonitorPointLayerOptions = {}) {
  const cluster = L.markerClusterGroup()
  cluster.addTo(map)
  const markersById = new Map<number, L.Marker>()
  let highlightPopup: L.Popup | null = null

  function popupHtml(point: MonitorPointRecord, alerts: Alert[]) {
    return buildMonitorPopupHtml(point, alerts, { readonly: options.readonly })
  }

  function bindPopupActions(marker: L.Marker, point: MonitorPointRecord, alerts: Alert[]) {
    if (options.readonly) return

    marker.on('popupopen', (e) => {
      const container = e.popup?.getElement()
      if (!container) return

      const triggerBtn = container.querySelector('.trigger') as HTMLButtonElement | null
      const closeBtn = container.querySelector('.close') as HTMLButtonElement | null

      if (triggerBtn && options.onTriggerAlert) {
        triggerBtn.onclick = async () => {
          triggerBtn.disabled = true
          try {
            await options.onTriggerAlert!(point)
            marker.setPopupContent(popupHtml(point, alerts))
          } finally {
            triggerBtn.disabled = false
          }
        }
      }

      if (closeBtn && options.onResolveAlert) {
        closeBtn.onclick = async () => {
          closeBtn.disabled = true
          try {
            const ok = await options.onResolveAlert!(point)
            if (ok) marker.setPopupContent(popupHtml(point, alerts))
          } finally {
            closeBtn.disabled = false
          }
        }
      }
    })
  }

  function dismissHighlight() {
    highlightPopup?.remove()
    highlightPopup = null
  }

  function openMarkerPopupLayer(marker: L.Marker) {
    const popup = marker.getPopup()
    if (!popup) return

    dismissHighlight()
    popup.options.autoPan = LAYER_POPUP_OPTIONS.autoPan
    popup.options.autoClose = LAYER_POPUP_OPTIONS.autoClose
    popup.options.closeOnClick = LAYER_POPUP_OPTIONS.closeOnClick
    popup.setLatLng(marker.getLatLng())
    popup.addTo(map)
    highlightPopup = popup
  }

  function render(points: MonitorPointRecord[], alerts: Alert[]) {
    dismissHighlight()
    cluster.clearLayers()
    markersById.clear()

    for (const p of points) {
      const marker = L.marker([p.lat, p.lng], { icon: createMonitorDivIcon(p) })
      marker.bindPopup(popupHtml(p, alerts))
      bindPopupActions(marker, p, alerts)
      markersById.set(p.id, marker)
      cluster.addLayer(marker)
    }
  }

  function updatePopups(points: MonitorPointRecord[], alerts: Alert[]) {
    for (const p of points) {
      const marker = markersById.get(p.id)
      if (marker) marker.setPopupContent(popupHtml(p, alerts))
    }
  }

  function detach() {
    dismissHighlight()
    map.removeLayer(cluster)
    markersById.clear()
  }

  function highlightPoint(pointId: number, options: HighlightPointOptions = {}) {
    const marker = markersById.get(pointId)
    if (!marker) return

    const maxZoom = options.maxZoom ?? 14
    const markerLatLng = marker.getLatLng()

    cluster.zoomToShowLayer(marker, () => {
      if (options.queryLatLng) {
        const bounds = L.latLngBounds(options.queryLatLng, markerLatLng)
        map.fitBounds(bounds, {
          padding: FIT_BOTH_POPUPS_PADDING,
          maxZoom,
          animate: true,
          duration: 0.8
        })
      } else {
        map.flyTo(markerLatLng, maxZoom, { duration: 0.8 })
      }
      map.once('moveend', () => {
        openMarkerPopupLayer(marker)
      })
    })
  }

  return { render, updatePopups, detach, dismissHighlight, highlightPoint, cluster }
}
```

## 模块 5：遥感 NDVI 两期对比
文件路径：src/stores/remoteSensing.ts
对应说明书：4.3.4
```typescript
import { computed, ref } from 'vue'
import { defineStore } from 'pinia'
import {
  fetchFields,
  fetchMoistureLayers,
  fetchNdviLayers
} from '@/api/remoteSensing'
import { resolveImageAsset } from '@/constants/remoteSensingLayers'
import type { Field, MoistureLayer, NdviLayer, RasterLayerView } from '@/types/remoteSensing'

function latestDate(dates: string[]) {
  return [...dates].sort((a, b) => b.localeCompare(a))[0] ?? ''
}

function toRasterView(layer: {
  imageAsset: string
  bounds: NdviLayer['bounds']
  date: string
  source: string
}): RasterLayerView {
  return {
    imageUrl: resolveImageAsset(layer.imageAsset),
    bounds: layer.bounds,
    date: layer.date,
    source: layer.source
  }
}

export const useRemoteSensingStore = defineStore('remoteSensing', () => {
  const fields = ref<Field[]>([])
  const ndviLayers = ref<NdviLayer[]>([])
  const moistureLayers = ref<MoistureLayer[]>([])
  const selectedFieldId = ref('')
  const selectedNdviDate = ref('')
  const selectedMoistureDate = ref('')
  const compareEnabled = ref(false)
  const compareNdviDate = ref('')
  const compareOpacity = ref(0.5)
  const loading = ref(false)
  const loadError = ref<string | null>(null)

  const layersForField = computed(() =>
    ndviLayers.value.filter((l) => l.fieldId === selectedFieldId.value)
  )

  const compareDatesForField = computed(() =>
    layersForField.value
      .map((l) => l.date)
      .filter((date) => date !== selectedNdviDate.value)
  )

  const canCompareNdvi = computed(() => compareDatesForField.value.length > 0)

  const currentNdviLayer = computed(
    () =>
      layersForField.value.find((l) => l.date === selectedNdviDate.value) ??
      layersForField.value[0] ??
      null
  )

  const currentMoistureLayer = computed(
    () =>
      moistureLayers.value.find((l) => l.date === selectedMoistureDate.value) ??
      moistureLayers.value[0] ??
      null
  )

  const currentNdviRaster = computed(() =>
    currentNdviLayer.value ? toRasterView(currentNdviLayer.value) : null
  )

  const currentMoistureRaster = computed(() =>
    currentMoistureLayer.value ? toRasterView(currentMoistureLayer.value) : null
  )

  const compareNdviLayer = computed(() =>
    compareEnabled.value && compareNdviDate.value
      ? layersForField.value.find((l) => l.date === compareNdviDate.value) ?? null
      : null
  )

  const compareNdviRaster = computed(() =>
    compareNdviLayer.value ? toRasterView(compareNdviLayer.value) : null
  )

  function resetCompare() {
    compareEnabled.value = false
    compareNdviDate.value = ''
  }

  function syncCompareDateForField() {
    const options = compareDatesForField.value
    if (options.length === 0) {
      resetCompare()
      return
    }
    if (!options.includes(compareNdviDate.value)) {
      compareNdviDate.value = latestDate(options)
    }
  }

  function setCompareEnabled(enabled: boolean) {
    if (enabled && !canCompareNdvi.value) return
    compareEnabled.value = enabled
    if (!enabled) {
      compareNdviDate.value = ''
      return
    }
    syncCompareDateForField()
  }

  function syncNdviDateForField() {
    const ndviDates = layersForField.value.map((l) => l.date)
    if (ndviDates.length) {
      const hasDate = ndviDates.includes(selectedNdviDate.value)
      if (!hasDate) selectedNdviDate.value = latestDate(ndviDates)
    } else {
      selectedNdviDate.value = ''
    }
  }

  function selectField(fieldId: string) {
    selectedFieldId.value = fieldId
    resetCompare()
    syncNdviDateForField()
  }

  function onNdviDateChange() {
    if (compareEnabled.value) syncCompareDateForField()
  }

  function initSelection() {
    if (fields.value.length) {
      const hasField = fields.value.some((f) => f.id === selectedFieldId.value)
      if (!hasField) selectedFieldId.value = fields.value[0]?.id ?? ''
    }

    syncNdviDateForField()

    if (!canCompareNdvi.value) {
      resetCompare()
    } else if (compareEnabled.value) {
      syncCompareDateForField()
    }

    const moistureDates = moistureLayers.value.map((l) => l.date)
    if (moistureDates.length) {
      const hasDate = moistureDates.includes(selectedMoistureDate.value)
      if (!hasDate) selectedMoistureDate.value = latestDate(moistureDates)
    }
  }

  async function fetchAll() {
    loading.value = true
    loadError.value = null
    try {
      const [fieldsRes, ndviRes, moistureRes] = await Promise.all([
        fetchFields(),
        fetchNdviLayers(),
        fetchMoistureLayers()
      ])
      fields.value = fieldsRes.data ?? []
      ndviLayers.value = ndviRes.data ?? []
      moistureLayers.value = moistureRes.data ?? []
      initSelection()
    } catch (err: unknown) {
      loadError.value = err instanceof Error ? err.message : '遥感数据加载失败'
      throw err
    } finally {
      loading.value = false
    }
  }

  return {
    fields,
    ndviLayers,
    moistureLayers,
    selectedFieldId,
    selectedNdviDate,
    selectedMoistureDate,
    compareEnabled,
    compareNdviDate,
    compareOpacity,
    loading,
    loadError,
    layersForField,
    compareDatesForField,
    canCompareNdvi,
    currentNdviLayer,
    currentMoistureLayer,
    currentNdviRaster,
    currentMoistureRaster,
    compareNdviLayer,
    compareNdviRaster,
    fetchAll,
    initSelection,
    selectField,
    syncNdviDateForField,
    setCompareEnabled,
    onNdviDateChange,
    resetCompare
  }
})
```

## 模块 6：农业业务规则引擎
文件路径：deploy/api_mock/agriMockCore.cjs
对应说明书：4.3、4.7
```javascript
const ROLE_MAP = {
  admin: 'admin',
  agronomist: 'agronomist',
  cooperative: 'cooperative',
  user: 'cooperative'
}

function normalizeRole(role) {
  return ROLE_MAP[role] || 'cooperative'
}

function getMonitorPoints(db) {
  return Array.isArray(db.monitorPoints) ? db.monitorPoints : []
}

function getAlerts(db) {
  return Array.isArray(db.alerts) ? db.alerts : []
}

function handleFarmLogin(db, body = {}) {
  const { phone, password, code, role } = body
  const users = db.users || db.user || []
  const requestedRole = normalizeRole(role)
  const user = users.find((u) => u.phone === phone)
  const passPassword = user && password && user.password == password
  const passDemoCode = user && code === '2026'

  if (!user || (!passPassword && !passDemoCode)) {
    return {
      ok: false,
      status: 401,
      body: { message: '手机号、验证码或备用密码错误' }
    }
  }

  return {
    ok: true,
    status: 200,
    body: {
      code: 200,
      message: '登录成功',
      token: `qinghe-${requestedRole}-${Date.now()}`,
      user: { id: user.id, name: user.name, phone: user.phone, role: requestedRole }
    }
  }
}

function buildNdviSummary(db) {
  const points = getMonitorPoints(db)
  const alerts = getAlerts(db)
  const activeAlertPointIds = new Set(alerts.filter((a) => !a.handled).map((a) => a.pointId))
  const samples = points.map((point, index) => {
    const moisture = Number(point.soilMoisture || 0)
    const temp = Number(point.temp || 0)
    const stressPenalty = activeAlertPointIds.has(point.id) ? 0.08 : 0
    const ndvi = Math.max(0.28, Math.min(0.86, 0.72 + moisture / 300 - temp / 500 - stressPenalty))
    return {
      pointId: point.id,
      pointName: point.name,
      ndvi: Number(ndvi.toFixed(2)),
      vegetationLevel: ndvi >= 0.72 ? '旺盛' : ndvi >= 0.55 ? '正常' : '偏弱',
      sampleNo: `NDVI-${String(index + 1).padStart(3, '0')}`
    }
  })
  const average =
    samples.length > 0
      ? samples.reduce((sum, item) => sum + item.ndvi, 0) / samples.length
      : 0

  return {
    code: 200,
    message: 'NDVI 摘要已生成',
    data: {
      averageNdvi: Number(average.toFixed(2)),
      weakCount: samples.filter((item) => item.vegetationLevel === '偏弱').length,
      samples
    }
  }
}

function buildSoilMoistureTrend(db) {
  const points = getMonitorPoints(db)
  const base = points.length
    ? points.reduce((sum, point) => sum + Number(point.soilMoisture || 0), 0) / points.length
    : 30

  const days = Array.from({ length: 7 }, (_, index) => {
    const offset = index - 3
    const moisture = Math.max(6, Math.min(85, base + offset * 1.8 + Math.sin(index) * 3))
    return {
      dateOffset: offset,
      moisture: Number(moisture.toFixed(1)),
      irrigationAdvice: moisture < 20 ? '建议补水' : moisture > 75 ? '注意排水' : '保持观察'
    }
  })

  return {
    code: 200,
    message: '土壤湿度趋势已生成',
    data: {
      stationCount: points.length,
      unit: '%',
      trend: days
    }
  }
}

function toRad(deg) {
  return (deg * Math.PI) / 180
}

function haversineKm(lat1, lng1, lat2, lng2) {
  const earthRadiusKm = 6371
  const dLat = toRad(lat2 - lat1)
  const dLng = toRad(lng2 - lng1)
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2
  return earthRadiusKm * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
}

function queryMoistureByNearestPoint(db, lat, lng) {
  const points = getMonitorPoints(db)
  if (!points.length) {
    return {
      ok: false,
      status: 404,
      body: { message: '无监测点数据' }
    }
  }

  const latNum = Number(lat)
  const lngNum = Number(lng)
  if (!Number.isFinite(latNum) || !Number.isFinite(lngNum)) {
    return {
      ok: false,
      status: 400,
      body: { message: '请提供有效的 lat、lng 查询参数' }
    }
  }

  let nearest = points[0]
  let minDistKm = Infinity
  for (const point of points) {
    const distKm = haversineKm(latNum, lngNum, Number(point.lat), Number(point.lng))
    if (distKm < minDistKm) {
      minDistKm = distKm
      nearest = point
    }
  }

  return {
    ok: true,
    status: 200,
    body: {
      moisture: Number(nearest.soilMoisture),
      source: 'nearest-point',
      nearestPointId: nearest.id,
      pointName: nearest.name,
      distanceKm: Number(minDistKm.toFixed(1))
    }
  }
}

function evaluateDisasterRules(db, body = {}) {
  const points = getMonitorPoints(db)
  const pointId = Number(body.pointId || points[0]?.id || 0)
  const point = points.find((item) => item.id === pointId) || points[0]
  const temp = Number(body.temp ?? point?.temp ?? 0)
  const soilMoisture = Number(body.soilMoisture ?? point?.soilMoisture ?? 0)
  const rules = []

  if (temp >= 38) {
    rules.push({ rule: 'high_temperature', level: 'critical', reason: '温度达到高温危险阈值' })
  } else if (temp >= 32) {
    rules.push({ rule: 'heat_attention', level: 'warning', reason: '温度进入持续关注区间' })
  }

  if (soilMoisture <= 10) {
    rules.push({ rule: 'drought_risk', level: 'critical', reason: '土壤湿度低于重旱阈值' })
  } else if (soilMoisture <= 20) {
    rules.push({ rule: 'water_stress', level: 'warning', reason: '土壤湿度低于警戒线' })
  }

  if (soilMoisture >= 80) {
    rules.push({ rule: 'waterlogging_risk', level: 'warning', reason: '土壤湿度偏高，需关注涝渍' })
  }

  const level = rules.some((item) => item.level === 'critical')
    ? 'critical'
    : rules.length
      ? 'warning'
      : 'normal'

  return {
    code: 200,
    message: '灾害规则评估完成',
    data: {
      pointId: point?.id || pointId,
      pointName: point?.name || '未知监测点',
      level,
      rules,
      advice:
        level === 'critical'
          ? '建议立即派人现场复核，并同步预警中心。'
          : level === 'warning'
            ? '建议提高巡检频次，必要时触发人工预警。'
            : '当前指标未触发灾害规则，按常规频次观察。'
    }
  }
}

module.exports = {
  handleFarmLogin,
  buildNdviSummary,
  buildSoilMoistureTrend,
  evaluateDisasterRules,
  queryMoistureByNearestPoint
}
```

## 模块 7：农业领域接口路由
文件路径：src/mock/server.ts
对应说明书：1.4、4.3
```typescript
import jsonServer from 'json-server'
import path from 'path'
import fs from 'fs'
import { createRequire } from 'module'
import { fileURLToPath } from 'url'
import type { Request, Response } from 'express'

interface AgriMockCore {
  handleFarmLogin: (db: any, body: any) => { status: number; body: any }
  buildNdviSummary: (db: any) => any
  buildSoilMoistureTrend: (db: any) => any
  evaluateDisasterRules: (db: any, body: any) => any
  queryMoistureByNearestPoint: (
    db: any,
    lat: unknown,
    lng: unknown
  ) => { ok: boolean; status: number; body: any }
}

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const dbPath = path.join(__dirname, 'db.json')
const require = createRequire(import.meta.url)
const agriMockCore = require('../../deploy/api_mock/agriMockCore.cjs') as AgriMockCore

const server = jsonServer.create()
const router = jsonServer.router(dbPath)
const middlewares = jsonServer.defaults()

server.use(middlewares)
server.use(jsonServer.bodyParser)

function readDb(res: Response) {
  let raw = ''
  try {
    raw = fs.readFileSync(dbPath, 'utf-8')
  } catch (err) {
    console.error('read db.json failed:', err)
    res.status(500).jsonp({ message: '无法读取 db.json' })
    return null
  }

  try {
    return JSON.parse(raw)
  } catch (err) {
    console.error('parse db.json failed:', err)
    res.status(500).jsonp({ message: 'db.json 解析错误' })
    return null
  }
}

server.use((req: Request, _res: Response, next) => {
  if (req.method === 'GET') {
    try {
      const db = JSON.parse(fs.readFileSync(dbPath, 'utf-8'))
      router.db.setState(db)
    } catch (err) {
      console.error('reload db.json failed:', err)
    }
  }
  next()
})

server.post('/login', (req: Request, res: Response) => {
  const db = readDb(res)
  if (!db) return
  const result = agriMockCore.handleFarmLogin(db, req.body)
  return res.status(result.status).jsonp(result.body)
})

server.get('/ndvi/summary', (_req: Request, res: Response) => {
  const db = readDb(res)
  if (!db) return
  return res.jsonp(agriMockCore.buildNdviSummary(db))
})

server.get('/soilMoisture/trend', (_req: Request, res: Response) => {
  const db = readDb(res)
  if (!db) return
  return res.jsonp(agriMockCore.buildSoilMoistureTrend(db))
})

server.post('/disasterRules/evaluate', (req: Request, res: Response) => {
  const db = readDb(res)
  if (!db) return
  return res.jsonp(agriMockCore.evaluateDisasterRules(db, req.body))
})

server.get('/moisture/value', (req: Request, res: Response) => {
  const db = readDb(res)
  if (!db) return
  const result = agriMockCore.queryMoistureByNearestPoint(db, req.query.lat, req.query.lng)
  return res.status(result.status).jsonp(result.body)
})

server.use(router)

const PORT = Number(process.env.MOCK_PORT || 3000)
server.listen(PORT, '0.0.0.0', () => {
  console.log(`JSON Server is running on http://localhost:${PORT}`)
})
```

## 模块 8：作物图像分析流水线
文件路径：server/app.py
对应说明书：4.5
```python
from flask import Flask, request, jsonify
from flask_cors import CORS
from dataclasses import dataclass
from hashlib import sha256
from pathlib import Path

app = Flask(__name__)
CORS(app)

CROP_DISEASE_LABELS = {
    "peach": ["桃疮痂病", "桃褐腐病", "桃缩叶病", "健康"],
    "apple": ["苹果腐烂病", "苹果轮纹病", "健康"],
    "wheat": ["小麦锈病", "小麦赤霉病", "健康"],
    "rice": ["稻瘟病", "纹枯病", "健康"]
}

SUPPORTED_CROPS = {
    "peach": "桃",
    "apple": "苹果",
    "wheat": "小麦",
    "rice": "水稻"
}

CONFIDENCE_THRESHOLD = 0.82
ALLOWED_EXTENSIONS = {".jpg", ".jpeg", ".png", ".webp"}


@dataclass
class ImageSample:
    filename: str
    crop_type: str
    category: str
    size_kb: float
    digest: str


def normalize_crop_type(crop_type):
    return crop_type if crop_type in SUPPORTED_CROPS else "unknown"


def preprocess_image_sample(image_file, crop_type, category):
    filename = image_file.filename or ""
    suffix = Path(filename).suffix.lower()
    if suffix not in ALLOWED_EXTENSIONS:
        raise ValueError("仅支持 JPG、PNG、WEBP 格式图片")

    raw = image_file.read()
    image_file.stream.seek(0)
    if not raw:
        raise ValueError("图片内容为空")

    return ImageSample(
        filename=filename,
        crop_type=normalize_crop_type(crop_type),
        category=category or "general",
        size_kb=round(len(raw) / 1024, 2),
        digest=sha256(raw).hexdigest()
    )


def extract_agri_features(sample):
    digest_value = int(sample.digest[:8], 16)
    spot_score = (digest_value % 100) / 100
    texture_score = ((digest_value // 100) % 100) / 100
    moisture_hint = "偏湿" if texture_score > 0.66 else "偏干" if texture_score < 0.33 else "适中"
    return {
        "spotScore": round(spot_score, 2),
        "textureScore": round(texture_score, 2),
        "moistureHint": moisture_hint,
        "fileSizeKb": sample.size_kb
    }


def classify_crop_disaster(sample, features):
    labels = CROP_DISEASE_LABELS.get(sample.crop_type, ["未知病害"])
    label_index = int(sample.digest[-4:], 16) % len(labels)
    result = labels[label_index]
    confidence = round(0.78 + features["spotScore"] * 0.18, 2)

    if result == "健康" and confidence < CONFIDENCE_THRESHOLD:
        confidence = CONFIDENCE_THRESHOLD

    level = "low" if result == "健康" else "high" if confidence >= 0.9 else "medium"
    return {
        "result": result,
        "confidence": min(confidence, 0.98),
        "level": level,
        "isReliable": confidence >= CONFIDENCE_THRESHOLD
    }


def build_agri_advice(sample, classification, features):
    if classification["result"] == "健康":
        return "图像未触发明显病害特征，建议保持常规巡检并继续留存样本。"
    crop_name = SUPPORTED_CROPS.get(sample.crop_type, "作物")
    if features["moistureHint"] == "偏湿":
        return f"{crop_name}样本疑似 {classification['result']}，同时纹理提示偏湿，建议加强通风排湿并复核田间积水。"
    if features["moistureHint"] == "偏干":
        return f"{crop_name}样本疑似 {classification['result']}，建议结合土壤湿度数据判断是否需要补水和病斑复查。"
    return f"{crop_name}样本疑似 {classification['result']}，建议农技员现场复核后决定是否生成高等级预警。"


def run_ai_model_prediction(image_file, crop_type, category=""):
    sample = preprocess_image_sample(image_file, crop_type, category)
    features = extract_agri_features(sample)
    classification = classify_crop_disaster(sample, features)
    advice = build_agri_advice(sample, classification, features)
    return sample, features, classification, advice



@app.route('/api/analysis/image', methods=['POST'])
def analyze_image():
    if 'file' not in request.files:
        return jsonify({"error": "未找到文件"}), 400

    file = request.files['file']
    crop_type = request.form.get('cropType', 'unknown')
    category = request.form.get('category', '')

    if file.filename == '':
        return jsonify({"error": "文件名为空"}), 400

    try:
        sample, features, classification, advice = run_ai_model_prediction(file, crop_type, category)
        return jsonify({
            "code": 200,
            "message": "success",
            "result": classification["result"],
            "confidence": classification["confidence"],
            "level": classification["level"],
            "advice": advice,
            "details": {
                "received_crop": sample.crop_type,
                "crop_label": SUPPORTED_CROPS.get(sample.crop_type, "未知作物"),
                "category": category,
                "features": features,
                "isReliable": classification["isReliable"],
                "note": "Mock 按预处理、特征提取、分类规则生成结果"
            }
        }), 200
    except ValueError as e:
        return jsonify({"error": str(e)}), 400
    except Exception as e:
        print(f"Error: {e}")
        return jsonify({"error": "服务器内部错误", "details": str(e)}), 500


if __name__ == '__main__':
    app.run(debug=True, port=5000, host='0.0.0.0')
```

## 模块 9：相关数据页面
文件路径：src/views/user/RelatedData.vue
对应说明书：4.3
```vue
<template>
  <AppLayout>
    <div class="data-page-content">
      <div class="chart-panel glass-panel glass-panel--chart">
        <div class="panel-header">
          <div class="header-left">
            <span class="title">{{ currentTitle }}</span>
            <span class="sub-title">{{ currentSubtitle }}</span>
          </div>

          <div class="header-actions">
            <a-select
              v-if="currentTab === 'weather'"
              v-model:value="selectedWeatherPointId"
              class="weather-point-select"
              popup-class-name="weather-point-select-dropdown"
              :options="weatherPointOptions"
              placeholder="选择监测站" />
            <a-button
              type="primary"
              shape="round"
              @click="handleGenerateReport">
              <template #icon><FilePdfOutlined /></template>
              生成{{ currentTabName }}简报
            </a-button>
            <a-button
              size="small"
              ghost
              style="margin-left: 10px">
              查看详情
            </a-button>
          </div>
        </div>

        <div
          class="chart-wrapper"
          :class="{ 'chart-wrapper--weather': currentTab === 'weather' }">
          <div
            v-if="loading"
            class="glass-loading-mask">
            <div class="loading-content">
              <a-spin size="large" />
              <p>正在加载数据...</p>
            </div>
          </div>

          <div
            v-show="currentTab === 'sensor'"
            ref="sensorChartRef"
            class="full-content sensor-chart"></div>

          <div
            v-if="currentTab === 'drone' || currentTab === 'gis'"
            class="full-content map-visual">
            <NdviLayerControls v-if="currentTab === 'drone'" />
            <RemoteSensingMap
              ref="remoteMapRef"
              :key="currentTab"
              :mode="currentTab === 'drone' ? 'ndvi' : 'moisture'"
              :image-url="remoteRasterLayer.imageUrl"
              :bounds="remoteRasterLayer.bounds"
              :compare-image-url="ndviCompareImageUrl"
              :compare-opacity="remoteStore.compareOpacity"
              :show-monitor-points="currentTab === 'gis'"
              :enable-moisture-query="currentTab === 'gis'"
              :monitor-points="dataStore.monitorPoints"
              :monitor-alerts="dataStore.alerts"
              @moisture-query="onMoistureQuery" />
            <div class="map-caption">
              <h3 class="font-heading">
                {{ currentTab === 'drone' ? 'NDVI 植被指数' : '土壤墒情分布' }}
              </h3>
              <p class="map-source">
                来源：{{ mapDataSource }}
              </p>
              <p
                v-if="currentTab === 'drone' && remoteStore.selectedNdviDate"
                class="map-meta">
                影像日期：{{ remoteStore.selectedNdviDate }}
                <template v-if="remoteStore.compareEnabled && remoteStore.compareNdviDate">
                  · 对比 {{ remoteStore.compareNdviDate }}
                  · 历史透明度 {{ Math.round(remoteStore.compareOpacity * 100) }}%
                </template>
              </p>
              <p
                v-if="currentTab === 'gis' && remoteStore.selectedMoistureDate"
                class="map-meta">
                影像日期：{{ remoteStore.selectedMoistureDate }} · 监测点为地面传感器
              </p>
              <p
                v-if="currentTab === 'gis'"
                class="map-meta map-meta--hint">
                点击地图可查询该位置墒情（演示：最近监测点）
              </p>
              <p
                v-if="currentTab === 'gis' && lastMoistureQuery"
                class="map-meta">
                最近查值：{{ lastMoistureQuery.moisture }}% · {{ lastMoistureQuery.pointName }}
              </p>
            </div>
            <div
              class="map-legend"
              :aria-label="currentTab === 'drone' ? 'NDVI 色标' : '土壤湿度色标'">
              <span class="legend-title">
                {{ currentTab === 'drone' ? 'NDVI' : '墒情 (%)' }}
              </span>
              <div class="legend-bar">
                <span
                  v-for="step in legendSteps"
                  :key="step.label"
                  class="legend-step"
                  :style="{ background: step.color }"
                  :title="step.label" />
              </div>
              <div class="legend-labels">
                <span>{{ legendSteps[0]?.label }}</span>
                <span>{{ legendSteps[legendSteps.length - 1]?.label }}</span>
              </div>
            </div>
          </div>

          <div
            v-if="currentTab === 'weather'"
            class="weather-grid">
            <template v-if="weatherMetrics.length">
              <a-card
                v-for="item in weatherMetrics"
                :key="item.label"
                class="weather-card"
                :title="item.label">
                {{ item.value }}
              </a-card>
            </template>
            <div
              v-else
              class="weather-empty">
              暂无该监测站气象读数
            </div>
          </div>
        </div>

        <div class="ai-analysis-box">
          <span class="ai-tag">AI 智能分析</span>
          <span class="ai-text">
            {{ aiConclusion }}
          </span>
        </div>
      </div>

      <div class="nav-buttons">
        <a-button
          v-for="tab in tabs"
          :key="tab.key"
          size="large"
          block
          class="nav-btn"
          :class="{ 'active-btn': currentTab === tab.key }"
          @click="switchTab(tab.key)">
          {{ tab.label }}
        </a-button>
      </div>
    </div>

    <a-modal
      v-model:visible="reportModalVisible"
      title="生成月度数据简报"
      @ok="handleDownload">
      <p>正在聚合分析最近 30 天的{{ currentTabName }}...</p>
      <a-progress
        :percent="reportProgress"
        status="active" />
      <div
        v-if="reportProgress === 100"
        style="margin-top: 10px; color: green">
        <CheckCircleOutlined />
        简报生成完毕，可下载。
      </div>
    </a-modal>
  </AppLayout>
</template>

<script setup lang="ts">
import { ref, onMounted, computed, nextTick, watch, onUnmounted } from 'vue'
import AppLayout from '@/layouts/AppLayout.vue'
import RemoteSensingMap from '@/components/remote-sensing/RemoteSensingMap.vue'
import NdviLayerControls from '@/components/remote-sensing/NdviLayerControls.vue'
import { NDVI_DEMO_LAYER, MOISTURE_DEMO_LAYER } from '@/constants/remoteSensingLayers'
import { useDataStore, type WeatherReading } from '@/stores/data.ts'
import { useRemoteSensingStore } from '@/stores/remoteSensing'
import type { MoistureQueryResult } from '@/types/remoteSensing'
import * as echarts from 'echarts'
import { FilePdfOutlined, CheckCircleOutlined } from '@ant-design/icons-vue'
import { message } from 'ant-design-vue'

const dataStore = useDataStore()
const remoteStore = useRemoteSensingStore()
const loading = ref(false)

const currentTab = ref('sensor')
const selectedWeatherPointId = ref<number>(1)

const weatherPointOptions = computed(() =>
  dataStore.monitorPoints.map((point) => ({
    value: point.id,
    label: point.name
  }))
)

function formatWeatherMetrics(reading: WeatherReading) {
  const rainLabel =
    reading.hourlyRain <= 0
      ? '0.0 mm（无降水）'
      : `${reading.hourlyRain.toFixed(1)} mm`

  return [
    { label: '土壤体积含水率', value: `${reading.soilVwc.toFixed(1)} %vol` },
    { label: '10cm土壤温度', value: `${reading.soilTemp10cm.toFixed(1)} ℃` },
    { label: '土壤EC电导率', value: `${reading.soilEc.toFixed(0)} μS/cm` },
    { label: '空气温度', value: `${reading.airTemp.toFixed(1)} ℃` },
    { label: '空气相对湿度', value: `${reading.airRh.toFixed(1)} %RH` },
    { label: '瞬时风速', value: `${reading.windSpeed.toFixed(1)} m/s` },
    {
      label: '风向',
      value: `${reading.windDirection}°（${reading.windDirectionText}）`
    },
    { label: '大气气压', value: `${reading.pressure.toFixed(1)} hPa` },
    { label: '小时降雨量', value: rainLabel }
  ]
}

const selectedWeatherReading = computed(() =>
  dataStore.getWeatherReadingByPointId(selectedWeatherPointId.value)
)

const weatherMetrics = computed(() => {
  const reading = selectedWeatherReading.value
  return reading ? formatWeatherMetrics(reading) : []
})

function getWeatherPointName(pointId: number) {
  return (
    dataStore.monitorPoints.find((point) => point.id === pointId)?.name ??
    `监测站 #${pointId}`
  )
}

function buildWeatherAiConclusion(reading: WeatherReading, pointName: string) {
  const rainPart =
    reading.hourlyRain <= 0
      ? '当前无降水'
      : `近 1 小时降雨 ${reading.hourlyRain.toFixed(1)} mm`
  const humidityPart =
    reading.airRh < 40
      ? '，空气偏干'
      : reading.airRh > 60
        ? '，空气湿度较高'
        : ''
  const soilPart =
    reading.soilVwc < 20
      ? '，土壤墒情偏低，建议适时补灌'
      : reading.soilVwc > 35
        ? '，土壤墒情充足'
        : '，蒸腾作用较强，建议关注墒情'

  return `${pointName}：${rainPart}（相对湿度 ${reading.airRh.toFixed(1)}%RH），土壤体积含水率 ${reading.soilVwc.toFixed(1)}%vol${humidityPart}${soilPart}。`
}

const tabs = [
  {
    key: 'sensor',
    label: '传感器数据 (地)',
    title: '物联网传感器监控',
    subtitle: '最近 7 天环境参数趋势'
  },
  {
    key: 'drone',
    label: '无人机遥感 (空)',
    title: '无人机多光谱监测',
    subtitle: '作物长势 NDVI 指数分析'
  },
  {
    key: 'weather',
    label: '气象数据 (天)',
    title: '气象站实时数据',
    subtitle: '土壤墒情与局地小气候实时监测'
  },
  { key: 'gis', label: 'GIS 数据 (图)', title: '地理信息可视化', subtitle: '土壤墒情热力分布图' }
]

const currentTitle = computed(() => tabs.find((t) => t.key === currentTab.value)?.title)
const currentSubtitle = computed(() => {
  const base = tabs.find((t) => t.key === currentTab.value)?.subtitle ?? ''
  if (currentTab.value === 'weather') {
    const pointName = getWeatherPointName(selectedWeatherPointId.value)
    return `${pointName} · 土壤墒情与局地小气候实时监测`
  }
  if (currentTab.value === 'drone' && remoteStore.selectedNdviDate) {
    const fieldName =
      remoteStore.fields.find((f) => f.id === remoteStore.selectedFieldId)?.name ??
      remoteStore.selectedFieldId
    const datePart = `${fieldName} · ${remoteStore.selectedNdviDate}`
    if (remoteStore.compareEnabled && remoteStore.compareNdviDate) {
      return `${base} · ${datePart} · 对比 ${remoteStore.compareNdviDate}`
    }
    return `${base} · ${datePart}`
  }
  return base
})
const currentTabName = computed(() => tabs.find((t) => t.key === currentTab.value)?.label)

const remoteMapRef = ref<InstanceType<typeof RemoteSensingMap> | null>(null)
const lastMoistureQuery = ref<MoistureQueryResult | null>(null)

function onMoistureQuery(result: MoistureQueryResult) {
  lastMoistureQuery.value = result
}

const remoteRasterLayer = computed(() => {
  if (currentTab.value === 'drone') {
    return remoteStore.currentNdviRaster ?? NDVI_DEMO_LAYER
  }
  if (currentTab.value === 'gis') {
    return remoteStore.currentMoistureRaster ?? MOISTURE_DEMO_LAYER
  }
  return NDVI_DEMO_LAYER
})

const ndviCompareImageUrl = computed(() => {
  if (currentTab.value !== 'drone' || !remoteStore.compareEnabled) return undefined
  return remoteStore.compareNdviRaster?.imageUrl
})

const mapDataSource = computed(() => remoteRasterLayer.value.source)

const ndviLegend = [
  { label: '低 (裸地/胁迫)', color: '#8b4513' },
  { label: '偏低', color: '#d4a574' },
  { label: '中等', color: '#f4e87c' },
  { label: '良好', color: '#7cb342' },
  { label: '高 (茂盛)', color: '#1b5e20' }
]

const soilLegend = [
  { label: '干旱', color: '#c62828' },
  { label: '偏干', color: '#ef6c00' },
  { label: '适中', color: '#fdd835' },
  { label: '湿润', color: '#42a5f5' },
  { label: '饱和', color: '#1565c0' }
]

const legendSteps = computed(() =>
  currentTab.value === 'drone' ? ndviLegend : soilLegend
)

const GIS_DEFAULT_AI =
  '土壤水分热力图显示栾城区一带墒情偏高，河间—雄县段偏干，建议分区灌溉。'

function formatMoistureSourceLabel(source: string) {
  return source === 'nearest-point' ? '最近监测点' : source
}

function moistureLevelHint(moisture: number) {
  if (moisture <= 20) return '墒情偏低，与参考站传感器读数一致，建议关注灌溉'
  if (moisture >= 60) return '墒情偏高，与参考站传感器读数一致，建议留意排水'
  return '墒情适中，与参考站传感器读数一致'
}

function buildGisAiConclusion(query: MoistureQueryResult) {
  const sourceLabel = formatMoistureSourceLabel(query.source)
  const levelHint = moistureLevelHint(query.moisture)
  return `${query.pointName} 附近墒情约 ${query.moisture}%（${sourceLabel}），${levelHint}。已定位至 ${query.pointName} 传感器。`
}

function buildDroneAiConclusion() {
  const fieldName =
    remoteStore.fields.find((f) => f.id === remoteStore.selectedFieldId)?.name ?? '当前地块'
  if (
    remoteStore.compareEnabled &&
    remoteStore.compareNdviDate &&
    remoteStore.selectedNdviDate
  ) {
    return `${fieldName} 当前期 ${remoteStore.selectedNdviDate} 与对比期 ${remoteStore.compareNdviDate} 的 NDVI 影像叠加显示植被指数变化，长势较好区域可从画面上绿色加深区域辨识，建议结合田间踏查确认变量施肥范围。`
  }
  return `${fieldName} 出现轻微缺氮光谱特征，建议针对该区域进行无人机变量施肥。`
}

const aiConclusion = computed(() => {
  if (currentTab.value === 'sensor') {
    const alerts = dataStore.alerts || []
    const criticalCount = alerts.filter(
      (a: any) => a.level === 'critical' || a.level === 'high'
    ).length

    const latestAlert = alerts.find((a: any) => !a.handled)
    const latestMsg = latestAlert ? latestAlert.message : '目前设备运行平稳'

    if (criticalCount > 0) {
      return `系统分析检测到 ${criticalCount} 次高风险异常！最新问题为："${latestMsg}"，建议立即派人排查 pointId-${latestAlert?.pointId}。`
    } else {
      return `过去 7 天传感器网络运行平稳，偶发 ${alerts.length} 次轻微波动，建议维持当前灌溉策略。`
    }
  }

  if (currentTab.value === 'drone') {
    return buildDroneAiConclusion()
  }

  if (currentTab.value === 'gis') {
    return lastMoistureQuery.value
      ? buildGisAiConclusion(lastMoistureQuery.value)
      : GIS_DEFAULT_AI
  }

  if (currentTab.value === 'weather') {
    const reading = selectedWeatherReading.value
    if (!reading) {
      return '气象读数加载中或暂无数据，请切换监测站或稍后重试。'
    }
    return buildWeatherAiConclusion(reading, getWeatherPointName(selectedWeatherPointId.value))
  }

  return '数据分析中...'
})

const sensorChartRef = ref<HTMLDivElement | null>(null)
let chartInstance: echarts.ECharts | null = null

function buildTrendSeries() {
  const now = Date.now()
  const dayMs = 24 * 60 * 60 * 1000
  const labels: string[] = []
  const counts: number[] = []
  const alerts = dataStore.alerts || []

  for (let i = 6; i >= 0; i--) {
    const start = new Date(now - i * dayMs)
    const label = `${start.getMonth() + 1}/${start.getDate()}`
    labels.push(label)

    const dayStart = new Date(start.getFullYear(), start.getMonth(), start.getDate()).getTime()
    const dayEnd = dayStart + dayMs
    const c = alerts.filter((a: any) => a.time >= dayStart && a.time < dayEnd).length
    counts.push(c)
  }
  return { labels, counts }
}

function renderSensorChart() {
  if (!sensorChartRef.value) return
  if (!chartInstance) chartInstance = echarts.init(sensorChartRef.value)

  const { labels, counts } = buildTrendSeries()

  chartInstance.setOption({
    backgroundColor: 'transparent',
    grid: { top: '12%', left: '3%', right: '4%', bottom: 40, containLabel: true },
    tooltip: { trigger: 'axis', formatter: '{b} <br/> 报警数量: {c} 次' },
    xAxis: {
      type: 'category',
      boundaryGap: false,
      data: labels,
      axisLabel: { color: '#fff', margin: 10 }
    },
    yAxis: {
      type: 'value',
      splitLine: { lineStyle: { color: 'rgba(255,255,255,0.1)' } },
      axisLabel: { color: '#fff' },
      minInterval: 1
    },
    series: [
      {
        name: '异常预警',
        type: 'line',
        smooth: true,
        data: counts,
        areaStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: 'rgba(255, 80, 80, 0.5)' },
            { offset: 1, color: 'rgba(84,112,198,0.05)' }
          ])
        },
        lineStyle: { width: 3, color: '#ff7875' },
        itemStyle: { color: '#ff4d4f' }
      }
    ]
  })
  chartInstance.resize()
}

const switchTab = async (key: string) => {
  if (key === currentTab.value) return
  if (currentTab.value === 'gis' && key !== 'gis') {
    lastMoistureQuery.value = null
  }
  currentTab.value = key
  if (key === 'sensor') {
    await nextTick()
    chartInstance?.resize()
    renderSensorChart()
  } else if (key === 'drone' || key === 'gis') {
    await nextTick()
    remoteMapRef.value?.invalidate()
  }
}

const reportModalVisible = ref(false)
const reportProgress = ref(0)
let timer: any = null

const handleGenerateReport = () => {
  reportModalVisible.value = true
  reportProgress.value = 0
  timer = setInterval(() => {
    if (reportProgress.value >= 100) {
      clearInterval(timer)
    } else {
      reportProgress.value += 10
    }
  }, 200)
}

const handleDownload = () => {
  reportModalVisible.value = false
  message.success(`已下载《${currentTabName.value}分析简报.pdf》`)
}

function onWindowResize() {
  chartInstance?.resize()
  if (currentTab.value === 'drone' || currentTab.value === 'gis') {
    remoteMapRef.value?.invalidate()
  }
}

onMounted(async () => {
  loading.value = true
  try {
    const tasks: Promise<unknown>[] = [
      remoteStore.fetchAll().catch(() => {
        message.warning('遥感图层加载失败，已使用本地演示数据')
      })
    ]
    if (dataStore.alerts.length === 0) {
      tasks.push(dataStore.fetchAlerts())
    }
    if (dataStore.monitorPoints.length === 0) {
      tasks.push(dataStore.fetchMonitorPoints())
    }
    if (dataStore.weatherReadings.length === 0) {
      tasks.push(
        dataStore.fetchWeatherReadings().catch(() => {
          message.warning('气象读数加载失败，请检查 Mock 服务')
        })
      )
    }
    await Promise.all(tasks)
    await nextTick()
    renderSensorChart()
  } finally {
    loading.value = false
  }
  window.addEventListener('resize', onWindowResize)
})

onUnmounted(() => {
  window.removeEventListener('resize', onWindowResize)
  chartInstance?.dispose()
  chartInstance = null
})

watch(
  () => dataStore.alerts,
  () => {
    if (currentTab.value === 'sensor') {
      renderSensorChart()
    }
  },
  { deep: true }
)

watch(remoteRasterLayer, async () => {
  if (currentTab.value === 'drone' || currentTab.value === 'gis') {
    await nextTick()
    remoteMapRef.value?.invalidate()
  }
})

watch(currentTab, (tab) => {
  if (tab !== 'weather') return
  const field = remoteStore.fields.find((item) => item.id === remoteStore.selectedFieldId)
  if (field?.monitorPointId) {
    selectedWeatherPointId.value = field.monitorPointId
  }
})

watch(
  () => dataStore.monitorPoints,
  (points) => {
    if (points.length && !points.some((point) => point.id === selectedWeatherPointId.value)) {
      selectedWeatherPointId.value = points[0].id
    }
  },
  { immediate: true }
)
</script>

<style scoped>
.data-page-content {
  display: flex;
  height: 100%;
  width: 100%;
  max-width: var(--page-max-width);
  margin-inline: auto;
  padding: 30px;
  gap: 30px;
  box-sizing: border-box;
  overflow: hidden;
}

.chart-panel {
  min-width: 0;
}

.panel-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  padding-bottom: 15px;
  border-bottom: 1px solid var(--glass-border);
}

.header-left {
  display: flex;
  flex-direction: column;
}

.title {
  font-size: 24px;
  font-weight: bold;
  color: var(--glass-text-primary);
}

.sub-title {
  font-size: 14px;
  color: var(--glass-text-muted);
  margin-top: 5px;
}

.chart-wrapper {
  flex: 1;
  position: relative;
  width: 100%;
  min-height: 0;
  background: rgb(0 0 0 / 10%);
  border-radius: 12px;
  overflow: hidden;
}

.full-content {
  width: 100%;
  height: 100%;
}

.sensor-chart {
  box-sizing: border-box;
  padding-bottom: 8px;
}

.map-visual {
  position: relative;
  overflow: hidden;
}

.map-caption {
  position: absolute;
  left: 12px;
  bottom: 12px;
  z-index: 4;
  pointer-events: none;
  max-width: min(280px, 55%);
  padding: 10px 14px;
  border-radius: 8px;
  background: rgb(0 0 0 / 55%);
  border: 1px solid rgb(255 255 255 / 15%);
  backdrop-filter: blur(8px);
  color: var(--glass-text-primary);
}

.map-caption h3 {
  margin: 0 0 4px;
  font-size: 15px;
  font-weight: 600;
}

.map-source {
  margin: 0;
  font-size: 12px;
  color: var(--glass-text-muted);
}

.map-meta {
  margin: 4px 0 0;
  font-size: 11px;
  color: rgb(255 255 255 / 55%);
}

.map-meta--hint {
  color: rgb(255 255 255 / 45%);
  font-style: italic;
}

.map-legend {
  position: absolute;
  right: 12px;
  bottom: 12px;
  z-index: 4;
  pointer-events: none;
  min-width: 140px;
  padding: 10px 12px;
  border-radius: 8px;
  background: rgb(0 0 0 / 55%);
  border: 1px solid rgb(255 255 255 / 15%);
  backdrop-filter: blur(8px);
  color: var(--glass-text-primary);
}

.legend-title {
  display: block;
  font-size: 12px;
  font-weight: 600;
  margin-bottom: 6px;
  color: var(--glass-text-secondary);
}

.legend-bar {
  display: flex;
  height: 10px;
  border-radius: 4px;
  overflow: hidden;
}

.legend-step {
  flex: 1;
}

.legend-labels {
  display: flex;
  justify-content: space-between;
  margin-top: 4px;
  font-size: 10px;
  color: var(--glass-text-muted);
}

.header-actions {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 10px;
}

.weather-point-select {
  min-width: 180px;
}

.weather-empty {
  grid-column: 1 / -1;
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 200px;
  color: var(--glass-text-muted);
  font-size: 14px;
}

.chart-wrapper--weather {
  flex: 1;
  min-height: 0;
  display: flex;
  flex-direction: column;
}

.weather-grid {
  display: grid;
  flex: 1;
  min-height: 0;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  grid-auto-rows: 1fr;
  gap: 16px;
  padding: 24px;
  box-sizing: border-box;
  width: 100%;
}

.weather-card {
  min-width: 0;
  width: 100%;
  min-height: 110px;
  height: 100%;
  background: var(--glass-bg-subtle) !important;
  border: 1px solid var(--glass-border) !important;
  color: var(--glass-text-primary) !important;
  text-align: center;
  font-size: 20px;
  font-weight: bold;
  text-shadow: var(--glass-text-shadow);
}

:deep(.weather-card.ant-card) {
  min-width: 0;
  width: 100%;
  min-height: 110px;
  height: 100%;
  display: flex;
  flex-direction: column;
}

:deep(.weather-card .ant-card-head) {
  min-height: auto;
  padding: 0 12px;
}

:deep(.weather-card .ant-card-head-title) {
  white-space: normal;
  font-size: 14px;
  line-height: 1.35;
  padding: 12px 0;
}

:deep(.weather-card .ant-card-body) {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 12px 8px 16px;
  line-height: 1.35;
  word-break: break-word;
}

:deep(.ant-card-head-title) {
  color: var(--glass-text-secondary) !important;
  text-shadow: var(--glass-text-shadow);
}

.ai-analysis-box {
  margin-top: 20px;
  background: rgb(74 92 67 / 30%);
  padding: 15px;
  border-radius: 8px;
  border-left: 4px solid #73d13d;
  display: flex;
  align-items: center;
  gap: 15px;
}

.ai-tag {
  background: #73d13d;
  color: #1a2a1a;
  padding: 2px 8px;
  border-radius: 4px;
  font-weight: bold;
  font-size: 12px;
}

.ai-text {
  color: #eef1ea;
  font-size: 14px;
  line-height: 1.6;
}

.nav-buttons {
  width: 220px;
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.nav-btn {
  height: 60px !important;
  background: var(--glass-bg-subtle) !important;
  border: 1px solid var(--glass-border) !important;
  color: var(--glass-text-secondary) !important;
  font-size: 16px !important;
  text-shadow: var(--glass-text-shadow);
}

.active-btn {
  background: linear-gradient(90deg, #4a5c43 0%, #2c3a26 100%) !important;
  color: #fff !important;
  border-color: #73d13d !important;
  box-shadow: 0 4px 12px rgb(0 0 0 / 20%);
}

@media (width <= 992px) {
  .data-page-content {
    flex-direction: column;
    height: auto;
    min-height: 0;
    padding: 16px;
    gap: 16px;
    overflow: visible;
  }

  .chart-wrapper {
    min-height: 320px;
  }

  .nav-buttons {
    width: 100%;
    flex-direction: row;
    flex-wrap: wrap;
    gap: 8px;
    order: 1;
  }

  .chart-panel {
    order: 0;
    min-height: 480px;
  }

  .nav-btn {
    flex: 1 1 calc(50% - 4px);
    height: 48px !important;
    font-size: 14px !important;
  }

  .panel-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
  }

  .header-actions {
    width: 100%;
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
  }

  .weather-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
    grid-auto-rows: minmax(110px, 1fr);
    padding: 20px;
  }

  .ai-analysis-box {
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;
  }
}

@media (width <= 576px) {
  .data-page-content {
    padding: 12px;
    gap: 12px;
  }

  .title {
    font-size: 20px;
  }

  .nav-btn {
    flex: 1 1 100%;
    height: 44px !important;
    font-size: 13px !important;
  }

  .chart-wrapper {
    min-height: 260px;
  }

  .chart-panel {
    min-height: 420px;
  }

  .weather-grid {
    grid-template-columns: minmax(0, 1fr);
    grid-auto-rows: minmax(100px, auto);
    padding: 16px;
    gap: 12px;
  }

  .weather-card {
    font-size: 24px !important;
  }

  .map-caption {
    max-width: calc(100% - 24px);
    left: 8px;
    bottom: 8px;
    padding: 8px 10px;
  }

  .map-legend {
    right: 8px;
    bottom: 8px;
    min-width: 120px;
    padding: 8px;
  }
}
</style>
```

## 模块 10：智能分析页面
文件路径：src/views/user/DataAnalysis.vue
对应说明书：4.5
```vue
<template>
  <AppLayout>
    <main class="main-content page-main-shell page-main-shell--scroll">
      <div class="content-wrapper glass-page">
        <a-card :bordered="false">
          <template #title>
            <div class="glass-card-title">智能分析</div>
          </template>

          <div class="analysis-body-container">
            <div class="form-section">
              <div class="upload-wrapper">
                <a-upload
                  v-model:file-list="fileList"
                  name="file"
                  list-type="picture-card"
                  class="avatar-uploader"
                  :show-upload-list="false"
                  :before-upload="beforeUpload"
                  :customRequest="customUpload"
                  @change="handleChange">
                  <img
                    v-if="imageUrl"
                    :src="imageUrl"
                    alt="uploaded-image"
                    class="uploaded-image" />
                  <div v-else>
                    <loading-outlined v-if="loading"></loading-outlined>
                    <plus-outlined v-else></plus-outlined>
                    <div class="ant-upload-text">上传图片</div>
                  </div>
                </a-upload>
                <div
                  v-if="uploading"
                  class="upload-progress-overlay">
                  <a-progress
                    type="circle"
                    :percent="uploadProgress"
                    :width="80">
                    <template #format="percent">{{ percent }}%</template>
                  </a-progress>
                </div>
              </div>

              <a-form
                class="analysis-form"
                layout="vertical">
                <a-form-item>
                  <div class="form-inline-group">
                    <a-select
                      v-model:value="formState.cropType"
                      style="flex-grow: 1">
                      <a-select-option value="peach">桃</a-select-option>
                      <a-select-option value="apple">苹果</a-select-option>
                      <a-select-option value="wheat">小麦</a-select-option>
                      <a-select-option value="rice">水稻</a-select-option>
                    </a-select>
                    <a-button @click="handleIdentify">识别</a-button>
                  </div>
                </a-form-item>
                <a-form-item label="其他补充信息：">
                  <a-textarea
                    v-model:value="formState.additionalInfo"
                    placeholder="请输入..."
                    :rows="2" />
                </a-form-item>
              </a-form>
              <a-button
                type="primary"
                block
                size="large"
                @click="handleConfirm">
                确定
              </a-button>
            </div>

            <div class="category-section">
              <a-button
                v-for="category in categories"
                :key="category.key"
                :class="{ active: selectedCategory === category.key }"
                class="category-btn"
                @click="selectedCategory = category.key">
                {{ category.name }}
              </a-button>
            </div>
          </div>

          <div class="result-section">
            <div
              v-if="analyzing"
              class="result-panel result-loading">
              <a-spin size="large" />
              <p>正在智能分析中，请稍候…</p>
            </div>
            <div
              v-else-if="analysisResult"
              class="result-panel">
              <div class="result-header">
                <h3 class="result-title">分析结果</h3>
                <a-tag :color="analysisResult.isHealthy ? 'success' : 'error'">
                  {{ analysisResult.isHealthy ? '健康' : '需关注' }}
                </a-tag>
              </div>
              <div class="result-meta">
                <span>作物：{{ cropLabel }}</span>
                <span>识别类型：{{ categoryLabel }}</span>
                <span>分析时间：{{ formatAnalyzedAt(analysisResult.analyzedAt) }}</span>
              </div>
              <p class="result-text">{{ analysisResult.result }}</p>
              <div class="confidence-block">
                <div class="confidence-label">
                  <span>模型置信度</span>
                  <strong>{{ confidencePercent }}%</strong>
                </div>
                <a-progress
                  :percent="confidencePercent"
                  :stroke-color="confidenceStrokeColor"
                  :show-info="false" />
              </div>
              <p class="result-hint">结果已同步写入预警列表，可在灾害预警页查看与处理。</p>
              <a-button
                type="link"
                class="goto-warnings-btn"
                @click="router.push('/warnings')">
                前往预警列表 →
              </a-button>
            </div>
            <div
              v-else
              class="result-panel result-empty">
              <ExperimentOutlined class="result-empty-icon" />
              <p>上传图片并点击「确定」或「识别」后，分析结果将显示在这里</p>
            </div>
          </div>
        </a-card>
      </div>
    </main>
  </AppLayout>
</template>

<script setup lang="ts">
import { ref, reactive, computed } from 'vue'
import { PlusOutlined, LoadingOutlined, ExperimentOutlined } from '@ant-design/icons-vue'
import { message } from 'ant-design-vue'
import type { UploadChangeParam, UploadProps, UploadFile } from 'ant-design-vue'
import AppLayout from '@/layouts/AppLayout.vue'
import { analyzeImage } from '@/api/analysis.ts'
import { useDataStore } from '@/stores/data'
import { useRouter } from 'vue-router'

const store = useDataStore()
const router = useRouter()

const formState = reactive({
  cropType: 'peach',
  additionalInfo: ''
})

const cropLabels: Record<string, string> = {
  peach: '桃',
  apple: '苹果',
  wheat: '小麦',
  rice: '水稻'
}

const categories = [
  { key: 'disaster', name: '灾害识别' },
  { key: 'pest', name: '病虫害识别' },
  { key: 'climate', name: '气候灾害识别' },
  { key: 'other', name: '其他' }
]
const selectedCategory = ref('disaster')

interface AnalysisResultView {
  result: string
  confidence: number
  isHealthy: boolean
  cropType: string
  category: string
  analyzedAt: number
}

const fileList = ref<UploadFile[]>([])
const loading = ref<boolean>(false)
const uploading = ref<boolean>(false)
const uploadProgress = ref<number>(0)
const imageUrl = ref<string>('')
const analyzing = ref(false)
const analysisResult = ref<AnalysisResultView | null>(null)

const cropLabel = computed(
  () => cropLabels[analysisResult.value?.cropType ?? formState.cropType] ?? formState.cropType
)

const categoryLabel = computed(() => {
  const key = analysisResult.value?.category ?? selectedCategory.value
  return categories.find((c) => c.key === key)?.name ?? key
})

const confidencePercent = computed(() => {
  if (!analysisResult.value) return 0
  const raw = analysisResult.value.confidence
  const pct = raw <= 1 ? raw * 100 : raw
  return Math.min(100, Math.max(0, Math.round(pct)))
})

const confidenceStrokeColor = computed(() => {
  const p = confidencePercent.value
  if (p >= 80) return '#73d13d'
  if (p >= 60) return '#faad14'
  return '#ff4d4f'
})

function formatAnalyzedAt(ts: number) {
  const d = new Date(ts)
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`
}

function getBase64(img: Blob, callback: (base64Url: string) => void) {
  const reader = new FileReader()
  reader.addEventListener('load', () => callback(reader.result as string))
  reader.readAsDataURL(img)
}
const beforeUpload: UploadProps['beforeUpload'] = (file) => {
  const isJpgOrPng = file.type === 'image/jpeg' || file.type === 'image/png'
  if (!isJpgOrPng) {
    message.error('只能上传 JPG/PNG 格式的图片!')
  }
  const isLt2M = file.size / 1024 / 1024 < 2
  if (!isLt2M) {
    message.error('图片大小不能超过 2MB!')
  }
  return isJpgOrPng && isLt2M
}

const customUpload = (options: any) => {
  const { onSuccess, file } = options
  setTimeout(() => onSuccess('Ok', file), 100)
}

const handleChange = (info: UploadChangeParam) => {
  fileList.value = info.fileList

  if (info.file.status === 'uploading') {
    analysisResult.value = null
    loading.value = true
    uploading.value = true
    uploadProgress.value = 0
    const interval = setInterval(() => {
      uploadProgress.value += Math.floor(Math.random() * 10) + 5
      if (uploadProgress.value >= 84) {
        uploadProgress.value = 84
        clearInterval(interval)
      }
    }, 200)
    return
  }
  if (info.file.status === 'done') {
    uploadProgress.value = 100
    setTimeout(() => {
      uploading.value = false
      loading.value = false
      getBase64(info.file.originFileObj as Blob, (base64Url: string) => {
        imageUrl.value = base64Url
      })
    }, 500)
  }
  if (info.file.status === 'error') {
    uploading.value = false
    loading.value = false
    message.error('上传失败')
  }
}

const handleConfirm = async () => {
  if (!imageUrl.value || !fileList.value[0]?.originFileObj) {
    message.warning('请先上传一张图片！')
    return
  }

  analyzing.value = true
  analysisResult.value = null

  try {
    const response = await analyzeImage({
      file: fileList.value[0].originFileObj,
      cropType: formState.cropType,
      category: selectedCategory.value,
      additionalInfo: formState.additionalInfo
    })

    const aiResult = response.data.result as string
    const aiConfidence = response.data.confidence as number
    const isHealthy = aiResult.includes('健康')
    const alertLevel = isHealthy ? 'low' : 'high'
    const cropName = cropLabels[formState.cropType] ?? formState.cropType

    analysisResult.value = {
      result: aiResult,
      confidence: aiConfidence,
      isHealthy,
      cropType: formState.cropType,
      category: selectedCategory.value,
      analyzedAt: Date.now()
    }

    await store.createAlert({
      pointId: 1,
      level: alertLevel,
      message: `[AI识别] 监测到 ${cropName} - ${aiResult} (置信度: ${(aiConfidence <= 1 ? aiConfidence * 100 : aiConfidence).toFixed(1)}%)`,
      handled: false
    })

    message.success('分析完成！请查看下方结果卡片。')
  } catch (error) {
    message.error('分析或保存失败，请重试。')
    console.error('Error:', error)
  } finally {
    analyzing.value = false
  }
}

const handleIdentify = () => handleConfirm()
</script>

<style scoped>
.glass-page :deep(.ant-card-body) {
  padding: 24px 32px;
}

.analysis-body-container {
  display: flex;
  gap: 40px;
}

.form-section {
  flex: 2;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.upload-wrapper {
  position: relative;
  margin-bottom: 24px;
}

.avatar-uploader :deep(.ant-upload.ant-upload-select-picture-card) {
  width: 250px;
  height: 250px;
  background-color: var(--glass-bg-subtle) !important;
  border: 1px dashed var(--glass-border-strong) !important;
  border-radius: 8px;
}

.avatar-uploader :deep(.ant-upload-text),
.avatar-uploader :deep(.anticon) {
  color: var(--glass-text-muted);
}

.uploaded-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.upload-progress-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgb(0 0 0 / 50%);
  display: flex;
  justify-content: center;
  align-items: center;
  border-radius: 8px;
}

.upload-progress-overlay :deep(.ant-progress-text) {
  color: white !important;
}

.analysis-form {
  width: 100%;
  margin-bottom: 16px;
}

.form-inline-group {
  display: flex;
  gap: 12px;
}

.analysis-form :deep(.ant-form-item-label > label) {
  color: var(--light-green);
}

.analysis-form :deep(.ant-input),
.analysis-form :deep(.ant-select-selector),
.analysis-form :deep(.ant-input-affix-wrapper) {
  background-color: var(--glass-bg-input) !important;
  border: 1px solid var(--glass-border-strong) !important;
  color: var(--glass-text-primary) !important;
}

.analysis-form :deep(.ant-select-selection-item) {
  color: var(--glass-text-primary) !important;
}

.analysis-form :deep(.ant-select-arrow) {
  color: var(--glass-text-muted);
}

.form-inline-group .ant-btn {
  background-color: var(--primary-green);
  border-color: var(--primary-green);
  color: white;
}

.form-section > .ant-btn-primary {
  background-color: var(--dark-green) !important;
  border-color: var(--dark-green) !important;
}

.category-section {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.category-btn {
  width: 100%;
  height: 48px;
  font-size: 16px;
  background-color: var(--glass-bg-subtle);
  border-color: var(--glass-border-strong);
  color: var(--glass-text-primary);
  transition: all 0.3s;
  text-shadow: var(--glass-text-shadow);
}

.category-btn:hover {
  background-color: var(--glass-bg-item-hover);
  border-color: var(--glass-border-strong);
}

.category-btn.active {
  background-color: var(--dark-green) !important;
  border-color: var(--dark-green) !important;
  color: white !important;
  font-weight: bold;
}

.result-section {
  margin-top: 32px;
  padding-top: 24px;
  border-top: 1px solid var(--glass-border);
}

.result-panel {
  background-color: var(--glass-bg-subtle);
  border: 1px solid var(--glass-border);
  border-radius: 12px;
  padding: 24px;
}

.result-loading,
.result-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 12px;
  min-height: 120px;
  color: var(--glass-text-muted);
  text-align: center;
}

.result-empty-icon {
  font-size: 36px;
  color: var(--glass-text-muted);
}

.result-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16px;
}

.result-title {
  margin: 0;
  font-size: 18px;
  color: var(--light-green);
  font-weight: 600;
  text-shadow: var(--glass-title-shadow);
}

.result-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 16px 24px;
  margin-bottom: 16px;
  font-size: 13px;
  color: var(--glass-text-muted);
}

.result-text {
  margin: 0 0 20px;
  font-size: 16px;
  line-height: 1.6;
  color: var(--glass-text-primary);
  text-shadow: var(--glass-text-shadow);
}

.confidence-block {
  margin-bottom: 12px;
}

.confidence-label {
  display: flex;
  justify-content: space-between;
  margin-bottom: 8px;
  font-size: 14px;
  color: var(--glass-text-secondary);
}

.confidence-label strong {
  color: var(--glass-text-primary);
  font-size: 18px;
}

.result-hint {
  margin: 16px 0 4px;
  font-size: 13px;
  color: var(--glass-text-muted);
}

.goto-warnings-btn {
  padding-left: 0 !important;
  color: #95de64 !important;
}

.goto-warnings-btn:hover {
  color: #b7eb8f !important;
}

@media (width <= 992px) {
  .analysis-body-container {
    flex-direction: column;
    gap: 24px;
  }

  .glass-page :deep(.ant-card-body) {
    padding: 16px;
  }
}

@media (width <= 576px) {
  .avatar-uploader :deep(.ant-upload.ant-upload-select-picture-card) {
    width: 200px;
    height: 200px;
  }
}
</style>
```

## 模块 11：智慧决策页面
文件路径：src/views/user/DecisionSupport.vue
对应说明书：4.7
```vue
<template>
  <AppLayout>
    <main class="main-content page-main-shell">
      <div class="content-wrapper glass-page page-card-fill page-card-body-stack-md">
        <a-card :bordered="false">
          <template #title>
            <div class="glass-card-title">智慧决策支持</div>
          </template>

          <div class="decision-dashboard page-grid-stack-md">
            <div class="left-column">
              <a-card
                title="待处理灾害预警"
                size="small"
                class="widget-card glass-widget-card">
                <a-list
                  :data-source="unhandledAlerts"
                  size="small">
                  <template #renderItem="{ item }">
                    <a-list-item
                      class="area-list-item"
                      :class="{ active: selectedArea && selectedArea.id === item.id }"
                      @click="selectArea(item)">
                      <a-list-item-meta>
                        <template #title>
                          <span class="area-item-title">{{ item.pointName }}</span>
                        </template>
                        <template #description>
                          <a-tag :color="getLevelColor(item.level)">
                            {{ getLevelText(item.level) }}
                          </a-tag>
                          <span class="alert-message-preview">{{ item.message }}</span>
                        </template>
                      </a-list-item-meta>
                    </a-list-item>
                  </template>
                  <template #empty>
                    <div class="empty-list-placeholder">暂无待处理预警</div>
                  </template>
                </a-list>
              </a-card>
              <a-card
                v-if="selectedArea"
                title="区域概览"
                size="small"
                class="widget-card glass-widget-card">
                <div
                  ref="mapRef"
                  class="mini-map-container"></div>
                <a-descriptions
                  :column="1"
                  size="small"
                  style="margin-top: 16px">
                  <a-descriptions-item label="经度">
                    {{ selectedArea.coords.lng }}
                  </a-descriptions-item>
                  <a-descriptions-item label="纬度">
                    {{ selectedArea.coords.lat }}
                  </a-descriptions-item>
                </a-descriptions>
              </a-card>
            </div>

            <div class="right-column">
              <div
                v-if="!isAreaSelected"
                class="placeholder-wrapper">
                <info-circle-outlined />
                <p>请从左侧列表选择一个预警进行决策分析</p>
              </div>

              <div
                v-else
                class="right-column-grid page-grid-stack-md">
                <a-card
                  title="实时监测数据"
                  size="small"
                  class="widget-card glass-widget-card">
                  <div class="geo-info-grid">
                    <div class="info-card">
                      <dashboard-outlined
                        class="info-icon"
                        :style="{ color: getStatusColor(selectedArea.pointStatus) }" />
                      <h4>设备状态</h4>
                      <p :style="{ color: getStatusColor(selectedArea.pointStatus) }">
                        {{ getStatusLabel(selectedArea.pointStatus) }}
                      </p>
                    </div>
                    <div class="info-card">
                      <heat-map-outlined class="info-icon" />
                      <h4>当前温度</h4>
                      <p>{{ selectedArea.pointTemp }}°C</p>
                    </div>
                    <div class="info-card">
                      <cloud-outlined class="info-icon" />
                      <h4>土壤湿度</h4>
                      <p>{{ selectedArea.pointSoilMoisture }}%</p>
                    </div>
                  </div>
                </a-card>

                <a-card
                  title="AI 决策建议"
                  size="small"
                  class="widget-card glass-widget-card">
                  <template #extra>
                    <a-button
                      type="primary"
                      size="small">
                      导出方案
                    </a-button>
                  </template>
                  <a-list
                    size="small"
                    :data-source="currentSuggestions"
                    class="suggestion-list">
                    <template #renderItem="{ item }">
                      <a-list-item>
                        <template #actions>
                          <a-tooltip title="标记为重要"><star-outlined /></a-tooltip>
                        </template>
                        <robot-outlined style="margin-right: 8px; color: #1890ff" />
                        {{ item }}
                      </a-list-item>
                    </template>
                  </a-list>
                </a-card>
              </div>
            </div>
          </div>
        </a-card>
      </div>
    </main>
  </AppLayout>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onBeforeUnmount, watch, nextTick } from 'vue'
import * as L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import {
  InfoCircleOutlined,
  RobotOutlined,
  StarOutlined,
  DashboardOutlined,
  HeatMapOutlined,
  CloudOutlined
} from '@ant-design/icons-vue'
import AppLayout from '@/layouts/AppLayout.vue'
import { useDataStore } from '@/stores/data'
import { createLeafletBaseMap, removeLeafletMap } from '@/composables/useLeafletBase'
import { getAlertLevelColor, getAlertLevelText } from '@/utils/alertLevel'
import {
  getMonitorStatusColor as getStatusColor,
  getMonitorStatusLabel as getStatusLabel
} from '@/utils/monitorStatus'

const dataStore = useDataStore()

const unhandledAlerts = computed(() => {
  const pointsMap = new Map(dataStore.monitorPoints.map((p) => [p.id, p]))
  return dataStore.unhandledAlerts
    .map((alert) => {
      const point = pointsMap.get(alert.pointId)
      return {
        ...alert,
        pointName: point?.name || `未知监测点 #${alert.pointId}`,
        coords: point ? { lat: point.lat, lng: point.lng } : { lat: 0, lng: 0 },
        pointStatus: point?.status || 'unknown',
        pointTemp: point?.temp ?? 'N/A',
        pointSoilMoisture: point?.soilMoisture ?? 'N/A'
      }
    })
    .sort((a, b) => b.time - a.time)
})

const currentSuggestions = computed(() => {
  if (!selectedArea.value) return []
  return generateSuggestions(selectedArea.value)
})

function generateSuggestions(area: any): string[] {
  const suggestions: string[] = []
  const message = area.message.toLowerCase()

  if (area.level === 'critical') {
    suggestions.push('最高优先级处理！立即通知所有相关应急负责人。')
  }
  if (area.level === 'high' || area.level === 'warning') {
    suggestions.push('高风险事件，建议2小时内响应。')
  }
  if (message.includes('湿度') || area.pointSoilMoisture < 20) {
    suggestions.push(`目标区域土壤湿度为 ${area.pointSoilMoisture}%，建议立即启动远程灌溉系统。`)
  }
  if (message.includes('温度') || area.pointTemp > 35) {
    suggestions.push(`目标区域温度已达 ${area.pointTemp}°C，建议启动田间降温预案（如喷雾）。`)
  }
  if (area.level === 'critical') {
    suggestions.push('评估是否需要疏散现场人员，确保安全。')
  }
  if (message.includes('设备') || message.includes('通信') || message.includes('电量')) {
    suggestions.push('派遣运维人员前往现场检修硬件设备。')
  }
  if (suggestions.length <= 1) {
    suggestions.push('根据常规流程处理该事件。')
    suggestions.push('记录处理过程，并归档。')
  }
  return suggestions
}

const selectedArea = ref<any>(null)
const isAreaSelected = computed(() => !!selectedArea.value)
const mapRef = ref<HTMLDivElement | null>(null)
let map: L.Map | null = null
let areaMarker = ref<L.Marker | null>(null)

const selectArea = (area: any) => {
  selectedArea.value = area
}

const getLevelColor = getAlertLevelColor
const getLevelText = getAlertLevelText
const initMap = () => {
  if (!mapRef.value) return
  map = createLeafletBaseMap(mapRef.value, {
    center: [35.1, 139.1],
    zoom: 11,
    tile: 'cartoDark',
    zoomControl: false
  })
}

const updateMap = (area: any) => {
  if (!map || !area.coords) return
  const { lat, lng } = area.coords
  if (areaMarker.value) {
    areaMarker.value.remove()
  }
  areaMarker.value = L.marker([lat, lng]).addTo(map)
  areaMarker.value.bindPopup(`<b>${area.pointName}</b><br/>${area.message}`).openPopup()
  map.flyTo([lat, lng], 13)
}

onMounted(() => {
  dataStore.fetchAlerts()
  dataStore.fetchMonitorPoints()
})

onBeforeUnmount(() => {
  removeLeafletMap(map)
  map = null
})
watch(selectedArea, (newArea) => {
  if (newArea) {
    if (!map) {
      nextTick(() => {
        if (mapRef.value) {
          initMap()
          if (map) {
            updateMap(newArea)
          }
        }
      })
    } else {
      updateMap(newArea)
    }
  }
})
</script>

<style scoped>
.decision-dashboard {
  display: grid;
  grid-template-columns: 350px 1fr;
  gap: 20px;
  width: 100%;
  height: 100%;
}

.left-column,
.right-column {
  display: flex;
  flex-direction: column;
  gap: 20px;

  min-height: 0;
}

.widget-card {
  display: flex;
  flex-direction: column;
}

.widget-card :deep(.ant-card-body) {
  flex-grow: 1;
  overflow-y: auto;
}

.area-list-item {
  cursor: pointer;
  padding: 8px 12px !important;
  border-radius: 4px;
  transition: background-color 0.2s;
  border-bottom: none !important;
  background-color: var(--glass-bg-item);
  margin-bottom: 4px;
}

.area-list-item:hover {
  background-color: var(--glass-bg-item-hover);
}

.area-list-item.active {
  background-color: var(--glass-bg-active);
  font-weight: bold;
}

.area-list-item :deep(.ant-list-item-meta-title),
.area-item-title {
  color: var(--glass-text-primary) !important;
  margin-bottom: 2px !important;
  font-weight: 500;
  text-shadow: var(--glass-text-shadow);
}

.area-list-item :deep(.ant-list-item-meta-description) {
  color: var(--glass-text-secondary);
}

.alert-message-preview {
  font-size: 12px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  display: block;
  max-width: 220px;
  color: var(--glass-text-secondary);
}

.empty-list-placeholder {
  color: var(--glass-text-muted);
  text-align: center;
  padding: 20px 0;
}

.placeholder-wrapper {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  height: 100%;
  color: var(--glass-text-muted);
  font-size: 16px;
  background-color: var(--glass-bg-subtle);
  border-radius: 8px;
  border: 1px dashed var(--glass-border);
}

.right-column-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 20px;
  height: 100%;
}

.geo-info-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
}

.info-card {
  text-align: center;
}

.info-icon {
  font-size: 28px;
  margin-bottom: 8px;
  color: var(--light-green, #eef1ea);
}

.info-card h4 {
  font-size: 14px;
  color: var(--glass-text-primary);
  margin-bottom: 4px;
  font-weight: 500;
  text-shadow: var(--glass-text-shadow);
}

.info-card p {
  display: inline-block;
  font-size: 13px;
  color: var(--glass-text-secondary);
  margin-bottom: 0;
  font-weight: 500;
  padding: 2px 10px;
  border-radius: 12px;
  background: rgb(0 0 0 / 30%);
  text-shadow: var(--glass-text-shadow);
}

.mini-map-container {
  height: 150px;
  border-radius: 4px;
  border: 1px solid var(--glass-border);
}

:deep(.ant-descriptions-item-label) {
  color: var(--glass-text-muted);
}

:deep(.ant-descriptions-item-content) {
  color: var(--glass-text-primary);
  text-shadow: var(--glass-text-shadow);
}

.suggestion-list :deep(.ant-list-item) {
  color: var(--glass-text-secondary);
  border: none !important;
  padding: 6px 0 !important;
  font-weight: 500;
  text-shadow: var(--glass-text-shadow);
}

@media (width <= 992px) {
  .left-column,
  .right-column {
    min-height: auto;
  }

  .placeholder-wrapper {
    min-height: 200px;
    padding: 24px;
    text-align: center;
  }

  .alert-message-preview {
    max-width: 100%;
  }
}

@media (width <= 576px) {
  .geo-info-grid {
    grid-template-columns: 1fr;
    gap: 12px;
  }

  .mini-map-container {
    height: 180px;
  }
}
</style>
```

## 模块 12：灾害实时监测页面
文件路径：src/views/user/MapVisualization.vue
对应说明书：4.4
```vue
<template>
  <AppLayout>
    <div class="content-wrapper glass-page map-page">
      <a-card
        class="map-card glass-ant-card"
        :bordered="false">
        <template #title>
          <div class="glass-card-title">地图 - 监测点实时分布</div>
        </template>
        <div
          ref="mapRef"
          class="map-container"></div>
      </a-card>

      <a-card
        class="actions-card glass-ant-card"
        :bordered="false">
        <template #title>
          <div class="glass-card-title">地图操作</div>
        </template>
        <a-space>
          <a-button
            type="primary"
            @click="zoomToAll">
            缩放至全部
          </a-button>
          <a-button
            class="refresh-btn"
            @click="refreshData">
            刷新数据
          </a-button>
        </a-space>
      </a-card>
    </div>
  </AppLayout>
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount, watch } from 'vue'
import { message } from 'ant-design-vue'
import { useDataStore } from '@/stores/data'
import AppLayout from '@/layouts/AppLayout.vue'
import {
  createLeafletBaseMap,
  invalidateLeafletSize,
  removeLeafletMap
} from '@/composables/useLeafletBase'
import { createMonitorPointLayer } from '@/composables/useMonitorPointLayer'
import * as L from 'leaflet'
import 'leaflet/dist/leaflet.css'

const dataStore = useDataStore()
const mapRef = ref<HTMLDivElement | null>(null)

let map: L.Map | null = null
let monitorLayer: ReturnType<typeof createMonitorPointLayer> | null = null

function renderMarkers() {
  if (!monitorLayer || !map) return
  monitorLayer.render(dataStore.monitorPoints, dataStore.alerts)
  zoomToAll()
}

async function initMap() {
  if (!mapRef.value) return
  map = createLeafletBaseMap(mapRef.value, {
    center: [38.44, 115.95],
    zoom: 8,
    tile: 'gaodeSatellite'
  })

  monitorLayer = createMonitorPointLayer(map, {
    onTriggerAlert: async (p) => {
      try {
        await dataStore.createAlert({
          pointId: p.id,
          level: 'medium',
          message: `手动触发：${p.name} 状态异常`
        })
      } catch {
        message.error('触发预警失败')
        throw new Error('trigger failed')
      }
    },
    onResolveAlert: async (p) => {
      const unhandled = dataStore.unhandledAlerts.find((a) => a.pointId === p.id)
      if (!unhandled) {
        message.info('该点暂无未处理预警')
        return false
      }
      try {
        await dataStore.updateAlert(unhandled.id, { handled: true })
        return true
      } catch {
        message.error('关闭预警失败')
        return false
      }
    }
  })

  invalidateLeafletSize(map)
}

async function refreshData() {
  message.loading({ content: '正在刷新数据...', key: 'refresh' })
  await Promise.all([dataStore.fetchMonitorPoints(), dataStore.fetchAlerts()])
  message.success({ content: '数据已更新！', key: 'refresh', duration: 2 })
}

function zoomToAll() {
  if (!monitorLayer || !map) return
  const layers = monitorLayer.cluster.getLayers()
  if (layers.length > 0) {
    const group = L.featureGroup(layers as L.Layer[])
    map.fitBounds(group.getBounds().pad(0.2))
  }
}

onMounted(async () => {
  await initMap()
  await refreshData()
  renderMarkers()

  watch(() => dataStore.monitorPoints, renderMarkers, { deep: true })

  watch(
    () => dataStore.alerts,
    () => {
      monitorLayer?.updatePopups(dataStore.monitorPoints, dataStore.alerts)
    },
    { deep: true }
  )
})

onBeforeUnmount(() => {
  monitorLayer?.detach()
  monitorLayer = null
  removeLeafletMap(map)
  map = null
})
</script>

<style scoped>
.map-page {
  height: 100%;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.map-page .glass-card-title {
  font-size: 18px;
}

.map-card {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.map-card :deep(.ant-card-body) {
  padding: 0 !important;
  flex: 1;
  position: relative;
  height: 100%;
}

.map-container {
  width: 100%;
  height: 100%;
  min-height: 400px;
  border-radius: 0 0 12px 12px;
  z-index: 1;
}

.actions-card {
  flex-shrink: 0;
}

.refresh-btn {
  background-color: var(--glass-bg-subtle) !important;
  border-color: var(--glass-border-strong) !important;
  color: var(--glass-text-primary) !important;
}

.map-container :deep(.custom-marker) {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
}

.map-container :deep(.marker-dot) {
  width: 18px;
  height: 18px;
  border-radius: 50%;
  border: 1px solid rgb(255 255 255 / 60%);
  box-shadow: 0 0 8px rgb(0 0 0 / 50%);
}

.map-container :deep(.marker-label) {
  font-size: 12px;
  color: white;
  text-shadow: 1px 1px 2px black;
  white-space: nowrap;
}

@media (width <= 576px) {
  .map-container {
    min-height: 280px;
  }

  .map-page .glass-card-title {
    font-size: 16px;
  }
}
</style>
```
