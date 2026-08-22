<template>
  <AppLayout>
    <main class="main-content page-main-shell page-main-shell--fill decision-page-root">
      <div class="content-wrapper glass-page page-card-fill page-card-body-stack-md decision-page-fill">
        <a-card :bordered="false">
          <template #title>
            <div class="glass-card-title">智慧决策支持</div>
          </template>

          <div class="decision-dashboard page-grid-stack-md">
            <!-- 左列：待处理预警队列 -->
            <div class="col-queue">
              <a-card
                size="small"
                class="widget-card glass-widget-card alert-panel"
                :class="{ 'alert-panel--collapsed': alertPanelCollapsed }">
                <template #title>
                  <div class="alert-panel-head">
                    <span>待处理灾害预警</span>
                    <a-badge
                      :count="unhandledAlerts.length"
                      :overflow-count="99"
                      :number-style="{ backgroundColor: 'var(--dark-green, #4a5c43)' }" />
                  </div>
                </template>
                <template #extra>
                  <a-button
                    type="text"
                    size="small"
                    class="alert-panel-toggle"
                    :aria-label="alertPanelCollapsed ? '展开预警列表' : '折叠预警列表'"
                    @click="alertPanelCollapsed = !alertPanelCollapsed">
                    <UpOutlined v-if="!alertPanelCollapsed" />
                    <DownOutlined v-else />
                  </a-button>
                </template>
                <div
                  v-show="!alertPanelCollapsed"
                  class="alert-list-body">
                  <div
                    class="level-filter"
                    role="tablist"
                    aria-label="预警级别筛选">
                    <button
                      v-for="opt in levelFilterOptions"
                      :key="opt.key"
                      type="button"
                      role="tab"
                      class="level-filter-btn"
                      :class="{ active: levelFilter === opt.key }"
                      :aria-selected="levelFilter === opt.key"
                      @click="levelFilter = opt.key">
                      {{ opt.label }}
                      <span class="level-filter-count">{{ opt.count }}</span>
                    </button>
                  </div>
                  <a-list
                    class="decision-alert-list"
                    :data-source="pagedAlerts"
                    size="small"
                    :pagination="false">
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
                      <div class="empty-list-placeholder">
                        {{ levelFilter === 'all' ? '暂无待处理预警' : '当前筛选下无预警' }}
                      </div>
                    </template>
                  </a-list>
                  <a-pagination
                    v-if="showAlertPagination"
                    v-model:current="alertPage"
                    class="alert-list-pagination"
                    :total="filteredAlerts.length"
                    :page-size="ALERT_PAGE_SIZE"
                    size="small"
                    :show-size-changer="false" />
                </div>
              </a-card>
            </div>

            <!-- 无待办：中+右占位 -->
            <div
              v-if="unhandledAlerts.length === 0"
              class="empty-situation-action">
              <info-circle-outlined />
              <p>当前无待处理预警，请先在预警中心或智能分析产生事件</p>
            </div>

            <!-- 有待办：中列态势 + 右列建议 -->
            <template v-else-if="selectedArea">
              <div class="col-situation">
                <a-card
                  title="实时监测数据"
                  size="small"
                  class="widget-card glass-widget-card monitor-panel">
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
                  title="区域概览"
                  size="small"
                  class="widget-card glass-widget-card map-panel">
                  <div
                    ref="mapRef"
                    class="mini-map-container"></div>
                  <a-descriptions
                    :column="1"
                    size="small"
                    class="map-coords">
                    <a-descriptions-item label="经度">
                      {{ selectedArea.coords.lng }}
                    </a-descriptions-item>
                    <a-descriptions-item label="纬度">
                      {{ selectedArea.coords.lat }}
                    </a-descriptions-item>
                  </a-descriptions>
                </a-card>
              </div>

              <div class="col-action">
                <a-card
                  title="AI 决策建议"
                  size="small"
                  class="widget-card glass-widget-card suggestion-panel">
                  <template #extra>
                    <a-button
                      type="primary"
                      size="small"
                      @click="exportPlan">
                      导出方案
                    </a-button>
                  </template>
                  <a-collapse
                    v-model:activeKey="activeCollapseKeys"
                    class="suggestion-collapse"
                    :bordered="false">
                    <a-collapse-panel
                      v-for="panel in suggestionCollapsePanels"
                      :key="panel.key"
                      :header="panel.title">
                      <ul class="suggestion-panel-list">
                        <li
                          v-for="(line, idx) in panel.lines"
                          :key="idx">
                          {{ line }}
                        </li>
                      </ul>
                    </a-collapse-panel>
                  </a-collapse>
                </a-card>
              </div>
            </template>
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
  DashboardOutlined,
  HeatMapOutlined,
  CloudOutlined,
  UpOutlined,
  DownOutlined
} from '@ant-design/icons-vue'
import { message } from 'ant-design-vue'
import AppLayout from '@/layouts/AppLayout.vue'
import { useDataStore } from '@/stores/data'
import { useRemoteSensingStore } from '@/stores/remoteSensing'
import { factorsFromAlert } from '@/utils/pestFactors'
import {
  getTreatment,
  parseDiseaseFromAlert,
  buildTreatmentPanels,
  flattenTreatmentPanels,
  type TreatmentPanel,
  useTreatmentGuide
} from '@/composables/useTreatmentGuide'
import { createLeafletBaseMap, invalidateLeafletSize, removeLeafletMap } from '@/composables/useLeafletBase'
import { createMonitorPointLayer } from '@/composables/useMonitorPointLayer'
import {
  getAlertLevelColor,
  getAlertLevelText,
  normalizeAlertLevel
} from '@/utils/alertLevel'
import {
  getMonitorStatusColor as getStatusColor,
  getMonitorStatusLabel as getStatusLabel
} from '@/utils/monitorStatus'

type EnrichedAlert = {
  id: number
  pointId: number
  level: string
  message: string
  time: number
  handled: boolean
  pointName: string
  coords: { lat: number; lng: number }
  pointStatus: string
  pointTemp: number | string
  pointSoilMoisture: number | string
}

type LevelFilterKey = 'all' | 'high' | 'medium' | 'low'

const ALERT_PAGE_SIZE = 6

const dataStore = useDataStore()
const remoteStore = useRemoteSensingStore()
const { disclaimer: treatmentDisclaimer } = useTreatmentGuide()

const alertPanelCollapsed = ref(false)
const levelFilter = ref<LevelFilterKey>('all')
const alertPage = ref(1)
const activeCollapseKeys = ref<string[]>([])

const unhandledAlerts = computed(() => {
  const pointsMap = new Map(dataStore.filteredMonitorPoints.map((p) => [p.id, p]))
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

function matchesLevelFilter(level: string, filter: LevelFilterKey): boolean {
  if (filter === 'all') return true
  const normalized = normalizeAlertLevel(level)
  if (filter === 'high') return normalized === 'critical' || normalized === 'high' || normalized === 'warning'
  if (filter === 'medium') return normalized === 'medium'
  if (filter === 'low') return normalized === 'low'
  return true
}

const filteredAlerts = computed(() =>
  unhandledAlerts.value.filter((alert) => matchesLevelFilter(alert.level, levelFilter.value))
)

const showAlertPagination = computed(() => filteredAlerts.value.length > ALERT_PAGE_SIZE)

const pagedAlerts = computed(() => {
  const start = (alertPage.value - 1) * ALERT_PAGE_SIZE
  return filteredAlerts.value.slice(start, start + ALERT_PAGE_SIZE)
})

const levelFilterOptions = computed(() => [
  { key: 'all' as const, label: '全部', count: unhandledAlerts.value.length },
  {
    key: 'high' as const,
    label: '高',
    count: unhandledAlerts.value.filter((a) => matchesLevelFilter(a.level, 'high')).length
  },
  {
    key: 'medium' as const,
    label: '中',
    count: unhandledAlerts.value.filter((a) => matchesLevelFilter(a.level, 'medium')).length
  },
  {
    key: 'low' as const,
    label: '低',
    count: unhandledAlerts.value.filter((a) => matchesLevelFilter(a.level, 'low')).length
  }
])

watch(filteredAlerts, (list) => {
  const maxPage = Math.max(1, Math.ceil(list.length / ALERT_PAGE_SIZE))
  if (alertPage.value > maxPage) {
    alertPage.value = maxPage
  }
})

const selectedArea = ref<EnrichedAlert | null>(null)

function buildRuleSuggestions(area: EnrichedAlert): string[] {
  const suggestions: string[] = []
  const rawMessage = area.message
  const messageLower = rawMessage.toLowerCase()

  if (rawMessage.includes('[自动预警]')) {
    if (rawMessage.includes('土壤湿度') && rawMessage.includes('低于')) {
      suggestions.push('墒情持续偏低，建议按地块启动灌溉并复核传感器。')
    }
    if (rawMessage.includes('气温') && rawMessage.includes('超过')) {
      suggestions.push('高温已持续超标，建议启动喷雾/遮阴等田间降温预案。')
    }
    if (rawMessage.includes('偏高') || rawMessage.includes('涝')) {
      suggestions.push('墒情过高，注意排水，避免涝渍。')
    }
    if (suggestions.length) return suggestions
  }

  if (rawMessage.includes('[虫情风险]')) {
    suggestions.push('按预警中的风险因子安排巡田，优先复核高湿与降水窗口。')
    return suggestions
  }
  if (rawMessage.includes('[极端天气]')) {
    suggestions.push('按极端天气类型执行热害/防涝/防风预案，并提高未来 3 日巡查频次。')
    return suggestions
  }

  if (area.level === 'critical') {
    suggestions.push('最高优先级处理！立即通知所有相关应急负责人。')
  }
  if (area.level === 'high' || area.level === 'warning') {
    suggestions.push('高风险事件，建议2小时内响应。')
  }
  if (messageLower.includes('湿度') || (typeof area.pointSoilMoisture === 'number' && area.pointSoilMoisture < 20)) {
    suggestions.push(`目标区域土壤湿度为 ${area.pointSoilMoisture}%，建议立即启动远程灌溉系统。`)
  }
  if (messageLower.includes('温度') || (typeof area.pointTemp === 'number' && area.pointTemp > 35)) {
    suggestions.push(`目标区域温度已达 ${area.pointTemp}°C，建议启动田间降温预案（如喷雾）。`)
  }
  if (area.level === 'critical') {
    suggestions.push('评估是否需要疏散现场人员，确保安全。')
  }
  if (
    messageLower.includes('设备') ||
    messageLower.includes('通信') ||
    messageLower.includes('电量')
  ) {
    suggestions.push('派遣运维人员前往现场检修硬件设备。')
  }
  if (suggestions.length === 0) {
    suggestions.push('根据常规流程处理该事件。')
    suggestions.push('记录处理过程，并归档。')
  }
  return suggestions
}

const knowledgePanels = computed((): TreatmentPanel[] => {
  if (!selectedArea.value) return []
  const rawMessage = selectedArea.value.message
  if (!rawMessage.includes('[AI识别]')) return []
  const diseaseLabel = parseDiseaseFromAlert(rawMessage)
  if (!diseaseLabel) return []
  return buildTreatmentPanels(getTreatment(diseaseLabel))
})

const ruleSuggestions = computed(() => {
  if (!selectedArea.value) return []
  return buildRuleSuggestions(selectedArea.value)
})

const pestFactorLines = computed(() => {
  const area = selectedArea.value
  if (!area || !area.message.includes('[虫情风险]')) return []
  const field = remoteStore.fields.find((item) => Number(item.monitorPointId) === area.pointId)
  const prediction = remoteStore.pestPredictions.find((row) => row.fieldId === field?.id)
  return factorsFromAlert(area.message, prediction)
})

const suggestionCollapsePanels = computed((): TreatmentPanel[] => {
  const panels = [...knowledgePanels.value]
  const factors = pestFactorLines.value
  if (factors.length) {
    panels.push({ key: 'pest-factors', title: '风险因子', lines: factors })
  }
  const rules = ruleSuggestions.value
  if (rules.length) {
    panels.push({ key: 'linkage', title: '联动处置建议', lines: rules })
  }
  if (panels.length === 0) {
    panels.push({
      key: 'general',
      title: '通用处置',
      lines: ['根据常规流程处理该事件。', '记录处理过程，并归档。']
    })
  }
  return panels
})

const exportLines = computed(() => {
  const knowledge = flattenTreatmentPanels(knowledgePanels.value)
  const factors = pestFactorLines.value
  const rules = ruleSuggestions.value
  const extra = [
    ...factors.map((line) => `【风险因子】${line}`),
    ...rules.map((line) => `【联动处置建议】${line}`)
  ]
  if (extra.length) {
    return [...knowledge, ...extra]
  }
  return knowledge.length ? knowledge : ruleSuggestions.value
})

function resolveDefaultCollapseKeys(panels: TreatmentPanel[]): string[] {
  const keys: string[] = []
  if (panels.some((p) => p.key === 'pest-factors')) keys.push('pest-factors')
  if (panels.some((p) => p.key === 'linkage')) keys.push('linkage')
  if (panels.some((p) => p.key === 'chemical')) keys.push('chemical')
  else if (panels.some((p) => p.key === 'summary')) keys.push('summary')
  return keys.length ? keys : panels.slice(0, 1).map((p) => p.key)
}

function exportPlan() {
  if (!selectedArea.value || exportLines.value.length === 0) {
    message.warning('暂无建议可导出')
    return
  }

  const area = selectedArea.value
  const header = [
    '智慧决策方案',
    `监测点：${area.pointName}`,
    `预警：${area.message}`,
    `导出时间：${new Date().toLocaleString('zh-CN')}`,
    ''
  ].join('\n')
  const body = exportLines.value.map((line, index) => `${index + 1}. ${line}`).join('\n')
  const footer = `\n\n---\n${treatmentDisclaimer}`

  const blob = new Blob([`${header}${body}${footer}`], {
    type: 'text/plain;charset=utf-8'
  })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = `决策方案-${area.id}-${Date.now()}.txt`
  link.click()
  URL.revokeObjectURL(url)
  message.success('方案已导出')
}

const mapRef = ref<HTMLDivElement | null>(null)
let map: L.Map | null = null
let monitorLayer: ReturnType<typeof createMonitorPointLayer> | null = null

function syncDefaultSelection() {
  const all = unhandledAlerts.value
  const list = filteredAlerts.value

  if (all.length === 0) {
    selectedArea.value = null
    return
  }

  if (list.length === 0) {
    if (selectedArea.value && !all.some((alert) => alert.id === selectedArea.value!.id)) {
      selectedArea.value = null
    }
    return
  }

  const stillExists =
    selectedArea.value != null && list.some((alert) => alert.id === selectedArea.value!.id)
  if (!stillExists) {
    selectedArea.value = list[0]
  }
}

const selectArea = (area: EnrichedAlert) => {
  selectedArea.value = area
}

const getLevelColor = getAlertLevelColor
const getLevelText = getAlertLevelText

function renderMapMarkers() {
  if (!monitorLayer) return
  monitorLayer.render(dataStore.filteredMonitorPoints, dataStore.filteredAlerts)
}

function initMap() {
  if (!mapRef.value || map) return
  map = createLeafletBaseMap(mapRef.value, {
    center: [38.44, 115.95],
    zoom: 8,
    tile: 'gaodeSatellite'
  })
  monitorLayer = createMonitorPointLayer(map, { readonly: true })
  renderMapMarkers()
  invalidateLeafletSize(map)
}

function focusSelectedOnMap(area: EnrichedAlert) {
  if (!monitorLayer || !map) return
  monitorLayer.highlightPoint(area.pointId, { maxZoom: 14 })
  invalidateLeafletSize(map)
}

onMounted(async () => {
  await Promise.all([
    dataStore.fetchAlerts(),
    dataStore.fetchMonitorPoints(),
    remoteStore.fetchAll().catch(() => undefined)
  ])
  syncDefaultSelection()
})

onBeforeUnmount(() => {
  monitorLayer?.detach()
  monitorLayer = null
  removeLeafletMap(map)
  map = null
})

watch(levelFilter, () => {
  alertPage.value = 1
  syncDefaultSelection()
})

watch(unhandledAlerts, () => {
  syncDefaultSelection()
})

watch(selectedArea, (newArea) => {
  if (!newArea) return
  nextTick(() => {
    if (!map) initMap()
    if (map && monitorLayer) {
      focusSelectedOnMap(newArea)
    }
  })
})

watch(
  suggestionCollapsePanels,
  (panels) => {
    if (panels.length) {
      activeCollapseKeys.value = resolveDefaultCollapseKeys(panels)
    }
  },
  { immediate: true }
)

watch(
  () => dataStore.filteredMonitorPoints,
  () => {
    renderMapMarkers()
    if (selectedArea.value) {
      nextTick(() => focusSelectedOnMap(selectedArea.value!))
    }
  },
  { deep: true }
)

watch(
  () => dataStore.filteredAlerts,
  () => {
    monitorLayer?.updatePopups(dataStore.filteredMonitorPoints, dataStore.filteredAlerts)
  },
  { deep: true }
)

watch(
  () => dataStore.selectedRegion,
  () => {
    renderMapMarkers()
    syncDefaultSelection()
  }
)
</script>

<style scoped>
.decision-page-root {
  width: 100%;
}

.decision-dashboard {
  display: grid;
  grid-template-columns: minmax(260px, 300px) minmax(0, 1fr) minmax(300px, 360px);
  gap: 16px;
  width: 100%;
  flex: 1;
  min-height: 0;
  overflow: hidden;
}

.col-queue,
.col-situation,
.col-action {
  display: flex;
  flex-direction: column;
  min-height: 0;
  overflow: hidden;
}

.col-queue {
  height: 100%;
}

.col-situation {
  gap: 16px;
}

.widget-card {
  display: flex;
  flex-direction: column;
  min-height: 0;
}

.alert-panel {
  flex: 1;
  min-height: 0;
  overflow: hidden;
}

.alert-panel--collapsed {
  flex: 0 0 auto;
}

.alert-panel--collapsed :deep(.ant-card-body) {
  display: none;
}

.alert-panel :deep(.ant-card-body) {
  flex: 1;
  min-height: 0;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  padding: 12px;
}

.alert-panel-head {
  display: flex;
  align-items: center;
  gap: 8px;
}

.alert-panel-toggle {
  color: var(--light-green, #eef1ea) !important;
}

.alert-list-body {
  flex: 1;
  min-height: 0;
  display: flex;
  flex-direction: column;
  gap: 10px;
  overflow: hidden;
}

.level-filter {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  flex-shrink: 0;
}

.level-filter-btn {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 2px 8px;
  border-radius: 4px;
  border: 1px solid var(--glass-border);
  background: rgb(0 0 0 / 20%);
  color: var(--glass-text-secondary);
  font-size: 12px;
  cursor: pointer;
  transition: background-color 0.2s, border-color 0.2s;
}

.level-filter-btn:hover {
  background: rgb(255 255 255 / 10%);
  color: var(--glass-text-primary);
}

.level-filter-btn.active {
  background: rgb(74 92 67 / 55%);
  border-color: var(--dark-green, #4a5c43);
  color: var(--light-green, #eef1ea);
  font-weight: 600;
}

.level-filter-count {
  min-width: 16px;
  padding: 0 4px;
  border-radius: 8px;
  background: rgb(0 0 0 / 30%);
  font-size: 11px;
  line-height: 16px;
  text-align: center;
}

.decision-alert-list {
  flex: 1;
  min-height: 0;
  overflow: hidden;
}

.decision-alert-list :deep(.ant-spin-nested-loading),
.decision-alert-list :deep(.ant-spin-container) {
  height: 100%;
}

.decision-alert-list :deep(.ant-list-items) {
  border: none;
}

.alert-list-pagination {
  flex-shrink: 0;
  display: flex;
  justify-content: center;
  padding-top: 4px;
  margin-top: auto;
}

.alert-list-pagination :deep(.ant-pagination-item a) {
  color: var(--light-green);
}

.alert-list-pagination :deep(.ant-pagination-item),
.alert-list-pagination :deep(.ant-pagination-prev .ant-pagination-item-link),
.alert-list-pagination :deep(.ant-pagination-next .ant-pagination-item-link) {
  background-color: transparent !important;
  border-color: var(--glass-border-strong, var(--glass-border)) !important;
  color: var(--glass-text-primary);
}

.alert-list-pagination :deep(.ant-pagination-item-active) {
  background-color: var(--dark-green, #4a5c43) !important;
  border-color: var(--dark-green, #4a5c43) !important;
}

.alert-list-pagination :deep(.ant-pagination-item-active a) {
  color: white !important;
}

.monitor-panel {
  flex: 0 0 auto;
}

.monitor-panel :deep(.ant-card-body) {
  overflow: visible;
}

.map-panel {
  flex: 1;
  min-height: 0;
  overflow: hidden;
}

.map-panel :deep(.ant-card-body) {
  flex: 1;
  min-height: 0;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.map-coords {
  margin-top: 12px;
  flex-shrink: 0;
}

.suggestion-panel {
  flex: 1;
  min-height: 0;
  overflow: hidden;
}

.suggestion-panel :deep(.ant-card-body) {
  flex: 1;
  min-height: 0;
  overflow: hidden;
}

.suggestion-collapse {
  background: transparent;
}

.suggestion-collapse :deep(.ant-collapse-item) {
  border-color: var(--glass-border) !important;
  margin-bottom: 8px;
}

.suggestion-collapse :deep(.ant-collapse-header) {
  color: var(--light-green, #eef1ea) !important;
  font-weight: 600;
  padding: 8px 12px !important;
  background: rgb(0 0 0 / 15%);
  border-radius: 4px;
}

.suggestion-collapse :deep(.ant-collapse-content) {
  background: transparent;
  border-top: 1px solid var(--glass-border);
}

.suggestion-collapse :deep(.ant-collapse-content-box) {
  padding: 10px 12px !important;
}

.suggestion-panel-list {
  margin: 0;
  padding-left: 18px;
  color: var(--glass-text-secondary);
  font-size: 13px;
  line-height: 1.6;
}

.suggestion-panel-list li {
  margin-bottom: 6px;
}

.suggestion-panel-list li:last-child {
  margin-bottom: 0;
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
  max-width: 200px;
  color: var(--glass-text-secondary);
}

.empty-list-placeholder {
  color: var(--glass-text-muted);
  text-align: center;
  padding: 16px 0;
}

.empty-situation-action {
  grid-column: 2 / -1;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  min-height: 0;
  color: var(--glass-text-muted);
  font-size: 16px;
  background-color: var(--glass-bg-subtle);
  border-radius: 8px;
  border: 1px dashed var(--glass-border);
  text-align: center;
  padding: 24px;
}

.empty-situation-action .anticon {
  font-size: 32px;
  margin-bottom: 12px;
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
  flex: 1;
  min-height: 180px;
  width: 100%;
  border-radius: 4px;
  border: 1px solid var(--glass-border);
  z-index: 1;
}

.mini-map-container :deep(.custom-marker) {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
}

.mini-map-container :deep(.marker-dot) {
  width: 18px;
  height: 18px;
  border-radius: 50%;
  border: 1px solid rgb(255 255 255 / 60%);
  box-shadow: 0 0 8px rgb(0 0 0 / 50%);
}

.mini-map-container :deep(.marker-label) {
  font-size: 12px;
  color: white;
  text-shadow: 1px 1px 2px black;
  white-space: nowrap;
}

:deep(.ant-descriptions-item-label) {
  color: var(--glass-text-muted);
}

:deep(.ant-descriptions-item-content) {
  color: var(--glass-text-primary);
  text-shadow: var(--glass-text-shadow);
}

@media (width <= 992px) {
  .decision-page-root.page-main-shell--fill {
    overflow-y: auto;
    flex: none;
    height: auto;
  }

  .decision-dashboard {
    grid-template-columns: 1fr;
    grid-template-rows: auto auto auto;
    height: auto;
    overflow: visible;
  }

  .empty-situation-action {
    grid-column: 1;
    min-height: 200px;
  }

  .col-queue,
  .col-situation,
  .col-action {
    min-height: auto;
  }

  .alert-message-preview {
    max-width: 100%;
  }

  .map-panel {
    min-height: 240px;
  }
}

@media (width <= 576px) {
  .geo-info-grid {
    grid-template-columns: 1fr;
    gap: 12px;
  }

  .mini-map-container {
    min-height: 160px;
  }

  .level-filter {
    gap: 4px;
  }

  .level-filter-btn {
    font-size: 11px;
    padding: 2px 6px;
  }
}
</style>
