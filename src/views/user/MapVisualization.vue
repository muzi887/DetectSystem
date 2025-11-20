<template>
  <!-- 使用 AppLayout 包裹内容 -->
  <AppLayout>
    <div class="content-wrapper">
      <!-- 地图容器卡片 -->
      <a-card
        class="map-card"
        :bordered="false">
        <template #title>
          <div class="card-title">地图 - 监测点实时分布</div>
        </template>
        <div
          ref="mapRef"
          class="map-container"></div>
      </a-card>

      <!-- 操作面板卡片 -->
      <a-card
        class="actions-card"
        :bordered="false">
        <template #title>
          <div class="card-title">地图操作</div>
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
import { ref, onMounted, onBeforeUnmount, watch, nextTick } from 'vue'
import { message } from 'ant-design-vue'
import { useDataStore } from '@/stores/data'
// 引入布局组件
import AppLayout from '@/layouts/AppLayout.vue'
import * as L from 'leaflet'
import 'leaflet.markercluster'
import 'leaflet/dist/leaflet.css'
import 'leaflet.markercluster/dist/MarkerCluster.css'
import 'leaflet.markercluster/dist/MarkerCluster.Default.css'

// --- 响应式引用和状态管理 ---
const dataStore = useDataStore()
const mapRef = ref<HTMLDivElement | null>(null)

let map: L.Map | null = null
let markerCluster: L.MarkerClusterGroup | null = null
const markersById = new Map<number, L.Marker>()

// --- 样式与内容生成函数 ---

function statusColor(status: string) {
  if (status === 'normal') return '#52c41a'
  if (status === 'warning') return '#fa8c16'
  if (status === 'critical') return '#cf1322'
  return '#1890ff'
}

function createDivIcon(point: any) {
  const color = statusColor(point.status)
  const html = `
    <div class="custom-marker">
      <div class="marker-dot" style="background:${color};"></div>
      <div class="marker-label">${point.name}</div>
    </div>
  `
  return L.divIcon({
    html,
    className: 'leaflet-custom-icon',
    iconSize: [80, 40],
    iconAnchor: [40, 20],
    popupAnchor: [0, -20]
  })
}

function buildPopupHtml(point: any) {
  const unhandled = dataStore.alerts.find((a) => a.pointId === point.id && !a.handled)
  const alertInfo = unhandled
    ? `<div class="popup-alert-info">未处理预警: ${unhandled.message}</div>`
    : ''

  return `
    <div class="leaflet-popup-content-themed">
      <div class="popup-title">${point.name}</div>
      <div class="popup-info">温度: <strong>${point.temp}°C</strong></div>
      <div class="popup-info">土壤湿度: <strong>${point.soilMoisture}%</strong></div>
      <div class="popup-info">状态: <strong style="color:${statusColor(point.status)}">${point.status || '未知'}</strong></div>
      ${alertInfo}
      <div class="popup-actions">
        <button data-action="trigger" data-id="${point.id}" class="popup-btn trigger">手动触发</button>
        <button data-action="close" data-id="${point.id}" class="popup-btn close">标记解决</button>
      </div>
    </div>
  `
}

function renderMarkers() {
  if (!markerCluster || !map) return
  markerCluster.clearLayers()
  markersById.clear()

  for (const p of dataStore.monitorPoints) {
    const icon = createDivIcon(p)
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
          const unhandled = dataStore.alerts.find((a) => a.pointId === p.id && !a.handled)
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
  const darkTileLayer = L.tileLayer(
    'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png',
    {
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
      subdomains: 'abcd',
      maxZoom: 19
    }
  )

  map = L.map(mapRef.value, {
    layers: [darkTileLayer]
  }).setView([35.05, 139.05], 9)

  markerCluster = L.markerClusterGroup()
  markerCluster.addTo(map)

  // 修复 Leaflet 在 Flex 布局中可能出现的渲染大小问题
  setTimeout(() => {
    map?.invalidateSize()
  }, 100)
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

// 6. 生命周期钩子
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
  if (map) {
    map.remove()
    map = null
  }
})
</script>

<!-- 全局样式：Leaflet 覆盖 -->
<style>
/* 自定义 Leaflet 弹窗样式 */
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
}

.leaflet-popup-close-button {
  color: #eef1ea !important;
  padding: 8px 8px 0 0 !important;
}

/* 自定义聚合点样式 */
.marker-cluster-small,
.marker-cluster-medium,
.marker-cluster-large {
  background-color: rgb(74 92 67 / 60%) !important;
  border: 2px solid #677662;
}

.marker-cluster-small div,
.marker-cluster-medium div,
.marker-cluster-large div {
  background-color: rgb(42 60 35 / 80%) !important;
  color: white !important;
}
</style>

<style scoped>
/* 变量定义 (如果 AppLayout 样式没穿透，这里可能需要，但通常不需要了) */
.content-wrapper {
  /* 关键修改：让内容区域填满 AppLayout 留下的空间 */
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

/* 卡片通用玻璃样式 */
.map-card,
.actions-card {
  background-color: rgb(255 255 255 / 10%);
  border-radius: 12px;
  border: 1px solid rgb(255 255 255 / 20%);
  backdrop-filter: blur(10px);
  box-shadow: 0 4px 30px rgb(0 0 0 / 10%);
}

:deep(.ant-card-head) {
  border-bottom: 1px solid rgb(255 255 255 / 20%);
}

.card-title {
  color: #eef1ea;
  font-size: 18px;
  font-weight: bold;
}

:deep(.ant-card-body) {
  padding: 16px;
}

.map-card {
  /* 关键修改：使用 flex: 1 占据剩余所有垂直空间 */
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden; /* 防止内容溢出 */
}

.map-card :deep(.ant-card-body) {
  padding: 0 !important;
  flex: 1; /* 让 body 填满卡片 */
  position: relative; /* 为地图绝对定位做准备（可选，视leaflet行为而定） */
  height: 100%; /* 确保高度传递 */
}

.map-container {
  width: 100%;
  height: 100%; /* 必须设置高度，否则 leaflet 无法渲染 */
  min-height: 400px; /* 防止极端情况下高度为0 */
  border-radius: 0 0 12px 12px;
  z-index: 1; /* 确保地图在最下层 */
}

/* 操作区按钮样式 */
.actions-card {
  flex-shrink: 0; /* 防止操作栏被压缩 */
}

.actions-card :deep(.ant-btn-primary) {
  background-color: #4a5c43 !important;
  border-color: #4a5c43 !important;
}

.refresh-btn {
  background-color: rgb(255 255 255 / 15%) !important;
  border-color: rgb(255 255 255 / 30%) !important;
  color: white !important;
}

/* --- 自定义 Marker 和 Popup 内容样式 --- */
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

.leaflet-popup-content-themed .popup-title {
  font-size: 16px;
  font-weight: bold;
  margin-bottom: 8px;
  color: white;
  border-bottom: 1px solid rgb(255 255 255 / 20%);
  padding-bottom: 8px;
}

.leaflet-popup-content-themed .popup-info {
  margin-bottom: 4px;
}

.leaflet-popup-content-themed .popup-alert-info {
  margin-top: 10px;
  padding: 8px;
  border-radius: 4px;
  background: rgb(207 19 34 / 30%);
  color: #ffc2c2;
  font-size: 13px;
}

.leaflet-popup-content-themed .popup-actions {
  display: flex;
  gap: 8px;
  margin-top: 12px;
}

.popup-btn {
  padding: 6px 10px;
  border-radius: 4px;
  color: white;
  border: none;
  cursor: pointer;
  transition: background-color 0.3s;
}

.popup-btn.trigger {
  background-color: #c4600c;
}

.popup-btn.close {
  background-color: #4a5c43;
}

.popup-btn:hover {
  opacity: 0.8;
}

.popup-btn:disabled {
  background-color: #555;
  cursor: not-allowed;
}
</style>
