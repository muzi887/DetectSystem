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
