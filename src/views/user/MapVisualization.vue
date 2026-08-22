<template>
  <AppLayout>
    <div class="content-wrapper glass-page map-page">
      <a-card
        class="map-card glass-ant-card"
        :bordered="false">
        <template #title>
          <div class="glass-card-title">地图 - 监测点实时分布</div>
        </template>
        <template #extra>
          <span class="map-region-hint">当前区域：{{ currentRegionLabel }}</span>
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

    <a-drawer
      v-model:open="drawerOpen"
      :title="selectedPoint?.name || '监测站'"
      root-class-name="station-drawer"
      :width="480">
      <div class="station-status-row">
        <span
          class="station-online"
          :class="selectedPoint?.online === false ? 'is-offline' : 'is-online'">
          {{ selectedPoint?.online === false ? '离线' : '在线' }}
        </span>
        <span class="station-last-seen">最后上报 {{ formatLastSeen(selectedPoint?.lastSeenAt) }}</span>
      </div>
      <div class="station-metric-grid">
        <div class="station-metric">
          <span class="station-metric-label">气温</span>
          <span class="station-metric-value">{{ drawerTemp }} ℃</span>
        </div>
        <div class="station-metric">
          <span class="station-metric-label">湿度</span>
          <span class="station-metric-value">{{ drawerRh }}</span>
        </div>
        <div class="station-metric">
          <span class="station-metric-label">墒情</span>
          <span class="station-metric-value">{{ drawerVwc }} %</span>
        </div>
        <div class="station-metric">
          <span class="station-metric-label">土温</span>
          <span class="station-metric-value">{{ drawerSoilTemp }} ℃</span>
        </div>
      </div>
      <h4 class="station-table-title">近 7 日读数</h4>
      <a-table
        class="glass-ant-table"
        size="small"
        :pagination="false"
        :data-source="drawerRows"
        :columns="drawerColumns"
        row-key="id" />
    </a-drawer>
  </AppLayout>
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount, watch, computed } from 'vue'
import { message } from 'ant-design-vue'
import { useDataStore } from '@/stores/data'
import AppLayout from '@/layouts/AppLayout.vue'
import {
  createLeafletBaseMap,
  invalidateLeafletSize,
  removeLeafletMap
} from '@/composables/useLeafletBase'
import { createMonitorPointLayer, type MonitorPointRecord } from '@/composables/useMonitorPointLayer'
import { getMonitorRegion } from '@/constants/monitorRegions'
import { fetchSensorReadings } from '@/api/rules'
import { last7DayRange, type SensorReading } from '@/utils/sensorReadings'
import * as L from 'leaflet'
import 'leaflet/dist/leaflet.css'

const dataStore = useDataStore()
const mapRef = ref<HTMLDivElement | null>(null)
const drawerOpen = ref(false)
const selectedPoint = ref<MonitorPointRecord | null>(null)
const drawerReadings = ref<SensorReading[]>([])

let map: L.Map | null = null
let monitorLayer: ReturnType<typeof createMonitorPointLayer> | null = null

const currentRegionLabel = computed(
  () => getMonitorRegion(dataStore.selectedRegion).label
)

const liveReading = computed(() =>
  selectedPoint.value ? dataStore.getWeatherReadingByPointId(selectedPoint.value.id) : undefined
)

const drawerTemp = computed(() => liveReading.value?.airTemp ?? selectedPoint.value?.temp ?? '—')
const drawerRh = computed(() =>
  liveReading.value ? `${liveReading.value.airRh} %RH` : '—'
)
const drawerVwc = computed(
  () => liveReading.value?.soilVwc ?? selectedPoint.value?.soilMoisture ?? '—'
)
function soilTempOf(row?: { soilTemp10cm?: number; soilTemp10Cm?: number } | null) {
  if (!row) return undefined
  const value = row.soilTemp10cm ?? row.soilTemp10Cm
  return value != null && Number.isFinite(Number(value)) ? Number(value) : undefined
}

const drawerSoilTemp = computed(() => {
  const live = soilTempOf(liveReading.value)
  if (live != null) return live
  const rows = drawerReadings.value
  return soilTempOf(rows[rows.length - 1]) ?? '—'
})

const drawerRows = computed(() =>
  drawerReadings.value.map((row) => ({
    ...row,
    date: String(row.recordedAt).slice(0, 10),
    soilTemp10cm: soilTempOf(row)
  }))
)

const drawerColumns = [
  { title: '日期', dataIndex: 'date', key: 'date' },
  { title: '气温 ℃', dataIndex: 'airTemp', key: 'airTemp' },
  { title: '湿度', dataIndex: 'airRh', key: 'airRh' },
  { title: '墒情 %', dataIndex: 'soilVwc', key: 'soilVwc' },
  { title: '土温 ℃', dataIndex: 'soilTemp10cm', key: 'soilTemp10cm' }
]

function formatLastSeen(value?: string) {
  if (!value) return '暂无'
  return String(value).replace('T', ' ').replace(/\+.*/, '')
}

async function openPointDrawer(point: MonitorPointRecord) {
  selectedPoint.value = point
  drawerOpen.value = true
  const { from, to } = last7DayRange()
  try {
    const res = await fetchSensorReadings(point.id, from, to)
    drawerReadings.value = res.data || []
  } catch {
    drawerReadings.value = []
  }
}

function renderMarkers() {
  if (!monitorLayer || !map) return
  monitorLayer.render(dataStore.filteredMonitorPoints, dataStore.filteredAlerts)
  zoomToAll()
}

async function initMap() {
  if (!mapRef.value) return
  const region = getMonitorRegion(dataStore.selectedRegion)
  map = createLeafletBaseMap(mapRef.value, {
    center: region.center,
    zoom: region.zoom,
    tile: 'gaodeSatellite'
  })

  monitorLayer = createMonitorPointLayer(map, {
    onSelectPoint: (point) => {
      void openPointDrawer(point)
    },
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
  await Promise.all([
    dataStore.fetchMonitorPoints(),
    dataStore.fetchAlerts(),
    dataStore.fetchWeatherReadings().catch(() => {
      message.warning('气象读数加载失败，请检查 Mock 服务')
    })
  ])
  message.success({ content: '数据已更新！', key: 'refresh', duration: 2 })
}

function zoomToAll() {
  if (!monitorLayer || !map) return
  const layers = monitorLayer.cluster.getLayers()
  if (layers.length > 0) {
    const group = L.featureGroup(layers as L.Layer[])
    map.fitBounds(group.getBounds().pad(0.2))
    return
  }
  const region = getMonitorRegion(dataStore.selectedRegion)
  map.setView(region.center, region.zoom)
}

onMounted(async () => {
  await initMap()
  await refreshData()
  renderMarkers()

  watch(() => dataStore.filteredMonitorPoints, renderMarkers, { deep: true })
  watch(() => dataStore.selectedRegion, renderMarkers)

  watch(
    () => dataStore.filteredAlerts,
    () => {
      monitorLayer?.updatePopups(dataStore.filteredMonitorPoints, dataStore.filteredAlerts)
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

.map-region-hint {
  color: rgb(255 255 255 / 70%);
  font-size: 13px;
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

.station-status-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 16px;
}

.station-online {
  display: inline-flex;
  align-items: center;
  height: 24px;
  padding: 0 10px;
  font-size: 12px;
  border-radius: 999px;
  border: 1px solid var(--glass-border-strong);
  background: var(--glass-bg-item);
}

.station-online.is-online {
  border-color: rgb(115 209 61 / 50%);
  color: #b7eb8f;
}

.station-online.is-offline {
  border-color: rgb(255 255 255 / 25%);
  color: var(--glass-text-muted);
}

.station-last-seen {
  font-size: 12px;
  color: var(--glass-text-muted);
  text-shadow: var(--glass-text-shadow);
}

.station-metric-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
  margin-bottom: 20px;
}

.station-metric {
  display: flex;
  flex-direction: column;
  gap: 4px;
  padding: 12px;
  border: 1px solid var(--glass-border);
  border-radius: 10px;
  background: var(--glass-bg-subtle);
}

.station-metric-label {
  font-size: 12px;
  color: var(--glass-text-muted);
}

.station-metric-value {
  font-size: 18px;
  font-weight: 600;
  color: var(--glass-text-primary);
  text-shadow: var(--glass-text-shadow);
}

.station-table-title {
  margin: 0 0 10px;
  font-size: 14px;
  font-weight: 600;
  color: var(--light-green);
  text-shadow: var(--glass-title-shadow);
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
