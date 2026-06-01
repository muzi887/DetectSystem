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
import {
  buildMonitorPopupHtml,
  createMonitorDivIcon
} from '@/composables/useMonitorMarkers'
import * as L from 'leaflet'
import 'leaflet.markercluster'
import 'leaflet/dist/leaflet.css'
import 'leaflet.markercluster/dist/MarkerCluster.css'
import 'leaflet.markercluster/dist/MarkerCluster.Default.css'

const dataStore = useDataStore()
const mapRef = ref<HTMLDivElement | null>(null)

let map: L.Map | null = null
let markerCluster: L.MarkerClusterGroup | null = null
const markersById = new Map<number, L.Marker>()

const buildPopupHtml = (point: any) => buildMonitorPopupHtml(point, dataStore.alerts)

function renderMarkers() {
  if (!markerCluster || !map) return
  markerCluster.clearLayers()
  markersById.clear()

  for (const p of dataStore.monitorPoints) {
    const icon = createMonitorDivIcon(p)
    const marker = L.marker([p.lat, p.lng], { icon })
    marker.bindPopup(buildPopupHtml(p))

    marker.on('popupopen', (e) => {
      const container = e.popup?.getElement()
      if (!container) return

      const triggerBtn = container.querySelector('.trigger') as HTMLButtonElement | null
      const closeBtn = container.querySelector('.close') as HTMLButtonElement | null

      if (triggerBtn) {
        triggerBtn.onclick = async () => {
          triggerBtn.disabled = true
          try {
            await dataStore.createAlert({
              pointId: p.id,
              level: 'medium',
              message: `手动触发：${p.name} 状态异常`
            })
            marker.setPopupContent(buildPopupHtml(p))
          } catch (err) {
            message.error('触发预警失败')
          } finally {
            triggerBtn.disabled = false
          }
        }
      }

      if (closeBtn) {
        closeBtn.onclick = async () => {
          const unhandled = dataStore.unhandledAlerts.find((a) => a.pointId === p.id)
          if (!unhandled) {
            message.info('该点暂无未处理预警')
            return
          }
          closeBtn.disabled = true
          try {
            await dataStore.updateAlert(unhandled.id, { handled: true })
            marker.setPopupContent(buildPopupHtml(p))
          } catch (err) {
            message.error('关闭预警失败')
          } finally {
            closeBtn.disabled = false
          }
        }
      }
    })

    markersById.set(p.id, marker)
    markerCluster.addLayer(marker)
  }
  zoomToAll()
}

async function initMap() {
  if (!mapRef.value) return
  map = createLeafletBaseMap(mapRef.value, {
    center: [38.44, 115.95],
    zoom: 8,
    tile: 'gaodeSatellite'
  })

  markerCluster = L.markerClusterGroup()
  markerCluster.addTo(map)
  invalidateLeafletSize(map)
}

async function refreshData() {
  message.loading({ content: '正在刷新数据...', key: 'refresh' })
  await Promise.all([dataStore.fetchMonitorPoints(), dataStore.fetchAlerts()])
  message.success({ content: '数据已更新！', key: 'refresh', duration: 2 })
}

function zoomToAll() {
  if (!markerCluster || !map) return
  const layers = markerCluster.getLayers()
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
      for (const p of dataStore.monitorPoints) {
        const mk = markersById.get(p.id)
        if (mk) mk.setPopupContent(buildPopupHtml(p))
      }
    },
    { deep: true }
  )
})

onBeforeUnmount(() => {
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
  min-height: 400px; /* Leaflet 需要容器高度 */
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

:deep(.custom-marker) {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
}

:deep(.marker-dot) {
  width: 18px;
  height: 18px;
  border-radius: 50%;
  border: 1px solid rgb(255 255 255 / 60%);
  box-shadow: 0 0 8px rgb(0 0 0 / 50%);
}

:deep(.marker-label) {
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
