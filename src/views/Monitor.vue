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
import { message } from 'ant-design-vue' // message 组件在新版本中不再直接使用，但可以保留以备后用
import BasicLayout from '@/layouts/BasicLayout.vue'
import { useDataStore } from '@/stores/data'
import * as L from 'leaflet' // L 是 Leaflet 的命名空间
import 'leaflet.markercluster'
import { contain } from 'echarts/types/src/scale/helper.js'

export default defineComponent({
  components: { BasicLayout },
  setup() {
    const dataStore = useDataStore()
    const mapRef = ref<HTMLDivElement | null>(null)

    // Leaflet 地图实例
    let map: L.Map | null = null
    // LayerGroup：管理所有 marker（方便统一清除 / 重建）。
    // 替换 markersLayer：可以管理大量marker
    let markerCluster: L.MarkerClusterGroup | null = null
    // 新增Map存储marker实例，无需遍历
    const markersById = new Map<number, L.Marker>()

    // 1. 根据状态返回颜色的函数
    function statusColor(status: string) {
      if (!status) return '#aaa'
      if (status === 'normal') return '#52c41a' // green
      if (status === 'warning') return '#fa8c16' // orange
      if (status === 'critical') return '#cf1322' // red
      return '#1890ff' // default blue
    }

    // 2. 创建自定义 HTML 图标的函数
    function createDivlcon(point: any) {
      const color = statusColor(point.status)
      const html = `
        <div class="custom-marker" style="display:flex;flex-direction:column;align-items:center;">
          <div style="width:18px;height:18px;border-radius:50%;background:${color};box-shadow:0 0 0 4px rgba(0,0,0,0.06)"></div>
          <div style="font-size:11px;margin-top:4px;white-space:nowrap">${point.name}</div>
        </div>
      `

      return L.divlcon({
        html,
        className: 'my-div-icon',
        iconSize: [40, 40],
        iconAnchor: [20, 20],
        popupAnchor: [0, -18]
      })
    }
    // 3. 构建动态弹窗内容的函数
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
    // 4.从后端拉取点并渲染 markers
    function renderMarkers() {
      if (!markerCluster || !map) return
      markerCluster.clearLayers()
      markersById.clear()

      for (const p of dataStore.monitorPoints) {
        const icon = createDivIcon(p)
        const marker = L.marker([p.lat, p.lng])
        marker.bindPopup(buildPopupHtml(p))

        marker.on('popupopen', (e) => {
          const container = (e as any).popup?._contentNode as HTMLElement | undefined
          if (container) {
            const triggerBtn = container.querySelector(
              'button[data-action="trigger"]'
            ) as HTMLButtonElement | null
            const closeBtn = container.querySelector(
              'button[data-action="close"]'
            ) as HTMLButtonElement | null
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
                  alert('触发预警失败') // 使用原生 alert 或 message 组件
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
                    alert('该点暂无未处理预警')
                  }
                } catch (err) {
                  console.error('updateAlert error', err)
                  alert('关闭预警失败')
                } finally {
                  closeBtn.disabled = false
                }
              }
            }
          }
        })
        markersById.set(p.id, marker) // 存储marker
        markerCluster.addLayer(marker) // 添加到聚合图层
      }
      // 渲染后自动缩放到合适范围
      zoomToAll()
    }

    //5. initMap, refreshData, zoomToAll
    async function initMap() {
      if (!mapRef.value) return
      // 初始化地图：设置初始中心和缩放等级
      map = L.map(mapRef.value as HTMLDivElement).setView([35.05, 139.05], 10)
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: '© OpenStreetMap'
      }).addTo(map)

      // 初始化 markerClusterGroup
      // @ts-expect-error - a-L's type definition is sometimes tricky, use ts-ignore to bypass
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
      const layers = markerCluster.getLayers()
      if (layers.length === 0) return
      const group = L.featureGroup(layers as L.Layer[])
      map.fitBounds(group.getBounds().pad(0.2))
    }

    // 6.重写生命周期钩子
    onMounted(async () => {
      markersLayer = L.layerGroup().addTo(map)

      // 在map实例上监听popupopen事件
      // map: Leaflet 地图实例
      map.on('popupopen', (e) => {
        // e.popup是当前打开的popup 实例,getElement()用于获取Leaflet地图实例对象的根DOM元素
        const popupContent = e.popup.getElement()
        if (!popupContent) return

        // 在popup的DOM内部查找带有data-id属性的按钮
        const btn = popupContent.querySelector('button[data-id]') as HTMLButtonElement | null
        if (btn) {
          // 从按钮的data-id属性获取监测点ID
          const pointId = Number(btn.dataset.id)
          // 通过pointId从 dataStore.monitorPoints 找到对应的监测点的完整信息(提供给createAlert)
          const point = dataStore.monitorPoints.find((p) => p.id === pointId)
          if (!point) return

          //绑定异步点击事件处理函数到btn
          btn.onclick = async () => {
            btn.disabled = true //防止重复点击
            btn.innerText = '正在触发...'

            try {
              // 调用API，创建Alert
              await dataStore.createAlert({
                pointId: point.id,
                level: 'medium',
                message: `手动触发:${point.name}状态${point.status}`,
                time: Date.now(),
                handled: false
              })
              message.success('已成功创建预警！')
              //创建成功后，关闭popup
              map?.closePopup()
            } catch (error) {
              message.error('创建预警失败')
              console.error('Create alert failed:', error)
              btn.innerText = '模拟触发预警' // 恢复按钮文字
              btn.disabled = false
            }
          }
        }
      })
    })
    // 当监测点更新时重新渲染 markers
    // 这里直接监听 store 数据变更也可以（略）
    return { mapRef }

    // 组件销毁时清理地图，防止内存泄漏
    onBeforeUnmount(() => {
      if (map) {
        map.remove()
        map = null
      }
    })
  }
})
</script>
