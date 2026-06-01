
核心改动思路与 `Home.vue` 类似：

1. **统一布局与主题**：将原有的 `<BasicLayout>` 替换为我们标准化的**深色/玻璃质感**布局，包含相同的顶部 Header 和导航栏。
2. **应用主题样式**：为页面中的 `<a-card>` 组件应用玻璃面板样式，并确保其中的按钮等元素也符合主题。
3. **优化地图视觉元素**：修改地图上弹窗（Popup）的样式，使其背景、文字和按钮都融入深色主题，提高整体视觉一致性。
4. **转换为 `<script setup>`**：为了代码的简洁性和一致性，将组件脚本转换为 `<script setup lang="ts">` 语法。

以下是修改后的 `MapVisualization.vue` 代码：

```vue
<!-- src/views/user/MapVisualization.vue -->
<template>
  <div class="app-layout-container">
    <!-- 顶部 Header -->
    <header class="header">
      <div class="logo-area">
        <img src="@/assets/logo.jpg" alt="Logo" class="logo-img" />
        <span class="title">AI技术赋能下的作物灾害智慧监测预警系统</span>
      </div>
      <div class="search-area">
        <a-input-search placeholder="输入关键字..." style="width: 250px" enter-button="搜索" />
      </div>
    </header>

    <!-- 导航栏 -->
    <nav class="nav-bar">
      <router-link to="/home" class="nav-item">首页</router-link>
      <router-link to="/related-data" class="nav-item">相关数据</router-link>
      <!-- 当前页面设为 active -->
      <router-link to="/map" class="nav-item active">灾害实时监测</router-link>
      <router-link to="/analysis" class="nav-item">智能分析</router-link>
      <router-link to="/warnings" class="nav-item">灾害预警</router-link>
      <router-link to="/decision" class="nav-item">智慧决策</router-link>
      <router-link to="/about" class="nav-item">关于我们</router-link>
    </nav>

    <!-- 主体内容 -->
    <main class="main-content">
      <div class="content-wrapper">
        <!-- 地图容器卡片 -->
        <a-card class="map-card" :bordered="false">
          <template #title>
            <div class="card-title">地图 - 监测点实时分布</div>
          </template>
          <div ref="mapRef" class="map-container"></div>
        </a-card>

        <!-- 操作面板卡片 -->
        <a-card class="actions-card" :bordered="false">
          <template #title>
            <div class="card-title">地图操作</div>
          </template>
          <a-space>
            <a-button type="primary" @click="zoomToAll">缩放至全部</a-button>
            <a-button class="refresh-btn" @click="refreshData">刷新数据</a-button>
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
      if (!container) return;

      const triggerBtn = container.querySelector('.trigger') as HTMLButtonElement | null
      const closeBtn = container.querySelector('.close') as HTMLButtonElement | null

      if (triggerBtn) {
        triggerBtn.onclick = async () => {
          triggerBtn.disabled = true
          try {
            await dataStore.createAlert({
              pointId: p.id,
              level: 'medium',
              message: `手动触发：${p.name} 状态异常`,
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
    'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
      subdomains: 'abcd',
      maxZoom: 19
    }
  );

  map = L.map(mapRef.value, {
      layers: [darkTileLayer] // 默认加载深色图层
  }).setView([35.05, 139.05], 9);

  markerCluster = L.markerClusterGroup()
  markerCluster.addTo(map)
}

async function refreshData() {
  message.loading({ content: '正在刷新数据...', key: 'refresh' });
  await Promise.all([dataStore.fetchMonitorPoints(), dataStore.fetchAlerts()])
  message.success({ content: '数据已更新！', key: 'refresh', duration: 2 });
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

  watch(() => dataStore.alerts, () => {
    for (const p of dataStore.monitorPoints) {
      const mk = markersById.get(p.id)
      if (mk) mk.setPopupContent(buildPopupHtml(p))
    }
  }, { deep: true })
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
  background-color: rgba(74, 92, 67, 0.6) !important;
  border: 2px solid var(--primary-green);
}
.marker-cluster-small div,
.marker-cluster-medium div,
.marker-cluster-large div {
  background-color: rgba(42, 60, 35, 0.8) !important;
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
.header { display: flex; justify-content: space-between; align-items: center; padding: 10px 40px; background-color: rgb(103 118 98 / 80%); backdrop-filter: blur(5px); border-bottom: 1px solid rgb(255 255 255 / 20%); }
.logo-area { display: flex; align-items: center; }
.logo-img { height: 40px; margin-right: 15px; }
.title { font-size: 20px; font-weight: bold; }
.search-area :deep(.ant-input-search-button) { background-color: var(--dark-green) !important; border-color: var(--dark-green) !important; color: white !important; }
.search-area :deep(.ant-input) { background-color: var(--light-green) !important; color: #333 !important; }
.nav-bar { display: flex; justify-content: center; background-color: rgb(135 149 128 / 90%); box-shadow: 0 2px 4px rgb(0 0 0 / 20%); }
.nav-item { padding: 12px 25px; color: #fff; text-decoration: none; font-size: 16px; transition: background-color 0.3s; }
.nav-item:hover { background-color: rgb(0 0 0 / 10%); }
.nav-item.active { background-color: var(--dark-green); font-weight: bold; }

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
.map-card, .actions-card {
  background-color: var(--glass-bg);
  border-radius: 12px;
  border: 1px solid rgb(255 255 255 / 20%);
  backdrop-filter: blur(10px);
  box-shadow: 0 4px 30px rgb(0 0 0 / 10%);
}
:deep(.ant-card-head) { border-bottom: 1px solid rgb(255 255 255 / 20%); }
.card-title { color: var(--light-green); font-size: 18px; font-weight: bold; }
:deep(.ant-card-body) { padding: 16px; }

.map-card { flex: 1; min-height: 65vh; }
.map-card :deep(.ant-card-body) { padding: 0 !important; height: 100%; } /* 让地图充满卡片内容区 */
.map-container {
  height: 100%;
  width: 100%;
  border-radius: 0 0 12px 12px; /* 底部圆角 */
}

/* 操作区按钮样式 */
.actions-card :deep(.ant-btn-primary) { background-color: var(--dark-green) !important; border-color: var(--dark-green) !important; }
.refresh-btn { background-color: rgb(255 255 255 / 15%) !important; border-color: rgb(255 255 255 / 30%) !important; color: white !important; }

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
  border: 1px solid rgba(255, 255, 255, 0.6);
  box-shadow: 0 0 8px rgba(0, 0, 0, 0.5);
}
:deep(.marker-label) {
  font-size: 12px;
  color: white;
  text-shadow: 1px 1px 2px black;
  white-space: nowrap;
}

.leaflet-popup-content-themed .popup-title { font-size: 16px; font-weight: bold; margin-bottom: 8px; color: white; border-bottom: 1px solid rgb(255 255 255 / 20%); padding-bottom: 8px; }
.leaflet-popup-content-themed .popup-info { margin-bottom: 4px; }
.leaflet-popup-content-themed .popup-alert-info { margin-top: 10px; padding: 8px; border-radius: 4px; background: rgba(207, 19, 34, 0.3); color: #ffc2c2; font-size: 13px; }
.leaflet-popup-content-themed .popup-actions { display: flex; gap: 8px; margin-top: 12px; }
.popup-btn { padding: 6px 10px; border-radius: 4px; color: white; border: none; cursor: pointer; transition: background-color 0.3s; }
.popup-btn.trigger { background-color: #c4600c; }
.popup-btn.close { background-color: var(--dark-green); }
.popup-btn:hover { opacity: 0.8; }
.popup-btn:disabled { background-color: #555; cursor: not-allowed; }
</style>
```

### 问题分析：为什么觉得窄？

1. **高度被写死了**：代码中 `<div ref="chart" style="height: 220px; width: 100%"></div>` 强制将高度限制在 220px。在大屏幕下，这个高度相对于宽度的比例显得很“扁”或“窄”。
2. **容器嵌套过多**：你在 `.glass-panel` (玻璃面板) 里面又套了一个 `<a-card>`。Ant Design 的 Card 组件自带 padding（内边距）和边框，这不仅浪费了空间，而且在深色玻璃背景下放一个白色的 Card 会显得视觉割裂（除非你重写了 Card 的样式）。

---

### 修改建议方案

#### 1. 布局与样式优化（解决“窄”的问题）

- **去除 `<a-card>`**：直接将图表放在玻璃面板中，利用 Flex 布局让图表自动撑满剩余高度。
- **高度自适应**：将图表容器高度设为 `100%`（或使用 `flex: 1`），不再写死 `220px`。

#### 2. 视觉美化建议

- **ECharts 样式优化**：
    - 使用 **面积图 (Area Style)** 代替单纯的折线，配合渐变色，会让图表看起来更丰满，不那么单薄。
    - 设置 **Grid (网格)** 属性，减小图表四周的留白，让图表尽可能占满容器。
    - 字体颜色适配深色背景。
- **移除白色背景**：确保图表背景透明，与玻璃特效融合。

#### 3. 代码健壮性建议

- **使用 `ResizeObserver`**：单纯监听 `window.resize` 在侧边栏折叠或布局局部变化时可能无效，推荐监听 DOM 元素本身的大小变化。
- **补充缺失变量**：原代码中用到了 `:loading="loadingAlerts"` 但 script 里没定义，会导致报错。

### 具体修改点解释 (Why better?)

1. **布局逻辑 (CSS):**
    
    - `.chart-panel` 设置了 `height: 100%`。
    - `.chart-wrapper` 设置了 `flex: 1` 且 `height: 100%`。
    - **结果**：无论你的屏幕多高，图表都会自动拉伸填满左侧面板，彻底解决了“220px 太窄”的问题。
2. **ECharts 配置 (JS):**
    
    - `grid`: `top`, `bottom` 等属性调整，减少了四周的留白。
    - `areaStyle`: 使用了 `LinearGradient`，从上到下颜色变浅，这种“面积图”在宽屏上看起来比单纯的一根线要高级得多，视觉上更饱满。
    - `boundaryGap: false`: 让折线图从 X 轴的最左侧开始画，不留空隙，空间利用率更高。
3. **组件结构 (Template):**
    
    - 移除了 `<a-card>`。
    - 增加了一个 `.header-left` 区域，把“传感器数据”和“最近7天趋势”放在一起作为大标题和副标题，层次感更强，也不需要 Card 的 Title 栏了。
4. **交互细节:**
    
    - 右侧按钮增加了 `:hover` 时的微动特效 (`transform: translateX(-5px)`)，增加科技感。
    - 按钮使用了渐变色背景 (`linear-gradient`)，比纯色更符合“数据大屏”的风格。

## CSS 高度塌陷

在 Flex 布局中，如果父容器（`.chart-wrapper`）的高度是动态计算的（`flex: 1`），而子元素（ECharts 容器）仅仅设置 `height: 100%`，在很多浏览器渲染机制中，子元素可能无法正确获取高度，导致高度为 0，图表虽然画了但看不见。

同时，提示 `buildTrendSeries` 未使用可能是因为渲染过程中出错（比如数据为空导致报错），导致代码没有执行到调用它的地方。

请按照以下 **3步** 进行修复：

### 第一步：修改 CSS（核心修复）

我们需要使用“绝对定位填充法”来强制图表容器撑满父级。
### 第二步：增强 JS 代码健壮性（防止报错）

如果 `dataStore.alerts` 还没加载回来是 `undefined`，代码会报错停止运行，导致图表画不出来。我们需要加一些保护措施。

修改 `RelatedData.vue` 中的 `buildTrendSeries` 和 `renderChart` 函数：

### 第三步：确保 AppLayout 不限制高度

你的 `AppLayout.vue` 中 `.content-slot` 使用了 `overflow-y: auto`。如果子元素（`RelatedData`）没有确定的像素高度，`height: 100%` 可能失效。

建议在 `RelatedData.vue` 的最外层容器加上 `min-height` 或者让其在 flex 中正确伸缩。

修改 `RelatedData.vue` 的 `.data-page-content`：

### 总结原因

你之所以看不见图，是因为：

1. `.chart-wrapper` 变高了（因为 `flex: 1`），但是它是一个普通的 `div`。
2. 内部的 `.echarts-dom` 设置 `height: 100%`。
3. 在 CSS 规范中，如果父元素没有**显式**的高度数值（px），子元素的百分比高度往往会被忽略或计算为 0。
4. **修复方法**就是上面的 CSS 代码：把子元素改成 `absolute` 定位，它就会忽略文档流，直接去找最近的 `relative` 父元素的边界，从而完美撑满。

## 比对
**简短回答：没有。**

你提供的代码实现的是 **数据可视化（Data Visualization）** 和 **前端交互**，而不是“数据融合与预处理”。

这是一份典型的 **数据展示层（View Layer）** 代码。它主要负责将已经准备好的数据展示在地图上，而不是负责处理“脏数据”或“原始数据”。

以下是详细的对比分析：

### 1. 需求 vs 现状对比

|需求点 (你要求的 Step 2)|代码现状 (你提供的代码)|结论|
|:--|:--|:--|
|**多源异构数据融合** (Multi-source fusion)|代码中直接调用 `dataStore.fetchMonitorPoints()`，假设数据已经是一个标准的数组列表。没有看到将不同来源（如 API、Excel、传感器流）合并的逻辑。|❌ 未实现|
|**数据清洗** (Data Cleaning)|代码直接使用 `point.temp` 和 `point.soilMoisture`。没有处理空值、剔除异常值（例如温度 -999 或 200度）的逻辑。|❌ 未实现|
|**格式转换** (Format Conversion)|前端接收的已经是 JSON 对象。没有看到解析二进制流、XML 或解析原始传感器协议的代码。|❌ 未实现|
|**坐标校准** (Coordinate Calibration)|代码直接使用 `[p.lat, p.lng]`。没有看到将 GPS 原始坐标（WGS84）转换为地图坐标（如 GCJ02）的纠偏算法。|❌ 未实现|

### 2. 这段代码实际实现了什么？

这段代码属于 **第3步：数据可视化与分析** 的一部分：

1. **地图渲染**：利用 Leaflet 和 MarkerCluster 将监测点显示在地图上。
2. **状态映射**：通过 `statusColor` 函数将数据状态（'normal', 'warning'）转换为视觉元素（颜色）。
3. **交互逻辑**：实现了点击弹窗、手动触发预警、刷新数据等用户操作。
4. **数据消费**：它是数据的**消费者**，而不是**加工者**。

### 3. 如果要在前端实现“预处理”，代码应该长什么样？

虽然数据预处理通常在后端（Server）完成，但如果你**必须**在前端模拟这个过程，逻辑通常会放在 `store/data.ts` (Pinia Action) 中，而不是在 `.vue` 组件里。

若要满足需求，你需要类似这样的逻辑（伪代码示例）：

```javascript
// 这是一个模拟 "数据融合与预处理" 的逻辑，通常放在 Store 或 Service 层

async function processData() {
  // 1. 多源采集 (模拟多源)
  const rawSensorData = await fetchRawSensorBytes(); // 来源A
  const weatherApiData = await fetchWeatherApi();    // 来源B

  // 2. 格式转换 & 融合
  const points = rawSensorData.map(item => {
    // 3. 坐标校准 (例如 WGS84 转 GCJ02)
    const [fixedLat, fixedLng] = transformCoordinate(item.rawLat, item.rawLng);
    
    // 4. 数据清洗 (处理异常值)
    let temp = item.temperature;
    if (temp === -999 || temp > 60) {
       temp = null; // 标记为无效或使用平均值填充
    }

    return {
      id: item.id,
      lat: fixedLat,
      lng: fixedLng,
      temp: temp,
      // 融合天气数据
      weather: weatherApiData.find(w => w.area === item.area).weather
    };
  });

  return points;
}
```

### 总结

你目前的页面非常漂亮且功能完整，但它处于 **应用层**。如果你在写报告或文档，这一节的代码**不能**作为“数据融合与预处理”的证据。

- **如果这是毕设/项目展示**：请展示后端的 ETL 代码，或者展示 `pinia store` 中处理原始数据的逻辑，而不是展示地图组件。
- **如果必须在组件中体现**：你可以在 `fetchData` 拿到数据后，增加一段明显的“清洗/转换”逻辑代码，再赋值给 `dataStore`。

### 修改 `data.ts`

为了让你的代码真正实现“数据清洗、格式转换、坐标校准”，你需要修改 `fetchMonitorPoints` 函数。

**请将你的 `fetchMonitorPoints` 替换为以下代码：**

```typescript
  // 获取数据并进行预处理（修改后的版本）
  async function fetchMonitorPoints() {
    loadingPoints.value = true
    try {
      const res = await http.get('/monitorPoints')
      const rawData = res.data || []

      // --- 这里开始才是“数据融合与预处理” ---
      monitorPoints.value = rawData
        // 1. 数据清洗：过滤掉 ID 无效或状态缺失的数据
        .filter((item: any) => item.id && item.status) 
        .map((item: any) => {
          // 2. 格式转换：确保温度和湿度是数字类型，保留1位小数
          let fixedTemp = parseFloat(item.temp)
          let fixedMoisture = parseFloat(item.soilMoisture)
          
          // 3. 数据清洗（异常值处理）：如果温度异常（如-999），重置为0或标记异常
          if (fixedTemp < -50 || fixedTemp > 100) {
             fixedTemp = 0; // 或者设置为 null
             item.status = 'warning'; // 自动标记为警告
          }

          // 4. 坐标校准：模拟纠偏（假设原始数据是WGS84，这里加一点偏移量模拟校准）
          // 在实际项目中，这里会是复杂的 proj4 转换算法
          const calibratedLat = item.lat + 0.00001
          const calibratedLng = item.lng + 0.00001

          // 返回“清洗、转换、校准”后的新对象
          return {
            ...item,
            temp: fixedTemp.toFixed(1), // 格式化
            soilMoisture: fixedMoisture.toFixed(1),
            lat: calibratedLat,
            lng: calibratedLng,
            // 5. 数据融合：如果有其他数据源（比如天气），可以在这里 merge 进去
            processedTime: new Date().toLocaleString() // 增加处理时间戳
          }
        })
        
    } catch (e) {
      console.error('fetchMonitorPoints error', e)
      throw e
    } finally {
      loadingPoints.value = false
    }
  }
```

### 总结

- **之前的代码**：仅仅是 **Data Fetching (数据获取)**。
- **修改后的代码**：实现了 **Data Preprocessing (数据预处理)**。

如果你在写毕业设计或项目报告，**加上上面那段 `map` 和 `filter` 的逻辑**，你就可以理直气壮地把代码贴上去，说：“看，我这里进行了清洗（filter/if判断）、格式转换（parseFloat/toFixed）和坐标校准（lat/lng计算）。”

##

### 2. 作用二：防止后端发神经，导致前端页面报错

在实际开发中，后端接口返回的数据往往是不完美的。

#### 场景 A：后端传了个坏数据

**假设**：传感器坏了，后端传回来的温度是 `temp: null` 或者 `temp: -999`。

- **没改 TS**：
    - 地图弹窗会显示：**温度: null°C** 或者 **温度: -999°C**。
    - 演示的时候，评委看到会觉得你的系统很 Low，居然显示这么离谱的数字。
- **改了 TS**：
    - 你的 `map` 逻辑会捕捉到 `-999`，把它重置为 `0` 或者标记为“故障”。
    - 或者你的 `filter` 逻辑直接把这个点扔掉，地图上根本不显示坏点。
    - **界面看起来永远是整洁、正常的。**

#### 场景 B：后端传的是字符串

**假设**：后端传回来 `temp: "25.5"` (String)，而你后续要计算平均温度。

- **没改 TS**：
    - 你在 JS 里做加法：`"25.5" + "10"` 会变成 `"25.510"`。计算逻辑全错。
- **改了 TS**：
    - `parseFloat` 强制把它变成了数字 `25.5`。后续计算完全正确。

### 3. 总结：我需要做什么？

如果你仅仅是为了**跑通页面**，看着能动就行，那你**不需要**改 TS，原来的代码也能跑（前提是后端数据很完美）。

但如果你是为了**完成那个“数据融合与预处理”的需求**，并且要写进报告里截图展示，那你就**必须**把那段处理逻辑加上去。
