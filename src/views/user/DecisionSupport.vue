<template>
  <AppLayout>
    <main class="main-content">
      <div class="content-wrapper">
        <a-card :bordered="false">
          <template #title>
            <div class="card-title">智慧决策支持</div>
          </template>

          <div class="decision-dashboard">
            <!-- 左侧列 -->
            <div class="left-column">
              <a-card
                title="待处理灾害预警"
                size="small"
                class="widget-card">
                <a-list
                  :data-source="unhandledAlerts"
                  size="small">
                  <template #renderItem="{ item }">
                    <a-list-item
                      class="area-list-item"
                      :class="{ active: selectedArea && selectedArea.id === item.id }"
                      @click="selectArea(item)">
                      <a-list-item-meta :title="item.pointName">
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
                class="widget-card">
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

            <!-- 右侧列 -->
            <div class="right-column">
              <div
                v-if="!isAreaSelected"
                class="placeholder-wrapper">
                <info-circle-outlined />
                <p>请从左侧列表选择一个预警进行决策分析</p>
              </div>

              <!-- ***** 修改：将右侧卡片包裹在一个新的 grid 容器中 ***** -->
              <div
                v-else
                class="right-column-grid">
                <a-card
                  title="实时监测数据"
                  size="small"
                  class="widget-card">
                  <div class="geo-info-grid">
                    <div class="info-card">
                      <dashboard-outlined
                        class="info-icon"
                        :style="{ color: getStatusColor(selectedArea.pointStatus) }" />
                      <h4>设备状态</h4>
                      <p :style="{ color: getStatusColor(selectedArea.pointStatus) }">
                        {{ selectedArea.pointStatus }}
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
                  class="widget-card">
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
              <!-- ***** 修改结束 ***** -->
            </div>
          </div>
        </a-card>
      </div>
    </main>
  </AppLayout>
</template>

<script setup lang="ts">
// Script 部分与上一版本完全相同，此处省略以保持简洁
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

const dataStore = useDataStore()

const unhandledAlerts = computed(() => {
  const pointsMap = new Map(dataStore.monitorPoints.map((p) => [p.id, p]))
  return dataStore.alerts
    .filter((alert) => !alert.handled)
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

const levelColors: Record<string, string> = {
  low: 'blue',
  medium: 'orange',
  high: 'red',
  warning: 'gold',
  critical: '#a70000'
}
const levelText: Record<string, string> = {
  low: '低',
  medium: '中',
  high: '高',
  warning: '警告',
  critical: '危急'
}
function getLevelColor(level: string) {
  return levelColors[level] || 'gray'
}
function getLevelText(level: string) {
  return levelText[level] || '未知'
}
function getStatusColor(status: string) {
  if (status === 'normal') return '#52c41a'
  if (status === 'warning') return '#fa8c16'
  if (status === 'critical') return '#cf1322'
  return '#fff'
}

const initMap = () => {
  if (!mapRef.value) return
  const darkTileLayer = L.tileLayer(
    'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png',
    { attribution: '&copy; CARTO', subdomains: 'abcd', maxZoom: 19 }
  )
  map = L.map(mapRef.value, { layers: [darkTileLayer], zoomControl: false }).setView(
    [35.1, 139.1],
    11
  )
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
  if (map) map.remove()
})
watch(selectedArea, (newArea) => {
  if (newArea) {
    if (!map) {
      // 1. 等待 DOM 更新，确保 v-if 渲染的 mapRef 元素已存在
      nextTick(() => {
        if (mapRef.value) {
          // 再次检查 mapRef 是否存在
          initMap()
          if (map) {
            updateMap(newArea)
          }
        }
      })
    } else {
      // 2. 如果 map 已经初始化，则直接更新标记点
      updateMap(newArea)
    }
  }
})
</script>

<style>
/* 全局弹窗样式保持不变 */
.leaflet-popup-content-wrapper {
  background: rgb(40 50 38 / 90%) !important;
  color: #eef1ea !important;
  border: 1px solid rgb(255 255 255 / 20%);
  border-radius: 8px !important;
  box-shadow: 0 4px 30px rgb(0 0 0 / 20%) !important;
  backdrop-filter: blur(10px);
}

.leaflet-popup-tip {
  background: rgb(40 50 38 / 90%) !important;
  border-left: 1px solid rgb(255 255 255 / 20%);
  border-bottom: 1px solid rgb(255 255 255 / 20%);
}

.leaflet-popup-content {
  margin: 14px 20px !important;
  line-height: 1.8;
  color: #eef1ea;
}

.leaflet-popup-close-button {
  color: #eef1ea !important;
  padding: 8px 8px 0 0 !important;
}
</style>

<style scoped>
/* Scoped 样式进行了布局优化 */
.main-content {
  flex-grow: 1;
  padding: 24px;
  display: flex;
  justify-content: center;
}

.content-wrapper {
  width: 100%;
  max-width: 1400px; /* 适当加宽以容纳三栏 */
}

.content-wrapper > :deep(.ant-card) {
  background-color: var(--glass-bg, rgb(255 255 255 / 10%));
  border-radius: 12px;
  border: 1px solid rgb(255 255 255 / 20%);
  backdrop-filter: blur(10px);
  height: 100%; /* 让卡片填满父容器 */
  display: flex;
  flex-direction: column;
}

.content-wrapper > :deep(.ant-card-head) {
  border-bottom: 1px solid rgb(255 255 255 / 20%);
}

.card-title {
  color: var(--light-green, #eef1ea);
  font-size: 20px;
  font-weight: bold;
}

.content-wrapper > :deep(.ant-card-body) {
  padding: 20px;
  flex-grow: 1; /* 让body填满剩余空间 */
  display: flex;
}

.decision-dashboard {
  display: grid;

  /* ***** 修改：左栏宽度微调，右侧占满剩余空间 ***** */
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

  /* ***** 新增：确保列本身可以拉伸 ***** */
  min-height: 0;
}

.widget-card {
  background-color: rgb(255 255 255 / 5%) !important;
  border: 1px solid rgb(255 255 255 / 15%) !important;
  color: white;

  /* ***** 新增：让卡片内部也采用 flex 布局以拉伸内容 ***** */
  display: flex;
  flex-direction: column;
}

.widget-card :deep(.ant-card-head) {
  background-color: rgb(255 255 255 / 10%);
  border-bottom: 1px solid rgb(255 255 255 / 15%) !important;
  color: var(--light-green, #eef1ea);
  font-size: 16px;
  padding: 0 16px;
}

.widget-card :deep(.ant-card-body) {
  padding: 12px;

  /* ***** 新增：让卡片内容区可以拉伸 ***** */
  flex-grow: 1;
  overflow-y: auto; /* 如果内容过多，允许滚动 */
}

.area-list-item {
  cursor: pointer;
  padding: 8px 12px !important;
  border-radius: 4px;
  transition: background-color 0.2s;
  border-bottom: none !important;
}

.area-list-item:hover {
  background-color: rgb(255 255 255 / 10%);
}

.area-list-item.active {
  background-color: var(--dark-green, #4a5c43);
  font-weight: bold;
}

.area-list-item :deep(.ant-list-item-meta-title) {
  color: white;
  margin-bottom: 2px !important;
}

.alert-message-preview {
  font-size: 12px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  display: block;
  max-width: 220px; /* 适当放宽 */
  color: rgb(255 255 255 / 70%);
}

.empty-list-placeholder {
  color: rgb(255 255 255 / 60%);
  text-align: center;
  padding: 20px 0;
}

.placeholder-wrapper {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  height: 100%;
  color: rgb(255 255 255 / 60%);
  font-size: 16px;
  background-color: rgb(255 255 255 / 5%);
  border-radius: 8px;
  border: 1px dashed rgb(255 255 255 / 20%);
}

/* ***** 新增：右侧新的 grid 布局 ***** */
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
  color: white;
  margin-bottom: 4px;
}

.info-card p {
  font-size: 13px;
  color: rgb(255 255 255 / 90%);
  margin-bottom: 0;
  font-weight: 500;
}

.mini-map-container {
  height: 150px;
  border-radius: 4px;
  border: 1px solid rgb(255 255 255 / 15%);
}

:deep(.ant-descriptions-item-label) {
  color: rgb(255 255 255 / 70%);
}

:deep(.ant-descriptions-item-content) {
  color: white;
}

.suggestion-list :deep(.ant-list-item) {
  color: rgb(255 255 255 / 90%);
  border: none !important;
  padding: 6px 0 !important;
}
</style>
