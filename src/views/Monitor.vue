<!-- src/views/Monitor.vue -->
<template>
  <BasicLayout>
    <!-- mapRef：挂载 Leaflet 地图的 DOM 节点引用。外层给了固定高度（65vh），保证地图有空间渲染。 -->
    <div style="display: flex; gap: 16px; flex-direction: column">
      <a-card
        title="地图 - 监测点"
        style="flex: 1; min-height: 60vh; padding: 0">
        <div
          ref="mapRef"
          style="height: 65vh"></div>
      </a-card>
      <a-card title="地图操作">
        <a-space>
          <a-button @click="zoomToAll">缩放至全部点位</a-button>
          <a-button @click="refreshData">刷新数据</a-button>
        </a-space>
      </a-card>
    </div>
  </BasicLayout>
</template>

<script lang="ts">
import { defineComponent, onMounted, onBeforeUnmount, ref, watch } from 'vue'
import { message } from 'ant-design-vue'
import BasicLayout from '@/layouts/BasicLayout.vue'
import { useDataStore } from '@/stores/data.ts'
import * as L from 'leaflet' // L 是 Leaflet 的命名空间
import 'leaflet.markercluster'

export default defineComponent({
  components: { BasicLayout },
  setup() {
    // 获取状态管理实例，用于获取和操作监测点、预警等全局数据。
    const dataStore = useDataStore()
    // 响应式引用，关联模板中的地图容器
    const mapRef = ref<HTMLDivElement | null>(null)

    // 存储Leaflet 地图的实例
    let map: L.Map | null = null
    // LayerGroup：管理所有 marker（方便统一清除 / 重建）。
    // 替换 markersLayer：可以管理大量marker，将密集的点聚合显示
    let markerCluster: L.MarkerClusterGroup | null = null
    // 新增Map存储每个监测点 ID 和其对应的 L.Marker 实例
    const markersById = new Map<number, L.Marker>()

    // 1. 根据status返回颜色的函数，用于渲染图标
    function statusColor(status: string) {
      if (!status) return '#aaa'
      if (status === 'normal') return '#52c41a' // green
      if (status === 'warning') return '#fa8c16' // orange
      if (status === 'critical') return '#cf1322' // red
      return '#1890ff' // default blue
    }

    // 2.  创建自定义的 HTML 图标 (L.divIcon)的函数
    function createDivIcon(point: any) {
      const color = statusColor(point.status)
      // 动态生成一段 HTML 字符串，包含一个根据状态变色的圆点和下方的监测点名称
      // L.divIcon 将这段 HTML 转换为 Leaflet 可用的图标。
      const html = `
        <div class="custom-marker" style="display:flex;flex-direction:column;align-items:center;">
          <div style="width:18px;height:18px;border-radius:50%;background:${color};box-shadow:0 0 0 4px rgba(0,0,0,0.06)"></div>
          <div style="font-size:11px;margin-top:4px;white-space:nowrap">${point.name}</div>
        </div>
      `
      return L.divIcon({
        html,
        className: 'my-div-icon', // 可通过 CSS 进一步定义样式
        iconSize: [40, 40],
        iconAnchor: [20, 20],
        popupAnchor: [0, -18]
      })
    }
    // 3. 为每个 marker 创建其点击后弹窗（Popup）的 HTML 内容的函数
    function buildPopupHtml(point: any) {
      // 查找此监测点是否有未处理的预警
      const unhandled = dataStore.alerts.find((a) => a.pointId === point.id && !a.handled)
      const alertInfo = unhandled
        ? `<div style="margin-top:8px;color:#cf1322">未处理预警: ${unhandled.message}</div>`
        : ''

      return `
        <div style="min-width:180px">
          <div><strong>${point.name}</strong></div>
          <div>温度: ${point.temp} °C</div>
          <div>土壤湿度: ${point.soilMoisture}%</div>
          <div>状态: ${point.status || '未知'}</div>
          ${alertInfo}
          <div style="margin-top:8px;display:flex;gap:8px">
            <button data-action="trigger" data-id="${point.id}" style="padding:6px 8px;border-radius:4px;background:#fa8c16;color:white;border:none;cursor:pointer">触发预警</button>
            <button data-action="close" data-id="${point.id}" style="padding:6px 8px;border-radius:4px;background:#52c41a;color:white;border:none;cursor:pointer">关闭预警</button>
          </div>
        </div>
      `
    }
    // 4.将 dataStore.monitorPoints 中的数据转换成地图上的 markers。
    function renderMarkers() {
      if (!markerCluster || !map) return
      // 清空聚合层和 markersById Map，避免重复渲染。
      markerCluster.clearLayers()
      markersById.clear()

      // 遍历 dataStore.monitorPoints
      for (const p of dataStore.monitorPoints) {
        const icon = createDivIcon(p)
        const marker = L.marker([p.lat, p.lng], { icon })
        marker.bindPopup(buildPopupHtml(p))

        // 监听每一个单独的marker,而不是整体的map
        // 处理动态 HTML 中的事件：当弹窗被打开后，
        // 通过 e.popup._contentNode 获取弹窗的 DOM 容器，（getElement()）
        // 然后用 querySelector 找到内部的按钮并绑定 onclick 事件。
        marker.on('popupopen', (e) => {
          // At this moment, 'p' and 'marker' are instantly available
          // because of a JavaScript feature called a "closure".
          // The function "remembers" the 'p' and 'marker' from its creation scope.
          // No searching is needed!
          const container = (e as any).popup?._contentNode as HTMLElement | undefined
          if (container) {
            const triggerBtn = container.querySelector(
              'button[data-action="trigger"]'
            ) as HTMLButtonElement | null
            const closeBtn = container.querySelector(
              'button[data-action="close"]'
            ) as HTMLButtonElement | null

            // 按钮点击逻辑：调用 `dataStore` 中的 action (`createAlert` 或 `updateAlert`)，
            // 并在请求期间禁用按钮 (`disabled = true`)，请求结束后无论成功失败都恢复按钮 (`finally` 块)
            if (triggerBtn) {
              triggerBtn.onclick = async () => {
                triggerBtn.disabled = true
                try {
                  await dataStore.createAlert({
                    pointId: p.id,
                    level: 'medium',
                    message: `手动触发：${p.name} 状态 ${p.status}`,
                    time: Date.now(),
                    handled: false
                  })
                  // 关键：原地刷新弹窗内容以显示新状态，而不是关闭它
                  marker.setPopupContent(buildPopupHtml(p))
                } catch (err) {
                  console.error('createAlert error', err)
                  message.error('触发预警失败')
                } finally {
                  triggerBtn.disabled = false
                }
              }
            }
            if (closeBtn) {
              closeBtn.onclick = async () => {
                closeBtn.disabled = true
                try {
                  const unhandled = dataStore.alerts.find((a) => a.pointId === p.id && !a.handled)
                  if (unhandled) {
                    await dataStore.updateAlert(unhandled.id, { handled: true })
                    // 关键：原地刷新弹窗
                    marker.setPopupContent(buildPopupHtml(p))
                  } else {
                    message.info('该点暂无未处理预警')
                  }
                } catch (err) {
                  console.error('updateAlert error', err)
                  message.error('关闭预警失败')
                } finally {
                  closeBtn.disabled = false
                }
              }
            }
          }
        })
        markersById.set(p.id, marker) // 存储marker到Map
        markerCluster.addLayer(marker) // 添加到聚合图层
      }
      // 渲染后自动缩放到合适范围
      zoomToAll()
    }

    //5. initMap, refreshData, zoomToAll
    async function initMap() {
      if (!mapRef.value) return
      // 初始化地图：设置瓦片图层：初始中心和缩放等级
      map = L.map(mapRef.value as HTMLDivElement).setView([35.05, 139.05], 10)
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: '© OpenStreetMap'
      }).addTo(map)

      // 初始化 markerClusterGroup
      markerCluster = L.markerClusterGroup()
      markerCluster.addTo(map)
    }

    // 刷新数据函数
    async function refreshData() {
      // 并行获取点位和预警数据
      await Promise.all([dataStore.fetchMonitorPoints(), dataStore.fetchAlerts()])
      // await dataStore.fetchMonitorPoints()
    }

    // 缩放至全部点位函数
    function zoomToAll() {
      if (!markerCluster || !map) return
      // 获取 markerCluster 中的所有图层
      const layers = markerCluster.getLayers()
      if (layers.length === 0) return
      const group = L.featureGroup(layers as L.Layer[])
      // 调用 map.fitBounds() 让地图自动缩放和平移到能正好显示所有点的最佳视野
      map.fitBounds(group.getBounds().pad(0.2)) // .pad(0.2) 增加了少许边距
    }

    // 6.重写生命周期钩子
    // 在组件挂载到 DOM 后执行
    onMounted(async () => {
      await initMap() // 确保地图容器已存在并初始化地图实例
      await refreshData() // 获取初始数据
      renderMarkers() // 根据获取到的数据渲染 markers

      // 监听 monitorPoints 变化，自动重绘 markers
      watch(
        () => dataStore.monitorPoints,
        // 当数据变化时，直接调用 renderMarkers() 重绘所有点
        () => {
          renderMarkers()
        },
        { deep: true } // 确保了即使是数组内部对象的属性变化也能被侦测到。
      )

      // 监听 alerts 变化，只更新弹窗内容，性能更高
      watch(
        () => dataStore.alerts,
        // 当预警状态改变时，只更新其弹窗内容，避免了昂贵的 DOM 操作
        () => {
          for (const p of dataStore.monitorPoints) {
            const mk = markersById.get(p.id)
            if (mk) mk.setPopupContent(buildPopupHtml(p))
          }
        },
        { deep: true }
      )
    })

    // 组件销毁时清理地图，防止内存泄漏
    onBeforeUnmount(() => {
      if (map) {
        map.remove()
        map = null
      }
    })

    return {
      mapRef, // 模板中的 <div ref="mapRef"> 需要
      zoomToAll, // 模板中的 <a-button @click="zoomToAll"> 需要
      refreshData // 模板中的 <a-button @click="refreshData"> 需要
    }
  }
})
</script>
