<!-- src/views/user/MapVisualization.vue -->
<template>
  <div class="app-layout-container">
    <!-- 顶部 Header -->
    <header class="header">
      <div class="logo-area">
        <img
          src="@/assets/logo.jpg"
          alt="Logo"
          class="logo-img" />
        <span class="title">AI技术赋能下的作物灾害智慧监测预警系统</span>
      </div>
      <div class="search-area">
        <a-input-search
          placeholder="输入关键字..."
          style="width: 250px"
          enter-button="搜索" />
      </div>
    </header>

    <!-- 导航栏 -->
    <nav class="nav-bar">
      <router-link
        to="/home"
        class="nav-item">
        首页
      </router-link>
      <router-link
        to="/related-data"
        class="nav-item">
        相关数据
      </router-link>
      <router-link
        to="/map"
        class="nav-item active">
        灾害实时监测
      </router-link>
      <router-link
        to="/analysis"
        class="nav-item">
        智能分析
      </router-link>
      <router-link
        to="/warnings"
        class="nav-item">
        灾害预警
      </router-link>
      <router-link
        to="/decision"
        class="nav-item">
        智慧决策
      </router-link>
      <router-link
        to="/about"
        class="nav-item">
        关于我们
      </router-link>
    </nav>

    <!-- 主体内容 -->
    <main class="main-content">
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
    </main>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount, watch } from 'vue'
import { message } from 'ant-design-vue'
import { useDataStore } from '@/stores/data'
import * as L from 'leaflet'
import 'leaflet.markercluster'
import 'leaflet/dist/leaflet.css' // 引入 Leaflet 默认 CSS
import 'leaflet.markercluster/dist/MarkerCluster.css' // 聚合插件 CSS
import 'leaflet.markercluster/dist/MarkerCluster.Default.css' // 聚合插件默认主题

// --- 响应式引用和状态管理 ---
const dataStore = useDataStore()
const mapRef = ref<HTMLDivElement | null>(null)

let map: L.Map | null = null
let markerCluster: L.MarkerClusterGroup | null = null
const markersById = new Map<number, L.Marker>()

// --- 样式与内容生成函数 ---

// 1. 根据 status 返回颜色的函数
function statusColor(status: string) {
  if (status === 'normal') return '#52c41a' // 绿色
  if (status === 'warning') return '#fa8c16' // 橙色
  if (status === 'critical') return '#cf1322' // 红色
  return '#1890ff' // 默认蓝色
}

// 2. 创建自定义的 HTML 图标
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
    className: 'leaflet-custom-icon', // 使用一个不冲突的类名
    iconSize: [80, 40], // 调整尺寸以适应内容
    iconAnchor: [40, 20], // 锚点居中
    popupAnchor: [0, -20]
  })
}

// 3. 为每个 marker 创建弹窗的 HTML 内容 (应用主题样式)
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

// 4. 渲染所有 markers
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
            marker.setPopupContent(buildPopupHtml(p)) // 原地刷新弹窗
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
            marker.setPopupContent(buildPopupHtml(p)) // 原地刷新弹窗
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

// 5. 地图初始化与控制函数
async function initMap() {
  if (!mapRef.value) return
  // 使用深色瓦片图层
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
    layers: [darkTileLayer] // 默认加载深色图层
  }).setView([35.05, 139.05], 9)

  markerCluster = L.markerClusterGroup()
  markerCluster.addTo(map)
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

<!-- 全局样式，用于覆盖 Leaflet 默认样式 -->
<style>
/* 自定义 Leaflet 弹窗样式 */
.leaflet-popup-content-wrapper {
  background: rgb(40 50 38 / 90%) !important;
  color: var(--light-green) !important;
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
  color: var(--light-green) !important;
  padding: 8px 8px 0 0 !important;
}

/* 自定义聚合点样式 */
.marker-cluster-small,
.marker-cluster-medium,
.marker-cluster-large {
  background-color: rgb(74 92 67 / 60%) !important;
  border: 2px solid var(--primary-green);
}

.marker-cluster-small div,
.marker-cluster-medium div,
.marker-cluster-large div {
  background-color: rgb(42 60 35 / 80%) !important;
  color: white !important;
}
</style>

<style scoped>
/* 基础布局和颜色变量 (与其它页面保持一致) */
.app-layout-container {
  width: 100vw;
  min-height: 100vh;
  background-image: url('@/assets/bg.webp');
  background-size: cover;
  background-position: center;
  background-attachment: fixed;
  display: flex;
  flex-direction: column;
  color: #fff;
  font-family:
    'Helvetica Neue', Helvetica, 'PingFang SC', 'Hiragino Sans GB', 'Microsoft YaHei', '微软雅黑',
    Arial, sans-serif;

  --primary-green: #677662;
  --dark-green: #4a5c43;
  --light-green: #eef1ea;
  --glass-bg: rgb(255 255 255 / 10%);
}

/* Header 和 Nav (与其它页面保持一致) */
.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 40px;
  background-color: rgb(103 118 98 / 80%);
  backdrop-filter: blur(5px);
  border-bottom: 1px solid rgb(255 255 255 / 20%);
}

.logo-area {
  display: flex;
  align-items: center;
}

.logo-img {
  height: 40px;
  margin-right: 15px;
}

.title {
  font-size: 20px;
  font-weight: bold;
}

.search-area :deep(.ant-input-search-button) {
  background-color: var(--dark-green) !important;
  border-color: var(--dark-green) !important;
  color: white !important;
}

.search-area :deep(.ant-input) {
  background-color: var(--light-green) !important;
  color: #333 !important;
}

.nav-bar {
  display: flex;
  justify-content: center;
  background-color: rgb(135 149 128 / 90%);
  box-shadow: 0 2px 4px rgb(0 0 0 / 20%);
}

.nav-item {
  padding: 12px 25px;
  color: #fff;
  text-decoration: none;
  font-size: 16px;
  transition: background-color 0.3s;
}

.nav-item:hover {
  background-color: rgb(0 0 0 / 10%);
}

.nav-item.active {
  background-color: var(--dark-green);
  font-weight: bold;
}

/* 主体内容区域 */
.main-content {
  flex-grow: 1;
  padding: 24px;
  display: flex;
  justify-content: center;
}

.content-wrapper {
  width: 100%;
  max-width: 1400px; /* 地图页面可以更宽 */
  display: flex;
  flex-direction: column;
  gap: 16px;
}

/* 卡片通用玻璃样式 */
.map-card,
.actions-card {
  background-color: var(--glass-bg);
  border-radius: 12px;
  border: 1px solid rgb(255 255 255 / 20%);
  backdrop-filter: blur(10px);
  box-shadow: 0 4px 30px rgb(0 0 0 / 10%);
}

:deep(.ant-card-head) {
  border-bottom: 1px solid rgb(255 255 255 / 20%);
}

.card-title {
  color: var(--light-green);
  font-size: 18px;
  font-weight: bold;
}

:deep(.ant-card-body) {
  padding: 16px;
}

.map-card {
  flex: 1;
  min-height: 65vh;
}

.map-card :deep(.ant-card-body) {
  padding: 0 !important;
  height: 100%;
} /* 让地图充满卡片内容区 */
.map-container {
  height: 100%;
  width: 100%;
  border-radius: 0 0 12px 12px; /* 底部圆角 */
}

/* 操作区按钮样式 */
.actions-card :deep(.ant-btn-primary) {
  background-color: var(--dark-green) !important;
  border-color: var(--dark-green) !important;
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
  background-color: var(--dark-green);
}

.popup-btn:hover {
  opacity: 0.8;
}

.popup-btn:disabled {
  background-color: #555;
  cursor: not-allowed;
}
</style>
