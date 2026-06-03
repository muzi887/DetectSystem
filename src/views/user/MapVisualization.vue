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
