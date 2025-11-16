<!-- src/views/user/DecisionSupport.vue -->
<template>
  <!-- 1. 沿用标准布局组件 -->
  <AppLayout>
    <main class="main-content">
      <div class="content-wrapper">
        <!-- 2. 使用统一的卡片式容器，保证整体感 -->
        <a-card :bordered="false">
          <template #title>
            <div class="card-title">智慧决策支持</div>
          </template>

          <!-- 3. 核心区域采用仪表盘式网格布局 -->
          <div class="decision-dashboard">
            <!-- 左侧列：选择区域 -->
            <div class="left-column">
              <a-card
                title="选择分析区域"
                size="small"
                class="widget-card">
                <a-list
                  :data-source="disasterAreas"
                  size="small">
                  <template #renderItem="{ item }">
                    <a-list-item
                      class="area-list-item"
                      :class="{ active: selectedArea && selectedArea.id === item.id }"
                      @click="selectArea(item)">
                      <a-list-item-meta :title="item.name">
                        <template #description>
                          <a-tag :color="item.status === '紧急' ? 'red' : 'orange'">
                            {{ item.status }}
                          </a-tag>
                          {{ item.type }}
                        </template>
                      </a-list-item-meta>
                    </a-list-item>
                  </template>
                </a-list>
              </a-card>

              <a-card
                v-if="selectedArea"
                title="区域概览"
                size="small"
                class="widget-card">
                <!-- ***** 修改：将占位符替换为真实的地图容器 ***** -->
                <div
                  ref="mapRef"
                  class="mini-map-container"></div>
                <!-- ***** 修改结束 ***** -->

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

            <!-- 右侧列：展示决策信息 -->
            <div class="right-column">
              <!-- ... 右侧内容保持不变 ... -->
              <div
                v-if="!isAreaSelected"
                class="placeholder-wrapper">
                <info-circle-outlined />
                <p>请从左侧列表选择一个灾害区域进行分析</p>
              </div>
              <template v-else>
                <a-card
                  title="详细地理信息"
                  size="small"
                  class="widget-card">
                  <div class="geo-info-grid">
                    <div class="info-card">
                      <fund-projection-screen-outlined class="info-icon" />
                      <h4>地形地貌</h4>
                      <p>{{ selectedArea.details.terrain }}</p>
                    </div>
                    <div class="info-card">
                      <appstore-outlined class="info-icon" />
                      <h4>农田分布</h4>
                      <p>{{ selectedArea.details.farmland }}</p>
                    </div>
                    <div class="info-card">
                      <cluster-outlined class="info-icon" />
                      <h4>灌溉设施</h4>
                      <p>{{ selectedArea.details.irrigation }}</p>
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
                    :data-source="selectedArea.suggestions"
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
              </template>
            </div>
          </div>
        </a-card>
      </div>
    </main>
  </AppLayout>
</template>

<script setup lang="ts">
// ***** 修改：引入 Vue 的生命周期钩子和 Leaflet *****
import { ref, computed, onMounted, onBeforeUnmount, watch } from 'vue'
import * as L from 'leaflet'
import 'leaflet/dist/leaflet.css'
// ***** 修改结束 *****

import {
  InfoCircleOutlined,
  RobotOutlined,
  FundProjectionScreenOutlined,
  AppstoreOutlined,
  ClusterOutlined,
  StarOutlined
} from '@ant-design/icons-vue'
import AppLayout from '@/layouts/AppLayout.vue'

// 模拟数据 (保持不变)
const disasterAreas = ref([
  {
    id: 1,
    name: 'A区 - 03号田块',
    type: '霜冻灾害',
    status: '紧急',
    coords: { lat: 35.05, lng: 139.05 },
    details: {
      terrain: '丘陵地带，坡度较缓',
      farmland: '约50亩，主要种植小麦',
      irrigation: '滴灌系统覆盖率70%'
    },
    suggestions: [
      '立即启动防霜冻风扇和喷灌系统。',
      '通知区域负责人，组织人力进行覆盖保温。',
      '预计影响产量10%-15%，建议调整后续施肥计划。',
      '评估周边3公里内相似海拔田块的风险。'
    ]
  },
  {
    id: 2,
    name: 'B区 - 11号田块',
    type: '蝗虫过境',
    status: '高风险',
    coords: { lat: 35.15, lng: 139.15 },
    details: {
      terrain: '平原，地势开阔',
      farmland: '约200亩，水稻种植区',
      irrigation: '大型渠道灌溉'
    },
    suggestions: [
      '建议使用无人机进行低毒性农药喷洒。',
      '协调下游区域，建立物理隔离带。',
      '发布虫害预警至邻近农户的移动应用。',
      '启动生物防治措施，投放天敌（如赤眼蜂）。'
    ]
  }
])

const selectedArea = ref<any>(null)
const isAreaSelected = computed(() => !!selectedArea.value)

// ***** 新增：地图相关的 ref *****
const mapRef = ref<HTMLDivElement | null>(null)
let map: L.Map | null = null
let areaMarker = ref<L.Marker | null>(null)
// ***** 新增结束 *****

const selectArea = (area: any) => {
  selectedArea.value = area
}

// ***** 新增：地图初始化函数 *****
const initMap = () => {
  if (!mapRef.value) return
  const darkTileLayer = L.tileLayer(
    'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png',
    {
      attribution: '&copy; CARTO',
      subdomains: 'abcd',
      maxZoom: 19
    }
  )
  map = L.map(mapRef.value, {
    layers: [darkTileLayer],
    zoomControl: false // 禁用默认的缩放控件，使小地图更简洁
  }).setView([35.1, 139.1], 11)
}

// ***** 新增：更新地图视图和标记的函数 *****
const updateMap = (area: any) => {
  if (!map || !area.coords) return
  const { lat, lng } = area.coords

  // 移除旧标记
  if (areaMarker.value) {
    areaMarker.value.remove()
  }

  // 创建新标记
  areaMarker.value = L.marker([lat, lng]).addTo(map)
  areaMarker.value.bindPopup(`<b>${area.name}</b><br/>${area.type}`).openPopup()

  // 飞至新位置
  map.flyTo([lat, lng], 13) // 使用飞行动画，并设置一个合适的缩放级别
}

// ***** 新增：生命周期钩子和监听器 *****
onMounted(() => {
  initMap()
})

onBeforeUnmount(() => {
  if (map) {
    map.remove()
    map = null
  }
})

// 监听 selectedArea 的变化，并更新地图
watch(selectedArea, (newArea) => {
  if (newArea && map) {
    updateMap(newArea)
  }
})
// ***** 新增结束 *****
</script>

<!-- ***** 新增：全局样式，用于统一 Leaflet 弹窗风格 ***** -->
<style>
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
/* ... 原有的大部分 scoped 样式保持不变 ... */
.main-content {
  flex-grow: 1;
  padding: 24px;
  display: flex;
  justify-content: center;
}

.content-wrapper {
  width: 100%;
  max-width: 1200px;
}

.content-wrapper > :deep(.ant-card) {
  background-color: var(--glass-bg, rgb(255 255 255 / 10%));
  border-radius: 12px;
  border: 1px solid rgb(255 255 255 / 20%);
  backdrop-filter: blur(10px);
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
}

.decision-dashboard {
  display: grid;
  grid-template-columns: 320px 1fr;
  gap: 20px;
}

.left-column,
.right-column {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.widget-card {
  background-color: rgb(255 255 255 / 5%) !important;
  border: 1px solid rgb(255 255 255 / 15%) !important;
  color: white;
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
}

.widget-card :deep(.ant-card-extra .ant-btn-primary) {
  background-color: var(--dark-green, #4a5c43) !important;
  border-color: var(--dark-green, #4a5c43) !important;
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

.placeholder-wrapper .anticon {
  font-size: 48px;
  margin-bottom: 16px;
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
  color: rgb(255 255 255 / 70%);
  margin-bottom: 0;
}

/* ***** 修改：移除旧的占位符样式，添加新的地图容器样式 ***** */
.mini-map-container {
  height: 150px;
  border-radius: 4px;
  border: 1px solid rgb(255 255 255 / 15%);
}

/* ***** 修改结束 ***** */

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

.suggestion-list :deep(.ant-list-item-action > li) {
  cursor: pointer;
  color: rgb(255 255 255 / 60%);
}

.suggestion-list :deep(.ant-list-item-action > li:hover) {
  color: #ffc53d;
}
</style>
