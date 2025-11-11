<!-- src/views/Monitor.vue -->
<template>
  <BasicLayout>
    <!-- mapRef：挂载 Leaflet 地图的 DOM 节点引用。外层给了固定高度（70vh），保证地图有空间渲染。 -->
    <div style="height: 70vh; border: 1px solid #eee">
      <div
        ref="mapRef"
        style="height: 100%"></div>
    </div>
  </BasicLayout>
</template>

<script lang="ts">
import { defineComponent, onMounted, ref } from 'vue'
import BasicLayout from '@/layouts/BasicLayout.vue'
import { useDataStore } from '@/stores/data'
import L from 'leaflet' //L 是 Leaflet 的命名空间

export default defineComponent({
  components: { BasicLayout },
  setup() {
    const dataStore = useDataStore()
    const mapRef = ref<HTMLDivElement | null>(null)

    //Leaflet 地图实例
    let map: L.Map | null = null
    //LayerGroup：管理所有 marker（方便统一清除 / 重建）。
    let markersLayer: L.LayerGroup | null = null

    //从后端拉取点并渲染 markers
    function renderMarkers() {
      if (!markersLayer) return
      markersLayer.clearLayers()
      for (const p of dataStore.monitorPoints) {
        const marker = L.marker([p.lat, p.lng])
        // popup（HTML 字符串）
        const popupHtml = `
          <div>
            <strong>${p.name}</strong><br/>
            温度: ${p.temp} °C<br/>
            土壤湿度: ${p.soilMoisture}%<br/>
            状态: ${p.status}
            <br/><br/>
            <button id="trigger-${p.id}" data-id="${p.id}">模拟触发预警</button>
          </div>
        `

        // 动态插入 popup：用户打开 marker 的 popup 时，Leaflet 把 HTML 插入到 DOM（ Leaflet 管理的 popup 容器里）。
        marker.bindPopup(popupHtml)
        markersLayer.addLayer(marker)
      }
    }

    // function attachPopupButtons() {
    //   // 由于 popup DOM 是动态插入，需要延时绑定事件
    //   setTimeout(() => {
    //     for (const p of dataStore.monitorPoints) {
    //       //查找 popup 中生成的 DOM，然后绑定点击处理器。
    //       const btn = document.getElementById(`trigger-${p.id}`)
    //       if (btn) {
    //         btn.onclick = async () => {
    //           // 向 mock 后端 POST（传入 time）
    //           await dataStore.createAlert({
    //             pointId: p.id,
    //             level: 'medium',
    //             message: `手动触发：${p.name} 状态 ${p.status}`,
    //             time: Date.now(),
    //             handled: false
    //           })
    //           alert('已创建预警（mock）')
    //         }
    //       }
    //     }
    //   }, 200)
    // }

    onMounted(async () => {
      // 初始化地图：设置初始中心和缩放等级
      map = L.map(mapRef.value as HTMLDivElement).setView([35.05, 139.05], 10)
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: '© OpenStreetMap'
      }).addTo(map)

      markersLayer = L.layerGroup().addTo(map)

      await dataStore.fetchMonitorPoints()
      renderMarkers()
      attachPopupButtons()
    })

    // 当监测点更新时重新渲染 markers
    // 这里直接监听 store 数据变更也可以（略）
    return { mapRef }
  }
})
</script>
