<!-- src/views/RelatedData.vue -->
<template>
  <AppLayout>
    <div class="data-page-content">
      <!-- 左侧图表面板 -->
      <div class="chart-panel glass-panel">
        <div class="panel-header">
          <span>传感器数据</span>
          <a-button
            size="small"
            ghost>
            查看详情
          </a-button>
        </div>

        <!-- ECharts 图表 -->
        <div class="chart-container">
          <a-card
            title="最近 7 天预警趋势"
            :loading="loadingAlerts"
            style="flex: 1 1 400px; min-width: 320px">
            <div
              ref="chart"
              style="height: 220px; width: 100%"></div>
          </a-card>
        </div>
      </div>
      <!-- 右侧导航按钮 -->
      <div class="nav-buttons">
        <a-button
          type="primary"
          size="large"
          block
          class="nav-btn">
          传感器数据
        </a-button>
        <a-button
          size="large"
          block
          class="nav-btn">
          无人机遥感数据
        </a-button>
        <a-button
          size="large"
          block
          class="nav-btn">
          气象数据
        </a-button>
        <a-button
          size="large"
          block
          class="nav-btn">
          GIS数据
        </a-button>
      </div>
    </div>
  </AppLayout>
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import AppLayout from '@/layouts/AppLayout.vue'

// 1. 导入所有需要的依赖
import { useDataStore } from '@/stores/data'
import * as echarts from 'echarts'

// 2. 粘贴所有来自 Dashboard.vue 的 script 逻辑
const dataStore = useDataStore()

// chart DOM & instance
const chart = ref<HTMLDivElement | null>(null) //
const chartInstance = ref<any>(null) //

// 构建最近 7 天数据（返回 reactive-friendly 值）//
function buildTrendSeries() {
  const now = Date.now()
  const dayMs = 24 * 60 * 60 * 1000
  const labels: string[] = []
  const counts: number[] = []
  for (let i = 6; i >= 0; i--) {
    const start = new Date(now - i * dayMs)
    const label = `${start.getMonth() + 1}/${start.getDate()}`
    labels.push(label)
    const dayStart = new Date(start.getFullYear(), start.getMonth(), start.getDate()).getTime()
    const dayEnd = dayStart + dayMs
    const c = dataStore.alerts.filter((a: any) => a.time >= dayStart && a.time < dayEnd).length
    counts.push(c)
  }
  return { labels, counts }
}

// 渲染图表
function renderChart() {
  if (!chart.value) return
  if (!chartInstance.value) chartInstance.value = echarts.init(chart.value)
  const { labels, counts } = buildTrendSeries()
  chartInstance.value.setOption({
    tooltip: { trigger: 'axis' },
    xAxis: {
      type: 'category',
      data: labels,
      axisLabel: { color: '#ccc' } // 调整颜色以适应深色背景
    },
    yAxis: {
      type: 'value',
      axisLabel: { color: '#ccc' } // 调整颜色以适应深色背景
    },
    series: [
      {
        data: counts,
        type: 'line',
        smooth: true,
        itemStyle: { color: '#5470C6' },
        lineStyle: { color: '#5470C6' }
      }
    ],
    grid: {
      // 调整图表边距
      left: '3%',
      right: '4%',
      bottom: '3%',
      containLabel: true
    }
  })
}

// 拉取所有数据（force 可用于强制刷新）
const fetchAll = async (force = false) => {
  // 这个页面只需要预警数据来画图
  await Promise.all([dataStore.fetchMonitorPoints(), dataStore.fetchAlerts(force)])
  // 数据获取后渲染图表
  renderChart()
}

// 3. 粘贴生命周期钩子和侦听器
// 组件挂载后，获取数据并渲染图表
onMounted(() => {
  fetchAll()

  // 增加窗口大小变化监听，使图表自适应
  window.addEventListener('resize', () => {
    chartInstance.value?.resize()
  })
})

// alerts 变化时自动刷新图表
watch(
  () => dataStore.alerts,
  () => {
    renderChart()
  },
  { deep: true }
)
</script>

<style scoped>
.data-page-content {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 40px;
  width: 100%;
  height: 100%;
}

.glass-panel {
  background-color: rgb(255 255 255 / 10%);
  border-radius: 16px;
  padding: 20px;
  box-shadow: 0 4px 30px rgb(0 0 0 / 10%);
  backdrop-filter: blur(12px);
  border: 1px solid rgb(255 255 255 / 20%);
}

.chart-panel {
  width: 70%;
  height: 80%;
  display: flex;
  flex-direction: column;
}

.panel-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
  color: #fff;
  font-size: 18px;
  font-weight: bold;
}

/* chart-container 现在是图表的直接父容器 */
.chart-container {
  /* 无需背景，图表直接在玻璃面板上 */
  flex-grow: 1;
  border-radius: 8px;
  padding: 10px;
}

.nav-buttons {
  width: 200px;
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.nav-btn {
  height: 60px !important;
  font-size: 16px !important;
  border-radius: 12px !important;
  background-color: rgb(255 255 255 / 10%) !important;
  border: 1px solid rgb(255 255 255 / 30%) !important;
  backdrop-filter: blur(10px);
  color: #fff !important;
}

.nav-btn.ant-btn-primary {
  background-color: var(--dark-green, #4a5c43) !important;
  border-color: var(--dark-green, #4a5c43) !important;
}
</style>
